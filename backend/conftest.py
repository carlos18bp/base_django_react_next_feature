from __future__ import annotations

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
