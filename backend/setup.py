#!/usr/bin/env python
"""
Setup script for the Django project.
Run this after installing dependencies to set up the database.
"""

import os
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automation_db.settings')
    django.setup()
    
    print("Creating database migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    print("Applying database migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("Creating superuser...")
    try:
        execute_from_command_line(['manage.py', 'createsuperuser'])
    except KeyboardInterrupt:
        print("Superuser creation cancelled.")
    
    print("Setup complete!")
