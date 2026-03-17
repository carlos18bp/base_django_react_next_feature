"""
Combine coverage reports from backend, frontend-unit, and frontend-e2e
into a unified Markdown summary for GitHub Actions Job Summary.

Reads:
  - backend-coverage-report/backend-coverage.json   (coverage.py JSON format)
  - frontend-unit-coverage-report/coverage-summary.json (vitest json-summary)
  - frontend-e2e-coverage-report/flow-coverage.json (custom Playwright reporter)

Writes:
  - coverage-report.md   (artifact + PR comment body)
  - $GITHUB_STEP_SUMMARY  (if running in GH Actions)
"""

from __future__ import annotations

import json
import os
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
    covered_stmts = num_stmts - totals.get("missing_lines", 0)
    num_branches = totals.get("num_branches", 0)
    missing_branches = totals.get("missing_branches", 0)
    covered_branches = num_branches - missing_branches
    branches_pct = ((covered_branches / num_branches) * 100) if num_branches > 0 else 0.0

    emoji = _pct_emoji(stmts_pct)
    details_text = f"{covered_stmts}/{num_stmts} stmts, {branches_pct:.1f}% branches"
    row = f"| Backend (pytest) | {emoji} {stmts_pct:.1f}% | `{_bar(stmts_pct)}` | {details_text} |"

    # Detail section
    details: list[str] = []
    details.append("")
    details.append("<details><summary>Backend Details</summary>")
    details.append("")
    details.append("| Metric | Covered | Total | % |")
    details.append("|--------|--------:|------:|------:|")
    details.append(f"| Statements | {covered_stmts} | {num_stmts} | {stmts_pct:.1f}% |")
    details.append(f"| Branches | {covered_branches} | {num_branches} | {branches_pct:.1f}% |")
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
    row = f"| Frontend Unit (vitest) | {emoji} {stmts_pct:.1f}% | `{_bar(stmts_pct)}` | {details_text} |"

    # Detail section
    details: list[str] = []
    details.append("")
    details.append("<details><summary>Frontend Unit Details</summary>")
    details.append("")
    details.append("| Metric | Covered | Total | % |")
    details.append("|--------|--------:|------:|------:|")
    details.append(f"| Statements | {stmts_covered} | {stmts_total} | {stmts_pct:.1f}% |")
    details.append(f"| Branches | {branches_covered} | {branches_total} | {branches_pct:.1f}% |")
    details.append(f"| Functions | {funcs_covered} | {funcs_total} | {funcs_pct:.1f}% |")
    details.append(f"| Lines | {lines_covered} | {lines_total} | {lines_pct:.1f}% |")
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
    row = f"| Frontend E2E (Playwright) | {emoji} {pct:.1f}% | `{_bar(pct)}` | {details_text} |"

    # Detail section
    details: list[str] = []
    details.append("")
    details.append("<details><summary>Frontend E2E Flow Details</summary>")
    details.append("")
    details.append("| Status | Count |")
    details.append("|--------|------:|")
    details.append(f"| ✅ Covered | {covered} |")
    details.append(f"| ⚠️ Partial | {partial} |")
    details.append(f"| ❌ Failing | {failing} |")
    details.append(f"| ⬜ Missing | {missing} |")
    details.append(f"| **Total** | **{total_flows}** |")
    details.append("")
    details.append("</details>")

    return row, details


# ── Main ─────────────────────────────────────────────────────────────


def main() -> None:
    reports_dir = Path(os.getenv("REPORTS_DIR", "."))

    backend_data = _read_json(reports_dir / "backend-coverage-report" / "backend-coverage.json")
    frontend_unit_data = _read_json(
        reports_dir / "frontend-unit-coverage-report" / "coverage-summary.json"
    )
    e2e_data = _read_json(reports_dir / "frontend-e2e-coverage-report" / "flow-coverage.json")

    # Build sections
    backend_row, backend_details = build_backend_section(backend_data)
    frontend_row, frontend_details = build_frontend_unit_section(frontend_unit_data)
    e2e_row, e2e_details = build_e2e_section(e2e_data)

    md: list[str] = []

    # ── Title ──
    md.append("# 📊 Coverage Report")
    md.append("")

    # ── Overview table ──
    md.append("| Suite | Coverage | Bar | Details |")
    md.append("|-------|----------|-----|---------|")
    md.append(backend_row)
    md.append(frontend_row)
    md.append(e2e_row)
    md.append("")

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
