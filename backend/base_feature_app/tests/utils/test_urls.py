import importlib
import importlib.util
from pathlib import Path

import pytest
from django.test import RequestFactory, override_settings


@pytest.mark.django_db
def test_url_modules_import_and_have_patterns():
    """Verifies each URL sub-module imports successfully and registers the expected named patterns."""
    package_urls = importlib.import_module('base_feature_app.urls')
    assert hasattr(package_urls, 'urlpatterns')

    captcha_urls = importlib.import_module('base_feature_app.urls.captcha')
    contact_urls = importlib.import_module('base_feature_app.urls.contact')

    assert any(pattern.name == 'captcha-site-key' for pattern in captcha_urls.urlpatterns)
    assert any(pattern.name == 'contact-submit' for pattern in contact_urls.urlpatterns)


@pytest.mark.django_db
def test_module_urls_py_is_executable():
    urls_path = Path(__file__).resolve().parents[2] / 'urls.py'
    spec = importlib.util.spec_from_file_location('base_feature_app.urls_module', urls_path)
    module = importlib.util.module_from_spec(spec)
    assert spec is not None
    assert spec.loader is not None
    spec.loader.exec_module(module)

    assert hasattr(module, 'urlpatterns')
    names = [pattern.url_patterns for pattern in module.urlpatterns]
    assert len(names) >= 1


def test_health_check_returns_json_ok():
    """GET /api/health/ returns JSON with status 'ok'."""
    from base_feature_project.urls import health_check

    request = RequestFactory().get('/api/health/')
    response = health_check(request)

    assert response.status_code == 200
    assert response['Content-Type'] == 'application/json'
    import json
    assert json.loads(response.content) == {'status': 'ok'}


@override_settings(DEBUG=True, MEDIA_URL='/media/', MEDIA_ROOT='/tmp/test-media/')
def test_debug_mode_adds_media_url_pattern():
    """URL patterns include media serving route when DEBUG is True."""
    import base_feature_project.urls as urls_module

    importlib.reload(urls_module)

    media_paths = [
        str(p.pattern) for p in urls_module.urlpatterns
        if hasattr(p, 'pattern') and 'media' in str(p.pattern)
    ]
    assert len(media_paths) >= 1
