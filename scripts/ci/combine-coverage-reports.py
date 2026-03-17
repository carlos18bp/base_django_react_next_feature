"""
Combine coverage reports from backend, frontend-unit, and frontend-e2e
into a unified Markdown summary for GitHub Actions Job Summary.

Reads:
  - backend-coverage-report/backend-coverage.json   (coverage.py JSON format)
  - frontend-unit-coverage-report/coverage-summary.json (vitest json-summary)
  - frontend-e2e-coverage-report/flow-coverage.json (custom Playwright reporter)

Writes:
  - combined-report.md  (artifact)
  - $GITHUB_STEP_SUMMARY (if running in GH Actions)
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path


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


def build_backend_section(data: dict | None) -> list[str]:
    lines: list[str] = []
    if data is None:
        lines.append("| Backend (pytest) | ⚠️ No report | — | — | — |")
        return lines

    totals = data.get("totals", {})
    stmts_pct = totals.get("percent_covered", 0.0)
    num_stmts = totals.get("num_statements", 0)
    missing = totals.get("missing_lines", 0)
    branches_pct = 0.0
    num_branches = totals.get("num_branches", 0)
    missing_branches = totals.get("missing_branches", 0)
    if num_branches > 0:
        branches_pct = ((num_branches - missing_branches) / num_branches) * 100

    emoji = _pct_emoji(stmts_pct)
    lines.append(
        f"| Backend (pytest) | {emoji} {stmts_pct:.1f}% | "
        f"{branches_pct:.1f}% | {num_stmts} | {missing} |"
    )

    # Top uncovered files
    files_data = data.get("files", {})
    uncovered = []
    for fpath, info in files_data.items():
        summary = info.get("summary", {})
        file_missing = summary.get("missing_lines", 0)
        file_pct = summary.get("percent_covered", 100.0)
        if file_missing > 0:
            short = fpath.split("base_feature_app/")[-1] if "base_feature_app/" in fpath else fpath
            uncovered.append((short, file_pct, file_missing))

    if uncovered:
        uncovered.sort(key=lambda x: x[1])
        lines.append("")
        lines.append("<details><summary>📋 Backend — Top uncovered files</summary>")
        lines.append("")
        lines.append("| File | Coverage | Missing |")
        lines.append("|------|----------|---------|")
        for name, pct, miss in uncovered[:10]:
            lines.append(f"| `{name}` | {pct:.1f}% | {miss} lines |")
        lines.append("")
        lines.append("</details>")

    return lines


def build_frontend_unit_section(data: dict | None) -> list[str]:
    lines: list[str] = []
    if data is None:
        lines.append("| Frontend Unit (vitest) | ⚠️ No report | — | — | — |")
        return lines

    total = data.get("total", {})
    stmts = total.get("statements", {})
    branches = total.get("branches", {})
    funcs = total.get("functions", {})
    lines_cov = total.get("lines", {})

    stmts_pct = stmts.get("pct", 0)
    branches_pct = branches.get("pct", 0)
    stmts_total = stmts.get("total", 0)
    stmts_missing = stmts_total - stmts.get("covered", 0)

    emoji = _pct_emoji(stmts_pct)
    lines.append(
        f"| Frontend Unit (vitest) | {emoji} {stmts_pct:.1f}% | "
        f"{branches_pct:.1f}% | {stmts_total} | {stmts_missing} |"
    )

    # Top uncovered files
    uncovered = []
    for fpath, info in data.items():
        if fpath == "total":
            continue
        file_stmts = info.get("statements", {})
        file_total = file_stmts.get("total", 0)
        file_covered = file_stmts.get("covered", 0)
        file_missing = file_total - file_covered
        file_pct = file_stmts.get("pct", 100)
        if file_missing > 0:
            short = fpath.split("/src/")[-1] if "/src/" in fpath else fpath
            uncovered.append((short, file_pct, file_missing))

    if uncovered:
        uncovered.sort(key=lambda x: x[1])
        lines.append("")
        lines.append("<details><summary>📋 Frontend Unit — Top uncovered files</summary>")
        lines.append("")
        lines.append("| File | Coverage | Missing |")
        lines.append("|------|----------|---------|")
        for name, pct, miss in uncovered[:10]:
            lines.append(f"| `{name}` | {pct:.1f}% | {miss} stmts |")
        lines.append("")
        lines.append("</details>")

    return lines


def build_e2e_section(data: dict | None) -> list[str]:
    lines: list[str] = []
    if data is None:
        lines.append("| Frontend E2E (Playwright) | ⚠️ No report | — | — | — |")
        return lines

    summary = data.get("summary", {})
    total_flows = summary.get("total", 0)
    covered = summary.get("covered", 0)
    partial = summary.get("partial", 0)
    failing = summary.get("failing", 0)
    missing = summary.get("missing", 0)

    pct = (covered / total_flows * 100) if total_flows > 0 else 0
    emoji = _pct_emoji(pct)

    lines.append(
        f"| Frontend E2E (Playwright) | {emoji} {pct:.1f}% flows | "
        f"{covered}/{total_flows} covered | "
        f"{failing} failing | {missing} missing |"
    )

    # Detail: missing/failing flows
    flows = data.get("flows", {})
    problem_flows = []
    for flow_id, flow_data in flows.items():
        status = flow_data.get("status", "missing")
        if status in ("missing", "failing"):
            priority = flow_data.get("definition", {}).get("priority", "P4")
            name = flow_data.get("definition", {}).get("name", flow_id)
            problem_flows.append((flow_id, name, status, priority))

    if problem_flows:
        problem_flows.sort(key=lambda x: x[3])
        lines.append("")
        lines.append("<details><summary>📋 E2E — Missing/Failing flows</summary>")
        lines.append("")
        lines.append("| Flow ID | Name | Status | Priority |")
        lines.append("|---------|------|--------|----------|")
        for fid, name, status, priority in problem_flows[:15]:
            lines.append(f"| `{fid}` | {name} | {_status_emoji(status)} {status} | {priority} |")
        lines.append("")
        lines.append("</details>")

    return lines


def main() -> None:
    reports_dir = Path(os.getenv("REPORTS_DIR", "."))

    backend_data = _read_json(reports_dir / "backend-coverage-report" / "backend-coverage.json")
    frontend_unit_data = _read_json(reports_dir / "frontend-unit-coverage-report" / "coverage-summary.json")
    e2e_data = _read_json(reports_dir / "frontend-e2e-coverage-report" / "flow-coverage.json")

    md: list[str] = []

    md.append("# 📊 Combined Coverage Report")
    md.append("")
    md.append("## Summary")
    md.append("")
    md.append("| Suite | Statements | Branches | Total Stmts | Missing |")
    md.append("|-------|------------|----------|-------------|---------|")
    md.extend(build_backend_section(backend_data))
    md.extend(build_frontend_unit_section(frontend_unit_data))
    md.extend(build_e2e_section(e2e_data))
    md.append("")

    # Overall status
    all_ok = True
    suites_found = 0
    if backend_data:
        suites_found += 1
        if backend_data.get("totals", {}).get("percent_covered", 0) < 70:
            all_ok = False
    if frontend_unit_data:
        suites_found += 1
        if frontend_unit_data.get("total", {}).get("statements", {}).get("pct", 0) < 70:
            all_ok = False
    if e2e_data:
        suites_found += 1
        summary = e2e_data.get("summary", {})
        if summary.get("failing", 0) > 0:
            all_ok = False

    if suites_found == 0:
        md.append("> ⚠️ No coverage reports found. Check that the test jobs completed successfully.")
    elif all_ok:
        md.append("> ✅ All suites meet minimum coverage thresholds.")
    else:
        md.append("> ⚠️ Some suites are below recommended thresholds or have failing tests.")

    md.append("")
    md.append("---")
    md.append(f"*Generated by CI — {suites_found}/3 suites reported*")

    report_text = "\n".join(md)

    # Write artifact
    output_path = reports_dir / "combined-report.md"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report_text, encoding="utf-8")
    print(f"✅ Combined report written to {output_path}")

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
