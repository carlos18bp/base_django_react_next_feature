# 🚀 Base Django React Next Feature

> Base template for developing projects with Django REST Framework + Next.js + React

This repository serves as a foundation for rapid implementation of future projects using Django backend and Next.js + React frontend, with RESTful architecture and JWT authentication.

[![Django](https://img.shields.io/badge/Django-6.0+-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Backend (Django)](#-backend-django)
- [Frontend (Next.js + React)](#-frontend-nextjs--react)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Reference Projects](#-reference-projects)
- [Customization](#-customization)
- [Contributing](#-contributing)

---

## ✨ Features

### Backend (Django)
- ✅ **Django REST Framework** - Complete RESTful API with function-based views
- ✅ **JWT Authentication** - Simple JWT for tokens
- ✅ **Google OAuth** - Sign in with Google (token verification via `requests`)
- ✅ **Password Reset** - Email-based passcode flow with `PasswordCode` model
- ✅ **Email Service** - Centralized email logic (`services/email_service.py`)
- ✅ **Custom User Model** - User with email as identifier and role-based permissions
- ✅ **Complete CRUD** - Blog, Product, Sale, User
- ✅ **Customized Django Admin** - Organized by sections
- ✅ **File Management** - `django-attachments` for images and files
- ✅ **Image Thumbnails** - `easy-thumbnails` for automatic resizing
- ✅ **Automatic File Cleanup** - `django-cleanup` removes orphan files
- ✅ **Fake Data Generation** - Management commands with Faker + factory-boy
- ✅ **Complete Tests** - Pytest for models, serializers, views, admin, forms, and utilities
- ✅ **Linting** - Ruff for fast Python linting
- ✅ **Coverage Reporting** - Custom terminal coverage report with top-N focus files
- ✅ **CORS Configured** - Ready for local development
- ✅ **Environment Management** - `python-dotenv` with centralized settings

### Frontend (Next.js + React)
- ✅ **Next.js 16 + App Router** - Server and client components with TypeScript
- ✅ **React 19** - Latest React with hooks and server components
- ✅ **TypeScript** - Full type safety across the project
- ✅ **Zustand** - State management with `persist` middleware (cart, locale)
- ✅ **Axios** - HTTP client with interceptors and automatic token refresh
- ✅ **TailwindCSS 4** - Utility-first styling via `@tailwindcss/postcss`
- ✅ **Google Login** - `@react-oauth/google` integration
- ✅ **next-intl** - Multi-language internationalization (en/es)
- ✅ **Cookie-based Auth** - `js-cookie` for token storage
- ✅ **JWT Decode** - `jwt-decode` for client-side token inspection
- ✅ **Custom Hooks** - `useRequireAuth` for protected routes
- ✅ **Reusable Components** - Carousels, cards, layout components
- ✅ **Jest 30** - Unit and component tests with React Testing Library
- ✅ **Playwright** - Modular E2E tests with flow coverage reporter

### DevOps & Tooling
- ✅ **Git Configuration** - Complete `.gitignore`
- ✅ **Pre-commit Hook** - Test quality gate on staged test files
- ✅ **ESLint** - TypeScript linting with `eslint-config-next` + `eslint-plugin-playwright`
- ✅ **Ruff** - Python linting
- ✅ **Environment Variables** - Documented `.env.example` files (backend + frontend)
- ✅ **CI Workflow** - GitHub Actions test quality gate
- ✅ **Documentation** - Complete architecture, testing, and quality standards

---

## 🛠 Technologies

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Python | 3.12+ | Programming language |
| Django | 6.0+ | Web framework |
| Django REST Framework | 3.16+ | REST API toolkit |
| Simple JWT | 5.5+ | JWT authentication |
| django-cors-headers | 4.9+ | CORS middleware |
| django-attachments | Custom | File management |
| django-cleanup | 9.0+ | Automatic orphan file removal |
| easy-thumbnails | 2.10+ | Image thumbnail generation |
| python-dotenv | 1.2+ | Environment variable management |
| requests | 2.32+ | HTTP library (Google OAuth verification) |
| Faker | 40.5+ | Fake data generation |
| factory-boy | 3.3+ | Test factories |
| freezegun | 1.5+ | Time mocking for tests |
| Pytest | 9.0+ | Testing framework |
| pytest-cov | 7.0+ | Coverage plugin |
| Ruff | 0.15+ | Python linter |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Next.js | 16.1+ | React framework with App Router |
| React | 19.2+ | UI library |
| TypeScript | 5+ | Type-safe JavaScript |
| Zustand | 5.0+ | State management |
| Axios | 1.13+ | HTTP client |
| TailwindCSS | 4.2+ | CSS framework |
| next-intl | 4.8+ | Internationalization |
| @react-oauth/google | 0.13+ | Google OAuth |
| js-cookie | 3.0+ | Cookie management |
| jwt-decode | 4.0+ | JWT token decoding |
| ESLint | 9.39+ | TypeScript linting |
| eslint-plugin-playwright | 2.7+ | Playwright lint rules |
| Jest | 30.2+ | Unit testing |
| @testing-library/react | 16.3+ | React component testing |
| Playwright | 1.58+ | E2E testing |

---

## 📁 Project Structure

```
base_django_react_next_feature/
├── backend/                              # Django Backend
│   ├── base_feature_app/                # Main app
│   │   ├── models/                      # Blog, Product, Sale, SoldProduct, User, PasswordCode
│   │   ├── serializers/                 # List, Detail, CreateUpdate per model
│   │   ├── views/                       # Function-based CRUD views + auth
│   │   ├── urls/                        # URL routing by model
│   │   ├── forms/                       # Django forms (blog, product, user)
│   │   ├── services/                    # Business logic (email_service)
│   │   ├── utils/                       # Utility functions (auth_utils)
│   │   ├── tests/                       # Tests
│   │   │   ├── models/                  # Model tests
│   │   │   ├── serializers/             # Serializer tests
│   │   │   ├── views/                   # View/endpoint tests
│   │   │   ├── services/               # Service tests
│   │   │   ├── commands/               # Management command tests
│   │   │   ├── utils/                   # Admin, forms, URL, auth utils tests
│   │   │   ├── conftest.py              # App-level fixtures
│   │   │   └── helpers.py              # Test helper utilities
│   │   ├── admin.py                     # Custom admin site organized by sections
│   │   └── management/commands/         # create_fake_data, delete_fake_data, etc.
│   ├── base_feature_project/            # Settings and configuration
│   │   ├── settings.py                  # Base settings
│   │   ├── urls.py                      # Root URL configuration
│   │   ├── wsgi.py / asgi.py            # Server entry points
│   │   └── __init__.py
│   ├── django_attachments/              # File management app
│   ├── conftest.py                      # Root pytest config (coverage report)
│   ├── pytest.ini                       # Pytest configuration
│   ├── requirements.txt                 # Python dependencies
│   └── .env.example                     # Environment variables (example)
│
├── frontend/                             # Next.js + React Frontend
│   ├── app/                             # Next.js App Router
│   │   ├── page.tsx                     # Home page
│   │   ├── layout.tsx                   # Root layout (Header + Footer)
│   │   ├── providers.tsx                # Google OAuth provider
│   │   ├── globals.css                  # Global styles
│   │   ├── sign-in/                     # Sign in page
│   │   ├── sign-up/                     # Sign up page
│   │   ├── forgot-password/             # Password reset page
│   │   ├── blogs/                       # Blog list + [blogId] detail
│   │   ├── catalog/                     # Product catalog
│   │   ├── products/                    # [productId] detail
│   │   ├── checkout/                    # Checkout page
│   │   ├── dashboard/                   # Dashboard (auth)
│   │   ├── backoffice/                  # Backoffice (auth)
│   │   └── __tests__/                   # Page-level tests
│   ├── components/                      # React components
│   │   ├── blog/                        # BlogCard, BlogCarousel
│   │   │   └── __tests__/               # Component tests
│   │   ├── product/                     # ProductCard, ProductCarousel
│   │   │   └── __tests__/               # Component tests
│   │   └── layout/                      # Header, Footer
│   │       └── __tests__/               # Layout tests
│   ├── lib/                             # Libraries and utilities
│   │   ├── stores/                      # Zustand stores
│   │   │   ├── authStore.ts             # Authentication + token management
│   │   │   ├── blogStore.ts             # Blog state
│   │   │   ├── productStore.ts          # Product state
│   │   │   ├── cartStore.ts             # Shopping cart (persisted)
│   │   │   ├── localeStore.ts           # Language state (persisted)
│   │   │   └── __tests__/               # Store tests
│   │   ├── services/                    # API client + token utilities
│   │   │   ├── http.ts                  # Axios instance with interceptors
│   │   │   ├── tokens.ts                # Cookie-based token management
│   │   │   └── __tests__/               # Service tests
│   │   ├── hooks/                       # Custom hooks
│   │   │   ├── useRequireAuth.ts        # Auth guard hook
│   │   │   └── __tests__/               # Hook tests
│   │   ├── i18n/                        # Internationalization config
│   │   │   ├── config.ts                # Locale definitions (en/es)
│   │   │   └── __tests__/               # i18n tests
│   │   ├── types.ts                     # TypeScript type definitions
│   │   ├── constants.ts                 # Routes, API endpoints, cookie keys
│   │   └── __tests__/                   # Constants tests + fixtures
│   ├── e2e/                             # Modular E2E tests (Playwright)
│   │   ├── auth/                        # Login, logout, register tests
│   │   ├── app/                         # Cart, checkout, purchase, user flows
│   │   ├── public/                      # Blogs, products, navigation, smoke
│   │   ├── helpers/                     # Flow tags, test utils
│   │   ├── reporters/                   # Flow coverage reporter
│   │   ├── fixtures.ts                  # E2E test fixtures
│   │   └── flow-definitions.json        # E2E flow definitions
│   ├── scripts/                         # Coverage & module helpers
│   │   ├── ast-parser.cjs               # AST parser for quality analysis
│   │   ├── coverage-summary.cjs         # Coverage summary generator
│   │   ├── e2e-modules.cjs              # List E2E modules
│   │   ├── e2e-module.cjs               # Run single E2E module
│   │   ├── e2e-coverage-module.cjs      # Module-scoped coverage
│   │   ├── test-summary.sh              # Test summary script
│   │   └── __tests__/                   # Script tests
│   ├── package.json                     # npm dependencies
│   ├── jest.config.cjs                  # Jest configuration
│   ├── playwright.config.ts             # Playwright configuration
│   ├── eslint.config.mjs                # ESLint configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── next.config.ts                   # Next.js configuration (rewrites)
│   ├── postcss.config.mjs               # PostCSS configuration
│   ├── TESTING.md                       # Frontend testing guide
│   ├── SETUP.md                         # Frontend setup guide
│   └── .env.example                     # Environment variables (example)
│
├── scripts/                              # Test & quality tooling
│   ├── run-tests-all-suites.py          # Global test runner (backend + unit + E2E)
│   ├── test_quality_gate.py             # Test quality gate CLI
│   └── quality/                         # Quality gate analyzer modules
│
├── docs/                                 # Project documentation
│   ├── DJANGO_REACT_ARCHITECTURE_STANDARD.md
│   ├── TESTING_QUALITY_STANDARDS.md
│   ├── BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md
│   ├── E2E_FLOW_COVERAGE_REPORT_STANDARD.md
│   ├── TEST_QUALITY_GATE_REFERENCE.md
│   ├── GLOBAL_RULES_GUIDELINES.md
│   └── USER_FLOW_MAP.md
│
├── .github/workflows/                    # CI pipelines
│   └── test-quality-gate.yml            # Quality gate GitHub Action
├── .pre-commit-config.yaml              # Pre-commit hooks
├── .gitignore                            # Git ignore rules
├── test-reports/                         # Test runner logs & resume metadata
├── test-results/                         # Quality gate reports
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
git clone https://github.com/carlos18bp/base_django_react_next_feature.git
cd base_django_react_next_feature
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
cd backend
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create test data with defaults (optional)
python manage.py create_fake_data

# Create test data with custom count (optional)
python manage.py create_fake_data 20

# Delete test data (optional — protects superusers)
python manage.py delete_fake_data --confirm

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
# Edit .env.local with your values

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 4. Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

---

## 🐍 Backend (Django)

### Environment Variables

Create a `backend/.env` file based on `backend/.env.example`:

```bash
# Core settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
DJANGO_CORS_ALLOWED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000
DJANGO_CSRF_TRUSTED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000

# Database (SQLite by default)
DJANGO_DB_ENGINE=django.db.backends.sqlite3
DJANGO_DB_NAME=db.sqlite3

# JWT
DJANGO_JWT_ACCESS_MINUTES=15
DJANGO_JWT_REFRESH_DAYS=7

# Google OAuth (optional)
DJANGO_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Email (optional — falls back to console backend if not set)
# DJANGO_EMAIL_HOST_USER=your-email@gmail.com
# DJANGO_EMAIL_HOST_PASSWORD=your-app-password
# DJANGO_DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**Generate new SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Available Models

| Model | Description | Main Fields |
|-------|-------------|------------|
| **User** | Custom user (email as identifier) | email, first_name, last_name, phone, role, is_active, date_joined |
| **Blog** | Blog entries | title, description, category, image |
| **Product** | Products | title, category, sub_category, description, price, gallery |
| **Sale** | Sales | email, address, city, state, postal_code, sold_products (M2M) |
| **SoldProduct** | Products in a sale | product (FK), quantity |
| **PasswordCode** | Password reset codes | user (FK), code, created_at, used |

### API Endpoints

#### Authentication
```
POST   /api/token/                                    # Get JWT tokens (access + refresh)
POST   /api/token/refresh/                             # Refresh JWT token
POST   /api/sign_in/                                   # Sign in (email + password)
POST   /api/sign_up/                                   # Register new user
POST   /api/google_login/                              # Sign in with Google OAuth
POST   /api/send_passcode/                             # Send password reset code via email
POST   /api/verify_passcode_and_reset_password/        # Verify code and reset password
POST   /api/update_password/                           # Update password (auth)
GET    /api/validate_token/                            # Validate current token (auth)
```

#### Blog
```
GET    /api/blogs-data/                # List blogs (public, serialized)
GET    /api/blogs/                     # List blogs (CRUD)
POST   /api/blogs/                     # Create blog (auth)
GET    /api/blogs/<id>/                # Blog detail
PUT    /api/blogs/<id>/                # Update blog (auth)
DELETE /api/blogs/<id>/                # Delete blog (auth)
```

#### Product
```
GET    /api/products-data/             # List products (public, serialized)
GET    /api/products/                  # List products (CRUD)
POST   /api/products/                  # Create product (auth)
GET    /api/products/<id>/             # Product detail
PUT    /api/products/<id>/             # Update product (auth)
DELETE /api/products/<id>/             # Delete product (auth)
```

#### Sale
```
POST   /api/create-sale/               # Create sale (public checkout)
GET    /api/sales/                     # List sales (auth)
GET    /api/sales/<id>/                # Sale detail (auth)
```

#### User
```
GET    /api/users/                     # List users (auth)
POST   /api/users/                     # Create user (auth)
GET    /api/users/<id>/                # User detail (auth)
PUT    /api/users/<id>/                # Update user (auth)
DELETE /api/users/<id>/                # Delete user (auth)
```

### Management Commands

#### Create Fake Data

```bash
# Create all data with defaults
python manage.py create_fake_data

# Create all data with a single count for every model
python manage.py create_fake_data 20

# Individual commands
python manage.py create_blogs 20
python manage.py create_products 50
python manage.py create_sales 30
python manage.py create_users 10
```

**Note:** The `create_users` command never deletes superusers or staff.

#### Delete Fake Data

```bash
# Delete all fake data (protects superusers)
python manage.py delete_fake_data --confirm
```

### Django Admin

Admin is organized in logical sections:

- **👥 User Management**: Users, PasswordCodes
- **📝 Blog Management**: Blogs
- **🛍️ Product Management**: Products
- **💰 Sales Management**: Sales, SoldProducts

Access: http://localhost:8000/admin

---

## 🎨 Frontend (Next.js + React)

### Environment Variables

Create a `frontend/.env.local` file based on `frontend/.env.example`:

```bash
# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API Configuration (optional — defaults to /api which uses Next.js rewrites)
NEXT_PUBLIC_API_BASE_URL=/api

# Django backend origin used by Next.js rewrites and media proxy
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:8000
```

**Note:** In Next.js, variables must start with `NEXT_PUBLIC_` to be accessible in the browser. Changes require a dev server restart.

### Store Structure (Zustand)

#### Auth Store (`lib/stores/authStore.ts`)
```typescript
// State
{ accessToken, refreshToken, user, isAuthenticated }

// Actions
signIn({ email, password })             // Authenticate via API
signUp({ email, password, ... })         // Register new user
googleLogin({ credential, ... })         // Sign in with Google
signOut()                                // Clear tokens + user
syncFromCookies()                        // Sync state from cookies
sendPasswordResetCode(email)             // Send reset code
resetPassword({ email, code, new_password }) // Verify code + reset
```

#### Blog Store (`lib/stores/blogStore.ts`)
```typescript
// State
{ blogs: [], loading, error }

// Actions
fetchBlogs()                             // Fetch all blogs
fetchBlog(blogId)                        // Fetch single blog

// Selectors
selectBlogs, selectBlogsLoading, selectBlogsError
```

#### Product Store (`lib/stores/productStore.ts`)
```typescript
// State
{ products: [], loading, error }

// Actions
fetchProducts()                          // Fetch all products
fetchProduct(productId)                  // Fetch single product

// Selectors
selectProducts, selectProductsLoading, selectProductsError
```

#### Cart Store (`lib/stores/cartStore.ts`)
```typescript
// State (persisted via zustand/persist)
{ items: CartItem[] }

// Actions
addToCart(product, quantity)              // Add/increment cart item
removeFromCart(productId)                 // Remove cart item
updateQuantity(productId, quantity)       // Update item quantity
clearCart()                              // Empty cart
subtotal()                               // Calculate total price
```

#### Locale Store (`lib/stores/localeStore.ts`)
```typescript
// State (persisted via zustand/persist)
{ locale: 'en' }

// Actions
setLocale(locale)                        // Switch locale (en/es)
```

### Main Components

#### Blog
- **BlogCard** - Blog presentation card
- **BlogCarousel** - Featured blogs carousel

#### Product
- **ProductCard** - Product presentation card
- **ProductCarousel** - Products carousel

#### Layout
- **Header** - Main navigation
- **Footer** - Footer

### Available Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Home page |
| `/blogs` | Blogs | Blog list |
| `/blogs/:blogId` | Blog Detail | Blog detail |
| `/catalog` | Catalog | Product catalog |
| `/products/:productId` | Product Detail | Product detail |
| `/checkout` | Checkout | Checkout |
| `/sign-in` | Sign In | Sign in (guest only) |
| `/sign-up` | Sign Up | Sign up (guest only) |
| `/forgot-password` | Forgot Password | Password reset flow |
| `/dashboard` | Dashboard | Dashboard (auth) |
| `/backoffice` | Backoffice | Backoffice (auth) |

### NPM Scripts

```bash
# Development
npm run dev                # Development server
npm run build              # Production build
npm run start              # Start production server

# Unit Testing (Jest)
npm run test               # Run all unit tests
npm run test:watch         # Watch mode
npm run test:ci            # CI mode
npm run test:coverage      # Unit tests with coverage report

# E2E Testing (Playwright)
npm run e2e                # Run all E2E tests
npm run e2e:desktop        # Desktop Chrome only
npm run e2e:mobile         # Mobile Chrome (Pixel 5) only
npm run e2e:tablet         # Tablet (iPad Mini) only
npm run e2e:coverage       # E2E + user flow coverage report

# E2E — module helpers
npm run e2e:modules        # List available E2E modules
npm run e2e:module -- auth # Run a single module
npm run e2e:coverage:module -- auth  # Module-scoped coverage

# E2E — utilities
npm run test:e2e:ui        # Interactive UI
npm run test:e2e:headed    # With visible browser
npm run test:e2e:debug     # Debug mode

# Combined
npm run test:all           # Unit + E2E

# Cleanup
npm run e2e:clean          # Remove playwright-report, test-results, blob-report

# Linting
npm run lint               # Run ESLint
```

---

## 🧪 Testing

### Global Test Runner (Backend + Frontend + E2E)

Run **backend pytest**, **frontend unit (Jest)**, and **frontend E2E (Playwright)** from a single command. By default suites run **sequentially** with verbose output; use `--parallel` for parallel execution with a live progress indicator. Use `--resume` to re-run only failed/unknown suites from the last run.

```bash
# From repo root — sequential (default)
python3 scripts/run-tests-all-suites.py

# Parallel mode
python3 scripts/run-tests-all-suites.py --parallel

# Resume failed/unknown suites from last run
python3 scripts/run-tests-all-suites.py --resume

# Skip a suite
python3 scripts/run-tests-all-suites.py --skip-e2e
python3 scripts/run-tests-all-suites.py --skip-backend --skip-unit

# Pass extra args to individual suites
python3 scripts/run-tests-all-suites.py --backend-args="-k test_user" --e2e-args="--headed"

# Force output mode
python3 scripts/run-tests-all-suites.py --parallel --verbose
python3 scripts/run-tests-all-suites.py --quiet

# Enable coverage reporting (opt-in)
python3 scripts/run-tests-all-suites.py --coverage
```

**What it does:**
- Runs up to 3 suites (backend, frontend-unit, frontend-e2e), sequential by default.
- In parallel mode, shows a live progress bar with per-suite status and elapsed time.
- Keeps going even if a suite fails so you get all reports.
- Prints a final summary with per-suite status and duration. Coverage highlights appear only when `--coverage` is enabled.
- `--resume` re-runs only failed/unknown suites based on `test-reports/last-run.json`.
- Without `--resume`, logs and resume metadata are overwritten at the start of a run.
- Jest output is run with `--silent` in this runner to avoid noisy console logs; run `npm run test` directly if you need console output.

**Outputs:**
- Logs per suite: `test-reports/backend.log`, `test-reports/frontend-unit.log`, `test-reports/frontend-e2e.log`
- Backend coverage: terminal summary (only with `--coverage`)
- Frontend unit coverage: `frontend/coverage/coverage-summary.json` (only with `--coverage`)
- Frontend E2E flow coverage: `frontend/e2e-results/flow-coverage.json` (only with `--coverage`)
- Resume metadata: `test-reports/last-run.json`

### Backend (Pytest)

#### Run Tests

```bash
cd backend

# All tests
pytest

# With coverage
pytest --cov

# Specific tests
pytest base_feature_app/tests/models/
pytest base_feature_app/tests/serializers/
pytest base_feature_app/tests/views/

# Single file tests
pytest base_feature_app/tests/models/test_user_model.py

# Verbose tests
pytest -v
```

#### Test Coverage

- ✅ **Models**: User, Blog, Product, Sale, SoldProduct, PasswordCode
- ✅ **Serializers**: List, Detail, CreateUpdate for all models
- ✅ **Views**: CRUD endpoints, auth endpoints, JWT, public endpoints, permissions
- ✅ **Admin**: Admin site registration, configuration, and custom sections
- ✅ **Forms**: Blog, Product, User forms
- ✅ **Utils**: Auth utilities, URL configuration, email service, global test runner

#### Test Structure

```
backend/base_feature_app/tests/
├── conftest.py                       # App-level fixtures
├── helpers.py                        # Test helper utilities
├── models/
│   ├── test_user_model.py
│   ├── test_blog_model.py
│   ├── test_product_model.py
│   ├── test_sale_model.py
│   └── test_password_code_model.py
├── serializers/
│   ├── test_blog_serializers.py
│   ├── test_product_serializers.py
│   ├── test_sale_serializer.py
│   └── test_user_create_update_serializer.py
├── views/
│   ├── test_auth_endpoints.py
│   ├── test_crud_endpoints.py
│   ├── test_crud_detail_endpoints.py
│   ├── test_jwt_endpoints.py
│   ├── test_public_endpoints.py
│   └── test_sale_and_user_detail_permissions.py
├── services/                         # Service tests
├── commands/                         # Management command tests
└── utils/
    ├── test_admin.py
    ├── test_auth_utils.py
    ├── test_forms.py
    ├── test_urls.py
    └── test_run_tests_suites.py
```

### Frontend (Jest + Playwright)

#### Unit Tests (Jest)

```bash
cd frontend

# All tests
npm run test

# With coverage
npm run test:coverage

# Specific tests
npm test -- lib/stores/__tests__/authStore.test.ts
npm test -- components/blog/__tests__/BlogCard.test.tsx
```

#### Unit Test Coverage

- ✅ **Stores**: authStore, blogStore, productStore, cartStore, localeStore
- ✅ **Components**: BlogCard, BlogCarousel, ProductCard, ProductCarousel, layout
- ✅ **Pages**: Home, Sign In, Sign Up, Blogs, Blog Detail, Catalog, Product Detail, Checkout, Dashboard, Backoffice, Forgot Password, Providers
- ✅ **Services**: HTTP client, tokens
- ✅ **Hooks**: useRequireAuth
- ✅ **i18n**: Locale configuration
- ✅ **Lib**: Constants, types

#### E2E Tests (Playwright)

```bash
cd frontend

# Install browsers (first time)
npx playwright install

# Run all E2E tests
npm run e2e

# Run tests + flow coverage report
npm run e2e:coverage

# List available E2E modules
npm run e2e:modules

# Run a single module (example: auth)
npm run e2e:module -- auth

# Module-scoped coverage
npm run e2e:coverage:module -- auth

# Per-viewport filtering
npm run e2e:desktop          # Desktop Chrome only
npm run e2e:mobile           # Mobile Chrome (Pixel 5) only
npm run e2e:tablet           # Tablet (iPad Mini) only

# With interactive UI
npm run test:e2e:ui

# Headed mode
npm run test:e2e:headed
```

**Note:** `--grep @module:<name>` only runs tests tagged with that module. When you run a subset, the flow coverage report will still list other modules/flows as missing because they were not executed.

**Note:** E2E tests automatically start both Next.js and Django dev servers. Keep backend available to avoid proxy errors.

#### Unit Test Structure

```
frontend/
├── app/
│   ├── __tests__/
│   │   ├── comingSoon.test.tsx
│   │   └── providers.test.tsx
│   ├── backoffice/__tests__/page.test.tsx
│   ├── blogs/__tests__/page.test.tsx
│   ├── blogs/[blogId]/__tests__/page.test.tsx
│   ├── catalog/__tests__/page.test.tsx
│   ├── checkout/__tests__/page.test.tsx
│   ├── dashboard/__tests__/page.test.tsx
│   ├── forgot-password/__tests__/page.test.tsx
│   ├── products/[productId]/__tests__/page.test.tsx
│   ├── sign-in/__tests__/page.test.tsx
│   └── sign-up/__tests__/page.test.tsx
├── components/
│   ├── blog/__tests__/
│   │   ├── BlogCard.test.tsx
│   │   └── BlogCarousel.test.tsx
│   ├── product/__tests__/
│   │   ├── ProductCard.test.tsx
│   │   └── ProductCarousel.test.tsx
│   └── layout/__tests__/
│       └── layout.test.tsx
└── lib/
    ├── __tests__/
    │   ├── constants.test.ts
    │   └── fixtures.ts
    ├── stores/__tests__/
    │   ├── authStore.test.ts
    │   ├── blogStore.test.ts
    │   ├── productStore.test.ts
    │   ├── cartStore.test.ts
    │   └── localeStore.test.ts
    ├── services/__tests__/
    │   ├── http.test.ts
    │   └── tokens.test.ts
    ├── hooks/__tests__/
    │   └── useRequireAuth.test.ts
    └── i18n/__tests__/
        └── config.test.ts
```

#### E2E Test Structure (Modular)

```
frontend/e2e/
├── auth/
│   └── auth.spec.ts                 # Login, logout, register, redirects
├── app/
│   ├── cart.spec.ts                 # Shopping cart
│   ├── checkout.spec.ts             # Checkout flow
│   ├── complete-purchase.spec.ts    # Full purchase flow
│   └── user-flows.spec.ts          # Authenticated user flows
├── public/
│   ├── blogs.spec.ts                # Blog list and navigation
│   ├── products.spec.ts             # Product catalog and navigation
│   ├── navigation.spec.ts           # General navigation
│   └── smoke.spec.ts                # Smoke tests
├── helpers/
│   └── flow-tags.ts                 # Module tagging helpers
├── reporters/
│   └── flow-coverage-reporter.mjs   # Flow coverage reporter
├── fixtures.ts                      # E2E test fixtures
├── test-with-coverage.ts            # Coverage test helper
└── flow-definitions.json            # E2E flow definitions
```

---

## 📚 Documentation

The project includes complete documentation:

### Available Guides

| File | Description |
|------|-------------|
| **docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md** | Full architecture standard (models, views, stores, router, admin, fake data, tests) |
| **docs/TESTING_QUALITY_STANDARDS.md** | Test quality standards (naming, assertions, isolation, anti-patterns) |
| **docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md** | Backend & frontend coverage report configuration |
| **docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md** | E2E flow coverage reporter & flow definitions |
| **docs/TEST_QUALITY_GATE_REFERENCE.md** | Quality gate checks reference |
| **docs/USER_FLOW_MAP.md** | End-to-end user flow map by module |
| **docs/GLOBAL_RULES_GUIDELINES.md** | Global development rules & guidelines |
| **frontend/TESTING.md** | Frontend testing guide |
| **frontend/SETUP.md** | Frontend setup guide |
| **frontend/e2e/README.md** | Playwright E2E guide |
| **backend/.../commands/README.md** | Fake data commands guide |
| **README.md** | This file — general project documentation |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/run-tests-all-suites.py` | Global test runner (sequential by default; backend + frontend unit + E2E) |
| `scripts/test_quality_gate.py` | Test quality gate CLI |
| `scripts/quality/` | Quality gate analyzer modules |

### Configuration Files

| File | Purpose |
|------|---------|
| `.gitignore` | Files to ignore in Git |
| `.pre-commit-config.yaml` | Pre-commit hooks (test quality gate on staged tests) |
| `.github/workflows/test-quality-gate.yml` | GitHub Actions CI workflow |
| `backend/.env.example` | Environment variables template (backend) |
| `backend/pytest.ini` | Pytest configuration |
| `frontend/.env.example` | Environment variables template (frontend) |
| `frontend/eslint.config.mjs` | ESLint configuration |
| `frontend/jest.config.cjs` | Jest configuration |
| `frontend/playwright.config.ts` | Playwright configuration |
| `frontend/tsconfig.json` | TypeScript configuration |
| `frontend/next.config.ts` | Next.js configuration (API rewrites, media proxy) |
| `frontend/postcss.config.mjs` | PostCSS configuration |

---

## 🎯 Reference Projects

Real implementation examples using this base:

### E-commerce
- [🕯️ Candle Project](https://github.com/carlos18bp/candle_project) - Artisanal candles store

### Internal tool
- [⚖️ G&M Project](https://github.com/carlos18bp/gym_projectt) - Law firm management system

### Features
- [🔐 Sign In/Sign On Feature](https://github.com/carlos18bp/signin_signon_feature) - Complete authentication system with registration

---

## 🔧 Customization

### Change Project Name

If you want to use this base for a new project:

1. **Search and replace** all occurrences of `base_feature`:

```bash
# Use ag (the silver searcher) or grep
ag base_feature
# Or
grep -r "base_feature" .

# Replace in files
find . -type f -exec sed -i 's/base_feature/your_new_name/g' {} +
```

2. **Rename directories**:

```bash
mv backend/base_feature_project backend/your_project
mv backend/base_feature_app backend/your_app
```

3. **Update imports** in Python and references in configuration.

### Add New Models

1. Create model in `backend/base_feature_app/models/`
2. Create serializers (List, Detail, CreateUpdate)
3. Create views in `views/`
4. Add URLs in `urls/`
5. Register in admin (`admin.py`)
6. Create fake data command if needed
7. Write tests (models, serializers, views)

### Add New Pages

1. Create page in `frontend/app/your-page/page.tsx`
2. Add Zustand store in `lib/stores/` if needed
3. Create reusable components in `components/`
4. Write unit tests in `__tests__/` directories
5. Write E2E tests in `e2e/`

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a suggestion:

1. **Fork** the project
2. Create a **branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Code Standards

- **Global & Architecture**: Follow the guidelines and architecture described in
  [docs/GLOBAL_RULES_GUIDELINES.md](docs/GLOBAL_RULES_GUIDELINES.md) and
  [docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md](docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md).
- **Backend**: Follow PEP 8 (enforced by `ruff`) along with the standards above.
- **Frontend**: Follow ESLint configuration along with the standards above.
- **Tests & Quality**: Apply the standards defined in
  [docs/TESTING_QUALITY_STANDARDS.md](docs/TESTING_QUALITY_STANDARDS.md),
  [docs/TEST_QUALITY_GATE_REFERENCE.md](docs/TEST_QUALITY_GATE_REFERENCE.md), and the coverage reports in
  [docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md](docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md) and
  [docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md](docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md).
- **User Flows**: Align changes with the flow map in
  [docs/USER_FLOW_MAP.md](docs/USER_FLOW_MAP.md).
- **Commits**: Descriptive messages in English.

---

## 📄 License

This project is under the MIT License. See `LICENSE` file for more details.

---

## 👤 Author

**Carlos Buitrago**

- GitHub: [@carlos18bp](https://github.com/carlos18bp)

---

## 🙏 Acknowledgments

- Django REST Framework for the excellent toolkit
- Next.js team for the incredible framework
- React team for the UI library
- All contributors of the libraries used

---

**⭐ If this project helps you, consider giving it a star!**

*Last updated: February 2026*
