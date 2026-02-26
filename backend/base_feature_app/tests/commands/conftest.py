"""
Conftest for command tests.

Injects lightweight mock modules for `silk` and `silk.models` into sys.modules
before any test-level import occurs, so that @patch('silk.models.Request') does
not trigger Django's app-registry check (silk is only in INSTALLED_APPS when
ENABLE_SILK=true, which is off by default in the test environment).
"""

import sys
from unittest.mock import MagicMock

sys.modules.setdefault('silk', MagicMock())
sys.modules.setdefault('silk.models', MagicMock())
