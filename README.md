# Automation Database System - Django + FastAPI + React

A comprehensive database system for managing automation records and workflows. This version features a **React frontend** with **Django backend**, **FastAPI for APIs**, and **SQLite database**.

## 🏗️ Architecture

### Frontend (React + Next.js)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI, Heroicons
- **Features**: 
  - Clean table view with essential columns (AIR ID, Name, Type, Complexity, Description)
  - Detailed sidebar with grouped information
  - Search functionality
  - Responsive design
  - CSV import/export functionality
  - Bulk operations (create/delete)

### Backend (Django + FastAPI)
- **Framework**: Django 5.0.6 with Django REST Framework
- **API Layer**: FastAPI for high-performance API endpoints
- **Database**: SQLite (file-based, no separate database server needed)
- **Features**:
  - RESTful API endpoints (both Django REST and FastAPI)
  - Automatic API documentation (FastAPI Swagger)
  - Data validation and serialization
  - Search functionality
  - Bulk operations support
  - Admin interface for data management

### Database Schema
The SQLite database contains a single `automations` table with the following fields:
- `air_id` (Primary Key) - Unique automation identifier
- `name` - Automation name
- `type` - Automation type (Process, API, etc.)
- `brief_description` - Brief description of the automation
- `coe_fed` - COE Fed classification
- `complexity` - Complexity level (Low, Medium, High)
- `tool_version` - Tool and version used
- `process_details` - Detailed process information
- `object_details` - Object-specific details
- `queue` - Queue information
- `shared_folders` - Shared folder paths
- `shared_mailboxes` - Shared mailbox information
- `qa_handshake` - QA handshake details
- `preprod_deploy_date` - Pre-production deployment date
- `prod_deploy_date` - Production deployment date
- `warranty_end_date` - Warranty end date
- `comments` - Additional comments
- `documentation` - Documentation links
- `modified` - Last modified date
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+** (for Django/FastAPI backend)
- **Node.js 18+** (for React frontend)
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd db-django
```

### 2. Backend Setup (Django + FastAPI)

Navigate to the backend directory:
```bash
cd backend
```

#### Option A: Automatic Setup (Recommended)
For **Windows**:
```bash
setup.bat
```

For **Linux/Mac**:
```bash
chmod +x setup.sh
./setup.sh
```

#### Option B: Manual Setup
1. Create and activate a virtual environment:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up the database:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create a superuser (optional, for Django admin):
```bash
python manage.py createsuperuser
```

### 3. Frontend Setup (React + Next.js)

Navigate to the frontend directory:
```bash
cd frontend
```

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# The .env.local file is already created with:
BACKEND_URL=http://localhost:8000
```

### 4. Running the Application

#### Option A: Start Both Servers Simultaneously
From the backend directory:

**Windows**:
```bash
start_servers.bat
```

**Linux/Mac**:
```bash
chmod +x start_servers.sh
./start_servers.sh
```

#### Option B: Start Servers Manually

1. **Start the FastAPI server** (recommended for frontend):
```bash
cd backend
python fastapi_app.py
```
The FastAPI server will start on `http://localhost:8000`
- API endpoints: `http://localhost:8000/api/`
- Interactive API docs: `http://localhost:8000/docs`

2. **Start the Django server** (optional, for admin interface):
```bash
cd backend
python manage.py runserver 8001
```
The Django server will start on `http://localhost:8001`
- Admin interface: `http://localhost:8001/admin/`

3. **Start the React frontend**:
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`

## 📱 Usage

### Frontend Application
- **Main Interface**: Visit `http://localhost:3000`
- **Search**: Use the search bar to find automations by AIR ID, name, type, or description
- **Create**: Click the "+" button to add new automations
- **Edit**: Click on any automation to view/edit details in the sidebar
- **Import**: Use the import button to upload CSV files
- **Export**: Export data to CSV format
- **Bulk Operations**: Select multiple items for bulk delete

### API Endpoints

#### FastAPI Endpoints (Primary)
- `GET /api/automations/` - Get all automations (with optional search)
- `GET /api/automations/{air_id}/` - Get specific automation
- `POST /api/automations/` - Create new automation
- `PUT /api/automations/{air_id}/` - Update automation
- `PATCH /api/automations/{air_id}/` - Partially update automation
- `DELETE /api/automations/{air_id}/` - Delete automation
- `POST /api/automations/bulk/` - Bulk create automations
- `DELETE /api/automations/bulk/` - Bulk delete automations

#### Django REST Endpoints (Alternative)
- `GET /api/automations/` - Get all automations
- `POST /api/automations/` - Create new automation
- `GET /api/automations/{air_id}/` - Get specific automation
- `PUT /api/automations/{air_id}/` - Update automation
- `PATCH /api/automations/{air_id}/` - Partially update automation
- `DELETE /api/automations/{air_id}/` - Delete automation

### API Documentation
- **FastAPI Swagger UI**: `http://localhost:8000/docs`
- **FastAPI ReDoc**: `http://localhost:8000/redoc`

### Django Admin Interface
- **Admin Panel**: `http://localhost:8001/admin/`
- Login with the superuser credentials created during setup
- Manage automations through the web interface

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Sample Data

You can import sample data using the CSV import feature in the frontend, or create test data through the admin interface.

### Sample CSV Format
```csv
air_id,name,type,brief_description,coe_fed,complexity,tool_version,process_details,object_details,queue,shared_folders,shared_mailboxes,qa_handshake,preprod_deploy_date,prod_deploy_date,warranty_end_date,comments,documentation,modified
AUTO001,Invoice Processing,Process,Automated invoice processing system,Finance,Medium,UiPath 2023.10,Process invoices from email,Invoice objects,finance_queue,\\shared\\finance,finance@company.com,QA-001,2024-01-15,2024-02-01,2025-02-01,Working well,http://docs.company.com/auto001,2024-01-10
AUTO002,Report Generation,Report,Monthly sales report automation,Sales,Low,Power Automate,Generate monthly reports,Sales data,sales_queue,\\shared\\sales,sales@company.com,QA-002,2024-01-20,2024-02-05,2025-02-05,Needs optimization,http://docs.company.com/auto002,2024-01-15
```

## 🔧 Configuration

### Backend Configuration
- **Database**: SQLite file located at `backend/db.sqlite3`
- **Settings**: `backend/automation_db/settings.py`
- **CORS**: Configured to allow all origins during development

### Frontend Configuration
- **API URL**: Configure in `frontend/.env.local`
- **Next.js Config**: `frontend/next.config.mjs`

## 🛠️ Development

### Adding New Features

1. **Backend (Django)**:
   - Add new models in `backend/automations/models.py`
   - Create serializers in `backend/automations/serializers.py`
   - Add views in `backend/automations/views.py`
   - Update URLs in `backend/automations/urls.py`

2. **Backend (FastAPI)**:
   - Add new endpoints in `backend/fastapi_app.py`
   - Update Pydantic models for validation

3. **Frontend (React)**:
   - Add new components in `frontend/src/app/components/`
   - Update API calls in component files
   - Modify styling with Tailwind CSS

### Database Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## 📋 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   - Kill existing processes: `taskkill /F /IM python.exe` (Windows) or `pkill python` (Linux/Mac)
   - Use different ports in configuration

2. **Database Issues**:
   - Delete `db.sqlite3` and re-run migrations
   - Check for model changes requiring new migrations

3. **CORS Issues**:
   - Ensure CORS is properly configured in Django settings
   - Check that frontend is making requests to correct backend URL

4. **Frontend API Errors**:
   - Verify backend is running on correct port
   - Check `.env.local` file for correct `BACKEND_URL`

### Log Files
- **Django**: Logs appear in the terminal where you ran `python manage.py runserver`
- **FastAPI**: Logs appear in the terminal where you ran `python fastapi_app.py`
- **React**: Logs appear in the browser console and terminal

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG = False` in `settings.py`
2. Configure proper `ALLOWED_HOSTS`
3. Set up proper database for production (PostgreSQL recommended)
4. Use a proper WSGI server like Gunicorn

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar service
3. Update `BACKEND_URL` to point to production backend

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📧 Support

For support and questions, please create an issue in the repository.

---

**Happy automating! 🚀**
