"""
Scheduled operational tasks with Huey.

Tasks:
- scheduled_backup: DB + media backup weekly (Sunday at 3:00 AM UTC)
- silk_garbage_collection: Daily cleanup of Silk profiling data (4:00 AM)
- weekly_slow_queries_report: Weekly performance report (Mondays 8:00 AM)
- silk_reports_cleanup: Monthly cleanup of Silk report files older than 6 months
"""

import logging
from datetime import timedelta
from io import StringIO
from pathlib import Path

from django.conf import settings
from django.utils import timezone
from huey import crontab
from huey.contrib.djhuey import db_periodic_task

logger = logging.getLogger('backups')


@db_periodic_task(crontab(day_of_week='0', hour='3', minute='0'))
def scheduled_backup():
    """
    Automated weekly backup of database and media files (Sunday 03:00 UTC).
    Storage: configured via BACKUP_STORAGE_PATH env var.
    Retention: 4 weeks (~1 month).
    """
    from django.core.management import call_command

    timestamp = timezone.now().strftime('%Y-%m-%d_%H%M%S')

    logger.info('=== Starting scheduled backup %s ===', timestamp)

    try:
        logger.info('Running database backup...')
        output = StringIO()
        call_command('dbbackup', '--compress', '--clean', stdout=output)
        logger.info(output.getvalue())

        logger.info('Running media backup...')
        output = StringIO()
        call_command('mediabackup', '--compress', '--clean', stdout=output)
        logger.info(output.getvalue())

        logger.info('=== Backup completed successfully ===')
        return True

    except Exception:
        logger.exception('Backup failed')
        raise


@db_periodic_task(crontab(hour='4', minute='0'))
def silk_garbage_collection():
    """
    Daily cleanup of Silk profiling data older than 7 days.
    Only runs if Silk is enabled.
    """
    if not getattr(settings, 'ENABLE_SILK', False):
        return

    from django.core.management import call_command

    logger.info('Running Silk garbage collection...')
    output = StringIO()
    call_command('silk_garbage_collect', '--days=7', stdout=output)
    logger.info(output.getvalue())


@db_periodic_task(crontab(day_of_week='1', hour='8', minute='0'))
def weekly_slow_queries_report():
    """
    Weekly report of slow queries and potential N+1 patterns.
    Output: backend/logs/silk-reports/silk-report-YYYY-MM-DD.log
    Only runs if Silk is enabled.
    """
    if not getattr(settings, 'ENABLE_SILK', False):
        return

    from django.db.models import Count

    try:
        from silk.models import Request, SQLQuery
    except (ImportError, RuntimeError):
        logger.warning('django-silk is not installed or not enabled; skipping report.')
        return

    week_ago = timezone.now() - timedelta(days=7)
    threshold_ms = getattr(settings, 'SLOW_QUERY_THRESHOLD_MS', 500)
    n_plus_one_threshold = getattr(settings, 'N_PLUS_ONE_THRESHOLD', 10)

    slow_queries = SQLQuery.objects.filter(
        request__start_time__gte=week_ago,
        time_taken__gte=threshold_ms,
    ).select_related('request').order_by('-time_taken')[:50]

    n_plus_one_suspects = Request.objects.filter(
        start_time__gte=week_ago,
    ).annotate(
        query_count=Count('queries'),
    ).filter(
        query_count__gte=n_plus_one_threshold,
    ).order_by('-query_count')[:20]

    report_lines = [
        '=' * 60,
        f'WEEKLY QUERY REPORT - {timezone.now().strftime("%Y-%m-%d")}',
        '=' * 60,
        '',
        f'## SLOW QUERIES (>{threshold_ms}ms)',
        '-' * 40,
    ]

    if slow_queries:
        for sq in slow_queries:
            report_lines.append(
                f'[{sq.time_taken:.0f}ms] {sq.request.path} - {sq.query[:100]}...'
            )
    else:
        report_lines.append('No slow queries found this week')

    report_lines.extend([
        '',
        f'## POTENTIAL N+1 (>{n_plus_one_threshold} queries/request)',
        '-' * 40,
    ])

    if n_plus_one_suspects:
        for req in n_plus_one_suspects:
            report_lines.append(
                f'[{req.query_count} queries] {req.path}'
            )
    else:
        report_lines.append('No N+1 patterns detected this week')

    report_lines.extend(['', '=' * 60])
    report = '\n'.join(report_lines)

    reports_dir = Path(settings.BASE_DIR) / 'logs' / 'silk-reports'
    reports_dir.mkdir(parents=True, exist_ok=True)
    report_date = timezone.now().strftime('%Y-%m-%d')
    log_path = reports_dir / f'silk-report-{report_date}.log'

    with open(log_path, 'w') as f:
        f.write(report + '\n')

    logger.info(
        'Weekly report generated. Slow queries: %d, N+1 suspects: %d',
        slow_queries.count(),
        n_plus_one_suspects.count(),
    )

    return report


@db_periodic_task(crontab(day='1', hour='5', minute='0'))
def silk_reports_cleanup():
    """
    Monthly cleanup of Silk report files older than 6 months.
    Runs on the 1st of each month at 5:00 AM.
    Only runs when Silk is enabled.
    """
    if not getattr(settings, 'ENABLE_SILK', False):
        return

    from datetime import datetime

    reports_dir = Path(settings.BASE_DIR) / 'logs' / 'silk-reports'
    if not reports_dir.exists():
        return

    cutoff = timezone.now().date() - timedelta(days=180)
    deleted = 0

    for report_file in reports_dir.glob('silk-report-*.log'):
        try:
            date_str = report_file.stem.replace('silk-report-', '')
            file_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            continue

        if file_date < cutoff:
            report_file.unlink()
            deleted += 1

    if deleted:
        logger.info('Silk reports cleanup: deleted %d file(s) older than %s.', deleted, cutoff)
