"""
Combine coverage reports from backend, frontend-unit, and frontend-e2e
into a unified Markdown summary for GitHub Actions Job Summary.

Reads:
  - backend-report/backend-coverage.json   (coverage.py JSON format)
  - frontend-unit-report/coverage-summary.json (vitest json-summary)
  - frontend-e2e-report/flow-coverage.json (custom Playwright reporter)

Writes:
  - coverage-report.md   (artifact + PR comment body)
  - $GITHUB_STEP_SUMMARY  (if running in GH Actions)
"""

from __future__ import annotations

import json
import os
import xml.etree.ElementTree as ET
from pathlib import Path

BAR_WIDTH = 20


# ── Helpers ──────────────────────────────────────────────────────────


def _read_json(path: Path) -> dict | None:
    if not path.exists():
        print(f"⚠️  Not found: {path}")
        return None
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _pct_emoji(pct: float) -> str:
    if pct >= 90:
        return "🟢"
    if pct >= 70:
        return "🟡"
    return "🔴"


def _status_emoji(status: str) -> str:
    return {
        "covered": "✅",
        "partial": "⚠️",
        "failing": "❌",
        "missing": "⬜",
    }.get(status, "❓")


def _bar(pct: float, width: int = BAR_WIDTH) -> str:
    filled = round(pct / 100 * width)
    empty = width - filled
    return "█" * filled + "░" * empty


# ── Section builders ─────────────────────────────────────────────────
# Each returns (overview_row: str, details_lines: list[str])


def build_backend_section(data: dict | None) -> tuple[str, list[str]]:
    if data is None:
        row = "| Backend (pytest) | ⚠️ — | `—` | No report |"
        return row, []

    totals = data.get("totals", {})
    stmts_pct = totals.get("percent_covered", 0.0)
    num_stmts = totals.get("num_statements", 0)
    missing_lines = totals.get("missing_lines", 0)
    covered_stmts = num_stmts - missing_lines
    num_branches = totals.get("num_branches", 0)
    missing_branches = totals.get("missing_branches", 0)
    covered_branches = num_branches - missing_branches
    branches_pct = ((covered_branches / num_branches) * 100) if num_branches > 0 else 0.0

    # Functions (optional — not in standard coverage.py, added by enrichment step)
    funcs_total = totals.get("functions_total", 0)
    funcs_covered = totals.get("functions_covered", 0)
    funcs_pct = ((funcs_covered / funcs_total) * 100) if funcs_total > 0 else 0.0
    has_funcs = funcs_total > 0

    # Lines (covered_lines from coverage.py JSON, falls back to statements)
    covered_lines = totals.get("covered_lines", covered_stmts)
    num_lines = covered_lines + missing_lines
    lines_pct = ((covered_lines / num_lines) * 100) if num_lines > 0 else 0.0

    emoji = _pct_emoji(stmts_pct)
    details_text = f"{covered_stmts}/{num_stmts} stmts, {branches_pct:.1f}% branches"
    row = f"| **Backend** (pytest) | {emoji} {stmts_pct:.1f}% | `{_bar(stmts_pct)}` | {details_text} |"

    # Detail section
    details: list[str] = []
    details.append("")
    details.append("<details>")
    details.append("<summary><strong>🐍 Backend Details</strong></summary>")
    details.append("")
    details.append("| Metric | Covered | Total | % |")
    details.append("|--------|--------:|------:|------:|")
    details.append(f"| Statements | {covered_stmts} | {num_stmts} | {stmts_pct:.1f}% |")
    details.append(f"| Branches | {covered_branches} | {num_branches} | {branches_pct:.1f}% |")
    if has_funcs:
        details.append(f"| Functions | {funcs_covered} | {funcs_total} | {funcs_pct:.1f}% |")
    details.append(f"| Lines | {covered_lines} | {num_lines} | {lines_pct:.1f}% |")

    # Top 10 uncovered files
    files_data = data.get("files", {})
    uncovered: list[tuple[str, int, int, float]] = []
    for fpath, info in files_data.items():
        summary = info.get("summary", {})
        f_stmts = summary.get("num_statements", 0)
        f_miss = summary.get("missing_lines", 0)
        f_pct = summary.get("percent_covered", 100.0)
        if f_miss > 0:
            short = fpath.split("base_feature_app/")[-1] if "base_feature_app/" in fpath else fpath
            uncovered.append((short, f_stmts, f_miss, f_pct))

    if uncovered:
        uncovered.sort(key=lambda x: x[3])
        details.append("")
        details.append("**Top uncovered files**")
        details.append("")
        details.append("| # | File | Stmts | Miss | Cover | Bar |")
        details.append("|--:|------|------:|-----:|------:|-----|")
        for idx, (name, st, ms, pc) in enumerate(uncovered[:10], 1):
            details.append(
                f"| {idx} | `{name}` | {st} | {ms} | {_pct_emoji(pc)} {pc:.1f}% | `{_bar(pc, 10)}` |"
            )

    details.append("")
    details.append("</details>")

    return row, details


def build_frontend_unit_section(data: dict | None) -> tuple[str, list[str]]:
    if data is None:
        row = "| Frontend Unit (vitest) | ⚠️ — | `—` | No report |"
        return row, []

    total = data.get("total", {})
    stmts = total.get("statements", {})
    branches = total.get("branches", {})
    functions = total.get("functions", {})
    lines = total.get("lines", {})

    stmts_pct = stmts.get("pct", 0)
    stmts_total = stmts.get("total", 0)
    stmts_covered = stmts.get("covered", 0)
    branches_pct = branches.get("pct", 0)
    branches_total = branches.get("total", 0)
    branches_covered = branches.get("covered", 0)
    funcs_pct = functions.get("pct", 0)
    funcs_total = functions.get("total", 0)
    funcs_covered = functions.get("covered", 0)
    lines_pct = lines.get("pct", 0)
    lines_total = lines.get("total", 0)
    lines_covered = lines.get("covered", 0)

    emoji = _pct_emoji(stmts_pct)
    details_text = (
        f"{stmts_covered}/{stmts_total} stmts, "
        f"{branches_pct:.1f}% branches, "
        f"{funcs_pct:.1f}% funcs"
    )
    row = f"| **Frontend Unit** (vitest) | {emoji} {stmts_pct:.1f}% | `{_bar(stmts_pct)}` | {details_text} |"

    # Detail section
    details: list[str] = []
    details.append("")
    details.append("<details>")
    details.append("<summary><strong>🧪 Frontend Unit Details</strong></summary>")
    details.append("")
    details.append("| Metric | Covered | Total | % |")
    details.append("|--------|--------:|------:|------:|")
    details.append(f"| Statements | {stmts_covered} | {stmts_total} | {stmts_pct:.1f}% |")
    details.append(f"| Branches | {branches_covered} | {branches_total} | {branches_pct:.1f}% |")
    details.append(f"| Functions | {funcs_covered} | {funcs_total} | {funcs_pct:.1f}% |")
    details.append(f"| Lines | {lines_covered} | {lines_total} | {lines_pct:.1f}% |")

    # Top 10 uncovered files
    uncovered: list[tuple[str, int, int, float]] = []
    for fpath, info in data.items():
        if fpath == "total":
            continue
        f_stmts_info = info.get("statements", {})
        f_total = f_stmts_info.get("total", 0)
        f_covered = f_stmts_info.get("covered", 0)
        f_miss = f_total - f_covered
        f_pct = f_stmts_info.get("pct", 100)
        if f_miss > 0:
            short = fpath.split("/src/")[-1] if "/src/" in fpath else fpath
            uncovered.append((short, f_total, f_miss, f_pct))

    if uncovered:
        uncovered.sort(key=lambda x: x[3])
        details.append("")
        details.append("**Top uncovered files**")
        details.append("")
        details.append("| # | File | Stmts | Miss | Cover | Bar |")
        details.append("|--:|------|------:|-----:|------:|-----|")
        for idx, (name, ft, fm, fp) in enumerate(uncovered[:10], 1):
            details.append(
                f"| {idx} | `{name}` | {ft} | {fm} | {_pct_emoji(fp)} {fp:.1f}% | `{_bar(fp, 10)}` |"
            )

    details.append("")
    details.append("</details>")

    return row, details


def build_e2e_section(data: dict | None) -> tuple[str, list[str]]:
    if data is None:
        row = "| Frontend E2E (Playwright) | ⚠️ — | `—` | No report |"
        return row, []

    summary = data.get("summary", {})
    total_flows = summary.get("total", 0)
    covered = summary.get("covered", 0)
    partial = summary.get("partial", 0)
    failing = summary.get("failing", 0)
    missing = summary.get("missing", 0)

    pct = (covered / total_flows * 100) if total_flows > 0 else 0
    emoji = _pct_emoji(pct)
    details_text = f"{covered}/{total_flows} flows covered, {failing} failing, {missing} missing"
    row = f"| **Frontend E2E** (Playwright) | {emoji} {pct:.1f}% | `{_bar(pct)}` | {details_text} |"

    # Detail section
    details: list[str] = []
    details.append("")
    details.append("<details>")
    details.append("<summary><strong>🎭 Frontend E2E Flow Details</strong></summary>")
    details.append("")
    details.append("| Status | Count |")
    details.append("|--------|------:|")
    details.append(f"| ✅ Covered | {covered} |")
    details.append(f"| ⚠️ Partial | {partial} |")
    details.append(f"| ❌ Failing | {failing} |")
    details.append(f"| ⬜ Missing | {missing} |")
    details.append(f"| **Total** | **{total_flows}** |")

    # Per-flow breakdown from flows dict
    flows = data.get("flows", {})

    # Failing flows
    failing_flows = [
        (fid, fd)
        for fid, fd in flows.items()
        if fd.get("status") == "failing"
    ]
    if failing_flows:
        failing_flows.sort(key=lambda x: x[1].get("definition", {}).get("priority", "P4"))
        details.append("")
        details.append("**❌ Failing flows**")
        details.append("")
        details.append("| Flow | Name | Priority | Tests | Failed |")
        details.append("|------|------|----------|------:|-------:|")
        for fid, fd in failing_flows:
            defn = fd.get("definition", {})
            tests = fd.get("tests", {})
            details.append(
                f"| `{fid}` | {defn.get('name', fid)} | {defn.get('priority', '—')} "
                f"| {tests.get('total', 0)} | {tests.get('failed', 0)} |"
            )

    # Missing flows
    missing_flows = [
        (fid, fd)
        for fid, fd in flows.items()
        if fd.get("status") == "missing"
    ]
    if missing_flows:
        missing_flows.sort(key=lambda x: x[1].get("definition", {}).get("priority", "P4"))
        details.append("")
        details.append("**⬜ Missing flows (no tests)**")
        details.append("")
        details.append("| Flow | Name | Priority | Module |")
        details.append("|------|------|----------|--------|")
        for fid, fd in missing_flows:
            defn = fd.get("definition", {})
            details.append(
                f"| `{fid}` | {defn.get('name', fid)} "
                f"| {defn.get('priority', '—')} | {defn.get('module', '—')} |"
            )

    # Coverage by module
    by_module: dict[str, dict[str, int]] = {}
    for _fid, fd in flows.items():
        mod = fd.get("definition", {}).get("module", "unknown")
        if mod not in by_module:
            by_module[mod] = {"covered": 0, "total": 0}
        by_module[mod]["total"] += 1
        if fd.get("status") == "covered":
            by_module[mod]["covered"] += 1

    if by_module:
        details.append("")
        details.append("**📦 Coverage by module**")
        details.append("")
        details.append("| Module | Covered | Total | % |")
        details.append("|--------|--------:|------:|------:|")
        for mod in sorted(by_module):
            m = by_module[mod]
            m_pct = (m["covered"] / m["total"] * 100) if m["total"] > 0 else 0
            details.append(f"| {mod} | {m['covered']} | {m['total']} | {m_pct:.1f}% |")

    details.append("")
    details.append("</details>")

    return row, details


# ── Test results parsers ─────────────────────────────────────────────


def _parse_backend_results(reports_dir: Path) -> dict[str, int] | None:
    """Parse pytest JUnit XML to extract passed/failed/skipped counts."""
    path = reports_dir / "backend-report" / "backend-results.xml"
    if not path.exists():
        return None
    try:
        tree = ET.parse(path)
        root = tree.getroot()
        # JUnit XML: <testsuite tests="N" errors="E" failures="F" skipped="S">
        suite = root if root.tag == "testsuite" else root.find("testsuite")
        if suite is None:
            return None
        tests = int(suite.get("tests", 0))
        failures = int(suite.get("failures", 0))
        errors = int(suite.get("errors", 0))
        skipped = int(suite.get("skipped", 0))
        passed = tests - failures - errors - skipped
        return {"passed": passed, "failed": failures + errors, "skipped": skipped, "total": tests}
    except Exception:
        return None


def _parse_frontend_unit_results(reports_dir: Path) -> dict[str, int] | None:
    """Parse vitest JSON results to extract passed/failed/skipped counts."""
    path = reports_dir / "frontend-unit-report" / "test-results.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        passed = data.get("numPassedTests", 0)
        failed = data.get("numFailedTests", 0)
        skipped = data.get("numPendingTests", 0)
        total = data.get("numTotalTests", passed + failed + skipped)
        return {"passed": passed, "failed": failed, "skipped": skipped, "total": total}
    except Exception:
        return None


def _parse_e2e_results(reports_dir: Path) -> dict[str, int] | None:
    """Parse Playwright JSON results to extract passed/failed/skipped counts."""
    path = reports_dir / "frontend-e2e-report" / "results.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        stats = data.get("stats", {})
        expected = stats.get("expected", 0)
        unexpected = stats.get("unexpected", 0)
        flaky = stats.get("flaky", 0)
        skipped = stats.get("skipped", 0)
        passed = expected + flaky
        total = passed + unexpected + skipped
        return {"passed": passed, "failed": unexpected, "skipped": skipped, "total": total}
    except Exception:
        return None


def build_test_results_section(
    reports_dir: Path,
) -> list[str]:
    """Build the ### ✅ Test Results section from available result files."""
    backend = _parse_backend_results(reports_dir)
    frontend_unit = _parse_frontend_unit_results(reports_dir)
    e2e = _parse_e2e_results(reports_dir)

    suites = [
        ("Backend (pytest)", backend),
        ("Frontend Unit (vitest)", frontend_unit),
        ("Frontend E2E (Playwright)", e2e),
    ]

    # If no result files found at all, skip section
    if all(r is None for _, r in suites):
        return []

    total_passed = sum((r or {}).get("passed", 0) for _, r in suites)
    total_failed = sum((r or {}).get("failed", 0) for _, r in suites)
    total_all = sum((r or {}).get("total", 0) for _, r in suites)

    status_emoji = "✅" if total_failed == 0 else "❌"
    lines: list[str] = []
    lines.append(f"### {status_emoji} Test Results — {total_passed}/{total_all} passed")
    lines.append("")
    lines.append("| Suite | Passed | Failed | Skipped | Total |")
    lines.append("|-------|--------|--------|---------|-------|")
    for name, result in suites:
        if result is None:
            lines.append(f"| {name} | — | — | — | — |")
        else:
            lines.append(
                f"| {name} | {result['passed']} | {result['failed']} "
                f"| {result['skipped']} | {result['total']} |"
            )
    lines.append("")
    return lines


# ── Main ─────────────────────────────────────────────────────────────


def main() -> None:
    reports_dir = Path(os.getenv("REPORTS_DIR", "."))

    backend_data = _read_json(reports_dir / "backend-report" / "backend-coverage.json")
    frontend_unit_data = _read_json(
        reports_dir / "frontend-unit-report" / "coverage-summary.json"
    )
    e2e_data = _read_json(reports_dir / "frontend-e2e-report" / "flow-coverage.json")

    # Build sections
    backend_row, backend_details = build_backend_section(backend_data)
    frontend_row, frontend_details = build_frontend_unit_section(frontend_unit_data)
    e2e_row, e2e_details = build_e2e_section(e2e_data)
    test_results_lines = build_test_results_section(reports_dir)

    md: list[str] = []

    # ── Title ──
    md.append("## 📊 Coverage Report")
    md.append("")

    # ── Overview table ──
    md.append("| Suite | Coverage | Bar | Details |")
    md.append("|-------|----------|-----|---------|")
    md.append(backend_row)
    md.append(frontend_row)
    md.append(e2e_row)
    md.append("")

    # ── Test Results ──
    if test_results_lines:
        md.extend(test_results_lines)

    # ── Collapsible detail sections ──
    md.extend(backend_details)
    md.extend(frontend_details)
    md.extend(e2e_details)
    md.append("")

    # ── Footer ──
    md.append("---")
    md.append("")
    md.append("*Generated by CI — Coverage Summary*")

    report_text = "\n".join(md)

    # Write artifact
    output_path = reports_dir / "coverage-report.md"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report_text, encoding="utf-8")
    print(f"✅ Report written to {output_path}")

    # Write to GitHub Step Summary if in Actions
    summary_path = os.getenv("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as fh:
            fh.write(report_text)
            fh.write("\n")
        print("✅ Report appended to $GITHUB_STEP_SUMMARY")

    # Print to stdout as well
    print("\n" + report_text)


if __name__ == "__main__":
    main()
