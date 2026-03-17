#!/usr/bin/env python3
"""Generate backend coverage Job Summary markdown from coverage-backend.json."""
import json
import sys

try:
    data = json.load(open('coverage-backend.json'))
except FileNotFoundError:
    sys.exit(0)

t = data.get('totals', {})
stmts_pct = t.get('percent_covered', 0)
br_total = t.get('num_branches', 0)
br_cov = t.get('covered_branches', 0)
br_pct = (br_cov / br_total * 100) if br_total else 0

print('## 🐍 Backend Coverage (pytest)')
print()
print('| Metric | Covered | Total | % |')
print('|--------|---------|-------|---|')
print(f'| Statements | {t.get("covered_lines", 0)} | {t.get("num_statements", 0)} | {stmts_pct:.1f}% |')
if br_total:
    print(f'| Branches | {br_cov} | {br_total} | {br_pct:.1f}% |')

# Compute function coverage from per-file function data (coverage.py 7.x+)
files = data.get('files', {})
total_funcs = 0
covered_funcs = 0
for fp, fd in files.items():
    if '/tests/' in fp:
        continue
    for func_data in fd.get('functions', {}).values():
        total_funcs += 1
        if func_data.get('executed_lines', []):
            covered_funcs += 1

if total_funcs > 0:
    funcs_pct = covered_funcs / total_funcs * 100
    print(f'| Functions | {covered_funcs} | {total_funcs} | {funcs_pct:.1f}% |')

lines_cov = t.get('covered_lines', 0)
lines_total = t.get('num_statements', 0)
print(f'| Lines | {lines_cov} | {lines_total} | {stmts_pct:.1f}% |')

# Top 5 files with most uncovered statements
file_list = []
for fp, fd in files.items():
    # Exclude test files — coverage on tests is not actionable
    if '/tests/' in fp:
        continue
    s = fd.get('summary', {})
    stmts = s.get('num_statements', 0)
    covered = s.get('covered_lines', 0)
    missing = stmts - covered
    pct = (covered / stmts * 100) if stmts else 100
    if missing > 0:
        file_list.append((fp, stmts, missing, pct))

file_list.sort(key=lambda x: -x[2])
top5 = file_list[:5]

if top5:
    print()
    print('**Top 5 — files needing coverage**')
    print()
    print('| File | Stmts | Missed | % |')
    print('|------|-------|--------|---|')
    for fp, stmts, missing, pct in top5:
        icon = '🟢' if pct >= 80 else ('🟡' if pct >= 50 else '🔴')
        print(f'| `{fp}` | {stmts} | {missing} | {icon} {pct:.1f}% |')
