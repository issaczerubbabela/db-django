from django.core.management.base import BaseCommand
from automations.models import Tool, Person


class Command(BaseCommand):
    help = 'Populate default tools and people'

    def handle(self, *args, **options):
        # Create default tools
        default_tools = [
            'UiPath',
            'Power Automate',
            'Automation Anywhere',
            'Blue Prism',
            'Python',
            'VBA',
            'PowerShell',
            'Other'
        ]

        for tool_name in default_tools:
            tool, created = Tool.objects.get_or_create(name=tool_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created tool: {tool_name}')
                )
            else:
                self.stdout.write(f'Tool already exists: {tool_name}')

        # Create default system person
        system_person, created = Person.objects.get_or_create(name='System')
        if created:
            self.stdout.write(
                self.style.SUCCESS('Created system person')
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated default data')
        )
