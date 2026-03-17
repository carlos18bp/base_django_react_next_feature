"""Tests for settings.py conditional branches: ENABLE_SILK and non-sqlite DB engine."""

import importlib
import os
from unittest.mock import patch


def test_settings_silk_enabled_adds_silk_to_installed_apps():
    """When ENABLE_SILK is truthy, 'silk' appears in INSTALLED_APPS."""
    with patch.dict(os.environ, {'ENABLE_SILK': '1'}):
        import base_feature_project.settings as settings_mod
        importlib.reload(settings_mod)

    assert 'silk' in settings_mod.INSTALLED_APPS


def test_settings_silk_enabled_prepends_silk_middleware():
    """When ENABLE_SILK is truthy, SilkyMiddleware is the first middleware."""
    with patch.dict(os.environ, {'ENABLE_SILK': '1'}):
        import base_feature_project.settings as settings_mod
        importlib.reload(settings_mod)

    assert settings_mod.MIDDLEWARE[0] == 'silk.middleware.SilkyMiddleware'


def test_settings_silk_enabled_sets_silky_analyze_queries():
    """When ENABLE_SILK is truthy, SILKY_ANALYZE_QUERIES and SILKY_INTERCEPT_FUNC are configured."""
    with patch.dict(os.environ, {'ENABLE_SILK': '1'}):
        import base_feature_project.settings as settings_mod
        importlib.reload(settings_mod)

    assert settings_mod.SILKY_ANALYZE_QUERIES is True
    assert callable(settings_mod.SILKY_INTERCEPT_FUNC)


def test_settings_silk_intercept_func_allows_api_paths():
    """_silk_intercept returns True for /api/ paths and False for other paths."""
    with patch.dict(os.environ, {'ENABLE_SILK': '1'}):
        import base_feature_project.settings as settings_mod
        importlib.reload(settings_mod)

    from types import SimpleNamespace

    assert settings_mod.SILKY_INTERCEPT_FUNC(SimpleNamespace(path='/api/contact/')) is True
    assert settings_mod.SILKY_INTERCEPT_FUNC(SimpleNamespace(path='/admin/')) is False


def test_settings_non_sqlite_engine_adds_db_credentials():
    """When DJANGO_DB_ENGINE is not sqlite3, USER/PASSWORD/HOST/PORT are added to DATABASES."""
    env = {
        'DJANGO_DB_ENGINE': 'django.db.backends.mysql',
        'DJANGO_DB_NAME': 'testdb',
        'DB_USER': 'testuser',
        'DB_PASSWORD': 'testpass',
        'DB_HOST': '127.0.0.1',
        'DB_PORT': '3307',
    }
    with patch.dict(os.environ, env):
        import base_feature_project.settings as settings_mod
        importlib.reload(settings_mod)

    db_conf = settings_mod.DATABASES['default']
    assert db_conf['ENGINE'] == 'django.db.backends.mysql'
    assert db_conf['USER'] == 'testuser'
    assert db_conf['PASSWORD'] == 'testpass'
    assert db_conf['HOST'] == '127.0.0.1'
    assert db_conf['PORT'] == '3307'
