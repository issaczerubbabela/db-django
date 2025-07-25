#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automation_db.settings')
django.setup()

from automations.models import Automation

def main():
    print(f"Current automations count: {Automation.objects.count()}")
    for auto in Automation.objects.all():
        print(f"- {auto.air_id}: {auto.name}")

if __name__ == "__main__":
    main()
