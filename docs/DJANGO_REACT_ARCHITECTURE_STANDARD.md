# Unified Architecture
## Backend Django REST + Frontend React

**Development Standards and Patterns Guide**

This document consolidates and standardizes the best architecture practices for fullstack projects, unifying three reference templates into a single corporate standard.

**Version 2.0 - February 2026**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
   - 1.1 [Technology Stack](#11-technology-stack)
   - 1.2 [Design Principles](#12-design-principles)
   - 1.3 [Test Quality Governance](#13-test-quality-governance)
   - 1.4 [Mandatory Reference Documents](#14-mandatory-reference-documents)
2. [Backend - Django REST Framework](#2-backend---django-rest-framework)
   - 2.1 [Standard Folder Structure](#21-standard-folder-structure)
   - 2.2 [Configuration (settings.py)](#22-configuration-settingspy)
   - 2.3 [Domain Models](#23-domain-models)
   - 2.4 [Serializers](#24-serializers)
   - 2.5 [API Views (@api_view)](#25-api-views-api_view)
   - 2.6 [URLs by Module](#26-urls-by-module)
   - 2.7 [Custom Django Admin](#27-custom-django-admin)
   - 2.8 [Management Commands (Fake Data)](#28-management-commands-fake-data)
   - 2.9 [Services and Integrations](#29-services-and-integrations)
   - 2.10 [Documentation Conventions](#210-documentation-conventions)
   - 2.11 [Image Gallery (django_attachments)](#211-image-gallery-django_attachments)
   - 2.12 [Testing (Backend)](#212-testing-backend)
     - 2.12.9 [Coverage Reporting](#2129-coverage-reporting)
3. [Frontend - React + TypeScript](#3-frontend---react--typescript)
   - 3.1 [Folder Structure](#31-folder-structure)
   - 3.2 [Main Configuration (App Providers)](#32-main-configuration-app-providers)
   - 3.3 [HTTP Service (Axios + JWT + Refresh)](#33-http-service-axios--jwt--refresh)
   - 3.4 [Global State (Store Pattern)](#34-global-state-store-pattern)
   - 3.5 [Routing and Guards](#35-routing-and-guards)
   - 3.6 [Internationalization (i18n)](#36-internationalization-i18n)
   - 3.7 [Testing (Frontend)](#37-testing-frontend)
     - 3.7.1 [Unit and Component Testing](#371-unit-and-component-testing-jest--react-testing-library)
     - 3.7.2 [E2E Testing (Playwright)](#372-e2e-testing-playwright)
     - 3.7.3 [E2E Module-based Directory Structure](#373-e2e-module-based-directory-structure)
     - 3.7.4 [E2E Test Infrastructure and Practical Patterns](#374-e2e-test-infrastructure-and-practical-patterns)
     - 3.7.5 [Flow Coverage Methodology — Overview](#375-flow-coverage-methodology--overview)
     - 3.7.6 [Step 1 — Define User Flows](#376-step-1--define-user-flows-flow-definitionsjson)
     - 3.7.7 [Step 2 — Tag Tests with @flow:](#377-step-2--tag-tests-with-flow)
     - 3.7.8 [Step 3 — Flow Tag Constants](#378-step-3--flow-tag-constants-flow-tagsts)
     - 3.7.9 [Step 4 — Custom Reporter and Artifacts](#379-step-4--custom-reporter-and-artifacts)
     - 3.7.10 [Coverage Goals and Maintenance](#3710-coverage-goals-and-maintenance)
     - 3.7.11 [Execution and Quality](#3711-execution-and-quality)
     - 3.7.12 [Commands to Run Tests (Focused Execution)](#3712-commands-to-run-tests-focused-execution)
     - 3.7.13 [Minimum Coverage by Layer](#3713-minimum-coverage-by-layer)
4. [Standard Dependencies](#4-standard-dependencies)
5. [Execution Commands](#5-execution-commands)
6. [New Project Checklist](#6-new-project-checklist)
7. [Annex A: Change Implementation Guide](#annex-a-change-implementation-guide)
8. [Annex B: Test Quality Reference](#annex-b-test-quality-reference)

---

## 1. Architecture Overview

This architecture defines the standard for fullstack projects that combine a robust backend with Django REST Framework and a modern frontend with React. The goal is to maximize code reuse, maintain consistency across projects, and facilitate the onboarding of new developers.

### 1.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | Django 4.x + DRF | REST API, ORM, Admin |
| Authentication | SimpleJWT | JWT tokens with refresh |
| Database | MySQL | Data persistence |
| Cache | Redis (optional) | Sessions, query caching |
| Frontend | React 19 + TypeScript | Declarative and scalable UI |
| Web Framework | Next.js (recommended) | Routing, hybrid rendering and optimization |
| State | Zustand / Redux Toolkit | Predictable global state |
| Routing | App Router / React Router | Navigation and route protection |
| HTTP Client | Axios | API requests |
| Styles | TailwindCSS | CSS utilities |
| i18n | next-intl / i18next | Multi-language support |

> **Frontend profile:** This document uses **React** as the reference frontend profile (React + Next.js + Zustand + React Testing Library). For **Vue 3** projects, the same backend architecture patterns, quality gate, and test structure apply; adapt the frontend tools (`Pinia` instead of Zustand, `Vue Test Utils` instead of React Testing Library, `Nuxt` instead of Next.js).

### 1.2 Design Principles

- **Layer separation:** Models, Serializers, Views, URLs clearly separated.
- **Modularity:** Each domain in its own module (separate files).
- **Reusability:** HTTP services, stores and generic components.
- **Consistency:** Same API response patterns and store structure.
- **Security:** JWT by default, CORS configured, credentials in environment variables.
- **English documentation:** All comments in code must be in English and use DocStrings.

### 1.3 Test Quality Governance

Every project incorporates an automated quality gate that analyzes naming, assertions, determinism, and lint of test files, returning a score from 0–100. The gate must be run **scoped** to the modified files before each merge.

#### Quality Gate Architecture

```
scripts/
├── test_quality_gate.py          # Main orchestrator
└── quality/
    ├── __init__.py               # Package exports
    ├── base.py                   # Shared types (Severity, Issue, Config)
    ├── patterns.py               # Compiled regex patterns
    ├── backend_analyzer.py       # Python/pytest analyzer (AST)
    ├── js_ast_bridge.py          # Bridge to Babel parser (Node.js)
    ├── frontend_unit_analyzer.py # Jest/React Testing Library analyzer
    └── frontend_e2e_analyzer.py  # Playwright E2E analyzer

frontend/scripts/
└── ast-parser.cjs                # JavaScript AST parser (Babel)
```

#### Execution Modes

| Flag | Values | Description |
|------|--------|-------------|
| `--suite` | `backend`, `frontend-unit`, `frontend-e2e` | Suite to analyze |
| `--semantic-rules` | `strict`, `off` | Activates naming and assertion rules |
| `--external-lint` | `run`, `off` | Runs Ruff (backend) or ESLint (frontend) |
| `--include-file` | relative path | Limits analysis to specific files |
| `--strict` | flag | Returns exit 1 if there are errors |

```bash
# Example: gate scoped to a modified backend file
backend/venv/bin/python scripts/test_quality_gate.py --repo-root . \
  --suite backend --semantic-rules strict --external-lint run \
  --include-file backend/core_app/tests/views/test_auth.py
```

> **Execution rule:** Never run the gate over the entire suite. Always scope it with `--include-file` to the modified files. See `TEST_QUALITY_GATE_REFERENCE.md` for complete technical reference.

### 1.4 Mandatory Reference Documents

These documents are the project's sources of truth. This standard **does not duplicate** their content — it references it. In case of conflict, the specialized document prevails.

| Document | Purpose | When to consult |
|----------|---------|-----------------|
| `GLOBAL_RULES_GUIDELINES.md` | Operational rules: commits, PRs, logging, security, migrations, code review | Before any change |
| `TESTING_QUALITY_STANDARDS.md` | Test quality criteria: mandatory rules, examples, anti-patterns, exceptions | Before writing or modifying tests |
| `TEST_QUALITY_GATE_REFERENCE.md` | Technical quality gate reference: CLI, architecture, modes, report schema | When running or configuring the gate |
| `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` | Backend + Frontend unit coverage reporters: custom conftest.py, coverage-summary.cjs, color thresholds, output examples, setup checklist | When setting up or customizing coverage reports for backend or frontend unit tests |
| `E2E_FLOW_COVERAGE_REPORT_STANDARD.md` | E2E Flow Coverage Report: reporter source, flow definitions schema, tagging, JSON output, setup checklist | When setting up or maintaining E2E flow coverage |

> **Path note:** All documents live at the repository root or in `docs/`. If the project uses a `docs/` folder, references must be updated consistently across all files.

**Precedence rule:**
1. If there is a conflict about test quality → `TESTING_QUALITY_STANDARDS.md` prevails
2. If there is a conflict about the quality gate → `TEST_QUALITY_GATE_REFERENCE.md` prevails
3. If there is a conflict about coverage reporting → `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` prevails
4. If there is a conflict about E2E flow coverage → `E2E_FLOW_COVERAGE_REPORT_STANDARD.md` prevails
5. If there is a conflict about process rules → `GLOBAL_RULES_GUIDELINES.md` prevails

---

## 2. Backend - Django REST Framework

### 2.1 Standard Folder Structure

```
backend/
├── core_project/           # Django Project
│   ├── settings.py         # Global configuration
│   ├── urls.py             # Root URLs
│   └── wsgi.py / asgi.py   # Entry points
├── core_app/               # Main domain app
│   ├── models/             # Models per entity
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   └── order.py
│   ├── serializers/        # Serializers per module
│   │   ├── __init__.py
│   │   ├── user_serializers.py
│   │   └── product_serializers.py
│   ├── views/              # API views per module
│   │   ├── __init__.py
│   │   ├── auth_views.py
│   │   └── product_views.py
│   ├── urls/               # URLs per module
│   │   ├── __init__.py
│   │   ├── auth_urls.py
│   │   └── product_urls.py
│   ├── services/           # Business logic
│   │   ├── email_service.py
│   │   └── payment_service.py
│   ├── middleware/         # Custom middleware
│   ├── management/commands/# Django commands
│   │   ├── create_fake_data.py
│   │   └── delete_fake_data.py
│   ├── admin.py            # Admin configuration
│   └── utils/              # Shared helpers
├── django_attachments/     # Gallery subproject (optional)
├── media/                  # Uploaded files
├── static/                 # Static files
└── requirements.txt
```

> **Note:** Each model, serializer, view, and URL must be in its own file within the corresponding directory. This facilitates maintenance and avoids monolithic files that are hard to navigate.

---

### 2.2 Standard Configuration (settings.py)

#### 2.2.1 Installed Apps

```python
INSTALLED_APPS = [
    # Django Core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party (mandatory)
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Third-party (optional depending on project)
    'django_redis',
    'easy_thumbnails',
    'django_cleanup.apps.CleanupConfig',
    
    # Project app
    'core_app',
]
```

#### 2.2.2 REST Framework Configuration

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

#### 2.2.3 JWT Configuration

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Adjust based on security requirements
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

#### 2.2.4 CORS and Security

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # React dev server (Next.js default)
    'http://127.0.0.1:3000',
    # Add production domains
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization', 'content-type',
    'origin', 'x-csrftoken', 'x-requested-with',
    'x-currency', 'accept-language',  # Custom headers
]

# Custom user model (MANDATORY from the start)
AUTH_USER_MODEL = 'core_app.User'
```

> **Important:** Credentials (SECRET_KEY, DB passwords, API keys) must NEVER be hardcoded. Use environment variables with `os.getenv()`.

---

### 2.3 Domain Models

Models represent domain entities. Each model goes in its own file inside `models/`. Use computed properties for derived logic.

```python
# core_app/models/product.py
import os
from django.db import models

class Product(models.Model):
    """
    Product model representing items available for sale.
    
    Attributes:
        name_en: Product name in English.
        name_es: Product name in Spanish.
        price: Product price in default currency.
        stock: Available quantity in inventory.
        is_active: Whether the product is visible to customers.
    """
    
    # Bilingual fields (standard pattern)
    name_en = models.CharField(max_length=255)
    name_es = models.CharField(max_length=255)
    description_en = models.TextField(blank=True)
    description_es = models.TextField(blank=True)
    
    # Business fields
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # File fields
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    # Timestamps (always include)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name_en
    
    @property
    def is_in_stock(self):
        """Check if product has available inventory."""
        return self.stock > 0
    
    def delete(self, *args, **kwargs):
        """Override delete to clean up associated files."""
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        super().delete(*args, **kwargs)
```

---

### 2.4 Serializers

Create specific serializers based on the use case: List (lightweight), Detail (complete), CreateUpdate (with validations). This optimizes performance and clarifies the API.

```python
# core_app/serializers/product_serializers.py
from rest_framework import serializers
from ..models import Product

class ProductListSerializer(serializers.ModelSerializer):
    '''Lightweight serializer for listings'''
    
    class Meta:
        model = Product
        fields = ['id', 'name_en', 'name_es', 'price', 'is_in_stock', 'image']


class ProductDetailSerializer(serializers.ModelSerializer):
    '''Full serializer for detail view'''
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    '''Serializer for create/update with validations'''
    
    class Meta:
        model = Product
        fields = ['name_en', 'name_es', 'description_en', 'description_es',
                  'price', 'stock', 'is_active', 'image']
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0')
        return value
```

---

### 2.5 API Views (@api_view)

The standard uses function-based views with `@api_view`. Each endpoint has its own function with explicit permissions. Responses follow a consistent format with descriptive keys (e.g.: 'products', 'message', 'error').

```python
# core_app/views/product_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from ..models import Product
from ..serializers.product_serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_products(request):
    '''Lists all active products'''
    products = Product.objects.filter(is_active=True)
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response({'products': serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def retrieve_product(request, product_id):
    '''Retrieves product detail'''
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductDetailSerializer(product, context={'request': request})
    return Response({'product': serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_product(request):
    '''Creates a new product (admin only)'''
    serializer = ProductCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        return Response({
            'message': 'Product created successfully',
            'product': ProductDetailSerializer(product).data
        }, status=status.HTTP_201_CREATED)
    return Response({'error': 'Invalid data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def update_product(request, product_id):
    '''Updates an existing product'''
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    partial = request.method == 'PATCH'
    serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=partial)
    if serializer.is_valid():
        product = serializer.save()
        return Response({
            'message': 'Product updated successfully',
            'product': ProductDetailSerializer(product).data
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, product_id):
    '''Deletes a product'''
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    product.delete()
    return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)
```

---

### 2.6 URLs by Module

URLs are organized by functional module. Each module has its own URL file that is included in the main urlpatterns.

```python
# core_app/urls/product_urls.py
from django.urls import path
from ..views.product_views import (
    list_products, retrieve_product, create_product, update_product, delete_product
)

urlpatterns = [
    path('', list_products, name='list-products'),
    path('<int:product_id>/', retrieve_product, name='retrieve-product'),
    path('create/', create_product, name='create-product'),
    path('<int:product_id>/update/', update_product, name='update-product'),
    path('<int:product_id>/delete/', delete_product, name='delete-product'),
]
```

```python
# core_project/urls.py
from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core_app.urls.auth_urls')),
    path('api/products/', include('core_app.urls.product_urls')),
    path('api/orders/', include('core_app.urls.order_urls')),
    # ... more modules
]
```

#### Endpoint Convention

| Action | Method | URL | Name |
|--------|--------|-----|------|
| List | GET | /api/entities/ | list-entities |
| Detail | GET | /api/entities/{id}/ | retrieve-entity |
| Create | POST | /api/entities/create/ | create-entity |
| Update | PUT/PATCH | /api/entities/{id}/update/ | update-entity |
| Delete | DELETE | /api/entities/{id}/delete/ | delete-entity |

---

### 2.7 Custom Django Admin

Configure an explicit ModelAdmin for each model with `list_display`, `search_fields`, `list_filter`, etc. For large projects, create a custom AdminSite that groups models by functional sections.

```python
# core_app/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Product, Order, User


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'price', 'stock', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name_en', 'name_es', 'description_en')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active', 'stock')
    ordering = ('-created_at',)


# Custom AdminSite (for large projects)
class ProjectAdminSite(admin.AdminSite):
    site_header = 'Administration Panel'
    site_title = 'Admin'
    index_title = 'Control Panel'
    
    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        # Organize by logical sections
        return [
            {'name': _('Users'), 'models': [...]},
            {'name': _('Products'), 'models': [...]},
            {'name': _('Orders'), 'models': [...]},
        ]

admin_site = ProjectAdminSite(name='project_admin')
```

---

### 2.8 Management Commands (Fake Data)

Management commands allow populating and cleaning test data in a controlled manner. A SEPARATE FILE must be created for each entity/model, following the single responsibility principle. The master command orchestrates calls in the correct order, respecting dependencies between models.

> **IMPORTANT RULE:** Each model must have its own command file to generate fake data. This allows running individual commands during development and facilitates maintenance. Commands must respect relationships/dependencies between models.

#### 2.8.1 Command File Structure

```
core_app/
└── management/
    └── commands/
        ├── create_fake_data.py       # Master command (orchestrator)
        ├── delete_fake_data.py       # Data cleanup
        ├── create_fake_users.py      # Users (no dependencies)
        ├── create_fake_categories.py # Categories (no dependencies)
        ├── create_fake_products.py   # Products (depends on Category)
        ├── create_fake_carts.py      # Carts (depends on User, Product)
        ├── create_fake_orders.py     # Orders (depends on User, Product)
        └── create_fake_reviews.py    # Reviews (depends on User, Product)
```

#### 2.8.2 Master Command (Orchestrator)

```python
# core_app/management/commands/create_fake_data.py
"""
Master command to orchestrate fake data creation for the entire system.

This command calls individual entity commands in the correct order,
respecting model dependencies (e.g., Products need Categories first).
"""
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create fake data for all entities in the correct order'
    
    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=20,
                            help='Number of users to create')
        parser.add_argument('--categories', type=int, default=10,
                            help='Number of categories to create')
        parser.add_argument('--products', type=int, default=50,
                            help='Number of products to create')
        parser.add_argument('--orders', type=int, default=30,
                            help='Number of orders to create')
        parser.add_argument('--reviews', type=int, default=100,
                            help='Number of reviews to create')
    
    def handle(self, *args, **options):
        self.stdout.write('🚀 Starting fake data creation...\n')
        
        # Order matters! Respect dependencies
        # 1. Independent entities first
        self.stdout.write('Creating users...')
        call_command('create_fake_users', '--num', options['users'])
        
        self.stdout.write('Creating categories...')
        call_command('create_fake_categories', '--num', options['categories'])
        
        # 2. Entities with single dependency
        self.stdout.write('Creating products...')
        call_command('create_fake_products', '--num', options['products'])
        
        # 3. Entities with multiple dependencies
        self.stdout.write('Creating orders...')
        call_command('create_fake_orders', '--num', options['orders'])
        
        self.stdout.write('Creating reviews...')
        call_command('create_fake_reviews', '--num', options['reviews'])
        
        self.stdout.write(self.style.SUCCESS(
            '\n✅ Fake data created successfully!'
        ))
```

#### 2.8.3 Entity Command - Complete Example (Products)

This is a complete example of how to create a fake data command for an entity that has dependencies (Product depends on Category). It includes relationship handling, image files, and validations.

```python
# core_app/management/commands/create_fake_products.py
"""
Command to generate fake product data for development and testing.

This command creates realistic product records with:
- Bilingual content (English/Spanish)
- Random pricing and stock levels
- Association with existing categories
- Placeholder images

Dependencies:
    - Category model must have existing records

Usage:
    python manage.py create_fake_products --num 50
    python manage.py create_fake_products --num 100 --with-images
"""
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from faker import Faker

from core_app.models import Product, Category


class Command(BaseCommand):
    help = 'Create fake products with realistic data'
    
    def __init__(self):
        super().__init__()
        self.fake_en = Faker('en_US')
        self.fake_es = Faker('es_ES')
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--num',
            type=int,
            default=50,
            help='Number of products to create (default: 50)'
        )
        parser.add_argument(
            '--with-images',
            action='store_true',
            help='Generate placeholder images for products'
        )
    
    def handle(self, *args, **options):
        num_products = options['num']
        with_images = options['with_images']
        
        # Validate dependencies exist
        categories = list(Category.objects.all())
        if not categories:
            self.stdout.write(self.style.ERROR(
                'No categories found. Run create_fake_categories first.'
            ))
            return
        
        self.stdout.write(f'Creating {num_products} fake products...')
        
        created_count = 0
        for i in range(num_products):
            product = self._create_product(categories, with_images)
            if product:
                created_count += 1
                if created_count % 10 == 0:
                    self.stdout.write(f'  Created {created_count} products...')
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Successfully created {created_count} products'
        ))
    
    def _create_product(self, categories, with_images=False):
        """
        Create a single product with randomized data.
        
        Args:
            categories: List of available Category instances.
            with_images: Whether to generate placeholder images.
        
        Returns:
            Product: The created product instance.
        """
        # Generate bilingual product name
        product_type = random.choice([
            'Laptop', 'Phone', 'Tablet', 'Headphones', 'Camera',
            'Watch', 'Speaker', 'Monitor', 'Keyboard', 'Mouse'
        ])
        brand = self.fake_en.company()
        name_en = f'{brand} {product_type} {self.fake_en.word().title()}'
        name_es = f'{product_type} {brand} {self.fake_es.word().title()}'
        
        # Generate descriptions
        desc_en = self.fake_en.paragraph(nb_sentences=3)
        desc_es = self.fake_es.paragraph(nb_sentences=3)
        
        # Generate realistic pricing
        base_price = random.choice([29.99, 49.99, 99.99, 149.99, 299.99, 499.99])
        price = Decimal(str(base_price)) + Decimal(random.randint(0, 50))
        
        # Create product
        product = Product.objects.create(
            name_en=name_en,
            name_es=name_es,
            description_en=desc_en,
            description_es=desc_es,
            price=price,
            stock=random.randint(0, 100),
            is_active=random.random() > 0.1,  # 90% active
            category=random.choice(categories),
        )
        
        # Add placeholder image if requested
        if with_images:
            self._add_placeholder_image(product)
        
        return product
    
    def _add_placeholder_image(self, product):
        """Generate and attach a placeholder image to the product."""
        # Simple SVG placeholder
        svg_content = f'''
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <rect width="200" height="200" fill="#f0f0f0"/>
            <text x="100" y="100" text-anchor="middle" fill="#999">
                {product.id}
            </text>
        </svg>
        '''
        product.image.save(
            f'product_{product.id}.svg',
            ContentFile(svg_content.encode()),
            save=True
        )
```

#### 2.8.4 Command for Entity with Multiple Dependencies (Orders)

```python
# core_app/management/commands/create_fake_orders.py
"""
Command to generate fake order data with related items.

Orders have multiple dependencies:
- User (customer who placed the order)
- Product (items in the order)

This command creates orders with realistic:
- Order items (1-5 products per order)
- Quantities and calculated totals
- Status progression
- Timestamps

Dependencies:
    - User model must have existing records
    - Product model must have existing records
"""
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from core_app.models import User, Product, Order, OrderItem


class Command(BaseCommand):
    help = 'Create fake orders with order items'
    
    def __init__(self):
        super().__init__()
        self.fake = Faker()
    
    def add_arguments(self, parser):
        parser.add_argument('--num', type=int, default=30)
    
    def handle(self, *args, **options):
        # Validate dependencies
        users = list(User.objects.filter(is_staff=False))
        products = list(Product.objects.filter(is_active=True))
        
        if not users:
            self.stdout.write(self.style.ERROR(
                'No users found. Run create_fake_users first.'
            ))
            return
        
        if not products:
            self.stdout.write(self.style.ERROR(
                'No products found. Run create_fake_products first.'
            ))
            return
        
        num_orders = options['num']
        self.stdout.write(f'Creating {num_orders} fake orders...')
        
        statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        
        for i in range(num_orders):
            # Create order
            order = Order.objects.create(
                user=random.choice(users),
                status=random.choice(statuses),
                shipping_address=self.fake.address(),
                created_at=self.fake.date_time_between(
                    start_date='-90d',
                    end_date='now',
                    tzinfo=timezone.get_current_timezone()
                ),
            )
            
            # Add 1-5 random items
            num_items = random.randint(1, 5)
            order_products = random.sample(products, min(num_items, len(products)))
            
            total = Decimal('0.00')
            for product in order_products:
                quantity = random.randint(1, 3)
                item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=product.price,
                )
                total += item.unit_price * quantity
            
            # Update order total
            order.total = total
            order.save()
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Created {num_orders} orders with items'
        ))
```

#### 2.8.5 Cleanup Command (Delete)

```python
# core_app/management/commands/delete_fake_data.py
"""
Command to safely delete all fake/test data from the database.

IMPORTANT: This command respects the reverse order of dependencies
to avoid foreign key constraint violations.

Protected records (not deleted):
- Superusers
- Users with specific protected emails
- System configuration records
"""
from django.core.management.base import BaseCommand
from core_app.models import (
    User, Category, Product, Order, OrderItem, Review, Cart, CartItem
)


class Command(BaseCommand):
    help = 'Delete all fake data (requires --confirm flag)'
    
    # Emails that must never be deleted
    PROTECTED_EMAILS = {
        'admin@example.com',
        'superadmin@company.com',
    }
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Required flag to confirm deletion'
        )
    
    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(
                '⚠️ This will DELETE ALL test data!\n'
                'Run with --confirm to proceed:\n'
                '  python manage.py delete_fake_data --confirm'
            ))
            return
        
        self.stdout.write('🗑️ Deleting fake data...\n')
        
        # Delete in reverse dependency order
        # 1. Entities with the most dependencies first
        self._delete_model(OrderItem, 'order items')
        self._delete_model(Order, 'orders')
        self._delete_model(CartItem, 'cart items')
        self._delete_model(Cart, 'carts')
        self._delete_model(Review, 'reviews')
        
        # 2. Entities with single dependency
        self._delete_model(Product, 'products')
        
        # 3. Independent entities
        self._delete_model(Category, 'categories')
        
        # 4. Users (with protection)
        deleted_users = User.objects.exclude(
            email__in=self.PROTECTED_EMAILS
        ).exclude(
            is_superuser=True
        ).delete()
        self.stdout.write(f'  Deleted {deleted_users[0]} users')
        
        self.stdout.write(self.style.SUCCESS('\n✅ All fake data deleted'))
    
    def _delete_model(self, model, name):
        """Helper to delete all records of a model."""
        count = model.objects.count()
        model.objects.all().delete()
        self.stdout.write(f'  Deleted {count} {name}')
```

#### 2.8.6 Dependency Diagram

It is crucial to understand and respect dependencies between models when creating and deleting data:

**CREATION order (from fewest to most dependencies):**

```
[User] ──────────────────────┐
                             │
[Category] ───────┐          │
                  │          │
                  ▼          │
            [Product] ───────┤
                  │          │
                  ▼          ▼
            [Review] ─── [User]
            [Order] ──── [User]
                  │
                  ▼
            [OrderItem] ─── [Product]
```

**DELETION order (reverse - from most to fewest dependencies):**

1. OrderItem (depends on Order, Product)
2. Order (depends on User)
3. Review (depends on User, Product)
4. CartItem (depends on Cart, Product)
5. Cart (depends on User)
6. Product (depends on Category)
7. Category (independent)
8. User (independent, protect admins)

---

### 2.9 Services and Integrations

Complex business logic and external integrations go in `services/`. This keeps views clean and facilitates unit testing.

```python
# core_app/services/email_service.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


class EmailService:
    """
    Service class for handling email notifications.
    
    Provides static methods for sending various types of emails
    using Django's email backend with HTML templates.
    """
    
    @staticmethod
    def send_welcome_email(user):
        """
        Send a welcome email to a newly registered user.
        
        Args:
            user: User instance with email attribute.
        
        Returns:
            int: Number of successfully delivered messages (0 or 1).
        """
        subject = 'Welcome to our platform'
        html_message = render_to_string('emails/welcome.html', {'user': user})
        
        return send_mail(
            subject=subject,
            message='',  # Plain text fallback
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    
    @staticmethod
    def send_order_confirmation(order):
        """
        Send order confirmation email to customer.
        
        Args:
            order: Order instance with customer and items data.
        """
        # Implementation follows same pattern...
        pass


# Usage in views:
# from ..services.email_service import EmailService
# EmailService.send_welcome_email(user)
```

---

### 2.10 Code Documentation Conventions

> **MANDATORY RULE:** All comments and documentation within code must be written in **ENGLISH** and must use the Python **DocString** format. This convention applies to both backend (Python/Django) and frontend (JavaScript/React).

#### 2.10.1 DocStrings in Python (Backend)

```python
# CORRECT - DocString in English
class OrderService:
    """
    Service class for handling order operations.
    
    This service manages order creation, updates, and integrations
    with external payment providers.
    
    Attributes:
        payment_gateway: Instance of the payment provider client.
        notification_service: Service for sending order notifications.
    
    Example:
        >>> service = OrderService()
        >>> order = service.create_order(user_id=1, items=[...])
    """
    
    def calculate_total(self, items):
        """
        Calculate the total price for a list of order items.
        
        Args:
            items: List of OrderItem objects with price and quantity.
        
        Returns:
            Decimal: The total price including taxes.
        
        Raises:
            ValueError: If items list is empty.
        """
        if not items:
            raise ValueError("Items list cannot be empty")
        return sum(item.price * item.quantity for item in items)


# INCORRECT - Comments in Spanish
class ServicioOrdenes:  # NO: name in Spanish
    # Este servicio maneja las órdenes  # NO: comment in Spanish
    def calcular_total(self, items):
        # Calcular el total  # NO
        pass
```

#### 2.10.2 Comments in JavaScript/React (Frontend)

```javascript
// CORRECT - JSDoc in English
/**
 * Fetches products from the API with optional filters.
 *
 * @param {Object} filters - Filter options for the query
 * @param {string} filters.category - Product category to filter by
 * @param {number} filters.minPrice - Minimum price threshold
 * @param {number} filters.maxPrice - Maximum price threshold
 * @returns {Promise<Array>} Array of product objects
 * @throws {Error} If the API request fails
 *
 * @example
 * const products = await fetchProducts({ category: 'electronics' });
 */
async function fetchProducts(filters = {}) {
    // Build query parameters from filters
    const params = new URLSearchParams(filters);
    
    // Make API request
    const response = await get_request(`products/?${params}`);
    
    // Return parsed data
    return response.data.products;
}

// INCORRECT
async function obtenerProductos(filtros) {  // NO: name in Spanish
    // Obtener los productos del servidor  // NO: comment in Spanish
    const respuesta = await get_request('products/');
    return respuesta.data;
}
```

#### 2.10.3 Convention Summary

- **Language:** Everything in ENGLISH (comments, DocStrings, variable names, functions and classes).
- **Python format:** Use DocStrings with triple quotes. Include description, Args, Returns, Raises.
- **JavaScript format:** Use JSDoc with `/** */`. Include `@param`, `@returns`, `@throws`, `@example`.
- **Classes:** Document purpose, main attributes and usage example.
- **Functions:** Document what it does, parameters, return value and exceptions.
- **Complex code:** Add inline comments explaining non-obvious logic.
- **TODO/FIXME:** Use standard format: `// TODO: description` or `# TODO: description`.

---

### 2.11 Image Gallery (django_attachments)

This library is an **optional** component, available as a **media-heavy profile** for projects that need to manage image galleries in models. It provides reusable fields (`GalleryField`, `LibraryField`), widgets for the Django admin, and a unified experience for uploading, ordering, and deleting images. Enable this profile only when the project manages multimedia content with multiple images per entity.

- **Repository:** Fork of [mireq/django-attachments](https://github.com/mireq/django-attachments) with custom improvements.
- **Installation:** Vendor the fork as a subproject in `backend/django_attachments/`.

#### 2.11.1 Installation and Configuration

The library is included as a subproject (vendored) within the backend. This allows full control over modifications and avoids external dependencies.

```
backend/
├── django_attachments/       # Subproject copied from the repo
│   ├── __init__.py
│   ├── admin.py              # AttachmentsAdminMixin, widgets
│   ├── fields.py             # GalleryField, LibraryField
│   ├── models.py             # Library, Attachment
│   ├── migrations/
│   ├── static/
│   │   └── django_attachments/
│   │       ├── css/
│   │       └── js/
│   └── templates/
│       └── django_attachments/
├── core_app/
└── core_project/
```

**Configuration in settings.py:**

```python
# core_project/settings.py

INSTALLED_APPS = [
    # Django core...
    
    # Image management dependencies (install before django_attachments)
    'easy_thumbnails',                    # Thumbnail generation
    'django_cleanup.apps.CleanupConfig', # Auto-cleanup orphan files
    
    # Gallery/Attachments subproject
    'django_attachments',
    
    # Main app
    'core_app',
]

# Thumbnail configuration (required for django_attachments)
THUMBNAIL_ALIASES = {
    '': {
        'small': {'size': (50, 50), 'crop': True},
        'medium': {'size': (200, 200), 'crop': True},
        'large': {'size': (500, 500), 'crop': False},
        'admin': {'size': (100, 100), 'crop': True},
    },
}

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

**After configuring, run migrations:**

```bash
python manage.py makemigrations
python manage.py migrate django_attachments
python manage.py migrate
```

#### 2.11.2 Usage in Models

Models that need an image gallery use `GalleryField` (for multiple images) or `LibraryField` (for general attachments). It is **CRITICAL** to implement the `delete()` method to clean up associated galleries and avoid orphan files.

```python
# core_app/models/product.py
"""
Product model with image gallery support.

Uses django_attachments for managing product images with
automatic cleanup on deletion.
"""
from django.db import models
from django_attachments.fields import GalleryField
from django_attachments.models import Library


class Product(models.Model):
    """
    Product entity with gallery support.
    
    Attributes:
        name_en: Product name in English.
        name_es: Product name in Spanish.
        price: Product price.
        gallery: Image gallery (managed by django_attachments).
    """
    
    # Business fields
    name_en = models.CharField(max_length=255)
    name_es = models.CharField(max_length=255)
    description_en = models.TextField(blank=True)
    description_es = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Gallery field - stores multiple images
    gallery = GalleryField(
        related_name='products_with_gallery',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name_en
    
    def delete(self, *args, **kwargs):
        """
        Override delete to clean up associated gallery.
        
        IMPORTANT: This prevents orphan files in the media directory.
        Always implement this pattern for models with GalleryField.
        """
        try:
            if self.gallery:
                self.gallery.delete()
        except Library.DoesNotExist:
            pass
        super().delete(*args, **kwargs)
```

**Example with multiple galleries (Home/Landing page):**

```python
# core_app/models/home.py
"""Home page model with multiple gallery sections."""
from django.db import models
from django_attachments.fields import GalleryField
from django_attachments.models import Library


class Home(models.Model):
    """
    Home page configuration with multiple image galleries.
    
    Typically only one instance exists (singleton pattern).
    """
    
    # Hero section
    hero_title_en = models.CharField(max_length=255)
    hero_title_es = models.CharField(max_length=255)
    hero_subtitle_en = models.TextField(blank=True)
    hero_subtitle_es = models.TextField(blank=True)
    
    # Multiple galleries for different sections
    carousel_gallery = GalleryField(
        related_name='home_carousel',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    featured_gallery = GalleryField(
        related_name='home_featured',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    testimonials_gallery = GalleryField(
        related_name='home_testimonials',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    def delete(self, *args, **kwargs):
        """Clean up ALL associated galleries."""
        galleries = [
            self.carousel_gallery,
            self.featured_gallery,
            self.testimonials_gallery
        ]
        for gallery in galleries:
            try:
                if gallery:
                    gallery.delete()
            except Library.DoesNotExist:
                pass
        super().delete(*args, **kwargs)
```

#### 2.11.3 Admin Forms

For the Django admin to correctly display gallery widgets, ModelForms must be created that automatically initialize Library objects if they don't exist. This ensures there is always an editable gallery.

```python
# core_app/forms.py
"""
Model forms with automatic Library initialization for gallery fields.

These forms ensure that GalleryField widgets work correctly in Django Admin
by creating Library instances when they don't exist.
"""
from django import forms
from django_attachments.models import Library
from .models import Product, Home


class ProductForm(forms.ModelForm):
    """
    Form for Product model with gallery support.
    
    Automatically creates a Library instance for the gallery field
    if one doesn't exist, enabling the admin widget to work properly.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make gallery field optional in the form
        self.fields['gallery'].required = False
    
    def save(self, commit=True):
        """
        Save the product, creating a Library if needed.
        
        Args:
            commit: Whether to save to database immediately.
        
        Returns:
            Product: The saved product instance.
        """
        obj = super().save(commit=False)
        
        # Create Library if it doesn't exist
        if not obj.gallery_id:
            library = Library()
            library.save()
            obj.gallery = library
        
        if commit:
            obj.save()
        return obj
    
    class Meta:
        model = Product
        fields = '__all__'


class HomeForm(forms.ModelForm):
    """
    Form for Home model with multiple gallery fields.
    
    Handles initialization of all gallery fields automatically.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # All gallery fields are optional
        gallery_fields = [
            'carousel_gallery',
            'featured_gallery',
            'testimonials_gallery'
        ]
        for field_name in gallery_fields:
            if field_name in self.fields:
                self.fields[field_name].required = False
    
    def save(self, commit=True):
        """Save the home instance, creating Libraries for all galleries."""
        obj = super().save(commit=False)
        
        # List of gallery field names to initialize
        gallery_fields = [
            'carousel_gallery',
            'featured_gallery',
            'testimonials_gallery'
        ]
        
        for field_name in gallery_fields:
            field_id = f'{field_name}_id'
            if not getattr(obj, field_id, None):
                library = Library()
                library.save()
                setattr(obj, field_name, library)
        
        if commit:
            obj.save()
        return obj
    
    class Meta:
        model = Home
        fields = '__all__'
```

#### 2.11.4 Admin Configuration

The ModelAdmin must inherit from `AttachmentsAdminMixin` to enable gallery widgets. It is also important to override `delete_queryset` to ensure the custom `delete()` method is called (and cleans up the galleries).

```python
# core_app/admin.py
"""
Django Admin configuration with gallery support.

Uses AttachmentsAdminMixin to enable image gallery widgets
and custom delete handling to clean up associated files.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django_attachments.admin import AttachmentsAdminMixin

from .models import Product, Home, Category
from .forms import ProductForm, HomeForm


class ProductAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    """
    Admin for Product model with gallery support.
    
    AttachmentsAdminMixin provides:
    - Custom widgets for GalleryField (drag & drop, ordering)
    - AJAX upload functionality
    - Thumbnail previews
    """
    form = ProductForm
    
    list_display = ('name_en', 'price', 'stock', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name_en', 'name_es', 'description_en')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('name_en', 'name_es', 'price', 'stock', 'is_active')
        }),
        (_('Descriptions'), {
            'fields': ('description_en', 'description_es'),
            'classes': ('collapse',)
        }),
        (_('Gallery'), {
            'fields': ('gallery',),
            'description': _('Drag and drop images to reorder. Click to edit.')
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def delete_queryset(self, request, queryset):
        """
        Override bulk delete to use model's delete() method.
        
        IMPORTANT: The default queryset.delete() bypasses the model's
        delete() method, which would leave orphan gallery files.
        """
        for obj in queryset:
            obj.delete()


class HomeAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    """Admin for Home model with multiple galleries."""
    form = HomeForm
    
    fieldsets = (
        (_('Hero Section'), {
            'fields': ('hero_title_en', 'hero_title_es',
                       'hero_subtitle_en', 'hero_subtitle_es')
        }),
        (_('Carousel Gallery'), {
            'fields': ('carousel_gallery',)
        }),
        (_('Featured Gallery'), {
            'fields': ('featured_gallery',)
        }),
        (_('Testimonials Gallery'), {
            'fields': ('testimonials_gallery',)
        }),
    )
    
    def delete_queryset(self, request, queryset):
        """Use model's delete() to clean up all galleries."""
        for obj in queryset:
            obj.delete()


# Register with default admin or custom AdminSite
admin.site.register(Product, ProductAdmin)
admin.site.register(Home, HomeAdmin)
admin.site.register(Category)
```

#### 2.11.5 API Serializers

To expose gallery images in the REST API, use `SerializerMethodField` to extract file URLs. Thumbnails can optionally be included.

```python
# core_app/serializers/product_serializers.py
"""
Product serializers with gallery URL extraction.

Provides multiple serializer variants for different use cases:
- List: minimal data for listings
- Detail: full data including all gallery images
- CreateUpdate: for write operations
"""
from rest_framework import serializers
from ..models import Product


class ProductListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for product listings.
    
    Includes only the first gallery image as thumbnail.
    """
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name_en', 'name_es', 'price',
            'stock', 'is_active', 'thumbnail_url'
        ]
    
    def get_thumbnail_url(self, obj):
        """
        Get the first image URL from the gallery.
        
        Returns:
            str or None: Absolute URL of first image, or None if empty.
        """
        request = self.context.get('request')
        if not request or not obj.gallery:
            return None
        
        # Get first attachment ordered by rank
        first_attachment = obj.gallery.attachment_set.order_by('rank').first()
        if first_attachment and first_attachment.file:
            return request.build_absolute_uri(first_attachment.file.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for product detail view.
    
    Includes all gallery images with metadata.
    """
    gallery_images = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_gallery_images(self, obj):
        """
        Get all images from the gallery with metadata.
        
        Returns:
            list: List of image objects with url, title, and dimensions.
        """
        request = self.context.get('request')
        if not request or not obj.gallery:
            return []
        
        images = []
        for attachment in obj.gallery.attachment_set.order_by('rank'):
            if attachment.file:
                images.append({
                    'id': attachment.id,
                    'url': request.build_absolute_uri(attachment.file.url),
                    'original_name': attachment.original_name,
                    'title': attachment.title or '',
                    'caption': attachment.caption or '',
                    'width': attachment.image_width,
                    'height': attachment.image_height,
                    'filesize': attachment.filesize,
                    'rank': attachment.rank,
                })
        return images


class AttachmentSerializer(serializers.Serializer):
    """
    Reusable serializer for individual attachments.
    
    Can be used standalone or nested in other serializers.
    """
    id = serializers.IntegerField(read_only=True)
    url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    original_name = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    caption = serializers.CharField(read_only=True)
    filesize = serializers.IntegerField(read_only=True)
    mimetype = serializers.CharField(read_only=True)
    image_width = serializers.IntegerField(read_only=True)
    image_height = serializers.IntegerField(read_only=True)
    rank = serializers.IntegerField(read_only=True)
    
    def get_url(self, obj):
        """Get absolute URL for the file."""
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None
    
    def get_thumbnail_url(self, obj):
        """
        Get thumbnail URL using easy_thumbnails.
        
        Returns medium size thumbnail if available.
        """
        request = self.context.get('request')
        if not obj.file or not obj.is_image:
            return None
        
        try:
            from easy_thumbnails.files import get_thumbnailer
            thumbnailer = get_thumbnailer(obj.file)
            thumbnail = thumbnailer.get_thumbnail({'size': (200, 200), 'crop': True})
            if request:
                return request.build_absolute_uri(thumbnail.url)
            return thumbnail.url
        except Exception:
            return None
```

#### django_attachments Integration Summary

- **Installation:** Check if `backend/django_attachments/` exists. If not, clone the repository.
- **Clone:** Clone the team's fork into `backend/django_attachments/` per the project's internal repository.
- **Dependencies:** Requires `easy_thumbnails` and `django_cleanup`.
- **Models:** Use `GalleryField`, **ALWAYS** implement `delete()` to clean up galleries.
- **Forms:** Create ModelForm that initializes Library automatically.
- **Admin:** Inherit from `AttachmentsAdminMixin`, override `delete_queryset`.
- **Serializers:** Use `SerializerMethodField` to extract image URLs.
- **URLs:** No manual configuration needed - the admin registers them automatically.

---

### 2.12 Testing (Backend)

Backend tests are organized as a pytest package inside the Django app. A distinction is made between unit tests (models, serializers, utils) and lightweight integration tests (API endpoints).

> **Mandatory quality reference:** `TESTING_QUALITY_STANDARDS.md` defines rules for naming, atomicity, assertions, determinism, and isolation. For quality gate operation, see `TEST_QUALITY_GATE_REFERENCE.md`.

#### 2.12.1 Test Structure

```
backend/
└── core_app/
    └── tests/
        ├── conftest.py    # Shared fixtures (api_client, existing_user, admin_user, etc.)
        ├── helpers.py     # Test utilities (e.g.: extract results from paginated responses)
        ├── models/        # Unit tests for models
        ├── serializers/   # Unit tests for DRF serializers
        ├── views/         # Endpoint tests (lightweight integration)
        ├── services/      # Unit tests for business services
        ├── tasks/         # Async task tests (Celery)
        ├── commands/      # Management command tests
        ├── permissions/   # Custom permission tests (BasePermission)
        └── utils/         # Unit tests for utilities
```

> **`conftest.py`:** Defines pytest fixtures shared by all app tests. The most common fixtures are `api_client` (an `APIClient` instance) and pre-created users (`existing_user`, `admin_user`). They should be minimal — only what most tests need.

> **`helpers.py`:** Test utility functions that are not fixtures but are reused across multiple files (e.g.: extracting the `results` array from a paginated response).

**Practical classification:**

- **Unit:** Models (`tests/models/*`), Serializers (`tests/serializers/*`), Services (`tests/services/*`), Utils (`tests/utils/*`), Permissions (`tests/permissions/*`).
- **Flow / lightweight integration (API):** Views (`tests/views/*`) using `APIClient`, `reverse()`, and assertions on status/response.
- **Commands:** Management command tests (`tests/commands/*`) that verify behavior of `create_fake_*` and `delete_fake_*`.
- **Tasks:** Celery task tests (`tests/tasks/*`) with broker mocks.

#### 2.12.2 Libraries Used

- **pytest:** Main test runner.
- **pytest-django:** Django integration (fixtures, marks).
- **pytest-cov / coverage:** Code coverage measurement.
- **DRF APIClient:** Test client for REST endpoints.
- **unittest.mock:** Mocks for external integrations (`patch`, `MagicMock`).

#### 2.12.3 Quality Rules (summary)

> **Canonical source:** `TESTING_QUALITY_STANDARDS.md` contains the complete rules with examples. `TEST_QUALITY_GATE_REFERENCE.md` details the checks per suite and the gate CLI.

**Blocking rules (ERROR):** empty test, no assertions, forbidden tokens (`batch`, `cov`, `deep`, `all`, `misc`), conjunctions in name (`and`/`or`/`also`/`plus`), `if`/`for`/`while` in the test body, `assert` inside loops.

**Warnings (WARNING):** `datetime.now()` / `random` without control, mock configured but not verified with `assert_called`.

**pytest conventions:** `@pytest.mark.django_db`, `api_client.force_authenticate(user=...)`, `reverse('<url_name>')`, always validate `status_code` and payload shape.

#### 2.12.4 Endpoint Test Example

```python
# core_app/tests/views/test_auth.py
import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_sign_in_success(api_client, existing_user, mock_requests_post):
    """
    Test successful user sign in with valid credentials.
    
    Args:
        api_client: DRF test client fixture.
        existing_user: Pre-created user fixture.
        mock_requests_post: Mock for external captcha validation.
    """
    url = reverse('sign_in')
    response = api_client.post(url, {
        'email': existing_user.email,
        'password': 'existingpassword',
        'captcha_token': 'valid_captcha_token',
    }, format='json')
    
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data
```

#### 2.12.5 Commands to Run Tests

```bash
# Run a specific modified file
pytest core_app/tests/views/test_auth.py -v

# Run related regression (recommended maximum batch: 20 tests)
pytest core_app/tests/views/test_auth.py core_app/tests/serializers/test_auth_serializers.py -v

# Quality gate scoped to the modified file
python ../scripts/test_quality_gate.py --repo-root .. --suite backend \
  --semantic-rules strict --external-lint run --include-file backend/core_app/tests/views/test_auth.py

# Recommended environment variable
export DJANGO_SETTINGS_MODULE=core_project.settings
```

#### 2.12.6 Naming Conventions (Python)

| Element | Pattern | Example |
|---------|---------|--------|
| File | `test_<domain>.py` | `test_order.py`, `test_auth_views.py` |
| Class | `class Test<Entity><Aspect>` | `class TestOrderCreation`, `class TestOrderPermissions` |
| Function (standalone) | `test_<action>_<result>_<condition>()` | `test_create_order_returns_201_when_user_is_authenticated` |
| Function (in class) | `test_<action>_<result>()` | `test_returns_404_when_order_not_found` |
| Fixture | `<entity>_<variant>` | `existing_user`, `pending_order`, `authenticated_client` |

```python
# ✅ CORRECT
class TestOrderCreation:
    """Tests for order creation endpoint behavior."""

    def test_returns_201_when_payload_is_valid(self, api_client, existing_user):
        """Verify successful order creation returns HTTP 201 with order data."""
        ...

    def test_returns_400_when_items_are_empty(self, api_client, existing_user):
        """Verify that an empty items list is rejected with HTTP 400."""
        ...

# ❌ INCORRECT
class OrderTests:                          # NO: does not describe the aspect
    def test_order(self): ...              # NO: too vague
    def test_order_ok(self): ...           # NO: "ok" does not describe the result
    def test_create_and_cancel(self): ...  # NO: conjunction
```

#### 2.12.7 Fixtures, Factories and AAA Pattern

Use the AAA pattern (Arrange — Act — Assert) in every test. Fixtures should be minimal and provide only what the test needs. For payloads with more than 4 fields, use factory functions with `**overrides`. For factories of related models, consider `factory-boy`.

> See complete examples in `TESTING_QUALITY_STANDARDS.md`.

#### 2.12.8 Determinism and Isolation

Tests must not depend on execution time, random values, or mutable global state. Use `@freeze_time` for time, `@override_settings` for settings, `monkeypatch.setenv()` for environment variables, and `patch()` with a fixed value for UUIDs/random values.

> See complete examples for each technique in `TESTING_QUALITY_STANDARDS.md`.

#### 2.12.9 Coverage Reporting

The backend uses a **custom coverage reporter** defined in `conftest.py` that replaces the default `pytest-cov` terminal output with a colored, per-file table and a "Top-N files to focus on" footer.

**Shared color thresholds:**

| Coverage % | Color | Meaning |
|------------|-------|----------|
| > 80% | Green | Good coverage |
| 50–80% | Yellow | Needs improvement |
| < 50% | Red | Critical — prioritize immediately |

**How to run:**

```bash
cd backend
source venv/bin/activate
pytest --cov
```

The `--cov` flag tells `pytest-cov` to collect coverage data into `.coverage`. The custom hooks in `conftest.py` suppress the default report and print the styled one instead.

> **Full implementation:** see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` for the complete `conftest.py` source code, adaptation notes (app name filter, Top-N count), and expected output examples.

---

## 3. Frontend - React + TypeScript

### 3.1 Folder Structure

```
frontend/
├── app/                     # Routes, layouts and pages (App Router)
│   ├── (public)/
│   ├── (app)/
│   ├── layout.tsx
│   └── __tests__/           # Unit/component tests
│       ├── stores/          # Zustand store tests
│       ├── services/        # HTTP client and service tests
│       ├── components/      # React component tests
│       ├── composables/     # Reusable hooks/composables tests
│       ├── styles/          # Style utility tests (if applicable)
│       └── views/           # Full page tests
├── lib/
│   ├── services/            # HTTP client + API wrappers
│   ├── stores/              # Global state (Zustand/Redux Toolkit)
│   └── constants.ts         # Shared application constants
├── e2e/                     # Playwright E2E tests
│   ├── flow-definitions.json      # Source of truth: all user flows
│   ├── flow-definitions.schema.json # JSON Schema for validation
│   ├── reporters/
│   │   └── flow-coverage-reporter.mjs  # Custom flow-level coverage reporter
│   ├── helpers/
│   │   └── flow-tags.ts           # Tag constants (recommended)
│   ├── fixtures.ts                # Custom test base + auth/mock helpers
│   ├── auth/                      # One directory per module
│   ├── app/
│   ├── public/
│   └── ...                        # Additional modules as the project grows
├── coverage-e2e/                  # Auto-generated (gitignored)
│   └── flow-coverage.json         # JSON coverage artifact
├── public/                  # Static assets
├── jest.config.cjs
├── jest.setup.ts
├── playwright.config.ts
├── next.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

> **Note on `lib/`:** The `lib/` directory groups reusable modules not tied to specific routes. Depending on the project, it can be expanded with `lib/auth/` (session/token management), `lib/i18n/` (language configuration) or `lib/utils/` (generic helpers). Keep only subdirectories that actually exist to avoid empty folders.

---

### 3.2 Main Configuration (App Providers)

```tsx
// frontend/app/providers.tsx
'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from '@/lib/auth/SessionProvider';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <I18nProvider>{children}</I18nProvider>
    </SessionProvider>
  );
}
```

```tsx
// frontend/app/layout.tsx
import type { ReactNode } from 'react';
import { AppProviders } from './providers';
import './globals.css';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='en'>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

---

### 3.3 HTTP Service (Axios + JWT + Refresh)

The HTTP service centralizes all requests. It automatically handles JWT in headers, expired access token refresh, and language/currency headers to maintain consistent contracts with the backend.

```ts
// frontend/lib/services/httpClient.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { sessionStore } from '@/lib/auth/sessionStore';

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api',
  timeout: 120000,
});

let refreshPromise: Promise<string | null> | null = null;

function attachRequestHeaders(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const accessToken = sessionStore.getAccessToken();
  const locale = sessionStore.getLocale() ?? 'en';
  const currency = sessionStore.getCurrency() ?? 'USD';

  config.headers = {
    ...config.headers,
    'Accept-Language': locale,
    'X-Currency': currency,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  return config;
}

httpClient.interceptors.request.use(attachRequestHeaders);

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const statusCode = error.response?.status;
    const originalRequest = error.config;

    if (
      !originalRequest ||
      statusCode !== 401 ||
      originalRequest.url?.includes('/auth/token/refresh/')
    ) {
      throw error;
    }

    if (!refreshPromise) {
      refreshPromise = sessionStore.refreshAccessToken(httpClient).finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;
    if (!newAccessToken) {
      sessionStore.clear();
      throw error;
    }

    originalRequest.headers = {
      ...originalRequest.headers,
      Authorization: `Bearer ${newAccessToken}`,
    };

    return httpClient.request(originalRequest);
  },
);

export const getRequest = <T>(url: string, config = {}) =>
  httpClient.get<T>(url, config);

export const createRequest = <T>(url: string, payload: unknown, config = {}) =>
  httpClient.post<T>(url, payload, config);

export const updateRequest = <T>(url: string, payload: unknown, config = {}) =>
  httpClient.put<T>(url, payload, config);

export const patchRequest = <T>(url: string, payload: unknown, config = {}) =>
  httpClient.patch<T>(url, payload, config);

export const deleteRequest = <T>(url: string, config = {}) =>
  httpClient.delete<T>(url, config);
```

---

### 3.4 Global State (Store Pattern)

The recommendation for React is to use an explicit store per domain. The pattern must include state, derived state, and async actions with consistent loading/error handling.

```ts
// frontend/lib/stores/productStore.ts
import { create } from 'zustand';
import {
  createRequest,
  deleteRequest,
  getRequest,
  updateRequest,
} from '@/lib/services/httpClient';

type Product = {
  id: number;
  name: string;
  price: string;
};

type ProductStoreState = {
  items: Product[];
  currentItem: Product | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  fetchItem: (id: number) => Promise<void>;
  createItem: (payload: Partial<Product>) => Promise<void>;
  updateItem: (id: number, payload: Partial<Product>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  clearError: () => void;
};

export const useProductStore = create<ProductStoreState>((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRequest<{ products: Product[] }>('/products/');
      set({ items: response.data.products ?? [] });
    } catch {
      set({ error: 'Unable to load products.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItem: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRequest<{ product: Product }>(`/products/${id}/`);
      set({ currentItem: response.data.product });
    } catch {
      set({ currentItem: null, error: 'Product not found.' });
    } finally {
      set({ isLoading: false });
    }
  },

  createItem: async (payload) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await createRequest<{ product: Product }>('/products/create/', payload);
      set((state) => ({ items: [response.data.product, ...state.items] }));
    } catch {
      set({ error: 'Unable to create product.' });
    } finally {
      set({ isUpdating: false });
    }
  },

  updateItem: async (id, payload) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await updateRequest<{ product: Product }>(`/products/${id}/update/`, payload);
      const updated = response.data.product;

      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
        currentItem: state.currentItem?.id === id ? updated : state.currentItem,
      }));
    } catch {
      set({ error: 'Unable to update product.' });
    } finally {
      set({ isUpdating: false });
    }
  },

  deleteItem: async (id) => {
    set({ isUpdating: true, error: null });
    try {
      await deleteRequest(`/products/${id}/delete/`);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        currentItem: state.currentItem?.id === id ? null : state.currentItem,
      }));
    } catch {
      set({ error: 'Unable to delete product.' });
    } finally {
      set({ isUpdating: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export const productSelectors = {
  totalItems: (state: ProductStoreState) => state.items.length,
  hasItems: (state: ProductStoreState) => state.items.length > 0,
  getById: (id: number) => (state: ProductStoreState) =>
    state.items.find((item) => item.id === id) ?? null,
};
```

---

### 3.5 Routing and Guards

With App Router, route protection is implemented in `middleware.ts` (edge) and in server/client layers depending on the sensitivity of the resource.

```ts
// frontend/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/account', '/orders'];
const guestRoutes = ['/login', '/register'];

function isAuthenticated(request: NextRequest): boolean {
  return Boolean(request.cookies.get('access_token')?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !authenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (guestRoutes.some((route) => pathname.startsWith(route)) && authenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/orders/:path*', '/login', '/register'],
};
```

---

### 3.6 Internationalization (i18n)

Define supported languages in a central configuration and expose locale state from a lightweight store to synchronize URL, UI, and HTTP headers.

```ts
// frontend/lib/i18n/config.ts
export const AVAILABLE_LOCALES = ['en', 'es'] as const;
export type Locale = (typeof AVAILABLE_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
```

```ts
// frontend/lib/stores/localeStore.ts
import { create } from 'zustand';
import { AVAILABLE_LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

type LocaleStoreState = {
  locale: Locale;
  setLocale: (locale: string) => void;
  initializeLocale: () => void;
};

export const useLocaleStore = create<LocaleStoreState>((set) => ({
  locale: DEFAULT_LOCALE,

  setLocale: (locale) => {
    if (!AVAILABLE_LOCALES.includes(locale as Locale)) {
      return;
    }

    const safeLocale = locale as Locale;
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', safeLocale);
    }

    set({ locale: safeLocale });
  },

  initializeLocale: () => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && AVAILABLE_LOCALES.includes(savedLocale as Locale)) {
      set({ locale: savedLocale as Locale });
      return;
    }

    const browserLocale = navigator.language.split('-')[0];
    set({
      locale: AVAILABLE_LOCALES.includes(browserLocale as Locale)
        ? (browserLocale as Locale)
        : DEFAULT_LOCALE,
    });
  },
}));
```

---

### 3.7 Testing (Frontend)

The frontend uses Jest for unit/component tests and Playwright for E2E. The source of truth for test quality is `TESTING_QUALITY_STANDARDS.md`; quality gate operation is in `TEST_QUALITY_GATE_REFERENCE.md`.

#### 3.7.1 Unit and Component Testing (Jest + React Testing Library)

**Configuration:**
- **Runner:** Jest (`npm test`) with `jsdom` environment, `@/` alias, and coverage by layer.
- **Setup:** `jest.setup.ts` for global matchers and mocks.
- **Location:** `frontend/app/__tests__/` organized by domain (`stores/`, `services/`, `components/`, `views/`).

**Rule: No implementation coupling**

Test only observable behavior from the outside. Do not access internal store state, private properties, or component implementation details.

```tsx
// ❌ INCORRECT — accesses internal store state
const { result } = renderHook(() => useProductStore());
expect(result.current._internalCache).toBeDefined();

// ✅ CORRECT — verifies behavior visible to the user
render(<ProductList />);
expect(screen.getByRole('list')).toBeInTheDocument();
expect(screen.getAllByRole('listitem')).toHaveLength(3);
```

**Selector stability table**

| Selector | Stability | Recommended use |
|----------|-----------|------------------|
| `getByRole('button', { name: /text/ })` | ✅ High | First option always |
| `getByLabelText(/label/i)` | ✅ High | Inputs with associated label |
| `getByTestId('my-component')` | ✅ High | No semantic role or label |
| `getByText(/text/i)` | ⚠️ Medium | Only predictable static text |
| `querySelector('.css-class')` | ❌ Fragile | Never — changes with refactors |
| `container.firstChild` | ❌ Fragile | Never — coupled to internal DOM |

**Rule: One mount per test**

Each test runs exactly one `render()`. If reactivity to prop changes needs to be verified, use `rerender()` in the same test with an exception comment.

```tsx
// ✅ CORRECT — one mount, one behavior
it('shows error state when fetch fails', async () => {
  mockGetProducts.mockRejectedValueOnce(new Error('Network error'));
  render(<ProductList />);
  expect(await screen.findByText(/unable to load/i)).toBeInTheDocument();
});

// ✅ DOCUMENTED EXCEPTION — rerender for prop reactivity
it('updates displayed locale when locale prop changes', () => {
  // quality: allow-multiple-renders (testing prop reactivity)
  const { rerender } = render(<LocaleLabel locale="en" />);
  expect(screen.getByText('English')).toBeInTheDocument();
  rerender(<LocaleLabel locale="es" />);
  expect(screen.getByText('Español')).toBeInTheDocument();
});
```

**Complete example:**

```tsx
// frontend/app/__tests__/components/login-form.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/app/components/auth/LoginForm';

describe('LoginForm', () => {
  it('shows validation message when email is missing', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/password/i), 'secure-pass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

**Coverage reporting:**

The project includes a **custom Jest coverage summary script** (`scripts/coverage-summary.cjs`) that reads `coverage/coverage-summary.json` and prints a styled Top-N uncovered files report with the same color thresholds as the backend (green >80%, yellow 50–80%, red <50%).

```bash
# Run unit tests with custom coverage summary
npm run test:coverage
```

The `test:coverage` npm script runs Jest with `--coverage` and then executes the custom summary script. The `json-summary` reporter in `jest.config.cjs` generates the data file consumed by the script.

> **Full implementation:** see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` for the complete `coverage-summary.cjs` source code, `jest.config.cjs` coverage settings, adaptation notes (source path regex, Top-N count), and expected output examples.

#### 3.7.2 E2E Testing (Playwright)

**Configuration:**
- **Runner:** `@playwright/test` with `playwright.config.ts` and `testDir: './e2e'`.
- **Structure:** `e2e/auth/`, `e2e/app/`, `e2e/public/`, `e2e/fixtures.ts`.

**Selector hierarchy table**

| Priority | Selector | Example |
|----------|----------|---------|
| 1 ✅ | `getByRole` | `page.getByRole('button', { name: /submit/i })` |
| 2 ✅ | `getByLabel` | `page.getByLabel('Email')` |
| 3 ✅ | `getByTestId` | `page.getByTestId('checkout-form')` |
| 4 ✅ | `getByText` | `page.getByText('Confirm order')` |
| 5 ⚠️ | `locator('[data-*]')` | `page.locator('[data-status="active"]')` |
| 6 ❌ | `locator('.css-class')` | Never — fragile against style refactors |
| 7 ❌ | `locator('#id')` | Never — generator IDs change |
| 8 ❌ | `nth()` without context | Never — position is not a stable selector |

**Rule: No `waitForTimeout()` — use condition-based waits**

```ts
// ❌ INCORRECT — arbitrary sleep, non-deterministic
await page.waitForTimeout(2000);
await expect(page.getByText('Order confirmed')).toBeVisible();

// ✅ CORRECT — waits for observable state
await expect(page).toHaveURL(/\/order\/confirmation/);
await expect(page.getByRole('heading', { name: /confirmed/i })).toBeVisible();

// ✅ CORRECT — wait for network response before verifying
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/orders/') && resp.status() === 201),
  page.getByRole('button', { name: 'Place order' }).click(),
]);
await expect(page.getByTestId('confirmation-number')).toBeVisible();
```

**E2E data isolation**

Each test must be independent: create and clean up its own data, or use an isolated tenant/user.

```ts
test.describe('Order flow', () => {
  let orderId: number;

  test.beforeEach(async ({ request }) => {
    // Create data via backend API
    const response = await request.post('/api/orders/', { data: { ... } });
    orderId = (await response.json()).id;
  });

  test.afterEach(async ({ request }) => {
    // Clean up so the test does not affect others
    await request.delete(`/api/orders/${orderId}/`);
  });

  test('order detail page shows correct items', async ({ page }) => {
    await page.goto(`/orders/${orderId}`);
    await expect(page.getByTestId('order-items')).toBeVisible();
  });
});
```

**Serial tests — require justification**

By default, E2E tests run in parallel. If a test must be serial (due to state dependency), document the reason with `quality: allow-serial`.

```ts
// quality: allow-serial (multi-step checkout creates state consumed by next step)
test.describe.serial('Checkout multi-step flow', () => {
  test('step 1: user adds item to cart', async ({ page }) => { ... });
  test('step 2: user fills shipping info', async ({ page }) => { ... });
  test('step 3: user completes payment', async ({ page }) => { ... });
});
```

**Complete example:**

```ts
// frontend/e2e/auth/login.spec.ts
import { test, expect, mockLoginApi, mockCaptchaSiteKey } from '../fixtures';
import { FlowTags, RoleTags } from '../helpers/flow-tags';

test('user signs in and lands on dashboard', {
  tag: [...FlowTags.AUTH_LOGIN, RoleTags.GUEST],
}, async ({ page }) => {
  await mockLoginApi(page);
  await mockCaptchaSiteKey(page);
  await page.goto('/login');

  await page.getByLabel(/Correo electrónico/i).fill('client@example.com');
  await page.getByLabel(/Contraseña/i).fill('secure-pass');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await page.waitForURL('**/dashboard', { timeout: 60_000 });
  await expect(page).toHaveURL(/\/dashboard/);
});
```

#### 3.7.3 E2E module-based directory structure

E2E tests are organized by **functional module**, mirroring the `module` field in `flow-definitions.json`. Each module gets its own directory under `e2e/`.

**Directory naming rules:**

| Rule | Example |
|---|---|
| One directory per module | `e2e/auth/`, `e2e/app/`, `e2e/public/` |
| Directory name matches the module ID in `flow-definitions.json` | Module `"booking"` → `e2e/app/` or `e2e/booking/` |
| Use kebab-case | `e2e/legal-requests/` (not `e2e/legalRequests/`) |
| Role-specific subdirectories when a module has many flows per role | `e2e/organizations/corporate/`, `e2e/organizations/client/` |
| Cross-role flows in a `cross-role/` subdirectory | `e2e/organizations/cross-role/` |

**Spec file naming convention:**

```
<module>-<flow-action>.spec.ts
```

Examples:
- `auth/login.spec.ts`
- `app/dashboard.spec.ts`
- `app/booking-complete-flow.spec.ts`
- `public/checkout.spec.ts`

#### 3.7.4 E2E test infrastructure and practical patterns

This section covers the foundational infrastructure every new project needs **before writing any E2E spec**. These helpers and patterns ensure tests are isolated, reproducible, and maintainable.

##### 3.7.4.1 Custom test base (`fixtures.ts`)

All spec files must import `test` and `expect` from a **custom fixtures file** instead of directly from `@playwright/test`. This custom base extends the default fixtures (e.g., to add error logging and shared auth helpers):

```ts
// e2e/fixtures.ts
import { test as base, expect, type Page } from '@playwright/test';

export const E2E_USER = {
  email: 'e2e@example.com',
  password: 'e2e123456',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
};

const FAKE_TOKEN = 'fake-e2e-jwt-token-for-testing';

/**
 * Mock the login API endpoint so it returns a fake token without hitting the backend.
 */
export async function mockLoginApi(page: Page) {
  await page.route('**/api/auth/login/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tokens: { access: FAKE_TOKEN, refresh: 'fake-e2e-refresh-token' },
        user: {
          id: 999,
          email: E2E_USER.email,
          first_name: E2E_USER.firstName,
          last_name: E2E_USER.lastName,
          role: 'customer',
        },
      }),
    });
  });
}

/**
 * Mock the captcha site-key endpoint to return 404, disabling captcha in E2E tests.
 */
export async function mockCaptchaSiteKey(page: Page) {
  await page.route('**/api/google-captcha/site-key/', async (route) => {
    await route.fulfill({ status: 404, body: '' });
  });
}

/**
 * Mock the auth profile endpoint for hydration.
 */
export async function mockAuthProfile(page: Page) {
  await page.route('**/api/auth/profile/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 999, email: E2E_USER.email, role: 'customer' },
      }),
    });
  });
}

/**
 * Setup default API mocks for common endpoints so tests don't hit the real backend.
 * Individual tests can override specific routes after calling this.
 */
export async function setupDefaultApiMocks(page: Page) {
  await mockCaptchaSiteKey(page);
  await mockAuthProfile(page);
  // Add more default mocks as needed (subscriptions, bookings, etc.)
}

/**
 * Inject auth cookies directly — for tests that only need an authenticated state
 * without going through the login form.
 */
export async function mockLoginAsTestUser(page: Page) {
  await mockLoginApi(page);
  await setupDefaultApiMocks(page);
  // Inject auth cookies or localStorage depending on your auth strategy
  await page.context().addCookies([
    { name: 'app_token', value: FAKE_TOKEN, domain: 'localhost', path: '/' },
  ]);
  await page.goto('/dashboard');
}

export const test = base;
export { expect };
```

**Usage in every spec file:**

```ts
// ✅ CORRECT — import from custom base
import { test, expect } from '../fixtures';

// ❌ WRONG — bypasses custom fixtures
import { test, expect } from '@playwright/test';
```

> This pattern allows adding global behaviors (error logging, custom fixtures, shared setup) in a single place without modifying every spec file.

##### 3.7.4.2 API mocking patterns

E2E tests mock backend API responses using Playwright route interception. The standard uses per-route mocking helpers defined in `fixtures.ts` or per-module mock files:

```ts
// Per-route mocking in a spec file
test('shows empty state when no items exist', {
  tag: [...FlowTags.MY_PROGRAMS_LIST, RoleTags.USER],
}, async ({ page }) => {
  await page.route('**/api/subscriptions/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    });
  });

  await mockLoginAsTestUser(page);
  await expect(page.getByText(/no tienes programas/i)).toBeVisible();
});
```

> **Key rule:** Route mocks must be set up **before** any `page.goto()`. The handler returns a `{ status, contentType, body }` object via `route.fulfill()`.

##### 3.7.4.3 Auth state setup

Authenticated routes require JWT tokens (cookies or localStorage). The auth setup helper injects auth state **before** navigation:

```ts
// e2e/fixtures.ts
export async function mockLoginAsTestUser(page: Page) {
  await mockLoginApi(page);
  await setupDefaultApiMocks(page);

  // Cookie-based auth (Next.js pattern)
  await page.context().addCookies([
    { name: 'app_token', value: FAKE_TOKEN, domain: 'localhost', path: '/' },
    { name: 'app_user', value: encodeURIComponent(JSON.stringify({
      id: 999, email: E2E_USER.email, role: 'customer',
    })), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/dashboard');
}
```

**Usage:**

```ts
test('dashboard shows user info', {
  tag: [...FlowTags.DASHBOARD_OVERVIEW, RoleTags.USER],
}, async ({ page }) => {
  await mockLoginAsTestUser(page);
  await expect(page.getByText(E2E_USER.fullName)).toBeVisible();
});
```

> **Order matters:** Call auth setup before `page.goto()`. Cookies/localStorage must be available when the SPA initializes.

##### 3.7.4.4 Module mock installers

For complex modules, create a centralized **mock installer function** in a dedicated mock file that sets up all API routes for that module in a single call:

```ts
// e2e/helpers/bookingMocks.ts
import type { Page } from '@playwright/test';

export function buildMockSlot({ id, date, startTime }: { id: number; date: string; startTime: string }) {
  return { id, date, start_time: startTime, is_available: true };
}

export async function installBookingApiMocks(page: Page, options: {
  hasAvailableSlots?: boolean;
  hasActiveSubscription?: boolean;
}) {
  await page.route('**/api/availability-slots/**', async (route) => {
    const slots = options.hasAvailableSlots
      ? [buildMockSlot({ id: 1, date: '2026-03-01', startTime: '09:00' })]
      : [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: slots.length, results: slots }),
    });
  });

  await page.route('**/api/subscriptions/', async (route) => {
    const results = options.hasActiveSubscription
      ? [{ id: 1, status: 'active', sessions_remaining: 5 }]
      : [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: results.length, results }),
    });
  });
}
```

**Naming convention:**

| File | Installer function | Builder functions |
|---|---|---|
| `<module>Mocks.ts` | `install<Module>ApiMocks(page, options)` | `buildMock<Entity>(fields)` |
| `bookingMocks.ts` | `installBookingApiMocks(page, { hasAvailableSlots, ... })` | `buildMockSlot()` |
| `checkoutMocks.ts` | `installCheckoutApiMocks(page, { packages, ... })` | `buildMockPackage()` |

For simpler modules, the mock installer can be defined **inline in the spec file** instead of in a shared helper. Move it to `helpers/` when multiple spec files need the same mocks.

##### 3.7.4.5 Test isolation — unique user IDs

Each test must use a **unique `userId`** to avoid state collisions between parallel tests. Use a simple convention of incrementing numeric IDs per spec file or test group:

```ts
// Spec file A — IDs in the 3200 range
test('user sees dashboard overview', { ... }, async ({ page }) => {
  const userId = 3200;
  // ...
});

test('user sees upcoming session', { ... }, async ({ page }) => {
  const userId = 3201;
  // ...
});

// Spec file B — IDs in the 4200 range
test('guest completes checkout', { ... }, async ({ page }) => {
  const userId = 4200;
  // ...
});
```

> **Why:** Playwright runs tests in parallel. If two tests share the same userId and the mock handlers are stateful, responses will collide. Unique IDs guarantee isolation.

##### 3.7.4.6 Cross-role test pattern

Flows that involve **multiple user roles** (e.g., admin creates → customer sees) use sequential auth switching within a single test by re-injecting cookies/auth state:

```ts
test('admin creates item, customer sees it', {
  tag: ['@flow:cross-admin-customer-flow', '@module:items', '@priority:P1'],
}, async ({ page }) => {
  test.setTimeout(60_000); // Cross-role tests need longer timeouts

  const adminUserId = 4700;
  const customerUserId = 4701;

  // Step 1: admin creates item
  await page.context().addCookies([
    { name: 'app_token', value: 'admin-token', domain: 'localhost', path: '/' },
  ]);
  await installMocks(page, { userId: adminUserId, role: 'admin' });
  await page.goto('/admin/items');
  // ... admin actions ...

  // Step 2: switch to customer role
  await page.context().clearCookies();
  await page.context().addCookies([
    { name: 'app_token', value: 'customer-token', domain: 'localhost', path: '/' },
  ]);
  await installMocks(page, { userId: customerUserId, role: 'customer' });
  await page.goto('/items');
  // ... customer verifications ...
});
```

**Cross-role test rules:**

- Place in a `cross-role/` subdirectory when applicable.
- Use `test.setTimeout(60_000)` — these tests involve multiple navigations.
- The mock installer must handle API routes for **both roles** and maintain state between navigations.
- Tag with all participating roles: `@role:shared` or `['@role:admin', '@role:customer']`.

##### 3.7.4.7 Playwright configuration essentials

The `playwright.config.ts` must include the custom reporter, a `webServer` block, and sensible defaults:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 3000;
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;
const reuseExistingServer = process.env.E2E_REUSE_SERVER === '1' && !process.env.CI;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'coverage-e2e' }],
    ['json', { outputFile: 'coverage-e2e/report.json' }],
    ['./e2e/reporters/flow-coverage-reporter.mjs', { outputDir: 'coverage-e2e' }],
  ],
  use: {
    baseURL,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'off',
    video: 'off',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

**Environment variables:**

| Variable | Default | Purpose |
|---|---|---|
| `E2E_PORT` | `3000` | Port for the dev server |
| `E2E_BASE_URL` | `http://localhost:3000` | Override base URL (e.g., for external servers) |
| `E2E_REUSE_SERVER` | `"0"` | Set to `"1"` to reuse an already running dev server |
| `CI` | — | Set automatically by CI runners; affects retries and server reuse |

##### 3.7.4.8 Responsive / Multi-Viewport Testing

Responsive layout is a **cross-cutting design property**, not a user flow. It must not have its own E2E module.

**Rules:**

- **Do NOT** create a dedicated `e2e/viewport/` or `e2e/responsive/` module.
- Use Playwright `projects` to define additional viewport sizes (mobile, tablet). Functional tests run automatically at all configured viewports.
- If a specific component has viewport-dependent **behavior** (e.g., sidebar collapses on mobile, hamburger menu appears), the test belongs in that component's functional module (e.g., `e2e/app/dashboard-sidebar-mobile.spec.ts`).

**Multi-project configuration example:**

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // ... other config
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Mini'] },
    },
  ],
});
```

All three projects run by default when executing `npm run e2e` or `npm run e2e:coverage`.

**Per-viewport npm scripts:**

| Script | Command | Purpose |
|---|---|---|
| `e2e` | `playwright test` | Full suite, all viewports |
| `e2e:desktop` | `playwright test --project="Desktop Chrome"` | Desktop only |
| `e2e:mobile` | `playwright test --project="Mobile Chrome"` | Mobile only |
| `e2e:tablet` | `playwright test --project="Tablet"` | Tablet only |

**Module helper scripts:**

| Script | Command | Purpose |
|---|---|---|
| `e2e:modules` | `node ./scripts/e2e-modules.cjs` | List modules defined in `flow-definitions.json` |
| `e2e:module` | `node ./scripts/e2e-module.cjs` | Run only tests tagged with `@module:<name>` |
| `e2e:coverage:module` | `node ./scripts/e2e-coverage-module.cjs` | Run coverage for a single module |

**Combining viewport filter with a specific spec:**

```bash
npm run e2e:desktop -- e2e/auth/auth-login.spec.ts
npm run e2e:mobile -- e2e/checkout/checkout.spec.ts
```

**Module-scoped helpers:**

```bash
npm run e2e:modules
npm run e2e:module -- auth

clear && npm run e2e:clean && npm run e2e:coverage -- --grep @module:auth
npm run e2e:coverage:module -- auth
```

> `--grep @module:<name>` runs only tests tagged with that module. The flow coverage report will still list other modules as missing because the subset was not executed.

#### 3.7.5 Flow Coverage methodology — overview

The standard E2E strategy measures coverage at the **user-flow level** rather than at the code-line level. This answers the question: *"Do our tests cover real user journeys?"*

The system has **three pillars:**

1. **Flow definitions** (`flow-definitions.json`) — a JSON registry of every user flow the application supports, classified by module, role, and priority.
2. **Flow tags** (`@flow:<flow-id>`) — Playwright test tags that link each test to one or more flow definitions.
3. **Custom reporter** (`flow-coverage-reporter.mjs`) — a Playwright reporter that computes flow-level coverage and generates a terminal report + JSON artifact.

> **Full implementation guide:** see `E2E_FLOW_COVERAGE_REPORT_STANDARD.md` for the complete reporter source code, JSON output schema, report sections, and the new-project checklist.

#### 3.7.6 Step 1 — Define user flows (`flow-definitions.json`)

Create `e2e/flow-definitions.json` as the **single source of truth** for all user flows tracked by the report.

**Schema:**

```jsonc
{
  "version": "<semver>",          // Version of this definitions file
  "lastUpdated": "<YYYY-MM-DD>",  // Date of last modification
  "flows": {
    "<flow-id>": {
      "name": "<string>",           // Human-readable flow name
      "module": "<string>",         // Module grouping (e.g., "auth", "booking")
      "roles": ["<string>", ...],   // Applicable roles (e.g., ["guest", "user"])
      "priority": "<P1|P2|P3|P4>",  // P1 = critical, P4 = nice-to-have
      "description": "<string>"     // What the flow does
    }
  }
}
```

**Field reference:**

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | `string` | Yes | Semantic version. Bump on structural changes. |
| `lastUpdated` | `string` | Yes | ISO date (`YYYY-MM-DD`) of the last edit. |
| `flows.<id>.name` | `string` | Yes | Display name shown in the report. |
| `flows.<id>.module` | `string` | Yes | Logical module. Used for grouping and must match a directory in `e2e/`. |
| `flows.<id>.roles` | `string[]` | Yes | Which user roles exercise this flow. Use `"shared"` for all roles. |
| `flows.<id>.priority` | `string` | Yes | `P1` (critical) → `P4` (nice-to-have). Affects "Missing Flows by Priority" in the report. |
| `flows.<id>.description` | `string` | Yes | One-line explanation of what the flow covers. |

**Priority levels:**

| Level | Meaning | Example |
|---|---|---|
| P1 | Critical — core business flow, blocks release if missing | Login, checkout, booking |
| P2 | High — important feature, should be covered before release | Edit profile, manage subscriptions |
| P3 | Medium — secondary feature, cover after P1/P2 | Search, filters, secondary modals |
| P4 | Nice-to-have — informational pages, low-risk | Privacy policy, brand page |

**Flow ID naming conventions:**

- Use **kebab-case**: `auth-login`, `booking-complete-flow`.
- Prefix with the **module name**: `auth-`, `booking-`, `checkout-`, `public-`.
- Keep IDs **stable** — tests reference them via `@flow:` tags.
- For cross-role flows use a `cross-` infix: `org-cross-invite-flow`.

**Annotated example:**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-23",
  "flows": {
    "auth-login": {
      "name": "Login",
      "module": "auth",
      "roles": ["guest"],
      "priority": "P1",
      "description": "Authenticate with valid credentials and handle login errors."
    },
    "booking-complete-flow": {
      "name": "Complete Booking Flow",
      "module": "booking",
      "roles": ["user"],
      "priority": "P1",
      "description": "Complete booking creation end-to-end with confirmation."
    },
    "checkout-flow": {
      "name": "Checkout Flow",
      "module": "checkout",
      "roles": ["guest", "user"],
      "priority": "P1",
      "description": "Complete checkout page flow for subscriptions."
    }
  }
}
```

#### 3.7.7 Step 2 — Tag tests with `@flow:`

Every Playwright test must be tagged with one or more `@flow:<flow-id>` tags to link it to a flow definition.

**Syntax — at test level:**

```ts
import { test, expect } from '../fixtures';
import { FlowTags, RoleTags } from '../helpers/flow-tags';

test('user can sign in with email and password', {
  tag: [...FlowTags.AUTH_LOGIN, RoleTags.GUEST],
}, async ({ page }) => {
  // test body
});
```

**Syntax — at describe level (all tests inherit the tags):**

```ts
test.describe('Login flows', {
  tag: [...FlowTags.AUTH_LOGIN, RoleTags.GUEST],
}, () => {
  test('signs in with valid credentials', {
    tag: ['@flow:auth-login'],
  }, async ({ page }) => {
    // ...
  });

  test('shows error for invalid password', {
    tag: ['@flow:auth-login'],
  }, async ({ page }) => {
    // ...
  });
});
```

**Additional metadata tags:**

While only `@flow:` tags are consumed by the reporter, tests should also carry additional tags for CLI filtering:

| Tag | Purpose | Example |
|---|---|---|
| `@module:<name>` | Group by module for Playwright `--grep` | `@module:auth` |
| `@priority:<P1-P4>` | Filter by priority | `@priority:P1` |
| `@role:<name>` | Filter by user role | `@role:guest` |

```bash
# Run only auth module tests
npx playwright test --grep @module:auth

# Run only P1 (critical) tests
npx playwright test --grep @priority:P1

# Run only guest-role tests
npx playwright test --grep @role:guest
```

**What happens to untagged tests:**

Tests without any `@flow:` tag are collected in the `unmappedTests` array and displayed in a warning section of the report. They do **not** affect any flow's status.

> **Goal:** Every E2E test should have at least one `@flow:` tag. The "Tests Without Flow Tag" section should be empty in a mature project.

#### 3.7.8 Step 3 — Flow tag constants (`flow-tags.ts`)

To avoid repeating the same tag arrays across spec files, create a constants helper at `e2e/helpers/flow-tags.ts`.

**Purpose:**
- **Single source** for tag arrays — change a tag value in one place.
- **Consistent metadata** — each constant bundles `@flow:`, `@module:`, and `@priority:` together.
- **Spread syntax** — use `...` to compose tags in tests.

**Example implementation:**

```ts
// e2e/helpers/flow-tags.ts
export const FlowTags = {
  // ── Auth ──
  AUTH_LOGIN: ['@flow:auth-login', '@module:auth', '@priority:P1'],
  AUTH_LOGOUT: ['@flow:auth-logout', '@module:auth', '@priority:P2'],
  AUTH_REGISTER: ['@flow:auth-register', '@module:auth', '@priority:P1'],
  AUTH_SESSION_PERSISTENCE: ['@flow:auth-session-persistence', '@module:auth', '@priority:P2'],

  // ── Booking ──
  BOOKING_SESSION_PAGE: ['@flow:booking-session-page', '@module:booking', '@priority:P1'],
  BOOKING_COMPLETE_FLOW: ['@flow:booking-complete-flow', '@module:booking', '@priority:P1'],
  BOOKING_ERROR_PATHS: ['@flow:booking-error-paths', '@module:booking', '@priority:P2'],

  // ── Checkout ──
  CHECKOUT_FLOW: ['@flow:checkout-flow', '@module:checkout', '@priority:P1'],

  // ── Dashboard ──
  DASHBOARD_OVERVIEW: ['@flow:dashboard-overview', '@module:dashboard', '@priority:P1'],

  // ── Public ──
  PUBLIC_HOME: ['@flow:public-home', '@module:public', '@priority:P2'],
  PUBLIC_FAQ: ['@flow:public-faq', '@module:public', '@priority:P3'],

  // ... add one constant per flow defined in flow-definitions.json
};

export const RoleTags = {
  GUEST: '@role:guest',
  USER: '@role:user',
  ADMIN: '@role:admin',
};
```

**Usage in spec files:**

```ts
import { test, expect } from '../fixtures';
import { FlowTags, RoleTags } from '../helpers/flow-tags';

test('user can sign in with email and password', {
  tag: [...FlowTags.AUTH_LOGIN, RoleTags.GUEST],
}, async ({ page }) => {
  // test body
});
```

**Naming convention:**

| Pattern | Example |
|---|---|
| `SCREAMING_SNAKE_CASE` matching the flow ID | `auth-login` → `AUTH_LOGIN` |
| One constant per flow in `flow-definitions.json` | N flows → N constants |
| Grouped by module with section comments | `// ── Auth ──`, `// ── Booking ──` |

> This file is **optional** but recommended for projects with more than 10 flows. Tests can use inline tag arrays (`tag: ['@flow:auth-login']`) if you prefer not to maintain a constants file.

#### 3.7.9 Step 4 — Custom reporter and artifacts

The custom reporter lives at `e2e/reporters/flow-coverage-reporter.mjs` and is registered in `playwright.config.ts`.

**Registration:**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'coverage-e2e' }],
    ['json', { outputFile: 'coverage-e2e/report.json' }],
    ['./e2e/reporters/flow-coverage-reporter.mjs', { outputDir: 'coverage-e2e' }],
  ],
  // ... rest of your config (see §3.7.4.7 for full example)
});
```

**How it works:**

1. On construction, the reporter loads `flow-definitions.json` and initializes all flows with status `missing`.
2. As each test finishes (`onTestEnd`), it extracts `@flow:` tags and updates the corresponding flow stats (passed/failed/skipped counters, spec file set).
3. When the suite ends (`onEnd`), it computes the final status for each flow, prints a colored terminal report, and writes `flow-coverage.json`.

**Status state machine:**

| Status | Condition | Meaning |
|---|---|---|
| `missing` | `tests.total === 0` | No tests exist for this flow |
| `failing` | `tests.failed > 0` | At least one test failed or timed out |
| `covered` | `tests.passed > 0 && tests.skipped === 0` | All tests passed, none skipped |
| `partial` | _(default)_ | Some passed but at least one skipped |

**Terminal report sections:**

| Section | Condition |
|---|---|
| Summary | Always shown |
| Missing Flows by Priority | At least one flow is `missing` |
| Failing Flows | At least one flow is `failing` |
| Partial Coverage | At least one flow is `partial` |
| Coverage by Module | Always shown (progress bars per module) |
| Tests Without Flow Tag | At least one test has no `@flow:` tag |

**JSON artifact** (`coverage-e2e/flow-coverage.json`):

A machine-readable report written after every run. Contains summary counts, per-flow status with test stats, and unmapped tests. Add `coverage-e2e/` to `.gitignore`.

> **Full reporter source code, JSON schema, and report examples:** see `E2E_FLOW_COVERAGE_REPORT_STANDARD.md`.

#### 3.7.10 Coverage goals and maintenance

**Coverage goal:** 100% of defined flows have status `covered` — zero `missing`, zero `failing`.

**Adding a new flow:**

1. Add a new entry to `flow-definitions.json` with all required fields.
2. Bump the `version` field if the change is structural.
3. Update the `lastUpdated` date.
4. Add a corresponding constant to `flow-tags.ts` (if used).
5. Create or update spec files with the `@flow:<new-flow-id>` tag.
6. Run the E2E suite and verify the new flow appears as `covered` in the report.

**Removing a flow:**

1. Delete the entry from `flow-definitions.json`.
2. Remove the `@flow:<deleted-id>` tag from all spec files.
3. Remove the constant from `flow-tags.ts`.
4. Run the suite and verify no tests became unmapped.

**Renaming a flow ID:**

1. Update the key in `flow-definitions.json`.
2. Update **all** `@flow:` tags in spec files to match the new ID.
3. Update the constant in `flow-tags.ts`.
4. This must be done atomically — a mismatch causes the old ID to appear as `missing` and the new ID as auto-detected under `unknown`.

**Version bumping guidelines:**

| Change | Version bump |
|---|---|
| Add/remove a flow | Patch (`1.0.0` → `1.0.1`) |
| Rename flow IDs or restructure modules | Minor (`1.0.0` → `1.1.0`) |
| Change the schema of the definitions file | Major (`1.0.0` → `2.0.0`) |

**Keeping definitions in sync:**

| Signal in the report | Action |
|---|---|
| "Missing Flows by Priority" appears | Write tests for those flows or remove the definition if the feature was deleted |
| "Tests Without Flow Tag" appears | Add `@flow:` tags to the listed tests |
| A flow appears under module `unknown` | The `@flow:` tag references an ID not in definitions — add the definition |

#### 3.7.11 Execution and quality

> **Full rules, selectors, naming, anti-patterns and examples:** see `TESTING_QUALITY_STANDARDS.md`.
> **Quality gate CLI options:** see `TEST_QUALITY_GATE_REFERENCE.md`.

```bash
# E2E: specific spec
npx playwright test e2e/auth/login.spec.ts --reporter=line

# E2E: filter by module
npx playwright test --grep @module:auth

# E2E: filter by priority
npx playwright test --grep @priority:P1

# E2E: filter by role
npx playwright test --grep @role:guest

# Quality gate on specific E2E files
backend/venv/bin/python scripts/test_quality_gate.py --repo-root . \
  --suite frontend-e2e --semantic-rules strict --external-lint run \
  --include-file frontend/e2e/auth/login.spec.ts
```

Inline exceptions when strictly necessary:

```ts
// quality: disable RULE_ID (reason)
// quality: allow-serial (reason)
```

#### 3.7.12 Commands to Run Tests (Focused Execution)

```bash
# Unit/component: modified file
npm test -- app/__tests__/components/login-form.test.tsx

# Unit/component: related regression (bounded batch)
npx jest --runTestsByPath \
  app/__tests__/components/login-form.test.tsx \
  app/__tests__/services/auth-service.test.ts

# E2E: modified spec
npx playwright test e2e/auth/login.spec.ts --reporter=line

# E2E: related regression
npx playwright test e2e/auth/login.spec.ts e2e/app/dashboard.spec.ts --reporter=line

# Unit/component: full coverage report (custom summary)
npm run test:coverage

# Quality gate scoped (frontend unit)
backend/venv/bin/python scripts/test_quality_gate.py --repo-root . \
  --suite frontend-unit --semantic-rules strict --external-lint run \
  --include-file frontend/app/__tests__/components/login-form.test.tsx

# Quality gate scoped (frontend e2e)
backend/venv/bin/python scripts/test_quality_gate.py --repo-root . \
  --suite frontend-e2e --semantic-rules strict --external-lint run \
  --include-file frontend/e2e/auth/login.spec.ts
```

#### 3.7.13 Minimum Coverage by Layer

Reference thresholds. Values below these must be justified in the PR and increased in subsequent iterations.

| Layer | Minimum coverage | Tool |
|-------|-----------------|------|
| Backend — Models | 80% | pytest-cov |
| Backend — Serializers | 80% | pytest-cov |
| Backend — Views / API | 70% | pytest-cov |
| Backend — Services | 85% | pytest-cov |
| Backend — Utils | 90% | pytest-cov |
| Frontend — Stores | 75% | Jest coverage |
| Frontend — Components | 60% | Jest coverage |
| Frontend — E2E | 100% of defined flows `covered` | Playwright + Flow Coverage Report |

> E2E coverage is measured at the **flow level** via the Flow Coverage Report (§3.7.5–3.7.10). The goal is 100% of defined flows with status `covered` — zero `missing`, zero `failing`. Critical paths (P1) include: authentication, checkout/payment, booking, and any flow that produces irreversible effects.

---

## 4. Standard Dependencies

### 4.1 Backend (requirements.txt)

| Category | Package | Purpose |
|----------|---------|---------|
| Core | Django>=4.2 | Web framework |
| Core | djangorestframework | REST API |
| Auth | djangorestframework-simplejwt | JWT authentication |
| CORS | django-cors-headers | CORS handling |
| Cache | django-redis | Redis caching |
| Images | Pillow | Image processing |
| Images | easy-thumbnails | Automatic thumbnails |
| Cleanup | django-cleanup | File cleanup |
| Testing | Faker | Test data |
| Testing | pytest | Test runner |
| Testing | pytest-django | pytest + Django integration |
| Testing | pytest-cov | Test coverage |
| Testing | pytest-freezegun | Deterministic time control in tests |
| Testing | factory-boy | Declarative factories for models and payloads |
| HTTP | requests | External integrations |

### 4.2 Frontend (package.json)

| Category | Package | Purpose |
|----------|---------|---------|
| Core | react + react-dom | Declarative UI |
| Web Framework | next | Routing and hybrid rendering |
| State | zustand / @reduxjs/toolkit | Predictable global state |
| Routing | App Router / react-router-dom | Navigation and guards |
| HTTP | axios | HTTP client |
| i18n | next-intl / i18next | Internationalization |
| Styles | tailwindcss | CSS utilities |
| UI | Custom components + accessible libraries | Interface scalability |
| Icons | lucide-react / heroicons | Consistent iconography |
| Testing | jest | Unit tests |
| Testing | @testing-library/react | React component testing |
| Testing | @testing-library/jest-dom | DOM matchers |
| Testing | @playwright/test | E2E tests |

---

## 5. Execution Commands

### 5.1 Backend (Django)

```bash
# 1. Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Environment variables (create .env)
# DJANGO_SECRET_KEY=...
# DATABASE_URL=...
# EMAIL_HOST_PASSWORD=...

# 4. Migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Create test data
python manage.py create_fake_data --users 20 --products 50 --orders 30

# 7. Delete test data
python manage.py delete_fake_data --confirm

# 8. Run tests (scope-first)
pytest core_app/tests/views/test_auth.py -v
pytest core_app/tests/views/test_auth.py core_app/tests/serializers/test_auth_serializers.py -v

# 8b. Run tests with coverage report
pytest --cov

# 9. Scoped quality gate
python ../scripts/test_quality_gate.py --repo-root .. --suite backend \
  --semantic-rules strict --external-lint run \
  --include-file backend/core_app/tests/views/test_auth.py

# 10. Development server
python manage.py runserver  # http://localhost:8000

# 11. Production server (with gunicorn)
gunicorn core_project.wsgi:application --bind 0.0.0.0:8000
```

### 5.2 Frontend (React + Next.js)

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Development server
npm run dev  # http://localhost:3000

# 3. Production build
npm run build

# 4. Local production server
npm run start

# 5. Linting
npm run lint

# 6. Focused unit/component test
npm test -- app/__tests__/components/login-form.test.tsx

# 6b. Unit test coverage report
npm run test:coverage

# 7. Focused E2E test
npx playwright test e2e/auth/login.spec.ts --reporter=line
```

### 5.3 Development Access URLs

| Resource | URL | Description |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| API | http://localhost:8000/api/ | REST endpoints |
| Admin | http://localhost:8000/admin/ | Django Admin panel |
| API Docs | http://localhost:8000/api/docs/ | Documentation (if enabled) |

---

## 6. New Project Checklist

Use this list when starting a new project to ensure all standards defined in this document are followed.

### 6.1 Initial Setup

- [ ] Create repository with `backend/` and `frontend/` structure
- [ ] Configure `.gitignore` (venv, node_modules, .env, db.sqlite3, media/, coverage-e2e/)
- [ ] Edit `README.md` with: environment setup, migrations, fake data, tests, servers
- [ ] Create `.env.example` file with required variables
- [ ] Create `TESTING_QUALITY_STANDARDS.md` (or copy from reference project)
- [ ] Create `TEST_QUALITY_GATE_REFERENCE.md` (or copy from reference project)
- [ ] Verify that `GLOBAL_RULES_GUIDELINES.md` exists at the root with standard content
- [ ] Define custom `AUTH_USER_MODEL` from the start
- [ ] Configure CORS for local frontend (localhost:3000)
- [ ] Configure JWT with appropriate expiration times

### 6.2 Backend

- [ ] Create folder structure: `models/`, `serializers/`, `views/`, `urls/`
- [ ] Implement User model with required fields
- [ ] Create separate serializers: List, Detail, CreateUpdate
- [ ] Implement views with `@api_view` and explicit permissions
- [ ] Organize URLs by functional module
- [ ] Configure Django Admin with detailed ModelAdmins
- [ ] Create `create_fake_data` and `delete_fake_data` commands
- [ ] Verify and integrate `django_attachments` if image galleries are required
- [ ] Implement services for complex business logic
- [ ] Define backend test hierarchy by domain (`models/`, `serializers/`, `views/`, etc.)
- [ ] Ensure minimum coverage per change: happy path + edge cases + error conditions
- [ ] Configure test execution in scoped-first + related regression mode
- [ ] Set up custom coverage reporter in `conftest.py` (see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`)

### 6.3 Frontend

- [ ] Configure React application (preferably Next.js) with TypeScript
- [ ] Implement HTTP service with JWT and refresh handling
- [ ] Create stores per domain (Zustand or Redux Toolkit)
- [ ] Configure routing with auth guards (middleware/layout guards)
- [ ] Implement internationalization (next-intl or i18next)
- [ ] Configure TailwindCSS
- [ ] Create reusable base components
- [ ] Implement global error handling
- [ ] Align tests with `TESTING_QUALITY_STANDARDS.md`
- [ ] Integrate quality gate per `TEST_QUALITY_GATE_REFERENCE.md`
- [ ] Define unit/component test structure (`frontend/app/__tests__/`) and E2E (`frontend/e2e/`)
- [ ] Ensure stable selector strategy for tests (roles/testid/data-*)
- [ ] Configure frontend test execution in scoped-first + related regression mode
- [ ] **E2E infrastructure setup (§3.7.4):**
  - [ ] Create `e2e/fixtures.ts` — custom test base with auth/mock helpers
  - [ ] Create API mocking helpers (`mockLoginApi`, `setupDefaultApiMocks`, etc.)
  - [ ] Create auth state helpers (`mockLoginAsTestUser`) for authenticated routes
  - [ ] Create captcha bypass helper (if app uses captcha)
  - [ ] Configure `playwright.config.ts` with `webServer`, timeouts, retries, and reporters
- [ ] **Coverage reporting setup (§3.7.1):**
  - [ ] Create `scripts/coverage-summary.cjs` custom coverage reporter (see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`)
  - [ ] Add `test:coverage` script to `package.json`
  - [ ] Configure `coverageReporters: ['text', 'json-summary']` in `jest.config.cjs`
- [ ] **E2E Flow Coverage setup (§3.7.5–3.7.10):**
  - [ ] Create `e2e/flow-definitions.json` with initial user flows (at least P1 flows)
  - [ ] Create `e2e/reporters/flow-coverage-reporter.mjs` (copy from reference project or `E2E_FLOW_COVERAGE_REPORT_STANDARD.md`)
  - [ ] Register the custom reporter in `playwright.config.ts`
  - [ ] Create `e2e/helpers/flow-tags.ts` with tag constants per flow
  - [ ] Organize `e2e/` directories by functional module (one directory per module)
  - [ ] Tag all E2E tests with `@flow:<flow-id>` tags
  - [ ] Add `coverage-e2e/` to `.gitignore`
  - [ ] Run suite and verify Flow Coverage Report appears in terminal output

### 6.4 Pre-commit and CI/CD

- [ ] Verify that `.pre-commit-config.yaml` exists at the repository root
- [ ] Install hooks: `pre-commit install` (backend venv active)
- [ ] Verify that `.github/workflows/test-quality-gate.yml` is configured
- [ ] Confirm that the quality gate runs on PR/push via GitHub Actions

> See `TEST_QUALITY_GATE_REFERENCE.md` for detailed gate configuration in CI.

### 6.5 Before Production

- [ ] Migrate to MySQL database
- [ ] Configure Redis for caching and sessions
- [ ] Move ALL credentials to environment variables
- [ ] Configure HTTPS and update CORS/CSRF
- [ ] Configure collectstatic for static files
- [ ] Configure media file server (S3, etc.)
- [ ] Implement appropriate logging
- [ ] Run `delete_fake_data --confirm`
- [ ] Review permissions on sensitive endpoints
- [ ] Production build of frontend
- [ ] Run backend/frontend quality gate and review active exceptions
- [ ] Run E2E suite and verify Flow Coverage Report shows zero `missing` / zero `failing` for P1 flows
- [ ] Run related regression for critical modules before releasing

> **This document must be updated when new technologies, patterns or best practices are adopted by the team.**

---

## Annex A: Change Implementation Guide

This annex describes the standard steps to follow every time a change is made to the project (backend or frontend). The goal is to preserve existing behavior, avoid regressions, and keep the system well-documented and testable.

### A.1 Mandatory Checklist

#### 1. Validate the business logic around the change

- Confirm that the new behavior is consistent with existing business rules.
- Verify implicit contracts (API responses, error formats, background jobs, emails, etc.).
- If a test requires changing existing behavior, explicitly decide whether the behavior or the test is the source of truth.

#### 2. Keep code documented with docstrings in English

- Public functions, classes and complex methods must have clear docstrings in English.
- Docstrings must explain: purpose and intent, parameters and return values, important side effects.
- When modifying existing behavior, update the docstring so it remains accurate.

#### 3. Add or update automated tests

- For any new behavior, add tests covering: happy path, relevant edge cases, and error conditions.
- When changing existing behavior, update tests to describe the NEW intended behavior.
- Avoid weakening assertions unless it is a deliberate design decision.
- Run only modified tests and related regression before merging.
- Complement with quality gate scoped to impacted files.

#### 4. Verify and maintain test data

- Review existing fixtures and fake data used by the affected areas.
- Update or extend backend fixtures, management commands, or fake data generators when new fields are introduced or business rules change.
- Ensure test data is realistic enough to facilitate debugging.

#### 5. Verify and update the User Manual

- If any user-facing behavior changes (API, UI, emails, reports, roles/permissions), review the user manual.
- Update or add entries in the manual so it reflects the current behavior.
- When in doubt, document: new features, changes to existing flows, error messages users might see.

### A.2 Optional / Recommended Considerations

These items are not always required, but should be considered for any non-trivial change.

#### Database migrations and data integrity

- Verify if model changes require Django migrations.
- Consider data migration scripts if existing records need to be adapted.
- Verify that constraints and defaults remain correct for production data.

#### Backwards compatibility

- For public APIs, avoid breaking changes in request/response shape unless explicitly planned.
- Where possible, deprecate behavior gradually (e.g.: support both old and new fields for a period).

#### Performance and scalability

- Evaluate if the change introduces heavier queries, N+1 problems, or costly computations.
- For critical paths, consider adding tests or instrumentation to detect regressions.

#### Security and permissions

- Re-verify permission checks, access control, and visibility rules affected by the change.
- Ensure error messages do not leak sensitive information.
- Review user input handling, file uploads, and external integrations.

#### Logging and observability

- Add or adjust logging for important flows (success and failure paths) when useful for debugging.
- Avoid logging sensitive data (passwords, tokens, personal identification details).

#### Configuration and environment

- If new settings or environment variables are added, document them and provide safe defaults.
- Ensure local, staging, and production environments can be configured consistently.

#### Code style and consistency

- Follow the existing project style (formatting, naming, folder structure).
- Prefer small, focused changes over large, mixed refactors.

#### Review and communication

- When submitting changes, include a concise description of: what was changed, why, and how it was tested.
- Highlight any breaking changes, data migrations, or manual steps required after deployment.
- For **FEAT:** use a brief phrase capturing the intended behavior or feature in English.
- For **FIX:** use a brief phrase explicitly mentioning the fix applied in English.

### A.3 Visual Process Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    BEFORE IMPLEMENTING                          │
├─────────────────────────────────────────────────────────────────┤
│  □ Understand the requirement and its impact                    │
│  □ Identify affected areas (models, views, frontend, etc.)      │
│  □ Review existing tests in those areas                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DURING IMPLEMENTATION                        │
├─────────────────────────────────────────────────────────────────┤
│  □ Write/update docstrings in English                           │
│  □ Follow established project patterns                          │
│  □ Create migrations if there are model changes                 │
│  □ Update fake data if there are new fields/relationships       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AFTER IMPLEMENTING                           │
├─────────────────────────────────────────────────────────────────┤
│  □ Write/update tests (happy path + edge cases)                 │
│  □ Run modified tests + related regression                      │
│  □ Update user manual if applicable                             │
│  □ Review security and permissions                              │
│  □ Prepare descriptive commit message                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BEFORE MERGE/DEPLOY                          │
├─────────────────────────────────────────────────────────────────┤
│  □ Code review completed                                        │
│  □ All tests in scope pass                                      │
│  □ Documentation updated                                        │
│  □ Breaking changes communicated to the team                    │
└─────────────────────────────────────────────────────────────────┘
```

> **Note:** This annex complements the technical architecture with process practices. Following these guidelines helps maintain code quality and reduces the risk of introducing bugs in production.

---

## Annex B: Test Quality Reference

This annex delegates to the canonical sources. Do not duplicate their content here.

- **`TESTING_QUALITY_STANDARDS.md`** — Complete rules (naming, atomicity, assertions, determinism, isolation, selectors), anti-patterns table, correct/incorrect examples per criterion, and exception syntax (`quality: disable`).
- **`TEST_QUALITY_GATE_REFERENCE.md`** — Gate architecture, checks per suite (backend / frontend-unit / E2E), severities, full CLI, execution modes and deduplication model.
- **`BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`** — Backend + Frontend unit custom coverage reporters: `conftest.py` hooks, `coverage-summary.cjs`, shared color thresholds, expected output examples, and setup checklist.
- **`E2E_FLOW_COVERAGE_REPORT_STANDARD.md`** — Flow Coverage Report: reporter source code, flow definitions schema, tagging conventions, JSON output schema, report sections, and new-project setup checklist.

> Always run the gate scoped: `backend/venv/bin/python scripts/test_quality_gate.py --repo-root . --semantic-rules strict --external-lint run --strict --include-file <modified_file>`

### B.1 Anti-patterns to Avoid

| Anti-pattern | Symptom | Solution |
|---|---|---|
| **God Test** | A test verifies 10+ behaviors | Split into atomic tests, one per behavior |
| **Mystery Guest** | Test fails without a clear message; hidden dependency on a global fixture | Make fixtures explicit and minimal |
| **Eager Mocking** | Mock of internal classes/services; test passes even when core logic is broken | Mock only boundaries (HTTP, email, storage) |
| **Silent Mock** | `mock.return_value = True` without verifying it was called with the right args | Use `assert_called_once_with(...)` or verify observable effect |
| **Time Bomb** | `datetime.now()` hardcoded; fails in 2026 | Use `freeze_time` or inject the date |
| **Selector Roulette** | Selector by generated CSS class; breaks after visual refactor | Use `data-testid` or ARIA roles |
| **Sleep Walking** | `waitForTimeout(3000)` in E2E | Use `toBeVisible`, `toHaveURL`, `waitForResponse` |
| **Assertion Roulette** | Multiple asserts without message; hard to know which one failed | One assert per behavior or descriptive messages |
| **Conditional Test** | `if condition: assert X else: assert Y` inside the test | Split into two parameterized tests |
| **Loop Assert** | `for item in items: assert item.active` | Use `all()` with a single assertion or parametrize |

### B.2 Quality Gate Checks by Suite

#### Backend (pytest)

| Check | Signal | Level |
|-------|--------|-------|
| Test with no `assert` | `NO_ASSERTIONS` | Error |
| Empty test or only `pass` | `EMPTY_TEST` | Error |
| Name with conjunction (`_and_`) | `NO_CONJUNCTION` | Warning |
| Forbidden token in name | `NO_FORBIDDEN_TOKEN` | Warning |
| Inline payload with >5 fields | `INLINE_PAYLOAD` | Warning |
| Missing docstring on public function | `MISSING_DOCSTRING` | Warning (Ruff D) |
| Disordered import | `IMPORT_ORDER` | Warning (Ruff I) |
| `assertRaises` instead of `pytest.raises` | `PT027` | Warning (Ruff PT) |

#### Frontend Unit (Jest)

| Check | Signal | Level |
|-------|--------|-------|
| Test with no `expect(...)` | `NO_ASSERTIONS` | Error |
| Empty test | `EMPTY_TEST` | Error |
| Name with conjunction | `NO_CONJUNCTION` | Warning |
| Forbidden token in name | `NO_FORBIDDEN_TOKEN` | Warning |
| >8 `expect` in a single test | `TOO_MANY_ASSERTIONS` | Warning |
| Test >50 lines | `TEST_TOO_LONG` | Warning |

#### Frontend E2E (Playwright)

| Check | Signal | Level |
|-------|--------|-------|
| Test with no `expect(...)` | `NO_ASSERTIONS` | Error |
| `waitForTimeout(...)` present | `HARDCODED_TIMEOUT` | Warning |
| Selector by CSS class (`'.class'`) | `FRAGILE_SELECTOR` | Warning |
| `test.describe.serial` without justification | `SERIAL_WITHOUT_REASON` | Warning |
| Name with conjunction | `NO_CONJUNCTION` | Warning |

### B.3 Quick Reference Checklist

Use before committing new or modified tests:

```
Tests — Quick Reference Checklist
───────────────────────────────────────────────────────────────
Naming
  □ Test name describes action + result + condition
  □ No conjunctions (_and_, _or_) in the name
  □ No forbidden tokens (batch, all, misc, general, various)
  □ File in the correct directory for its domain

Assertions
  □ At least one assert/expect that verifies observable behavior
  □ No asserts inside loops or conditionals
  □ Happy path + edge case + error condition covered

Isolation
  □ Does not depend on execution order with other tests
  □ Global state cleaned in afterEach / teardown
  □ Time controlled with freeze_time / fake timers (if applicable)
  □ Environment variables via monkeypatch / @override_settings

Mocking
  □ Only boundaries are mocked: external HTTP, email, storage, queues
  □ No internal domain classes or methods are mocked
  □ No access to wrapper.vm.* (frontend) unless DOM alternative is absent

Selectors (frontend)
  □ Preference: getByRole > getByTestId > data-testid > visible text
  □ No selectors by generated CSS class or nth position
  □ No waitForTimeout in E2E

Flow Coverage (E2E)
  □ Every test has at least one @flow:<flow-id> tag
  □ Flow ID exists in flow-definitions.json
  □ New user flows added to flow-definitions.json before writing tests
  □ flow-tags.ts constants updated if constants file is used
  □ Spec file lives in the correct module directory under e2e/
  □ "Tests Without Flow Tag" section is empty after run

Quality Gate
  □ Run in scoped mode for the modified files
  □ Score 100/100 or exceptions documented with justification
  □ Exceptions reviewed and not accumulated without reason
───────────────────────────────────────────────────────────────
```

---

## 9. Production Requirements

All Django projects in production MUST include the following configurations.

### 9.1 Settings Structure

Settings must be split into separate files, selected via `DJANGO_SETTINGS_MODULE`:

```
backend/[project_name]/
├── settings.py          # Base/shared settings (used by default)
├── settings_dev.py      # Development overrides (DEBUG=True)
└── settings_prod.py     # Production overrides (DEBUG=False enforced)
```

**`settings_dev.py`** imports from `settings.py` and overrides:
```python
from .settings import *  # noqa: F401,F403
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

**`settings_prod.py`** imports from `settings.py` and enforces:
- `DEBUG = False` (hardcoded, never from environment)
- `SECRET_KEY` must be set (raise error if missing)
- `ALLOWED_HOSTS` must be set (raise error if missing)
- Security headers: HSTS, secure cookies, SSL redirect, X-Frame-Options

In production: `DJANGO_SETTINGS_MODULE=[project_name].settings_prod`

### 9.2 Environment Variables

All secrets must be loaded from environment variables via `os.getenv()` + `python-dotenv`:
- `DJANGO_SECRET_KEY`
- `DB_USER`, `DB_PASSWORD`
- `DJANGO_EMAIL_HOST_USER`, `DJANGO_EMAIL_HOST_PASSWORD`
- API keys (project-specific)

A `.env.example` file must be provided with placeholders (no real secrets).

### 9.3 Automated Backups (django-dbbackup)

**Configuration in `settings.py`:**
```python
INSTALLED_APPS = [
    # ...
    'dbbackup',
]

DBBACKUP_STORAGE = 'django.core.files.storage.FileSystemStorage'
DBBACKUP_STORAGE_OPTIONS = {
    'location': os.getenv('BACKUP_STORAGE_PATH', '/var/backups/[project_name]'),
}
DBBACKUP_COMPRESS = True
DBBACKUP_CLEANUP_KEEP = 5  # ~90 days at 20-day intervals
```

**Automation:** Huey periodic task (days 1 & 21, 3:00 AM).

**Storage:** `/var/backups/[project_name]/` (outside project directory).

**Retention:** 90 days (~5 backups).

### 9.4 Query Monitoring (django-silk)

Silk is enabled conditionally via `ENABLE_SILK` environment variable to avoid overhead in production and test environments.

**Configuration in `settings.py`:**
```python
ENABLE_SILK = os.getenv('ENABLE_SILK', 'false').lower() in {'1', 'true', 'yes', 'on'}

if ENABLE_SILK:
    INSTALLED_APPS.append('silk')

# Middleware added conditionally
MIDDLEWARE = []
if ENABLE_SILK:
    MIDDLEWARE.append('silk.middleware.SilkyMiddleware')
MIDDLEWARE += [...]

# Access control
SILKY_AUTHENTICATION = True
SILKY_AUTHORISATION = True

def silk_permissions(user):
    return user.is_staff

SILKY_PERMISSIONS = silk_permissions
SILKY_MAX_RECORDED_REQUESTS = 10000
```

**URL:** Conditionally add `path('silk/', include('silk.urls', namespace='silk'))` to `urls.py`.

**Garbage Collection:** Daily cleanup of data older than 7 days via management command + Huey task.

**Alerts:** Weekly report generated via Huey task (slow queries + N+1 detection).

### 9.5 Task Queue (Huey)

**Configuration in `settings.py`:**
```python
from huey import RedisHuey

INSTALLED_APPS = [
    # ...
    'huey.contrib.djhuey',
]

HUEY = RedisHuey(
    name='[project_name]',
    url=os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
    immediate=not IS_PRODUCTION,  # Synchronous in development
)
```

**Scheduled Tasks:**

| Task | Schedule | Description |
|------|----------|-------------|
| `scheduled_backup` | Days 1 & 21, 3:00 AM | DB and media backup |
| `silk_garbage_collection` | Daily, 4:00 AM | Clean old profiling data |
| `weekly_slow_queries_report` | Mondays, 8:00 AM | Performance report |

**Task file location:**
- `[project_name]/tasks.py` — Operational/infrastructure tasks (backups, monitoring)
- `[app_name]/tasks.py` — Business logic tasks (if needed)

**Service:** Huey must run as a systemd service in production. Templates are provided in `scripts/systemd/`.