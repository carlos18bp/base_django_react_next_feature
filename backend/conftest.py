from __future__ import annotations

import ast
import json
import os
import tempfile
from pathlib import Path

# ── ANSI colours ────────────────────────────────────────────────────────────
_GREEN = "\033[32m"
_YELLOW = "\033[33m"
_RED = "\033[31m"
_BOLD = "\033[1m"
_DIM = "\033[2m"
_RESET = "\033[0m"

_EXCLUDE_PARTS = frozenset(
    {"tests", "migrations", "venv", "__pycache__", "conftest.py", ".git"}
)


def _colour(pct: float) -> str:
    if pct >= 90:
        return _GREEN
    if pct >= 70:
        return _YELLOW
    return _RED


def _bar(pct: float, width: int = 20) -> str:
    filled = round(pct / 100 * width)
    return "█" * filled + "░" * (width - filled)


def _is_production(path: str) -> bool:
    """Return True if the path does not belong to tests/migrations/venv/etc."""
    parts = Path(path).parts
    return not any(part in _EXCLUDE_PARTS for part in parts)


def _combined_totals(
    totals: dict | None,
    functions_total: int | None,
    functions_covered: int | None,
) -> tuple[int, int] | None:
    combined_total = 0
    combined_covered = 0
    if isinstance(totals, dict):
        total_statements = totals.get("num_statements")
        missing_lines = totals.get("missing_lines")
        covered_lines = totals.get("covered_lines")
        if covered_lines is None and isinstance(total_statements, int) and isinstance(missing_lines, int):
            covered_lines = total_statements - missing_lines

        total_branches = totals.get("num_branches")
        missing_branches = totals.get("missing_branches")
        covered_branches = totals.get("covered_branches")
        if covered_branches is None and isinstance(total_branches, int) and isinstance(missing_branches, int):
            covered_branches = total_branches - missing_branches

        total_lines = totals.get("num_lines")
        line_total = total_lines if isinstance(total_lines, int) else total_statements

        if isinstance(total_statements, int) and isinstance(covered_lines, int):
            combined_total += total_statements
            combined_covered += covered_lines
        if isinstance(total_branches, int) and isinstance(covered_branches, int):
            combined_total += total_branches
            combined_covered += covered_branches
        if isinstance(line_total, int) and isinstance(covered_lines, int):
            combined_total += line_total
            combined_covered += covered_lines

    if isinstance(functions_total, int) and isinstance(functions_covered, int):
        combined_total += functions_total
        combined_covered += functions_covered

    if combined_total == 0:
        return None
    return combined_covered, combined_total


def pytest_terminal_summary(terminalreporter, exitstatus, config) -> None:  # noqa: ARG001
    try:
        import coverage as coverage_module
    except ImportError:
        return

    rootdir = Path(str(config.rootdir))
    data_file = rootdir / ".coverage"
    if not data_file.exists():
        return

    try:
        cov = coverage_module.Coverage(data_file=str(data_file))
        cov.load()

        # ── Dump to JSON for a stable public API ────────────────────────────
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
            with open(tmp_path, encoding="utf-8") as fh:
                report = json.load(fh)
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

        files_data = report.get("files", {})
        if not files_data:
            return

        totals = report.get("totals")

        def count_function_coverage(files: dict, coverage_data) -> tuple[int, int] | None:
            if not files or coverage_data is None:
                return None
            total_functions = 0
            covered_functions = 0
            for raw_path in files:
                if not isinstance(raw_path, str) or not _is_production(raw_path):
                    continue
                file_path = Path(raw_path)
                if not file_path.is_absolute():
                    file_path = rootdir / file_path
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
        function_metrics = count_function_coverage(files_data, coverage_data)
        functions_covered = None
        functions_total = None
        if function_metrics:
            functions_covered, functions_total = function_metrics

        rows: list[tuple[str, int, int, float]] = []
        for raw_path, info in files_data.items():
            if not _is_production(raw_path):
                continue
            summary = info.get("summary", {})
            stmts: int = summary.get("num_statements", 0)
            missing: int = summary.get("missing_lines", 0)
            pct: float = summary.get("percent_covered", 0.0)
            # Normalise to a relative display path regardless of abs/rel input
            p = Path(raw_path)
            if p.is_absolute():
                try:
                    display = str(p.relative_to(rootdir))
                except ValueError:
                    display = raw_path
            else:
                display = raw_path
            rows.append((display, stmts, missing, pct))

        if not rows:
            return

        rows.sort(key=lambda r: r[0])

        total_stmts = sum(r[1] for r in rows)
        total_missing = sum(r[2] for r in rows)
        total_pct = (
            ((total_stmts - total_missing) / total_stmts * 100)
            if total_stmts
            else 100.0
        )

        combined_result = _combined_totals(totals, functions_total, functions_covered)

        tw = terminalreporter

        # ── Header ───────────────────────────────────────────────────────────
        tw.write_sep("=", "Coverage Report  (production files)", bold=True)

        col_file = 60
        header = (
            f"{'File':<{col_file}}  {'Stmts':>6}  {'Miss':>6}  {'Cover':>6}  Bar"
        )
        tw.write_line(f"{_BOLD}{header}{_RESET}")
        tw.write_line(_DIM + "─" * (col_file + 42) + _RESET)

        for display, stmts, missing, pct in rows:
            c = _colour(pct)
            name = (display[:57] + "...") if len(display) > col_file else display
            bar = _bar(pct)
            line = f"{name:<{col_file}}  {stmts:>6}  {missing:>6}  {c}{pct:>5.1f}%{_RESET}  {c}{bar}{_RESET}"
            tw.write_line(line)

        # ── Total summary ────────────────────────────────────────────────────
        tc = _colour(total_pct)
        tw.write_line(_DIM + "─" * (col_file + 42) + _RESET)
        total_bar = _bar(total_pct)
        total_line = (
            f"{'TOTAL':<{col_file}}  {total_stmts:>6}  {total_missing:>6}  "
            f"{tc}{total_pct:>5.1f}%{_RESET}  {tc}{total_bar}{_RESET}"
        )
        tw.write_line(f"{_BOLD}{total_line}{_RESET}")
        if combined_result:
            combined_covered, combined_total = combined_result
            combined_pct = (combined_covered / combined_total) * 100
            combined_missing = combined_total - combined_covered
            combined_color = _colour(combined_pct)
            combined_bar = _bar(combined_pct)
            combined_line = (
                f"{'TOTAL (combined)':<{col_file}}  {combined_total:>6}  {combined_missing:>6}  "
                f"{combined_color}{combined_pct:>5.1f}%{_RESET}  {combined_color}{combined_bar}{_RESET}"
            )
            tw.write_line(f"{_BOLD}{combined_line}{_RESET}")

        # ── Top-10 focus list ────────────────────────────────────────────────
        focus = sorted(
            [r for r in rows if r[3] < 100.0],
            key=lambda r: r[3],
        )[:10]

        if focus:
            tw.write_sep(
                "-",
                f"Top-{len(focus)} files to focus on  "
                f"(lowest coverage — total project: {tc}{total_pct:.1f}%{_RESET})",
            )
            for rank, (display, stmts, missing, pct) in enumerate(focus, 1):
                c = _colour(pct)
                bar = _bar(pct, width=15)
                tw.write_line(
                    f"  {_BOLD}{rank:>2}.{_RESET} {c}{pct:>5.1f}%  {bar}{_RESET}"
                    f"  {display}"
                    f"  {_DIM}({missing} line{'s' if missing != 1 else ''} uncovered){_RESET}"
                )

    except Exception:
        pass


def pytest_sessionstart(session) -> None:
    cov_plugin = session.config.pluginmanager.get_plugin("_cov")
    if cov_plugin is None:
        return
    hook = session.config.pluginmanager.hook.pytest_terminal_summary
    for impl in hook.get_hookimpls():
        if impl.plugin is cov_plugin:
            impl.function = lambda *args, **kw: None
            break
