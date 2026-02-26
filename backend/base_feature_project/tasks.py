"""
Scheduled operational tasks with Huey.

Tasks:
- scheduled_backup: DB + media backup every 20 days (days 1 & 21, 3:00 AM)
- silk_garbage_collection: Daily cleanup of Silk profiling data (4:00 AM)
- weekly_slow_queries_report: Weekly performance report (Mondays 8:00 AM)
"""

import logging
from datetime import datetime, timedelta
from io import StringIO
from pathlib import Path

from django.conf import settings
from django.utils import timezone
from huey import crontab
from huey.contrib.djhuey import periodic_task

logger = logging.getLogger('backups')


@periodic_task(crontab(day='1,21', hour='3', minute='0'))
def scheduled_backup():
    """
    Automated backup of database and media files every 20 days.
    Storage: configured via BACKUP_STORAGE_PATH env var.
    Retention: ~90 days (5 backups at 20-day intervals).
    """
    from django.core.management import call_command

    timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')

    logger.info(f"=== Starting scheduled backup {timestamp} ===")

    try:
        # Database backup + cleanup old in one pass
        logger.info("Running database backup...")
        output = StringIO()
        call_command('dbbackup', '--compress', '--clean', stdout=output)
        logger.info(output.getvalue())

        # Media backup + cleanup old in one pass
        logger.info("Running media backup...")
        output = StringIO()
        call_command('mediabackup', '--compress', '--clean', stdout=output)
        logger.info(output.getvalue())

        logger.info("=== Backup completed successfully ===")
        return True

    except Exception as e:
        logger.error(f"Backup failed: {str(e)}")
        raise


@periodic_task(crontab(hour='4', minute='0'))
def silk_garbage_collection():
    """
    Daily cleanup of Silk profiling data older than 7 days.
    Only runs if Silk is enabled.
    """
    if not getattr(settings, 'ENABLE_SILK', False):
        return

    from django.core.management import call_command

    logger.info("Running Silk garbage collection...")
    output = StringIO()
    call_command('silk_garbage_collect', '--days=7', stdout=output)
    logger.info(output.getvalue())


@periodic_task(crontab(day_of_week='1', hour='8', minute='0'))
def weekly_slow_queries_report():
    """
    Weekly report of slow queries and potential N+1 patterns.
    Output: backend/logs/silk-weekly-report.log
    Only runs if Silk is enabled.
    """
    if not getattr(settings, 'ENABLE_SILK', False):
        return

    from django.db.models import Count
    from silk.models import Request, SQLQuery

    week_ago = timezone.now() - timedelta(days=7)
    threshold_ms = getattr(settings, 'SLOW_QUERY_THRESHOLD_MS', 500)
    n_plus_one_threshold = getattr(settings, 'N_PLUS_ONE_THRESHOLD', 10)

    # Find slow queries
    slow_queries = SQLQuery.objects.filter(
        request__start_time__gte=week_ago,
        time_taken__gte=threshold_ms,
    ).select_related('request').order_by('-time_taken')[:50]

    # Find potential N+1 patterns
    n_plus_one_suspects = Request.objects.filter(
        start_time__gte=week_ago,
    ).annotate(
        query_count=Count('queries'),
    ).filter(
        query_count__gte=n_plus_one_threshold,
    ).order_by('-query_count')[:20]

    # Generate report
    report_lines = [
        "=" * 60,
        f"WEEKLY QUERY REPORT - {timezone.now().strftime('%Y-%m-%d')}",
        "=" * 60,
        "",
        f"## SLOW QUERIES (>{threshold_ms}ms)",
        "-" * 40,
    ]

    if slow_queries:
        for sq in slow_queries:
            report_lines.append(
                f"[{sq.time_taken:.0f}ms] {sq.request.path} - "
                f"{sq.query[:100]}..."
            )
    else:
        report_lines.append("No slow queries found this week")

    report_lines.extend([
        "",
        f"## POTENTIAL N+1 (>{n_plus_one_threshold} queries/request)",
        "-" * 40,
    ])

    if n_plus_one_suspects:
        for req in n_plus_one_suspects:
            report_lines.append(
                f"[{req.query_count} queries] {req.path}"
            )
    else:
        report_lines.append("No N+1 patterns detected this week")

    report_lines.extend(["", "=" * 60])
    report = "\n".join(report_lines)

    # Save to log file
    log_path = Path(settings.BASE_DIR) / 'logs' / 'silk-weekly-report.log'
    log_path.parent.mkdir(exist_ok=True)

    with open(log_path, 'a') as f:
        f.write(report + "\n\n")

    logger.info(
        f"Weekly report generated. "
        f"Slow queries: {slow_queries.count()}, "
        f"N+1 suspects: {n_plus_one_suspects.count()}"
    )

    return report
