# Vulnerability Audit Report — `double-check-30042026`

Date: 2026-04-30
Branch: `double-check-30042026` (from `origin/master`)

## Summary

### Frontend (npm)
- **Total CVEs**: 8 (info: 0, low: 0, moderate: 5, high: 3, critical: 0)
- Affected packages: `axios`, `brace-expansion`, `flatted`, `follow-redirects`, `next`, `next-intl`, `picomatch`, `postcss`

### Backend (pip-audit)
- **Total CVEs**: 11 across 5 packages
- Severity distribution (per advisory text — pip-audit does not emit CVSS classes):
  - high-impact (auth/CSRF/SSRF-class): 5 (Django admin/CSRF/header-spoof/MultiPart DoS)
  - moderate (DoS / local file): 4 (Django URLField, Django umask, Pillow FITS bomb, requests extract_zipped_paths)
  - low/local (symlink, tmp dir): 2 (python-dotenv, pytest)
- Affected packages: `Django`, `python-dotenv`, `pillow`, `pytest`, `requests`

## Frontend outdated

| package | current | wanted (patch+minor target) | latest (may be major) |
|---------|---------|------------------------------|------------------------|
| @playwright/test | 1.58.2 | 1.59.1 | 1.59.1 |
| @react-oauth/google | 0.13.4 | 0.13.5 | 0.13.5 |
| @tailwindcss/postcss | 4.2.1 | 4.2.4 | 4.2.4 |
| @types/node | 25.3.0 | 25.6.0 | 25.6.0 |
| axios | 1.13.5 | 1.15.2 | 1.15.2 |
| eslint | 9.39.3 | 9.39.4 | 10.2.1 |
| eslint-config-next | 16.1.6 | 16.1.6 | 16.2.4 |
| eslint-plugin-playwright | 2.7.1 | 2.10.2 | 2.10.2 |
| jest | 30.2.0 | 30.3.0 | 30.3.0 |
| jest-environment-jsdom | 30.2.0 | 30.3.0 | 30.3.0 |
| lucide-react | 1.8.0 | 1.14.0 | 1.14.0 |
| next | 16.1.6 | 16.1.6 (audit -> 16.2.4 in-major) | 16.2.4 |
| next-intl | 4.8.3 | 4.11.0 | 4.11.0 |
| react | 19.2.4 | 19.2.4 | 19.2.5 |
| react-dom | 19.2.4 | 19.2.4 | 19.2.5 |
| tailwindcss | 4.2.1 | 4.2.4 | 4.2.4 |
| typescript | 5.9.3 | 5.9.3 | 6.0.3 |
| zustand | 5.0.11 | 5.0.12 | 5.0.12 |

## Backend outdated

| package | current | wanted (patch+minor target) | latest |
|---------|---------|------------------------------|--------|
| coverage | 7.13.4 | 7.13.5 | 7.13.5 |
| Django | 6.0.2 | 6.0.4 | 6.0.4 |
| djangorestframework | 3.16.1 | 3.17.1 | 3.17.1 |
| Faker | 40.5.1 | 40.15.0 | 40.15.0 |
| gunicorn | 23.0.0 | 23.x (capped by `<24.0`) | 25.3.0 |
| pillow | 12.1.1 | 12.2.0 | 12.2.0 |
| pytest | 9.0.2 | 9.0.3 | 9.0.3 |
| pytest-cov | 7.0.0 | 7.1.0 | 7.1.0 |
| python-dotenv | 1.2.1 | 1.2.2 | 1.2.2 |
| requests | 2.32.5 | 2.33.1 | 2.33.1 |
| ruff | 0.15.2 | 0.15.12 | 0.15.12 |

## CVEs detail

### Frontend
| Package | Advisory | Severity | Fix version |
|---------|----------|----------|-------------|
| axios | GHSA-3p68-rc4w-qgx5 (NO_PROXY hostname normalization SSRF) | moderate | >=1.15.0 |
| axios | GHSA-fvcv-3m26-pcqx (Cloud metadata exfiltration) | moderate | >=1.15.0 |
| brace-expansion | GHSA-f886-m6hf-6m8v (DoS via zero-step) | moderate | >=5.0.5 (transitive) |
| flatted | GHSA-rf6f-7fwh-wjgh (prototype pollution) | high | >3.4.1 (override) |
| follow-redirects | GHSA-r4q5-vmmm-2653 (auth header leak on redirect) | moderate | transitive fix |
| next | GHSA-ggv3-7p47-pfv8 (HTTP request smuggling) | moderate | 16.1.7 |
| next | GHSA-3x4c-7xq6-9pq8 (next/image disk cache growth) | moderate | 16.1.7 |
| next | GHSA-h27x-g6w4-24gq (postponed resume DoS) | moderate | 16.1.7 |
| next | GHSA-mq59-m269-xvcx (null-origin Server Actions CSRF) | moderate | 16.1.7 |
| next | GHSA-jcc7-9wpm-mj36 (dev HMR null-origin) | low | 16.1.7 |
| next | GHSA-q4gf-8mx6-v5v3 (Server Components DoS) | high | 16.2.3 |
| next-intl | GHSA-8f24-v5vv-gm5j (open redirect) | moderate | >=4.9.1 |
| picomatch | GHSA-3v7f-55p6-f55p (method injection) | moderate | >=2.3.2 |
| picomatch | GHSA-c2c7-rcm5-vvqj (ReDoS) | high | >=2.3.2 |
| postcss | GHSA-qx2v-qp2m-jg93 (XSS via unescaped </style>) | moderate | >=8.5.10 (via next bump) |

### Backend
| Package | CVE | Severity | Fix version |
|---------|-----|----------|-------------|
| Django | CVE-2026-25674 (umask race in storage/cache) | medium | 6.0.3 |
| Django | CVE-2026-25673 (URLField NFKC DoS on Windows) | medium | 6.0.3 |
| Django | CVE-2026-33033 (MultiPartParser base64 DoS) | medium | 6.0.4 |
| Django | CVE-2026-33034 (ASGI Content-Length bypass DATA_UPLOAD_MAX_MEMORY_SIZE) | high | 6.0.4 |
| Django | CVE-2026-4292 (admin list_editable forged POST) | medium | 6.0.4 |
| Django | CVE-2026-4277 (GenericInlineModelAdmin permissions bypass) | medium | 6.0.4 |
| Django | CVE-2026-3902 (ASGIRequest header spoof underscore/hyphen) | high | 6.0.4 |
| python-dotenv | CVE-2026-28684 (symlink-following file overwrite) | low | 1.2.2 |
| pillow | CVE-2026-40192 (FITS decompression bomb) | medium | 12.2.0 |
| pytest | CVE-2025-71176 (predictable /tmp/pytest-of-{user}) | low | 9.0.3 |
| requests | CVE-2026-25645 (extract_zipped_paths predictable temp file) | low | 2.33.0 |

## Reproducibility

```bash
cd /home/dev-env/repos/base_django_react_next_feature
git fetch origin
git checkout origin/master
git checkout -b double-check-30042026

# Frontend
cd frontend
npm install
npm audit --json > /tmp/base_django_react_next_feature-npm-audit.json
npm outdated --json > /tmp/base_django_react_next_feature-npm-outdated.json

# Backend
cd ../backend
python3 -m venv .venv-audit
.venv-audit/bin/pip install --upgrade pip pip-audit
.venv-audit/bin/pip install -r requirements.txt
.venv-audit/bin/pip-audit -r requirements.txt --format json > /tmp/base_django_react_next_feature-pip-audit.json
.venv-audit/bin/pip list --outdated --format json > /tmp/base_django_react_next_feature-pip-outdated.json
```

## Post-update results

### Frontend
- `npm audit` after updates: 3 moderate remaining, all rooted in `next/node_modules/postcss@8.4.31`. The latest `next@16.2.4` (within major) still bundles this `postcss` version. The only `audit fix` path proposed is to downgrade `next` to `9.3.3` (major break) — skipped per rules. Direct `postcss` is up-to-date (`>=8.5.10`). Will be resolved upstream by Next.js.
- 5 of 8 original frontend CVEs resolved (axios, brace-expansion, flatted, follow-redirects, next-intl, picomatch fully fixed; next CVEs partially mitigated up to 16.2.4 — bundled postcss residual remains).
- `npm run build`: PASS
- `npm run test`: PASS (29 suites, 184 tests)
- `npm run lint`: PRE-EXISTING failures on origin/master (require() imports in `.cjs` scripts) — not introduced by this update.

### Backend
- `pip-audit -r requirements.txt`: **No known vulnerabilities found** (all 11 CVEs resolved).
- `python manage.py check`: PASS (0 issues)
- `pytest`: PASS (191 tests, 98.4% coverage)

## Updates rolled back

None — all selected patch+minor updates applied cleanly.

## Notes — majors available but skipped

- Frontend
  - `eslint` 10.2.1 (currently 9.x) — major bump skipped.
  - `typescript` 6.0.3 (currently 5.x) — major bump skipped.
  - `react` 19.2.5 / `react-dom` 19.2.5 are patch bumps (already on 19.x), kept inside major 19.
- Backend
  - `gunicorn` 25.3.0 (currently 23.x) — pin in `requirements.txt` is `>=23.0,<24.0`, kept inside major 23.
  - No backend dependency requires a major bump for CVE resolution; all listed CVEs have a fix within the current major.
