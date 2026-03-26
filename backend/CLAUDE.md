# Backend Rules — Django / Python / DRF

## Django/Python General Principles

You are an expert in Python, Django, and scalable web application development.

### Key Principles
- Write clear, technical responses with precise Django examples.
- Use Django's built-in features and tools wherever possible to leverage its full capabilities.
- Prioritize readability and maintainability; follow Django's coding style guide (PEP 8 compliance).
- Use descriptive variable and function names; adhere to naming conventions (e.g., lowercase with underscores for functions and variables).
- Structure your project in a modular way using Django apps to promote reusability and separation of concerns.

### Django/Python
- Use Django's class-based views (CBVs) for more complex views; prefer function-based views (FBVs) for simpler logic.
- Leverage Django's ORM for database interactions; avoid raw SQL queries unless necessary for performance.
- Use Django's built-in user model and authentication framework for user management.
- Utilize Django's form and model form classes for form handling and validation.
- Follow the MVT (Model-View-Template) pattern strictly for clear separation of concerns.
- Use middleware judiciously to handle cross-cutting concerns like authentication, logging, and caching.

### Error Handling and Validation
- Implement error handling at the view level and use Django's built-in error handling mechanisms.
- Use Django's validation framework to validate form and model data.
- Prefer try-except blocks for handling exceptions in business logic and views.
- Customize error pages (e.g., 404, 500) to improve user experience and provide helpful information.
- Use Django signals to decouple error handling and logging from core business logic.

### Django-Specific Guidelines
- Use Django templates for rendering HTML and DRF serializers for JSON responses.
- Keep business logic in models and forms; keep views light and focused on request handling.
- Use Django's URL dispatcher (urls.py) to define clear and RESTful URL patterns.
- Apply Django's security best practices (e.g., CSRF protection, SQL injection protection, XSS prevention).
- Use Django's built-in tools for testing (unittest and pytest-django) to ensure code quality and reliability.
- Leverage Django's caching framework to optimize performance for frequently accessed data.
- Use Django's middleware for common tasks such as authentication, logging, and security.

### Performance Optimization
- Optimize query performance using Django ORM's select_related and prefetch_related for related object fetching.
- Use Django's cache framework with backend support (e.g., Redis or Memcached) to reduce database load.
- Implement database indexing and query optimization techniques for better performance.
- Use asynchronous views and background tasks (via Celery/Huey) for I/O-bound or long-running operations.
- Optimize static file handling with Django's static file management system (e.g., WhiteNoise or CDN integration).

---

## Django REST Framework (DRF) Development

You are an expert in Python, Django, and scalable RESTful API development.

### Core Principles
- Django-First Approach: Use Django's built-in features and tools wherever possible
- Code Quality: Prioritize readability and maintainability; follow PEP 8 compliance
- Naming Conventions: Use descriptive variable and function names (lowercase with underscores)
- Modular Architecture: Structure your project using Django apps for reusability and separation of concerns
- Performance Awareness: Always consider scalability and performance implications

### Project Structure

#### Application Structure
```
app_name/
├── migrations/        # Database migration files
├── admin.py           # Django admin configuration
├── apps.py            # App configuration
├── models.py          # Database models
├── managers.py        # Custom model managers
├── signals.py         # Django signals
├── tasks.py           # Huey tasks
└── __init__.py
```

#### API Structure
```
api/
└── v1/
    ├── app_name/
    │   ├── urls.py            # URL routing
    │   ├── serializers.py     # Data serialization
    │   ├── views.py           # API views
    │   ├── permissions.py     # Custom permissions
    │   ├── filters.py         # Custom filters
    │   └── validators.py      # Custom validators
    └── urls.py
```

### Views and API Design
- Use Class-Based Views: Leverage Django's CBVs with DRF's APIViews (unless project convention is FBV)
- RESTful Design: Follow RESTful principles strictly with proper HTTP methods and status codes
- Keep Views Light: Focus views on request handling; keep business logic in models, managers, and services
- Consistent Response Format: Use unified response structure for both success and error cases

### Models and Database
- ORM First: Leverage Django's ORM; avoid raw SQL unless necessary for performance
- Business Logic in Models: Keep business logic in models and custom managers
- Query Optimization: Use select_related and prefetch_related for related object fetching
- Database Indexing: Implement proper indexing for frequently queried fields
- Transactions: Use transaction.atomic() for data consistency in critical operations

### Serializers and Validation
- Use DRF serializers for data validation and serialization
- Implement custom validators for complex business rules
- Use serializer field validation for input sanitization
- Properly handle nested relationships with appropriate serializers

### Authentication and Permissions
- JWT Authentication: Use djangorestframework_simplejwt for token-based auth
- Custom Permissions: Implement granular permission classes for different user roles
- Security: Implement proper CSRF protection, CORS configuration, and input sanitization

### Performance and Scalability
- N+1 Problem Prevention: Always use select_related and prefetch_related appropriately
- Pagination: Standardize pagination across all list endpoints
- Caching: Use Django's cache framework with Redis for frequently accessed data
- Response Optimization: Allow field selection to reduce payload size

### Error Handling
```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field_name": ["Specific error details"]
    },
    "error_code": "SPECIFIC_ERROR_CODE"
}
```

- Custom Exception Handler for consistent error responses
- Django Signals for decoupled error handling
- Proper HTTP Status Codes (400, 401, 403, 404, 422, 500)
- Structured Logging for API monitoring and debugging

---

## Django i18n

### Setup
```python
from django.utils.translation import gettext_lazy as _

LANGUAGE_CODE = 'es'
USE_I18N = True
USE_L10N = True

LANGUAGES = [
    ('es', _('Español')),
    ('en', _('English')),
]

LOCALE_PATHS = [BASE_DIR / 'locale']

MIDDLEWARE = [
    ...
    'django.middleware.locale.LocaleMiddleware',  # after SessionMiddleware, before CommonMiddleware
    ...
]
```

### Usage
```python
from django.utils.translation import gettext as _
from django.utils.translation import gettext_lazy as _

# In views (runtime translation)
message = _('Your order has been confirmed')

# In models (lazy translation — evaluated at render time)
class Product(models.Model):
    name = models.CharField(_('product name'), max_length=200)
    class Meta:
        verbose_name = _('product')

# With variables
message = _('Hello %(name)s, you have %(count)d items') % {'name': user.name, 'count': cart.item_count}

# ❌ Don't translate then concatenate
message = _('Hello') + ' ' + user.name  # breaks translation context
```

### Commands
```bash
python manage.py makemessages -l en -l es
python manage.py compilemessages
```

---

## Backend Testing Standards

### Execution Rules
1. **Activate virtual environment** before any command: `source venv/bin/activate`
2. **Run only modified test files**: `pytest path/to/test_file.py -v`
3. **Maximum per execution**: 20 tests per batch, 3 commands per cycle

### Coverage Prioritization (triage order)
1. Lowest % coverage (0% first) — maximum impact per test
2. Highest "Miss" / "Uncovered Lines" count
3. Core layers: Views → Serializers → Models → Utils → Tasks
4. Files with partial coverage — complete before polishing

### Per-Test Checklist
- Test name describes ONE specific behavior
- No conditionals or loops in test body
- Assertions verify observable outcomes (not implementation)
- Test is deterministic (no datetime.now, random without seed)
- Test is isolated (no dependency on other tests)
- Mocks have explicit return_value/side_effect
- Follows AAA pattern (Arrange/Act/Assert)

### Coverage Report
- Custom reporter in `conftest.py` with Unicode progress bars
- Run: `source venv/bin/activate && pytest --cov`
- Full reference: `docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`
