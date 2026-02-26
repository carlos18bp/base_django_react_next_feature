#!/usr/bin/env python3
from __future__ import annotations

import argparse
import ast
import json
import os
import re
import shlex
import subprocess
import sys
import threading
import tempfile
import time
import uuid
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timezone
from functools import partial
from pathlib import Path
from typing import Sequence

TAIL_LINES = 40
RESUME_FILENAME = "last-run.json"
VALID_STATUSES = {"ok", "failed"}

# ── ANSI helpers ─────────────────────────────────────────────────────────────
_COLOR = os.environ.get("NO_COLOR") is None and sys.stdout.isatty()

def _c(code: str, text: str) -> str:
    return f"\033[{code}m{text}\033[0m" if _COLOR else text

def _bold(t: str) -> str:    return _c("1", t)
def _dim(t: str) -> str:     return _c("2", t)
def _green(t: str) -> str:   return _c("32", t)
def _red(t: str) -> str:     return _c("31", t)
def _yellow(t: str) -> str:  return _c("33", t)
def _cyan(t: str) -> str:    return _c("36", t)

_RE_COVERAGE_SUMMARY = re.compile(
    r'^(\s*(?:Statements|Branches|Functions|Lines)\s*:\s*)(\d+(?:\.\d+)?)(%.*)$'
)


def _color_for_pct(pct: float, text: str) -> str:
    if pct > 80.0:
        return _green(text)
    if pct >= 50.0:
        return _yellow(text)
    return _red(text)


def _colorize_coverage_output_line(line: str) -> str:
    if not _COLOR:
        return line
    stripped = line.rstrip("\n")
    m = _RE_COVERAGE_SUMMARY.match(stripped)
    if m:
        pct = float(m.group(2))
        return m.group(1) + _color_for_pct(pct, m.group(2) + m.group(3)) + "\n"
    if "|" in stripped and not stripped.lstrip().startswith("-") and "% Stmts" not in stripped:
        parts = stripped.split("|")
        colored: list[str] = [parts[0]]
        for part in parts[1:]:
            cell = part.strip()
            try:
                val = float(cell)
                colored.append(part.replace(cell, _color_for_pct(val, cell), 1))
            except ValueError:
                colored.append(part)
        return "|".join(colored) + "\n"
    return line


_SPINNER = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"]


class _LiveProgress:
    """Background thread that redraws a multi-line status block every 0.3s."""

    def __init__(self, suite_names: list[str]):
        self._names = suite_names
        self._status: dict[str, str] = {n: "running" for n in suite_names}
        self._durations: dict[str, float] = {}
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._start = time.monotonic()
        self._frame = 0
        self._lines_printed = 0

    def mark_done(self, name: str, status: str, duration: float) -> None:
        with self._lock:
            self._status[name] = status
            self._durations[name] = duration

    def _erase(self) -> None:
        if self._lines_printed > 0:
            sys.stdout.write(f"\033[{self._lines_printed}A")
            sys.stdout.write("\033[J")

    def _draw(self) -> None:
        elapsed = time.monotonic() - self._start
        sp = _SPINNER[self._frame % len(_SPINNER)] if _COLOR else "-"
        self._frame += 1
        header = f"  {_cyan(sp)} {_bold('Elapsed')}: {elapsed:.0f}s"
        lines = [header]
        with self._lock:
            for name in self._names:
                st = self._status[name]
                dur = self._durations.get(name)
                if st == "running":
                    tag = _yellow("running...")
                    extra = ""
                elif st == "ok":
                    tag = _green("OK")
                    extra = f" ({dur:.1f}s)" if dur else ""
                else:
                    tag = _red("FAILED")
                    extra = f" ({dur:.1f}s)" if dur else ""
                lines.append(f"    {name:<18} {tag}{extra}")
        done = sum(1 for s in self._status.values() if s != "running")
        total = len(self._names)
        bar_w = 20
        filled = int(done / total * bar_w)
        bar = _green("█" * filled) + _dim("░" * (bar_w - filled))
        lines.append(f"  [{bar}] {done}/{total} suites done")
        out = "\n".join(lines) + "\n"
        sys.stdout.write(out)
        sys.stdout.flush()
        self._lines_printed = len(lines)

    def _loop(self) -> None:
        while not self._stop.wait(0.3):
            self._erase()
            self._draw()

    def start(self) -> None:
        self._draw()
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        self._thread.join(timeout=2)
        self._erase()
        self._draw()


@dataclass
class StepResult:
    name: str
    command: list[str]
    returncode: int
    duration: float
    status: str
    output_tail: list[str] = field(default_factory=list)
    coverage: list[str] = field(default_factory=list)
    log_path: Path | None = None


def split_args(value: str | None) -> list[str]:
    if not value:
        return []
    return shlex.split(value)


def _format_pct(value: object) -> str:
    if isinstance(value, (int, float)):
        return f"{value:.2f}"
    return str(value)


def erase_backend_coverage_data(backend_root: Path, quiet: bool) -> None:
    cmd = [sys.executable, "-m", "coverage", "erase"]
    try:
        result = subprocess.run(
            cmd,
            cwd=backend_root,
            capture_output=True,
            text=True,
        )
    except OSError as exc:
        if not quiet:
            print(_red(f"Failed to run coverage erase: {exc}"))
        return
    if result.returncode != 0 and not quiet:
        print(_red(f"coverage erase failed (exit {result.returncode})"))
        if result.stdout:
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="")


def read_backend_coverage_summary(backend_root: Path) -> list[str]:
    data_file = backend_root / ".coverage"
    if not data_file.exists():
        return []
    try:
        import coverage as coverage_module
    except ImportError:
        return []
    try:
        cov = coverage_module.Coverage(data_file=str(data_file))
        cov.load()
    except Exception:
        return []

    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".json")
    os.close(tmp_fd)
    try:
        cov.json_report(
            outfile=tmp_path,
            omit=[
                "*/venv/*",
                "*/migrations/*",
                "*/tests/*",
                "*/conftest*",
                "*/__pycache__/*",
            ],
            ignore_errors=True,
        )
        report = json.loads(Path(tmp_path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    totals = report.get("totals")
    if not isinstance(totals, dict):
        return []

    lines: list[str] = []

    def append_metric(label: str, covered: object, total: object, pct: object | None = None) -> None:
        if not (isinstance(total, int) and total > 0 and isinstance(covered, int)):
            return
        if pct is None:
            pct = (covered / total) * 100
        pct_colored = _color_for_pct(float(pct), f"{_format_pct(pct)}%")
        lines.append(f"{label}: {pct_colored} ({covered}/{total})")

    def count_function_coverage(files: object, coverage_data: object) -> tuple[int, int] | None:
        if not isinstance(files, dict) or coverage_data is None:
            return None
        total_functions = 0
        covered_functions = 0
        for raw_path in files:
            if not isinstance(raw_path, str):
                continue
            file_path = Path(raw_path)
            if not file_path.is_absolute():
                candidates = [backend_root / file_path, backend_root.parent / file_path]
                file_path = next((candidate for candidate in candidates if candidate.exists()), file_path)
            if file_path.suffix != ".py":
                continue
            try:
                source = file_path.read_text(encoding="utf-8")
            except OSError:
                continue
            try:
                tree = ast.parse(source)
            except SyntaxError:
                continue
            executed_lines = coverage_data.lines(raw_path)
            if executed_lines is None:
                executed_lines = coverage_data.lines(str(file_path))
            executed_set = set(executed_lines or [])
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    lineno = getattr(node, "lineno", None)
                    end_lineno = getattr(node, "end_lineno", None)
                    if not isinstance(lineno, int):
                        continue
                    if not isinstance(end_lineno, int):
                        end_lineno = lineno
                    total_functions += 1
                    if end_lineno > lineno:
                        lines_range = range(lineno + 1, end_lineno + 1)
                    else:
                        lines_range = range(lineno, end_lineno + 1)
                    if any(line in executed_set for line in lines_range):
                        covered_functions += 1
        if total_functions == 0:
            return None
        return covered_functions, total_functions

    try:
        coverage_data = cov.get_data()
    except Exception:
        coverage_data = None

    total_statements = totals.get("num_statements")
    missing_lines = totals.get("missing_lines")
    covered_lines = totals.get("covered_lines")
    if isinstance(total_statements, int) and total_statements > 0:
        if covered_lines is None and isinstance(missing_lines, int):
            covered_lines = total_statements - missing_lines
        append_metric("Statements", covered_lines, total_statements)

    total_branches = totals.get("num_branches")
    missing_branches = totals.get("missing_branches")
    covered_branches = totals.get("covered_branches")
    if isinstance(total_branches, int) and total_branches > 0:
        if covered_branches is None and isinstance(missing_branches, int):
            covered_branches = total_branches - missing_branches
        append_metric("Branches", covered_branches, total_branches)

    functions_total = None
    functions_covered = None
    function_metrics = count_function_coverage(report.get("files"), coverage_data)
    if function_metrics:
        functions_covered, functions_total = function_metrics
        append_metric("Functions", functions_covered, functions_total)

    total_lines = totals.get("num_lines")
    line_total = total_lines if isinstance(total_lines, int) else total_statements
    if isinstance(line_total, int) and isinstance(covered_lines, int):
        line_pct = totals.get("percent_covered_lines")
        append_metric("Lines", covered_lines, line_total, line_pct)

    combined_total = 0
    combined_covered = 0
    if isinstance(total_statements, int) and isinstance(covered_lines, int):
        combined_total += total_statements
        combined_covered += covered_lines
    if isinstance(total_branches, int) and isinstance(covered_branches, int):
        combined_total += total_branches
        combined_covered += covered_branches
    if isinstance(functions_total, int) and isinstance(functions_covered, int):
        combined_total += functions_total
        combined_covered += functions_covered
    if isinstance(line_total, int) and isinstance(covered_lines, int):
        combined_total += line_total
        combined_covered += covered_lines
    if combined_total > 0:
        append_metric("Total", combined_covered, combined_total)

    return lines


def read_jest_coverage_summary(frontend_root: Path) -> list[str]:
    summary_path = frontend_root / "coverage" / "coverage-summary.json"
    if not summary_path.exists():
        return []
    try:
        data = json.loads(summary_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    total = data.get("total")
    if not isinstance(total, dict):
        return []

    labels = [
        ("Statements", total.get("statements")),
        ("Branches", total.get("branches")),
        ("Functions", total.get("functions")),
        ("Lines", total.get("lines")),
    ]
    lines: list[str] = []
    for label, metric in labels:
        if not isinstance(metric, dict):
            continue
        pct = metric.get("pct")
        covered = metric.get("covered")
        total_count = metric.get("total")
        if pct is None or covered is None or total_count is None:
            continue
        pct_colored = _color_for_pct(float(pct), f"{_format_pct(pct)}%")
        lines.append(f"{label}: {pct_colored} ({covered}/{total_count})")
    return lines


def read_flow_coverage_summary(frontend_root: Path) -> list[str]:
    summary_path = frontend_root / "e2e-results" / "flow-coverage.json"
    if not summary_path.exists():
        return []
    try:
        data = json.loads(summary_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    summary = data.get("summary")
    if not isinstance(summary, dict):
        return []

    total_flows = summary.get("total")
    covered_flows = summary.get("covered")
    partial_flows = summary.get("partial")
    failing_flows = summary.get("failing")
    missing_flows = summary.get("missing")

    coverage_percent = None
    if isinstance(total_flows, (int, float)) and total_flows > 0:
        if isinstance(covered_flows, (int, float)):
            coverage_percent = (covered_flows / total_flows) * 100

    lines: list[str] = []
    if total_flows is not None and covered_flows is not None:
        if coverage_percent is None:
            pct_text = "0%"
        else:
            pct_text = _color_for_pct(
                float(coverage_percent),
                f"{_format_pct(coverage_percent)}%",
            )
        lines.append(f"Flows covered: {covered_flows}/{total_flows} ({pct_text})")
    if partial_flows is not None and partial_flows > 0:
        lines.append(f"Partial: {partial_flows}")
    if failing_flows is not None and failing_flows > 0:
        lines.append(f"Failing: {failing_flows}")
    if missing_flows is not None and missing_flows > 0:
        lines.append(f"Missing: {missing_flows}")
    return lines


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def resolve_log_path(log_path: Path | None, repo_root: Path) -> str | None:
    if log_path is None:
        return None
    try:
        return str(log_path.relative_to(repo_root))
    except ValueError:
        return str(log_path)


def build_log_header(run_id: str, name: str, command: Sequence[str]) -> str:
    timestamp = utc_timestamp()
    cmd_text = " ".join(str(item) for item in command)
    sep = "=" * 80
    return (
        f"\n{sep}\n"
        f"Resume run: {run_id}\n"
        f"Timestamp: {timestamp}\n"
        f"Suite: {name}\n"
        f"Command: {cmd_text}\n"
        f"{sep}\n"
    )


def load_resume_summary(summary_path: Path) -> dict | None:
    if not summary_path.exists():
        return None
    try:
        data = json.loads(summary_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
    if not isinstance(data, dict):
        return None
    return data


def extract_resume_entries(summary: dict) -> dict[str, dict]:
    entries: dict[str, dict] = {}
    suites = summary.get("suites")
    if not isinstance(suites, list):
        return entries
    for suite in suites:
        if not isinstance(suite, dict):
            continue
        name = suite.get("name")
        if isinstance(name, str):
            entries[name] = suite
    return entries


def resume_status(entry: dict | None) -> str:
    if not entry:
        return "unknown"
    status = entry.get("status")
    if status in VALID_STATUSES:
        return status
    returncode = entry.get("returncode")
    if isinstance(returncode, int):
        return "ok" if returncode == 0 else "failed"
    return "unknown"


def build_suite_summary(result: StepResult, run_id: str, repo_root: Path) -> dict:
    return {
        "name": result.name,
        "status": result.status,
        "returncode": result.returncode,
        "duration": result.duration,
        "command": result.command,
        "timestamp": utc_timestamp(),
        "log_path": resolve_log_path(result.log_path, repo_root),
        "run_id": run_id,
    }


def build_resume_summary(
    results: list[StepResult],
    run_id: str,
    repo_root: Path,
    suite_order: Sequence[str],
    existing_entries: dict[str, dict] | None = None,
) -> dict:
    entries = dict(existing_entries or {})
    for result in results:
        entries[result.name] = build_suite_summary(result, run_id, repo_root)
    order_index = {name: idx for idx, name in enumerate(suite_order)}
    suites = sorted(entries.values(), key=lambda entry: order_index.get(entry.get("name"), 999))
    return {
        "run_id": run_id,
        "generated_at": utc_timestamp(),
        "suites": suites,
    }


def run_command(
    name: str,
    command: Sequence[str],
    cwd: Path,
    log_path: Path | None,
    env: dict[str, str] | None = None,
    capture_coverage: bool = False,
    append_log: bool = False,
    log_header: str | None = None,
    quiet: bool = False,
) -> StepResult:
    cmd_list = [str(item) for item in command]
    if not quiet:
        print("\n" + "=" * 80)
        print(f"Running step: {name}")
        print(f"Command: {' '.join(cmd_list)}")

    output_tail: deque[str] = deque(maxlen=TAIL_LINES)
    coverage_lines: list[str] = []
    coverage_active = False

    log_file = None
    if log_path:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_file = log_path.open("a" if append_log else "w", encoding="utf-8")
        if log_header:
            log_file.write(log_header)
            if not log_header.endswith("\n"):
                log_file.write("\n")
            log_file.flush()

    start_time = time.monotonic()
    try:
        process = subprocess.Popen(
            cmd_list,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            env=env,
        )
    except FileNotFoundError as exc:
        if log_file:
            log_file.write(f"{exc}\n")
            log_file.close()
        duration = time.monotonic() - start_time
        return StepResult(
            name=name,
            command=cmd_list,
            returncode=127,
            duration=duration,
            status="failed",
            output_tail=[str(exc)],
            log_path=log_path,
        )

    if process.stdout is None:
        if log_file:
            log_file.close()
        duration = time.monotonic() - start_time
        return StepResult(
            name=name,
            command=cmd_list,
            returncode=1,
            duration=duration,
            status="failed",
            output_tail=["Failed to capture command output."],
            log_path=log_path,
        )

    for line in process.stdout:
        if not quiet:
            print(_colorize_coverage_output_line(line), end="")
        if log_file:
            log_file.write(line)
        stripped = line.rstrip("\n")
        output_tail.append(stripped)
        if capture_coverage:
            if "Coverage summary" in stripped:
                coverage_lines = [stripped]
                coverage_active = True
                continue
            if coverage_active:
                coverage_lines.append(stripped)
                if stripped.startswith("=") and "Coverage summary" not in stripped:
                    coverage_active = False

    returncode = process.wait()
    duration = time.monotonic() - start_time

    if log_file:
        log_file.flush()
        log_file.close()

    status = "ok" if returncode == 0 else "failed"
    return StepResult(
        name=name,
        command=cmd_list,
        returncode=returncode,
        duration=duration,
        status=status,
        output_tail=list(output_tail),
        coverage=coverage_lines,
        log_path=log_path,
    )


def run_backend(
    backend_root: Path,
    report_dir: Path,
    markers: str,
    extra_args: Sequence[str],
    quiet: bool = False,
    append_log: bool = False,
    run_id: str | None = None,
    coverage: bool = False,
) -> StepResult:
    if coverage:
        erase_backend_coverage_data(backend_root, quiet=quiet)
    backend_cmd: list[str] = [sys.executable, "-m", "pytest", "-q"]
    if coverage:
        backend_cmd.extend([
            f"--cov={backend_root / 'base_feature_app'}",
            "--cov-report=term-missing",
            "--cov-branch",
        ])
    if markers:
        backend_cmd.extend(["-m", markers])
    backend_cmd.extend(extra_args)

    log_header = (
        build_log_header(run_id, "backend", backend_cmd)
        if append_log and run_id
        else None
    )

    result = run_command(
        name="backend",
        command=backend_cmd,
        cwd=backend_root,
        log_path=report_dir / "backend.log",
        capture_coverage=coverage,
        append_log=append_log,
        log_header=log_header,
        quiet=quiet,
    )
    if coverage and result.status == "ok":
        result.coverage = read_backend_coverage_summary(backend_root)
    return result


def run_frontend_unit(
    frontend_root: Path,
    report_dir: Path,
    extra_args: Sequence[str],
    workers: str | None = None,
    quiet: bool = False,
    append_log: bool = False,
    run_id: str | None = None,
    coverage: bool = False,
) -> StepResult:
    unit_cmd = ["npm", "run", "test", "--"]
    if coverage:
        unit_cmd.append("--coverage")
    if workers:
        unit_cmd.append(f"--maxWorkers={workers}")
    unit_cmd.extend(extra_args)

    log_header = (
        build_log_header(run_id, "frontend-unit", unit_cmd)
        if append_log and run_id
        else None
    )

    result = run_command(
        name="frontend-unit",
        command=unit_cmd,
        cwd=frontend_root,
        log_path=report_dir / "frontend-unit.log",
        capture_coverage=coverage,
        append_log=append_log,
        log_header=log_header,
        quiet=quiet,
    )
    if coverage and result.status == "ok":
        result.coverage = read_jest_coverage_summary(frontend_root)
    return result


def run_frontend_e2e(
    frontend_root: Path,
    report_dir: Path,
    extra_args: Sequence[str],
    workers: str | None = None,
    quiet: bool = False,
    append_log: bool = False,
    run_id: str | None = None,
    coverage: bool = False,
) -> StepResult:
    env = dict(os.environ)
    playwright_cmd = ["npx", "playwright", "test"]
    if workers:
        playwright_cmd.append(f"--workers={workers}")
    playwright_cmd.extend(extra_args)

    log_header = (
        build_log_header(run_id, "frontend-e2e", playwright_cmd)
        if append_log and run_id
        else None
    )

    result = run_command(
        name="frontend-e2e",
        command=playwright_cmd,
        cwd=frontend_root,
        log_path=report_dir / "frontend-e2e.log",
        env=env,
        capture_coverage=False,
        append_log=append_log,
        log_header=log_header,
        quiet=quiet,
    )
    if coverage:
        result.coverage = read_flow_coverage_summary(frontend_root)
    return result


def print_final_report(results: list[StepResult], duration: float) -> None:
    sep = _bold("=" * 80)
    print(f"\n{sep}")
    print(_bold("Final suite report"))
    print(f"Total wall-clock duration: {_cyan(f'{duration:.2f}s')}")

    sum_duration = sum(r.duration for r in results)
    if len(results) > 1:
        print(f"Sum of individual durations: {sum_duration:.2f}s")
        saved = sum_duration - duration
        if saved > 0:
            print(f"Time saved by parallelism: {_green(f'{saved:.2f}s')}")

    print()
    for result in results:
        if result.status == "ok":
            tag = _green("OK")
        else:
            tag = _red("FAILED")
        print(f"  {result.name:<18} {tag}  ({result.duration:.2f}s)")
        if result.coverage:
            for line in result.coverage:
                print(f"    {line}")
        if result.log_path:
            print(f"    {_dim(f'Log: {result.log_path}')}")

    failed = [result for result in results if result.status == "failed"]
    if failed:
        print(f"\n{_red('!' * 80)}")
        print(_red(_bold("Failures (tail output):")))
        for result in failed:
            print(f"\n{_red('-' * 80)}")
            print(_red(f"{result.name} (exit {result.returncode})"))
            for line in result.output_tail:
                print(line)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Run backend pytest, frontend unit, and E2E tests with reporting."
        )
    )
    parser.add_argument("--backend-markers", default="",
                        help="pytest marker expression (-m)")
    parser.add_argument("--backend-args", default="",
                        help="Extra args forwarded to pytest")
    parser.add_argument("--unit-args", default="",
                        help="Extra args forwarded to Jest")
    parser.add_argument("--e2e-args", default="",
                        help="Extra args forwarded to Playwright")
    parser.add_argument("--unit-workers", default=None,
                        help="Jest --maxWorkers value (default: auto)")
    parser.add_argument("--e2e-workers", default=None,
                        help="Playwright --workers value (default: per config)")
    parser.add_argument("--skip-backend", action="store_true")
    parser.add_argument("--skip-unit", action="store_true")
    parser.add_argument("--skip-e2e", action="store_true")
    parser.add_argument("--parallel", action="store_true",
                        help="Run suites in parallel (default: sequential)")
    parser.add_argument("--resume", action="store_true",
                        help="Resume last run and only execute failed suites")
    verbosity = parser.add_mutually_exclusive_group()
    verbosity.add_argument("--verbose", action="store_true",
                           help="Force verbose output (even in parallel)")
    verbosity.add_argument("--quiet", action="store_true",
                           help="Force quiet output (even in sequential mode)")
    parser.add_argument("--report-dir", default="test-reports")
    parser.add_argument("--coverage", action="store_true",
                        help="Enable coverage reporting for all suites (default: off)")

    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    backend_root = repo_root / "backend"
    frontend_root = repo_root / "frontend"
    report_dir = repo_root / args.report_dir
    resume_path = report_dir / RESUME_FILENAME

    parallel = args.parallel
    if args.verbose:
        quiet = False
    elif args.quiet:
        quiet = True
    else:
        quiet = parallel

    append_log = args.resume
    run_id = uuid.uuid4().hex

    if not args.resume and resume_path.exists():
        resume_path.unlink()

    suite_runners: list[tuple[str, partial[StepResult]]] = []

    if not args.skip_backend:
        suite_runners.append((
            "backend",
            partial(
                run_backend,
                backend_root=backend_root,
                report_dir=report_dir,
                markers=args.backend_markers,
                extra_args=split_args(args.backend_args),
                quiet=quiet,
                append_log=append_log,
                run_id=run_id,
                coverage=args.coverage,
            ),
        ))

    if not args.skip_unit:
        suite_runners.append((
            "frontend-unit",
            partial(
                run_frontend_unit,
                frontend_root=frontend_root,
                report_dir=report_dir,
                extra_args=split_args(args.unit_args),
                workers=args.unit_workers,
                quiet=quiet,
                append_log=append_log,
                run_id=run_id,
                coverage=args.coverage,
            ),
        ))

    if not args.skip_e2e:
        suite_runners.append((
            "frontend-e2e",
            partial(
                run_frontend_e2e,
                frontend_root=frontend_root,
                report_dir=report_dir,
                extra_args=split_args(args.e2e_args),
                workers=args.e2e_workers,
                quiet=quiet,
                append_log=append_log,
                run_id=run_id,
                coverage=args.coverage,
            ),
        ))

    if not suite_runners:
        print("All suites skipped. Nothing to run.")
        return 0

    suite_order = [name for name, _ in suite_runners]
    existing_entries: dict[str, dict] | None = None
    if args.resume:
        resume_summary = load_resume_summary(resume_path)
        existing_entries = extract_resume_entries(resume_summary) if resume_summary else {}
        if resume_summary is not None:
            resume_runners: list[tuple[str, partial[StepResult]]] = []
            for name, runner in suite_runners:
                status = resume_status(existing_entries.get(name))
                if status != "ok":
                    resume_runners.append((name, runner))
            if not resume_runners:
                print("All suites passed in the last run. Re-run without --resume to execute again.")
                return 0
            suite_runners = resume_runners

    results: list[StepResult] = []
    wall_start = time.monotonic()

    if parallel and len(suite_runners) > 1:
        names = [n for n, _ in suite_runners]
        print(_bold(f"Running {len(names)} suites in parallel..."))
        print()

        progress = _LiveProgress(names) if quiet else None
        if progress:
            progress.start()

        with ThreadPoolExecutor(max_workers=len(suite_runners)) as executor:
            futures = {
                executor.submit(runner): name
                for name, runner in suite_runners
            }
            for future in as_completed(futures):
                name = futures[future]
                try:
                    result = future.result()
                    if progress:
                        progress.mark_done(name, result.status, result.duration)
                    results.append(result)
                except Exception as exc:
                    if progress:
                        progress.mark_done(name, "failed", 0.0)
                    results.append(StepResult(
                        name=name,
                        command=[],
                        returncode=1,
                        duration=0.0,
                        status="failed",
                        output_tail=[str(exc)],
                    ))

        if progress:
            progress.stop()
    else:
        for _name, runner in suite_runners:
            results.append(runner())

    wall_duration = time.monotonic() - wall_start

    order = {name: i for i, name in enumerate(suite_order)}
    results.sort(key=lambda r: order.get(r.name, 999))

    print_final_report(results, wall_duration)
    report_dir.mkdir(parents=True, exist_ok=True)
    summary_payload = build_resume_summary(
        results,
        run_id,
        repo_root,
        suite_order,
        existing_entries=existing_entries,
    )
    resume_path.write_text(json.dumps(summary_payload, indent=2), encoding="utf-8")
    failed = any(r.status == "failed" for r in results)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
