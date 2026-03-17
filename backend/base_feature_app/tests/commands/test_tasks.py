"""Tests for Huey tasks: scheduled_backup, silk_garbage_collection, weekly_slow_queries_report."""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import freezegun
import pytest
from django.test import override_settings


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

@override_settings(ENABLE_SILK=False)
def test_silk_garbage_collection_skips_when_silk_disabled():
    """silk_garbage_collection returns early without calling call_command when ENABLE_SILK is False."""
    from base_feature_project.tasks import silk_garbage_collection

    with patch('django.core.management.call_command') as mock_call_command:
        silk_garbage_collection.call_local()

    assert mock_call_command.call_count == 0


@override_settings(ENABLE_SILK=True)
def test_silk_garbage_collection_calls_command_with_seven_days():
    """silk_garbage_collection calls silk_garbage_collect with --days=7 when ENABLE_SILK is True."""
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

def test_weekly_slow_queries_report_skips_when_silk_disabled(settings, tmp_path):  # quality: disable global_state_mutation (pytest-django settings fixture auto-restores)
    """weekly_slow_queries_report returns early without writing a log when ENABLE_SILK is False."""
    settings.ENABLE_SILK = False
    settings.BASE_DIR = tmp_path
    from base_feature_project.tasks import weekly_slow_queries_report

    weekly_slow_queries_report.call_local()

    assert not (tmp_path / 'logs' / 'silk-weekly-report.log').exists()


def test_weekly_slow_queries_report_creates_log_file(settings, tmp_path):  # quality: disable global_state_mutation (pytest-django settings fixture auto-restores)
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


def test_weekly_slow_queries_report_log_contains_header(settings, tmp_path):  # quality: disable global_state_mutation (pytest-django settings fixture auto-restores)
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


def test_weekly_slow_queries_report_no_slow_queries_message(settings, tmp_path):  # quality: disable global_state_mutation (pytest-django settings fixture auto-restores)
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


def test_weekly_slow_queries_report_no_n_plus_one_message(settings, tmp_path):  # quality: disable global_state_mutation (pytest-django settings fixture auto-restores)
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


def test_weekly_slow_queries_report_includes_slow_query_data(settings, tmp_path):  # quality: disable global_state_mutation (pytest-django settings fixture auto-restores)
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


def test_weekly_slow_queries_report_includes_n_plus_one_suspects(settings, tmp_path):  # quality: disable global_state_mutation (pytest-django settings fixture auto-restores)
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


# ---------------------------------------------------------------------------
# scheduled_backup
# ---------------------------------------------------------------------------

@freezegun.freeze_time('2026-03-17 03:30:00')
def test_scheduled_backup_calls_dbbackup_and_mediabackup():
    """scheduled_backup invokes dbbackup and mediabackup management commands."""
    from base_feature_project.tasks import scheduled_backup

    with patch('django.core.management.call_command') as mock_call_command:
        scheduled_backup.call_local()

    assert mock_call_command.call_count == 2
    first_call_args = mock_call_command.call_args_list[0]
    assert first_call_args[0][0] == 'dbbackup'
    second_call_args = mock_call_command.call_args_list[1]
    assert second_call_args[0][0] == 'mediabackup'


@freezegun.freeze_time('2026-03-17 03:30:00')
def test_scheduled_backup_passes_compress_and_clean_flags():
    """scheduled_backup passes --compress and --clean to both backup commands."""
    from base_feature_project.tasks import scheduled_backup

    with patch('django.core.management.call_command') as mock_call_command:
        scheduled_backup.call_local()

    for call in mock_call_command.call_args_list:
        args = call[0]
        assert '--compress' in args
        assert '--clean' in args


@freezegun.freeze_time('2026-03-17 03:30:00')
def test_scheduled_backup_returns_true_on_success():
    """scheduled_backup returns True when both commands succeed."""
    from base_feature_project.tasks import scheduled_backup

    with patch('django.core.management.call_command'):
        result = scheduled_backup.call_local()

    assert result is True


@freezegun.freeze_time('2026-03-17 03:30:00')
def test_scheduled_backup_raises_on_dbbackup_failure():
    """scheduled_backup re-raises the exception when dbbackup fails."""
    from base_feature_project.tasks import scheduled_backup

    with patch('django.core.management.call_command', side_effect=Exception('DB locked')):
        with pytest.raises(Exception, match='DB locked') as exc_info:
            scheduled_backup.call_local()

    assert 'DB locked' in str(exc_info.value)


@freezegun.freeze_time('2026-03-17 03:30:00')
def test_scheduled_backup_raises_on_mediabackup_failure():
    """scheduled_backup re-raises the exception when mediabackup fails."""
    from base_feature_project.tasks import scheduled_backup

    def fail_on_media(*args, **kwargs):
        if args[0] == 'mediabackup':
            raise OSError('Disk full')

    with patch('django.core.management.call_command', side_effect=fail_on_media):
        with pytest.raises(OSError, match='Disk full') as exc_info:
            scheduled_backup.call_local()

    assert 'Disk full' in str(exc_info.value)


@freezegun.freeze_time('2026-03-17 03:30:00')
def test_scheduled_backup_logs_timestamp():
    """scheduled_backup logs the timestamp in the start message."""
    from base_feature_project.tasks import scheduled_backup

    with patch('base_feature_project.tasks.logger') as mock_logger:
        with patch('django.core.management.call_command'):
            scheduled_backup.call_local()

    log_messages = ' '.join(str(c) for c in mock_logger.info.call_args_list)
    assert '2026-03-17' in log_messages
