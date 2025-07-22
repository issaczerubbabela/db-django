from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from automations.models import AuditLog


class Command(BaseCommand):
    help = 'Clean up old audit logs (older than specified days)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Delete audit logs older than this many days (default: 90)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        cutoff_date = timezone.now() - timedelta(days=days)
        
        old_logs = AuditLog.objects.filter(timestamp__lt=cutoff_date)
        count = old_logs.count()
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would delete {count} audit logs older than {days} days '
                    f'(before {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")})'
                )
            )
        else:
            if count > 0:
                old_logs.delete()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully deleted {count} audit logs older than {days} days'
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'No audit logs found older than {days} days'
                    )
                )
