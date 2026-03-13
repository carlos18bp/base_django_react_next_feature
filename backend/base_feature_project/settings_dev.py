"""
Development settings for base_feature_project.

Usage: DJANGO_SETTINGS_MODULE=base_feature_project.settings_dev

Note: The default DJANGO_SETTINGS_MODULE in manage.py points to
base_feature_project.settings (base). Use this file explicitly
when you want development-specific overrides (DEBUG=True, console email).
"""

from .settings import *  # noqa: F401,F403

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
