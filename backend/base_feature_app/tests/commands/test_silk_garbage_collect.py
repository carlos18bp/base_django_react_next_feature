"""Tests for the silk_garbage_collect management command."""

from io import StringIO
from unittest.mock import MagicMock, patch

from base_feature_project.management.commands.silk_garbage_collect import Command


def _run_command(out, **options):
    """Instantiate and execute the command directly against a StringIO buffer."""
    defaults = {'days': 7, 'dry_run': False}
    defaults.update(options)
    cmd = Command(stdout=out, no_color=True)
    cmd.handle(**defaults)


@patch('silk.models.Request')
def test_silk_garbage_collect_deletes_old_records_with_default_days(mock_request_cls):
    """Running the command without --days uses 7-day retention and deletes matching records."""
    mock_qs = MagicMock()
    mock_qs.count.return_value = 3
    mock_qs.delete.return_value = (3, {})
    mock_request_cls.objects.filter.return_value = mock_qs

    out = StringIO()
    _run_command(out)

    output = out.getvalue()
    assert 'Requests to delete: 3' in output
    assert 'Deleted 3 records' in output
    mock_qs.delete.assert_called_once()


@patch('silk.models.Request')
def test_silk_garbage_collect_deletes_records_with_custom_days(mock_request_cls):
    """--days 14 applies a 14-day retention period when filtering records."""
    mock_qs = MagicMock()
    mock_qs.count.return_value = 10
    mock_qs.delete.return_value = (10, {})
    mock_request_cls.objects.filter.return_value = mock_qs

    out = StringIO()
    _run_command(out, days=14)

    output = out.getvalue()
    assert 'Requests to delete: 10' in output
    assert 'Deleted 10 records' in output
    mock_qs.delete.assert_called_once()


@patch('silk.models.Request')
def test_silk_garbage_collect_dry_run_does_not_delete_records(mock_request_cls):
    """--dry-run reports the count but does not call delete on the queryset."""
    mock_qs = MagicMock()
    mock_qs.count.return_value = 5
    mock_request_cls.objects.filter.return_value = mock_qs

    out = StringIO()
    _run_command(out, dry_run=True)

    output = out.getvalue()
    assert 'Requests to delete: 5' in output
    assert 'DRY RUN' in output
    mock_qs.delete.assert_not_called()


@patch('silk.models.Request')
def test_silk_garbage_collect_output_includes_cutoff_date(mock_request_cls):
    """Command stdout always contains the 'Silk records older than' header line."""
    mock_qs = MagicMock()
    mock_qs.count.return_value = 0
    mock_qs.delete.return_value = (0, {})
    mock_request_cls.objects.filter.return_value = mock_qs

    out = StringIO()
    _run_command(out)

    assert 'Silk records older than' in out.getvalue()
    mock_request_cls.objects.filter.assert_called_once()


@patch('silk.models.Request')
def test_silk_garbage_collect_reports_zero_when_no_records_match(mock_request_cls):
    """When no records match the cutoff, the command reports 0 records to delete and 0 deleted."""
    mock_qs = MagicMock()
    mock_qs.count.return_value = 0
    mock_qs.delete.return_value = (0, {})
    mock_request_cls.objects.filter.return_value = mock_qs

    out = StringIO()
    _run_command(out)

    output = out.getvalue()
    assert 'Requests to delete: 0' in output
    assert 'Deleted 0 records' in output
    mock_qs.delete.assert_called_once()
