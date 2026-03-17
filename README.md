# Corporación Fernando de Aragón — Web

> Lead generation website for Corporación Fernando de Aragón, a Colombian educational institution offering 15+ technical and vocational programs.

The site is designed around **one landing page per program** to maximize SEO relevance and ad conversion. Every page includes lead capture forms and a WhatsApp CTA.

[![Django](https://img.shields.io/badge/Django-6.0+-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Backend (Django)](#-backend-django)
- [Frontend (Vite + React)](#-frontend-vite--react)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## ✨ Features

### Frontend (Vite + React)
- ✅ **Vite 6 + React 18** - Fast SPA with TypeScript
- ✅ **React Router 7** - Client-side routing with dynamic program slugs
- ✅ **TailwindCSS 4** - Utility-first styling via `@tailwindcss/vite`
- ✅ **MUI 7 + Radix UI / shadcn** - Component library with Radix primitives
- ✅ **Lucide Icons** - Consistent icon set
- ✅ **Motion (Framer Motion)** - Scroll-driven animations and page transitions
- ✅ **Embla Carousel** - Responsive carousels for programs and testimonials
- ✅ **Lead Capture Forms** - Contact forms with program pre-selection
- ✅ **WhatsApp CTA** - Floating WhatsApp button on every page
- ✅ **Responsive Design** - Mobile-first layout (Navbar, Footer)
- ✅ **One Page per Program** - SEO-oriented landing pages for each course
- ✅ **Static Program Data** - All program info defined in TypeScript data files

### Backend (Django)
- ✅ **Django REST Framework** - API with function-based views
- ✅ **Contact Form Endpoint** - Receives lead form submissions and sends notification emails
- ✅ **Google reCAPTCHA** - Server-side captcha verification for form spam protection
- ✅ **Email Service** - Centralized email logic (`services/email_service.py`)
- ✅ **Custom User Model** - User with email as identifier and role-based permissions
- ✅ **Customized Django Admin** - Organized by sections
- ✅ **Fake Data Generation** - Management commands with Faker
- ✅ **Tests** - Pytest for models, serializers, views, admin, forms, services, and commands (100% coverage on `base_feature_app`)
- ✅ **CORS Configured** - Ready for local development (Vite on port 5173)
- ✅ **Environment Management** - `python-dotenv` with centralized settings

### Production Infrastructure
- ✅ **Automated Backups** - django-dbbackup with Huey scheduler
- ✅ **Query Profiling** - django-silk behind `ENABLE_SILK` flag
- ✅ **Task Queue** - Huey + Redis for background tasks
- ✅ **Systemd Templates** - Service files for Huey in production

---

## 🛠 Technologies

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Python | 3.12+ | Programming language |
| Django | 6.0+ | Web framework |
| Django REST Framework | 3.16+ | REST API toolkit |
| django-cors-headers | 4.9+ | CORS middleware |
| python-dotenv | 1.2+ | Environment variable management |
| requests | 2.32+ | HTTP library (reCAPTCHA verification) |
| Faker | 40.5+ | Fake data generation |
| factory-boy | 3.3+ | Test factories |
| freezegun | 1.5+ | Time mocking for tests |
| Pytest | 9.0+ | Testing framework |
| pytest-cov | 7.0+ | Coverage plugin |
| Ruff | 0.15+ | Python linter |
| django-dbbackup | 4.0+ | Database & media backup automation |
| django-silk | 5.0+ | Query profiling (optional) |
| Huey | 2.5+ | Lightweight task queue |
| Redis | 4.0+ | Message broker for Huey |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Vite | 6.4+ | Build tool and dev server |
| Vitest | 4.1+ | Unit testing framework |
| Playwright | Latest | E2E browser testing |
| React | 18.3+ | UI library |
| TypeScript | 5+ | Type-safe JavaScript |
| React Router | 7.13+ | Client-side routing |
| TailwindCSS | 4.1+ | CSS framework |
| MUI | 7.3+ | Material UI components |
| Radix UI / shadcn | Various | Accessible UI primitives |
| Lucide React | 0.487+ | Icon library |
| Motion | 12.23+ | Animations (Framer Motion) |
| Embla Carousel | 8.6+ | Carousel component |
| React Hook Form | 7.55+ | Form handling |
| Sonner | 2.0+ | Toast notifications |

---

## 📁 Project Structure

```
fernando_aragon_project/
├── backend/                              # Django Backend
│   ├── base_feature_app/                # Main app
│   │   ├── models/                      # User model
│   │   ├── serializers/                 # ContactFormSerializer
│   │   ├── views/                       # contact + captcha views
│   │   ├── urls/                        # URL routing (contact, captcha)
│   │   ├── forms/                       # Django admin forms (user)
│   │   ├── services/                    # Business logic (email_service)
│   │   ├── tests/                       # Tests
│   │   │   ├── models/                  # Model tests
│   │   │   ├── views/                   # View/endpoint tests
│   │   │   ├── services/                # Service tests (EmailService)
│   │   │   ├── commands/                # Management command tests
│   │   │   ├── utils/                   # Admin, forms, URL tests
│   │   │   ├── conftest.py              # App-level fixtures
│   │   │   └── helpers.py               # Test helper utilities
│   │   ├── admin.py                     # Custom admin site
│   │   └── management/commands/         # create_fake_data, create_users, delete_fake_data
│   ├── base_feature_project/            # Settings and configuration
│   │   ├── settings.py                  # Base settings
│   │   ├── urls.py                      # Root URL configuration
│   │   └── wsgi.py / asgi.py            # Server entry points
│   ├── conftest.py                      # Root pytest config (coverage report)
│   ├── pytest.ini                       # Pytest configuration
│   ├── requirements.txt                 # Python dependencies
│   └── .env.example                     # Environment variables (example)
│
├── frontend/                             # Vite + React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/                   # Page components
│   │   │   │   ├── Home.tsx             # Home page (hero, stats, programs, testimonials, lead form)
│   │   │   │   ├── English.tsx          # English program landing page
│   │   │   │   └── ProgramPage.tsx      # Dynamic program page (by slug)
│   │   │   ├── components/              # Shared components
│   │   │   │   ├── Layout.tsx           # Root layout (Navbar + Footer + WhatsApp)
│   │   │   │   ├── Navbar.tsx           # Responsive navigation with programs dropdown
│   │   │   │   ├── Footer.tsx           # Site footer
│   │   │   │   ├── LeadForm.tsx         # Lead capture form (name, email, phone, program)
│   │   │   │   ├── WhatsAppButton.tsx   # Floating WhatsApp CTA
│   │   │   │   ├── AnimatedCounter.tsx  # Scroll-triggered counter animation
│   │   │   │   ├── CurriculumSection.tsx # Program curriculum accordion
│   │   │   │   └── ui/                  # shadcn/ui primitive components
│   │   │   ├── data/                    # Static data
│   │   │   │   ├── programs.ts          # All program definitions (slug, name, icon, etc.)
│   │   │   │   └── curriculum.ts        # Curriculum modules per program
│   │   │   ├── services/
│   │   │   │   └── api.ts              # API client (submitContactForm)
│   │   │   ├── routes.ts               # React Router route definitions
│   │   │   └── App.tsx                  # Router provider
│   │   ├── __tests__/                   # Vitest unit tests
│   │   │   ├── services/api.test.ts     # API client tests
│   │   │   ├── data/programs.test.ts    # Programs data tests
│   │   │   ├── data/curriculum.test.ts  # Curriculum data tests
│   │   │   ├── routes.test.ts           # Router config tests
│   │   │   └── setup.ts                 # Test setup
│   │   ├── assets/                      # Static assets (logo, images)
│   │   └── main.tsx                     # App entry point
│   ├── e2e/                             # Playwright E2E tests
│   │   ├── home-page-load.spec.ts       # Home page tests
│   │   ├── contact-form-submit.spec.ts  # Contact form tests
│   │   ├── program-page-navigation.spec.ts # Program page tests
│   │   └── flow-definitions.json        # E2E flow definitions
│   ├── index.html                       # HTML entry point
│   ├── package.json                     # npm dependencies
│   ├── vite.config.ts                   # Vite configuration
│   ├── vitest.config.ts                 # Vitest test configuration
│   ├── playwright.config.ts             # Playwright E2E configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── postcss.config.mjs               # PostCSS configuration
│   └── .env.example                     # Environment variables (example)
│
├── scripts/                              # Test & quality tooling
│   ├── run-tests-all-suites.py          # Global test runner
│   ├── test_quality_gate.py             # Test quality gate CLI
│   ├── quality/                         # Quality gate analyzer modules
│   └── systemd/                         # Systemd service templates (Huey)
│
├── docs/                                 # Development standards (reusable)
│   ├── DJANGO_REACT_ARCHITECTURE_STANDARD.md
│   ├── TESTING_QUALITY_STANDARDS.md
│   ├── BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md
│   ├── E2E_FLOW_COVERAGE_REPORT_STANDARD.md
│   ├── TEST_QUALITY_GATE_REFERENCE.md
│   ├── GLOBAL_RULES_GUIDELINES.md
│   └── USER_FLOW_MAP.md
│
├── .gitignore                            # Git ignore rules
└── README.md                             # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+**
- **Node.js 20+** and **npm**
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd fernando_aragon_project
```

### 2. Backend Setup

```bash
# Create virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate  # Linux/Mac
# backend\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Run migrations
python manage.py migrate --settings=base_feature_project.settings

# Create superuser
python manage.py createsuperuser --settings=base_feature_project.settings

# Start server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your values (VITE_API_URL)

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 4. Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **Health Check**: http://localhost:8000/api/health/

---

## 🐍 Backend (Django)

### Environment Configuration

Copy the example file and configure your environment:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

See `backend/.env.example` for all available options grouped by category (environment, CORS, database, JWT, email, Redis, backups, Silk profiling, reCAPTCHA keys).

**Generate new SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Available Models

| Model | Description | Main Fields |
|-------|-------------|------------|
| **User** | Custom user (email as identifier) | email, first_name, last_name, phone, role, is_active, date_joined |

### API Endpoints

#### Contact / Lead Capture
```
POST   /api/contact/submit/            # Submit lead form (name, email, phone, program)
```

#### Google reCAPTCHA
```
GET    /api/google-captcha/site-key/    # Get reCAPTCHA site key
POST   /api/google-captcha/verify/      # Verify captcha token
```

#### System
```
GET    /api/health/                     # Health check
```

### Management Commands

```bash
cd backend
source venv/bin/activate

# Create test users
python manage.py create_users 10

# Create all fake data with defaults
python manage.py create_fake_data

# Create fake data with custom user count
python manage.py create_fake_data 20

# Delete all fake data (protects superusers/staff)
python manage.py delete_fake_data --confirm
```

### Django Admin

Admin panel header: **Corporación Fernando de Aragón - Administración**

- **👥 User Management**: Users

Access: http://localhost:8000/admin

---

## 🎨 Frontend (Vite + React)

### Environment Variables

Create a `frontend/.env.local` file based on `frontend/.env.example`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:8000/api
```

**Note:** In Vite, variables must start with `VITE_` to be accessible in the browser. Changes require a dev server restart.

### Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero section, stats, featured programs, testimonials, lead form |
| `/ingles` | English | English program landing page with levels and CTA |
| `/:slug` | ProgramPage | Dynamic landing page for each program (e.g., `/auxiliar-primera-infancia`) |

### Available Programs (defined in `src/app/data/programs.ts`)

- Programa de Inglés
- Auxiliar en Educación para la Primera Infancia
- Auxiliar Judicial y Tribunal
- Auxiliar en Operaciones Portuarias
- Auxiliar Administrativo
- Auxiliar de Aduana
- Auxiliar de Diseño y Producción Gráfica
- Investigación Judicial y Criminalística
- Operador de Equipo Pesado
- Patronaje, Corte y Confección
- Servicio al Huésped (Hotelería)
- Técnico en Peluquería y Barbería
- Auxiliar en Saneamiento Ambiental
- Auxiliar en Seguridad en el Trabajo
- Soporte de TI

### Main Components

- **Layout** — Root layout with Navbar, Footer, and WhatsApp button
- **Navbar** — Responsive navigation with programs dropdown menu
- **Footer** — Site footer with contact info and links
- **LeadForm** — Lead capture form (name, email, phone, program selector)
- **WhatsAppButton** — Floating WhatsApp CTA
- **AnimatedCounter** — Scroll-triggered animated statistics
- **CurriculumSection** — Accordion with program curriculum modules
- **ui/** — shadcn/ui primitive components (Button, Card, Dialog, etc.)

### NPM Scripts

```bash
npm run dev                # Vite development server (port 5173)
npm run build              # Production build
npm run preview            # Preview production build
npm test                   # Run Vitest unit tests
npm run test:watch         # Run Vitest in watch mode
npm run test:coverage      # Run Vitest with coverage report
npm run e2e                # Run Playwright E2E tests
npm run e2e:headed         # Run Playwright E2E tests in headed mode
npm run e2e:coverage       # Run Playwright E2E tests with flow coverage report
```

---

## 🧪 Testing

### Backend (Pytest) — 75 tests, 100% coverage

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest -v

# With coverage
pytest --cov

# Specific test directories
pytest base_feature_app/tests/models/ -v
pytest base_feature_app/tests/views/ -v
pytest base_feature_app/tests/services/ -v
pytest base_feature_app/tests/commands/ -v
```

| Category | Test Files | Tests |
|----------|-----------|-------|
| Models | `test_user_model.py` | 6 |
| Views | `test_captcha_views.py`, `test_contact_views.py` | 17 |
| Services | `test_email_service.py` | 6 |
| Commands | `test_silk_garbage_collect.py`, `test_tasks.py` | 14 |
| Utils | `test_admin.py`, `test_forms.py`, `test_urls.py`, `test_pytest_summary_total.py`, `test_run_tests_suites.py` | 32 |

### Frontend Unit (Vitest) — 22 tests

```bash
cd frontend

# Run unit tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

| Category | Test File | Tests |
|----------|----------|-------|
| Services | `api.test.ts` | 6 |
| Data | `programs.test.ts`, `curriculum.test.ts` | 13 |
| Routes | `routes.test.ts` | 3 |

### Frontend E2E (Playwright) — 9 tests

```bash
cd frontend

# Run E2E tests (headless)
npm run e2e

# Run E2E tests (headed, for debugging)
npm run e2e:headed

# Run E2E tests with flow coverage report
npm run e2e:coverage
```

| Flow | Test File | Tests |
|------|----------|-------|
| Home page load | `home-page-load.spec.ts` | 3 |
| Contact form | `contact-form-submit.spec.ts` | 3 |
| Program navigation | `program-page-navigation.spec.ts` | 3 |

### Quality Gate

```bash
# Backend quality gate
python scripts/test_quality_gate.py --repo-root . \
  --suite backend --semantic-rules strict --external-lint run

# Scoped to specific file
python scripts/test_quality_gate.py --repo-root . \
  --suite backend --semantic-rules strict --external-lint run \
  --include-file backend/base_feature_app/tests/views/test_contact_views.py
```

---

## 📚 Documentation

### Development Standards (reusable across projects)

| File | Description |
|------|-------------|
| **docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md** | Architecture standard (models, views, stores, routing, admin, fake data, tests) |
| **docs/TESTING_QUALITY_STANDARDS.md** | Test quality standards (naming, assertions, isolation, anti-patterns) |
| **docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md** | Coverage report configuration |
| **docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md** | E2E flow coverage reporter & flow definitions |
| **docs/TEST_QUALITY_GATE_REFERENCE.md** | Quality gate checks reference |
| **docs/USER_FLOW_MAP.md** | User flow map for this project |
| **docs/GLOBAL_RULES_GUIDELINES.md** | Global development rules & guidelines |
| **backend/.../commands/README.md** | Fake data commands guide |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/run-tests-all-suites.py` | Global test runner |
| `scripts/test_quality_gate.py` | Test quality gate CLI |
| `scripts/quality/` | Quality gate analyzer modules |
| `scripts/systemd/` | Systemd service templates (Huey) |

### Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env.example` | Environment variables template (backend) |
| `backend/pytest.ini` | Pytest configuration |
| `frontend/.env.example` | Environment variables template (frontend) |
| `frontend/vite.config.ts` | Vite configuration |
| `frontend/vitest.config.ts` | Vitest test configuration |
| `frontend/playwright.config.ts` | Playwright E2E configuration |
| `frontend/tsconfig.json` | TypeScript configuration |
| `frontend/postcss.config.mjs` | PostCSS configuration |

---

## 🤝 Contributing

1. Create a **branch** for your feature (`git checkout -b feature/AmazingFeature`)
2. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
3. **Push** to the branch (`git push origin feature/AmazingFeature`)
4. Open a **Pull Request**

### Code Standards

- **Backend**: Follow PEP 8 (enforced by `ruff`) and the guidelines in [docs/GLOBAL_RULES_GUIDELINES.md](docs/GLOBAL_RULES_GUIDELINES.md).
- **Tests**: Apply the standards in [docs/TESTING_QUALITY_STANDARDS.md](docs/TESTING_QUALITY_STANDARDS.md).
- **Commits**: Descriptive messages in English.

---

*Last updated: March 2026*
