"""
Production settings for base_feature_project.

Usage: DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod

This file is imported AFTER settings.py (base). All shared configuration
lives in settings.py; this file only contains production overrides and
validations.
"""

import os

from .settings import *  # noqa: F401,F403

# ---------------------------------------------------------------------------
# Core safety: DEBUG is always False in production
# ---------------------------------------------------------------------------
DEBUG = False

# ---------------------------------------------------------------------------
# Required environment variables — fail fast if missing
# ---------------------------------------------------------------------------
if not os.getenv('DJANGO_SECRET_KEY'):
    raise ValueError("DJANGO_SECRET_KEY is required in production")

if not os.getenv('DJANGO_ALLOWED_HOSTS'):
    raise ValueError("DJANGO_ALLOWED_HOSTS is required in production")

# ---------------------------------------------------------------------------
# Security hardening
# ---------------------------------------------------------------------------
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# ---------------------------------------------------------------------------
# Production email — require SMTP backend
# ---------------------------------------------------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# ---------------------------------------------------------------------------
# Production logging — add file handler
# ---------------------------------------------------------------------------
LOGGING['handlers']['file'] = {  # noqa: F405
    'level': 'WARNING',
    'class': 'logging.FileHandler',
    'filename': _logs_dir / 'django.log',  # noqa: F405
    'formatter': 'verbose',
}
LOGGING['loggers']['django']['handlers'].append('file')  # noqa: F405
