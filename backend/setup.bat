@echo off
echo Setting up Django backend...
echo.

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Setting up database...
python manage.py makemigrations
python manage.py migrate

echo.
echo Creating superuser (optional)...
python manage.py createsuperuser

echo.
echo Setup complete!
echo.
echo To start the Django development server, run:
echo python manage.py runserver
echo.
echo To start the FastAPI server, run:
echo python fastapi_app.py
echo.
echo To start both servers simultaneously, run:
echo start_servers.bat
