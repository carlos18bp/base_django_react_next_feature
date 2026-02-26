"""Tests for Silk-related Huey tasks: silk_garbage_collection, weekly_slow_queries_report."""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch


class _FakeQS(list):
    """List subclass with a no-arg .count() to mimic a sliced Django queryset."""

    def count(self):
        return len(self)


def _setup_silk_mocks(mock_request_cls, mock_sql_query_cls, *, slow_queries, n_plus_one):
    slow_qs = _FakeQS(slow_queries)
    n1_qs = _FakeQS(n_plus_one)
    (
        mock_sql_query_cls.objects
        .filter.return_value
        .select_related.return_value
        .order_by.return_value
        .__getitem__
    ) = MagicMock(return_value=slow_qs)
    (
        mock_request_cls.objects
        .filter.return_value
        .annotate.return_value
        .filter.return_value
        .order_by.return_value
        .__getitem__
    ) = MagicMock(return_value=n1_qs)


# ---------------------------------------------------------------------------
# silk_garbage_collection
# ---------------------------------------------------------------------------

def test_silk_garbage_collection_skips_when_silk_disabled(settings):
    """silk_garbage_collection returns early without calling call_command when ENABLE_SILK is False."""
    settings.ENABLE_SILK = False
    from base_feature_project.tasks import silk_garbage_collection

    with patch('django.core.management.call_command') as mock_call_command:
        silk_garbage_collection.call_local()

    assert mock_call_command.call_count == 0


def test_silk_garbage_collection_calls_command_with_seven_days(settings):
    """silk_garbage_collection calls silk_garbage_collect with --days=7 when ENABLE_SILK is True."""
    settings.ENABLE_SILK = True
    from base_feature_project.tasks import silk_garbage_collection

    with patch('django.core.management.call_command') as mock_call_command:
        silk_garbage_collection.call_local()

    mock_call_command.assert_called_once()
    args, kwargs = mock_call_command.call_args
    assert args[0] == 'silk_garbage_collect'
    assert '--days=7' in args
    assert 'stdout' in kwargs


# ---------------------------------------------------------------------------
# weekly_slow_queries_report
# ---------------------------------------------------------------------------

def test_weekly_slow_queries_report_skips_when_silk_disabled(settings, tmp_path):
    """weekly_slow_queries_report returns early without writing a log when ENABLE_SILK is False."""
    settings.ENABLE_SILK = False
    settings.BASE_DIR = tmp_path
    from base_feature_project.tasks import weekly_slow_queries_report

    weekly_slow_queries_report.call_local()

    assert not (tmp_path / 'logs' / 'silk-weekly-report.log').exists()


def test_weekly_slow_queries_report_creates_log_file(settings, tmp_path):
    """weekly_slow_queries_report creates the log file under BASE_DIR/logs/ when ENABLE_SILK is True."""
    settings.ENABLE_SILK = True
    settings.SLOW_QUERY_THRESHOLD_MS = 500
    settings.N_PLUS_ONE_THRESHOLD = 10
    settings.BASE_DIR = tmp_path

    with (
        patch('silk.models.Request') as mock_request_cls,
        patch('silk.models.SQLQuery') as mock_sql_query_cls,
    ):
        _setup_silk_mocks(mock_request_cls, mock_sql_query_cls, slow_queries=[], n_plus_one=[])
        from base_feature_project.tasks import weekly_slow_queries_report
        weekly_slow_queries_report.call_local()

    assert (tmp_path / 'logs' / 'silk-weekly-report.log').exists()


def test_weekly_slow_queries_report_log_contains_header(settings, tmp_path):
    """The generated log file contains the WEEKLY QUERY REPORT header."""
    settings.ENABLE_SILK = True
    settings.SLOW_QUERY_THRESHOLD_MS = 500
    settings.N_PLUS_ONE_THRESHOLD = 10
    settings.BASE_DIR = tmp_path

    with (
        patch('silk.models.Request') as mock_request_cls,
        patch('silk.models.SQLQuery') as mock_sql_query_cls,
    ):
        _setup_silk_mocks(mock_request_cls, mock_sql_query_cls, slow_queries=[], n_plus_one=[])
        from base_feature_project.tasks import weekly_slow_queries_report
        weekly_slow_queries_report.call_local()

    content = (tmp_path / 'logs' / 'silk-weekly-report.log').read_text()
    assert 'WEEKLY QUERY REPORT' in content


def test_weekly_slow_queries_report_no_slow_queries_message(settings, tmp_path):
    """Report contains the 'No slow queries found' message when there are no slow queries."""
    settings.ENABLE_SILK = True
    settings.SLOW_QUERY_THRESHOLD_MS = 500
    settings.N_PLUS_ONE_THRESHOLD = 10
    settings.BASE_DIR = tmp_path

    with (
        patch('silk.models.Request') as mock_request_cls,
        patch('silk.models.SQLQuery') as mock_sql_query_cls,
    ):
        _setup_silk_mocks(mock_request_cls, mock_sql_query_cls, slow_queries=[], n_plus_one=[])
        from base_feature_project.tasks import weekly_slow_queries_report
        weekly_slow_queries_report.call_local()

    content = (tmp_path / 'logs' / 'silk-weekly-report.log').read_text()
    assert 'No slow queries found this week' in content


def test_weekly_slow_queries_report_no_n_plus_one_message(settings, tmp_path):
    """Report contains the 'No N+1 patterns detected' message when there are no N+1 suspects."""
    settings.ENABLE_SILK = True
    settings.SLOW_QUERY_THRESHOLD_MS = 500
    settings.N_PLUS_ONE_THRESHOLD = 10
    settings.BASE_DIR = tmp_path

    with (
        patch('silk.models.Request') as mock_request_cls,
        patch('silk.models.SQLQuery') as mock_sql_query_cls,
    ):
        _setup_silk_mocks(mock_request_cls, mock_sql_query_cls, slow_queries=[], n_plus_one=[])
        from base_feature_project.tasks import weekly_slow_queries_report
        weekly_slow_queries_report.call_local()

    content = (tmp_path / 'logs' / 'silk-weekly-report.log').read_text()
    assert 'No N+1 patterns detected this week' in content


def test_weekly_slow_queries_report_includes_slow_query_data(settings, tmp_path):
    """Report includes the endpoint path and duration of each detected slow query."""
    settings.ENABLE_SILK = True
    settings.SLOW_QUERY_THRESHOLD_MS = 500
    settings.N_PLUS_ONE_THRESHOLD = 10
    settings.BASE_DIR = tmp_path

    slow_query = SimpleNamespace(
        time_taken=1200.0,
        request=SimpleNamespace(path='/api/products/'),
        query='SELECT * FROM product WHERE id = 1',
    )

    with (
        patch('silk.models.Request') as mock_request_cls,
        patch('silk.models.SQLQuery') as mock_sql_query_cls,
    ):
        _setup_silk_mocks(
            mock_request_cls,
            mock_sql_query_cls,
            slow_queries=[slow_query],
            n_plus_one=[],
        )
        from base_feature_project.tasks import weekly_slow_queries_report
        weekly_slow_queries_report.call_local()

    content = (tmp_path / 'logs' / 'silk-weekly-report.log').read_text()
    assert '/api/products/' in content
    assert '1200ms' in content


def test_weekly_slow_queries_report_includes_n_plus_one_suspects(settings, tmp_path):
    """Report includes the endpoint path and query count of each detected N+1 suspect."""
    settings.ENABLE_SILK = True
    settings.SLOW_QUERY_THRESHOLD_MS = 500
    settings.N_PLUS_ONE_THRESHOLD = 10
    settings.BASE_DIR = tmp_path

    suspect = SimpleNamespace(query_count=25, path='/api/sales/')

    with (
        patch('silk.models.Request') as mock_request_cls,
        patch('silk.models.SQLQuery') as mock_sql_query_cls,
    ):
        _setup_silk_mocks(
            mock_request_cls,
            mock_sql_query_cls,
            slow_queries=[],
            n_plus_one=[suspect],
        )
        from base_feature_project.tasks import weekly_slow_queries_report
        weekly_slow_queries_report.call_local()

    content = (tmp_path / 'logs' / 'silk-weekly-report.log').read_text()
    assert '/api/sales/' in content
    assert '25 queries' in content
