# 🚀 Base Django + React + Next Feature Template

A full-stack template featuring Django REST Framework backend with Next.js + React frontend, complete with testing infrastructure and fake data generation.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Testing](#-testing)
- [Test Quality Gate](#-test-quality-gate)
- [Pre-commit Hooks](#-pre-commit-hooks)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)

---

## ✨ Features

### Backend (Django)
- ✅ Django REST Framework API
- ✅ **Complete Authentication System:**
  - Email/Password Sign Up & Sign In
  - Google OAuth Integration
  - Password Reset with Email Codes
  - JWT Token Management
- ✅ Custom User model with roles
- ✅ File uploads with django-attachments
- ✅ **Comprehensive fake data generation system**
- ✅ **Admin panel organized by sections**
- ✅ **Safe data deletion with admin protection**

### Frontend (Next.js + React)
- ✅ Next.js 16 with App Router
- ✅ React 19 with TypeScript
- ✅ **Modern Authentication UI:**
  - Sign In/Sign Up with forms
  - Google OAuth "Sign in with Google" button
  - Password Reset flow (email + code)
- ✅ Tailwind CSS for styling
- ✅ Zustand for state management
- ✅ **Complete testing suite (Unit + E2E)**
- ✅ **Jest + React Testing Library**
- ✅ **Playwright for E2E testing**
- ✅ **Code coverage configured (≥50%)**

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 5.0+
- **API:** Django REST Framework
- **Authentication:** Simple JWT
- **Database:** SQLite (development) / PostgreSQL (production)
- **File Storage:** Django Attachments + Easy Thumbnails
- **Testing:** pytest, Faker
- **Linting:** Ruff

### Frontend
- **Framework:** Next.js 16
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Testing:** Jest, React Testing Library, Playwright
- **Linting:** ESLint + eslint-plugin-playwright

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Generate fake data (optional)
python manage.py create_fake_data 50

# Run development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`  
Admin panel at `http://localhost:8000/admin/`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## 🧪 Testing

### Global Test Runner (Backend + Frontend)

Single script runs **all suites** (backend pytest, frontend unit, frontend E2E) from the repo root.

#### `run-tests-all-suites.py` — Sequential (default)

Runs suites **sequentially** by default. Use `--parallel` for fast feedback (add `--verbose` to stream suite output).

```bash
# Sequential (default)
python3 scripts/run-tests-all-suites.py

# Parallel mode
python3 scripts/run-tests-all-suites.py --parallel

# Resume failed suites
python3 scripts/run-tests-all-suites.py --resume

# Skip a suite
python3 scripts/run-tests-all-suites.py --skip-e2e

# Pass extra args to individual suites
python3 scripts/run-tests-all-suites.py --backend-markers "not slow" --e2e-workers 2
```

Logs are written to `test-reports/` (configurable via `--report-dir`). Logs are overwritten on
each run unless `--resume` is used, which appends to existing logs and uses
`test-reports/last-run.json` to re-run only failed suites.

Reports generated:

- Backend: pytest output in the suite log.
- Frontend unit coverage: `frontend/coverage/lcov-report/index.html`.
- Playwright report: `frontend/playwright-report/` and artifacts in `frontend/test-results/`.

### Backend - Fake Data Generation

Generate realistic test data for development:

```bash
cd backend

# Create all fake data
python manage.py create_fake_data 20

# Create specific models
python manage.py create_users 10
python manage.py create_blogs 15
python manage.py create_products 20
python manage.py create_sales 25

# Delete all fake data (protects admin users)
python manage.py delete_fake_data --confirm
```

📖 **Full documentation:** `backend/base_feature_app/management/commands/README.md`

### Frontend - Testing Suite

Run comprehensive tests with coverage:

```bash
cd frontend

# Unit tests
npm run test              # Run all unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report

# E2E tests (all viewports: desktop + mobile + tablet)
npm run e2e               # Full suite, all viewports
npm run e2e:coverage      # Full suite with coverage, all viewports

# E2E per-viewport filtering
npm run e2e:desktop       # Desktop Chrome only
npm run e2e:mobile        # Mobile Chrome (Pixel 5) only
npm run e2e:tablet        # Tablet (iPad Mini) only

# Combine viewport filter with specific spec
npm run e2e:desktop -- e2e/auth/auth.spec.ts

# Coverage with viewport filter
npm run e2e:mobile -- e2e/public/products.spec.ts

# List available E2E modules (from flow-definitions.json)
npm run e2e:modules

# Run tests for a single module
npm run e2e:module -- auth

# Module-scoped coverage run
clear && npm run e2e:clean && npm run e2e:coverage -- --grep @module:auth
npm run e2e:coverage:module -- auth

# E2E utilities
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:headed   # With visible browser
npm run test:e2e:debug    # Debug mode

# All tests
npm run test:all          # Unit + E2E
bash frontend/scripts/test-summary.sh  # With detailed summary
```

> `--grep @module:<name>` runs only tests tagged with that module. The flow coverage report will still list other modules as missing because the subset was not executed.

📖 **Full documentation:**
- `frontend/TESTING.md` - Complete testing guide
- `frontend/e2e/README.md` - E2E specific guide

---

## 🔍 Test Quality Gate

A modular static analysis tool that scores test quality across backend and frontend suites without executing tests.

```bash
# Full analysis (all suites, strict mode)
python3 scripts/test_quality_gate.py --repo-root . --external-lint run --semantic-rules strict --verbose

# Backend only
python3 scripts/test_quality_gate.py --repo-root . --suite backend --verbose

# Frontend E2E only
python3 scripts/test_quality_gate.py --repo-root . --suite frontend-e2e --verbose
```

### What it checks

| Category | Examples |
|----------|----------|
| Assertions | Missing, vague, useless |
| Test size | Too long, too short |
| Naming | Generic names, poor identifiers |
| Mocking | Excessive patches, unverified mocks |
| E2E quality | Fragile locators, hardcoded timeouts, sleep calls |
| External lint | Ruff (Python) + ESLint/Playwright (TypeScript) |

### Semantic modes

- `--semantic-rules off` — structural checks only
- `--semantic-rules soft` *(default)* — semantic findings as warnings
- `--semantic-rules strict` — semantic findings as errors

### Filtering specific files

```bash
python3 scripts/test_quality_gate.py --repo-root . \
  --include-file backend/base_feature_app/tests/views/test_auth_endpoints.py \
  --include-file frontend/e2e/checkout.spec.ts \
  --external-lint run --semantic-rules strict --verbose
```

Report saved to `test-results/test-quality-report.json`.

---

## 🔒 Pre-commit Hooks

The `test-quality-gate` hook runs automatically on staged test files before each commit.

### Setup

```bash
# Install pre-commit (once, globally or in venv)
pip install pre-commit

# Install hooks into the repo
pre-commit install
```

### Manual runs

```bash
# Run on currently staged test files
pre-commit run test-quality-gate

# Run on all tracked test files
pre-commit run test-quality-gate --all-files
```

The hook matches files under:
- `backend/base_feature_app/tests/**/*.py`
- `frontend/app/__tests__/**/*.{ts,tsx,js,jsx,vue}`
- `frontend/e2e/**/*.{ts,tsx,js,jsx,vue}`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `frontend/TESTING.md` | Frontend testing guide |
| `frontend/e2e/README.md` | Playwright E2E guide |
| `backend/.../commands/README.md` | Fake data commands |
| `docs/TESTING_QUALITY_STANDARDS.md` | Test quality criteria & anti-patterns |
| `docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` | Coverage report configuration |
| `docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md` | E2E flow coverage standard |
| `docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md` | Architecture reference |
| `docs/TEST_QUALITY_GATE_REFERENCE.md` | Quality gate scoring reference |

---

## 📁 Project Structure

```
base_django_react_next_feature/
├── backend/                    # Django backend
│   ├── base_feature_app/       # Main Django app
│   │   ├── management/
│   │   │   └── commands/       # Fake data generators
│   │   ├── models/             # Database models
│   │   ├── serializers/        # DRF serializers
│   │   ├── views/              # API views
│   │   ├── admin.py            # Admin configuration
│   │   └── tests/              # Django tests
│   ├── base_feature_project/   # Django project settings
│   ├── media/                  # User uploads
│   ├── requirements.txt        # Python dependencies
│   └── manage.py
│
├── frontend/                   # Next.js frontend
│   ├── app/                    # Next.js App Router
│   │   └── __tests__/          # Page tests
│   ├── components/             # React components
│   │   ├── blog/
│   │   │   └── __tests__/      # Component tests
│   │   ├── product/
│   │   │   └── __tests__/      # Component tests
│   │   └── layout/
│   ├── lib/                    # Utilities and stores
│   │   ├── __tests__/          # Fixtures
│   │   ├── stores/             # Zustand stores
│   │   │   └── __tests__/      # Store tests
│   │   └── services/           # API services
│   ├── e2e/                    # Playwright E2E tests
│   ├── scripts/                # Utility scripts
│   ├── jest.config.cjs         # Jest configuration
│   ├── playwright.config.ts    # Playwright configuration
│   ├── package.json
│   └── TESTING.md
│
├── scripts/                    # Global test & quality scripts
│   ├── run-tests-all-suites.py # Sequential test runner (default)
│   ├── test_quality_gate.py    # Static test quality analysis
│   └── quality/                # Quality gate modules
│
├── docs/                       # Project standards & guides
│   ├── TESTING_QUALITY_STANDARDS.md
│   ├── BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md
│   ├── E2E_FLOW_COVERAGE_REPORT_STANDARD.md
│   ├── DJANGO_REACT_ARCHITECTURE_STANDARD.md
│   └── TEST_QUALITY_GATE_REFERENCE.md
│
├── .gitignore                  # Root gitignore
└── README.md                   # This file
```

---

## 💻 Development

### Backend Development

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Run development server with live reload
python manage.py runserver

# Create new Django app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations
python manage.py migrate

# Access Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic
```

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Testing Workflow

1. **Generate test data:**
   ```bash
   cd backend
   python manage.py create_fake_data 50
   ```

2. **Develop with tests:**
   ```bash
   cd frontend
   npm run dev              # Terminal 1
   npm run test:watch       # Terminal 2
   ```

3. **Before committing:**
   ```bash
   npm run test:all
   npm run lint
   ```

---

## 🔒 Environment Variables

### Backend (.env)

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000
DJANGO_DB_ENGINE=django.db.backends.sqlite3
DJANGO_DB_NAME=db.sqlite3
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

---

## 🎯 Key Features Detail

### Fake Data System

The backend includes a comprehensive fake data generation system:

- **Safe deletion:** Never deletes superusers or staff
- **Realistic data:** Uses Faker for names, emails, addresses
- **Images:** Generates placeholder images or uses test images
- **Relationships:** Creates coherent data (sales → products)
- **Customizable:** Generate specific amounts per model

### Testing Infrastructure

Complete testing coverage for both backend and frontend:

- **34 unit tests** with Jest + React Testing Library
- **~30 E2E tests** with Playwright
- **Code coverage** configured (≥50% threshold)
- **Auto-start servers** for E2E tests
- **Reusable fixtures** for consistent test data

### Admin Panel

Organized Django admin with custom sections:

- 👥 User Management
- 📝 Blog Management
- 🛍️ Product Management
- 💰 Sales Management

---

## 📈 Coverage Goals

| Metric | Goal | Status |
|--------|------|--------|
| Lines | ≥ 50% | ✅ Configured |
| Functions | ≥ 50% | ✅ Configured |
| Branches | ≥ 50% | ✅ Configured |
| Statements | ≥ 50% | ✅ Configured |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm run test:all`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:

1. Check the documentation files
2. Review troubleshooting sections
3. Open an issue on GitHub
4. Contact the development team

---

**Made with ❤️ using Django, React, and Next.js**

Last updated: February 2026
