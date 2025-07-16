# Automation Database System - Django + FastAPI + React

A comprehensive, full-stack database system for managing automation records and workflows. This modern application features a **React frontend** with **Django backend**, **FastAPI for high-performance APIs**, and **SQLite database**.

## � Key Features

- **🎯 Complete CRUD Operations**: Create, Read, Update, Delete automation records
- **🔍 Advanced Search**: Search across multiple fields with real-time filtering
- **📊 Bulk Operations**: Create and delete multiple records efficiently
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **📈 Interactive API Documentation**: Auto-generated Swagger UI and ReDoc
- **🔒 Data Validation**: Comprehensive input validation and error handling
- **📄 CSV Import/Export**: Easy data import and export functionality
- **⚡ High Performance**: FastAPI for maximum API speed
- **🛡️ Type Safety**: Full TypeScript-like validation with Pydantic

## �🏗️ Architecture

### Frontend (React + Next.js)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4 for modern, responsive design
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Form Handling**: React Hook Form for efficient form management
- **Features**: 
  - Clean table view with essential columns (AIR ID, Name, Type, Complexity, Description)
  - Detailed sidebar with grouped information sections
  - Real-time search functionality
  - Responsive design for all screen sizes
  - CSV import/export functionality
  - Bulk operations (create/delete)
  - Loading states and error handling

### Backend (Django + FastAPI)
- **Framework**: Django 5.0.6 with Django REST Framework
- **API Layer**: FastAPI for high-performance API endpoints
- **Database**: SQLite (file-based, no separate database server needed)
- **Features**:
  - Dual API support (Django REST and FastAPI)
  - Automatic API documentation (FastAPI Swagger UI)
  - Data validation and serialization with Pydantic
  - Advanced search functionality
  - Bulk operations support
  - Django admin interface for data management
  - CORS configuration for frontend integration
  - Comprehensive error handling

## 📁 Project Structure

```
db-django/
├── README.md                    # Main project documentation
├── setup_all.bat               # Windows setup script for entire project
├── setup_all.sh                # Linux/Mac setup script for entire project
├── start_all.bat               # Windows script to start all servers
├── start_all.sh                # Linux/Mac script to start all servers
│
├── backend/                     # Django + FastAPI backend
│   ├── README_FASTAPI.md       # FastAPI-specific documentation
│   ├── db.sqlite3              # SQLite database file
│   ├── fastapi_app.py          # FastAPI application entry point
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python dependencies
│   ├── setup.bat               # Windows backend setup
│   ├── setup.sh                # Linux/Mac backend setup
│   ├── start_servers.bat       # Windows script to start backend servers
│   ├── start_servers.sh        # Linux/Mac script to start backend servers
│   │
│   ├── automation_db/          # Django project configuration
│   │   ├── __init__.py
│   │   ├── asgi.py             # ASGI configuration
│   │   ├── settings.py         # Django settings
│   │   ├── urls.py             # Main URL configuration
│   │   └── wsgi.py             # WSGI configuration
│   │
│   └── automations/            # Django app for automation management
│       ├── __init__.py
│       ├── admin.py            # Django admin configuration
│       ├── apps.py             # App configuration
│       ├── models.py           # Database models
│       ├── serializers.py      # DRF serializers
│       ├── tests.py            # Unit tests
│       ├── urls.py             # App URL configuration
│       ├── views.py            # Django views
│       └── migrations/         # Database migrations
│           ├── __init__.py
│           └── 0001_initial.py
│
└── frontend/                   # React + Next.js frontend
    ├── package.json            # Node.js dependencies
    ├── next.config.mjs         # Next.js configuration
    ├── postcss.config.mjs      # PostCSS configuration
    ├── eslint.config.mjs       # ESLint configuration
    ├── jsconfig.json           # JavaScript configuration
    │
    ├── public/                 # Static assets
    │   ├── favicon.ico
    │   ├── next.svg
    │   └── vercel.svg
    │
    └── src/                    # Source code
        └── app/                # Next.js app directory
            ├── layout.js       # Root layout component
            ├── page.js         # Home page component
            ├── globals.css     # Global styles
            ├── favicon.ico     # App icon
            │
            ├── api/            # API route handlers
            │   └── automations/
            │       ├── route.js
            │       └── [air_id]/
            │           └── route.js
            │
            └── components/     # React components
                ├── AutomationDatabase.js      # Main database component
                ├── AutomationDetailsSidebar.js # Details sidebar
                ├── AutomationForm.js          # Form component
                └── AutomationTabView.js       # Tab view component
```
## 🗄️ Database Schema

### Automations Table
The SQLite database contains a single `automations` table with the following comprehensive fields:

| Field | Type | Description |
|-------|------|-------------|
| `air_id` | VARCHAR(100) | **Primary Key** - Unique automation identifier |
| `name` | VARCHAR(500) | Automation name |
| `type` | VARCHAR(100) | Automation type (Process, API, Report, etc.) |
| `brief_description` | TEXT | Brief description of the automation |
| `coe_fed` | VARCHAR(100) | COE Fed classification |
| `complexity` | VARCHAR(50) | Complexity level (Low, Medium, High) |
| `tool_version` | VARCHAR(200) | Tool and version used (e.g., "UiPath 2023.10") |
| `process_details` | TEXT | Detailed process information |
| `object_details` | TEXT | Object-specific details |
| `queue` | VARCHAR(200) | Queue information |
| `shared_folders` | TEXT | Shared folder paths |
| `shared_mailboxes` | TEXT | Shared mailbox information |
| `qa_handshake` | VARCHAR(200) | QA handshake details |
| `preprod_deploy_date` | DATETIME | Pre-production deployment date |
| `prod_deploy_date` | DATETIME | Production deployment date |
| `warranty_end_date` | DATETIME | Warranty end date |
| `comments` | TEXT | Additional comments |
| `documentation` | TEXT | Documentation links |
| `modified` | DATETIME | Last modified date |
| `created_at` | DATETIME | Record creation timestamp (auto-generated) |
| `updated_at` | DATETIME | Record update timestamp (auto-updated) |

### Database Features
- **File-based**: SQLite database stored as `backend/db.sqlite3`
- **No server required**: Embedded database for easy deployment
- **ACID compliant**: Ensures data integrity
- **Concurrent access**: Supports multiple read/write operations
- **Backup friendly**: Single file for easy backups

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (for Django/FastAPI backend)
- **Node.js 18+** (for React frontend)
- **Git** (for version control)

### 🎯 One-Command Setup

For the fastest setup, use the provided scripts:

**Windows:**
```powershell
# From the project root
setup_all.bat
```

**Linux/Mac:**
```bash
# From the project root
chmod +x setup_all.sh
./setup_all.sh
```

This will:
1. Set up Python virtual environment
2. Install all Python dependencies
3. Run database migrations
4. Install Node.js dependencies
5. Create environment files
6. Start all servers

### 🎯 One-Command Start

After setup, start all servers with:

**Windows:**
```powershell
start_all.bat
```

**Linux/Mac:**
```bash
chmod +x start_all.sh
./start_all.sh
```

This will start:
- Django server on `http://localhost:8000`
- FastAPI server on `http://localhost:8001`
- React frontend on `http://localhost:3000`

### 🌐 Access Points

After starting the servers:
- **Main Application**: http://localhost:3000
- **FastAPI Documentation**: http://localhost:8001/docs
- **Django Admin**: http://localhost:8000/admin
- **Django API**: http://localhost:8000/api/automations/
- **FastAPI API**: http://localhost:8001/api/automations/

## 🔧 Manual Setup (Alternative)

If you prefer manual setup or need to troubleshoot:

### 1. Clone the Repository
```bash
git clone https://github.com/issaczerubbabela/db-django.git
cd db-django
```

### 2. Backend Setup (Django + FastAPI)

Navigate to the backend directory:
```bash
cd backend
```

#### Option A: Automatic Backend Setup
**Windows:**
```powershell
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

#### Option B: Manual Backend Setup
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

2. Environment variables are automatically configured for local development

### 4. Running the Application

#### Option A: Start All Servers (Recommended)
From the backend directory:

**Windows:**
```powershell
start_servers.bat
```

**Linux/Mac:**
```bash
chmod +x start_servers.sh
./start_servers.sh
```

#### Option B: Start Servers Individually

1. **Start the Django server**:
```bash
cd backend
python manage.py runserver 8000
```
The Django server will start on `http://localhost:8000`
- Admin interface: `http://localhost:8000/admin/`
- Django API: `http://localhost:8000/api/automations/`

2. **Start the FastAPI server**:
```bash
cd backend
python fastapi_app.py
```
The FastAPI server will start on `http://localhost:8001`
- FastAPI API: `http://localhost:8001/api/automations/`
- Interactive API docs: `http://localhost:8001/docs`
- Alternative docs: `http://localhost:8001/redoc`

3. **Start the React frontend**:
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`

## 🎯 Usage Guide

### Main Application Features

#### 🏠 Homepage (`http://localhost:3000`)
- **Dashboard View**: Overview of all automations in a clean table format
- **Search Bar**: Real-time search across multiple fields
- **Action Buttons**: Create, import, export, and bulk operations
- **Responsive Design**: Works on desktop, tablet, and mobile

#### 🔍 Search Functionality
- Search across: AIR ID, Name, Type, Description, COE Fed, Complexity
- Real-time filtering as you type
- Case-insensitive search
- Multiple keyword support

#### ➕ Creating Automations
1. Click the "**+**" button in the top right
2. Fill in the automation details
3. Required fields: AIR ID, Name, Type
4. Optional fields: All other automation properties
5. Click "Save" to create

#### ✏️ Editing Automations
1. Click on any automation row in the table
2. Details sidebar opens on the right
3. Edit any field directly
4. Changes are saved automatically
5. Click "✕" to close the sidebar

#### 📊 Bulk Operations
- **Bulk Delete**: Select multiple rows and click delete
- **Bulk Create**: Use CSV import to create multiple automations
- **Export**: Download all or filtered data as CSV

#### 📁 Import/Export
- **CSV Import**: Upload CSV files with automation data
- **CSV Export**: Download current data or search results
- **Format**: Standard CSV with headers matching database fields

### API Usage

#### 🚀 FastAPI Endpoints (Primary API)
Base URL: `http://localhost:8001`

- `GET /api/automations/` - Get all automations
- `GET /api/automations/?search=keyword` - Search automations
- `GET /api/automations/{air_id}/` - Get specific automation
- `POST /api/automations/` - Create new automation
- `PUT /api/automations/{air_id}/` - Update automation (full)
- `PATCH /api/automations/{air_id}/` - Update automation (partial)
- `DELETE /api/automations/{air_id}/` - Delete automation
- `POST /api/automations/bulk/` - Bulk create automations
- `DELETE /api/automations/bulk/` - Bulk delete automations

#### 🛠️ Django REST Endpoints (Alternative API)
Base URL: `http://localhost:8000`

- `GET /api/automations/` - Get all automations
- `POST /api/automations/` - Create new automation
- `GET /api/automations/{air_id}/` - Get specific automation
- `PUT /api/automations/{air_id}/` - Update automation
- `PATCH /api/automations/{air_id}/` - Partially update automation
- `DELETE /api/automations/{air_id}/` - Delete automation

### API Documentation

#### 📖 Interactive Documentation
- **FastAPI Swagger UI**: `http://localhost:8001/docs`
  - Interactive API testing
  - Request/response examples
  - Authentication testing
  - Schema documentation

- **FastAPI ReDoc**: `http://localhost:8001/redoc`
  - Clean, readable documentation
  - Detailed schema information
  - Easy navigation

#### 🔧 Django Admin Interface
- **Admin Panel**: `http://localhost:8000/admin/`
- Login with superuser credentials
- Full CRUD operations
- Batch operations
- Data filtering and search
- Export functionality

### Example API Calls

#### Python Example
```python
import requests

# Get all automations
response = requests.get('http://localhost:8001/api/automations/')
automations = response.json()

# Search automations
response = requests.get('http://localhost:8001/api/automations/?search=invoice')
results = response.json()

# Create new automation
new_automation = {
    "air_id": "AUTO001",
    "name": "Invoice Processing",
    "type": "Process",
    "brief_description": "Automated invoice processing",
    "complexity": "Medium"
}
response = requests.post('http://localhost:8001/api/automations/', json=new_automation)
```

#### JavaScript Example
```javascript
// Get all automations
const response = await fetch('http://localhost:8001/api/automations/');
const automations = await response.json();

// Create new automation
const newAutomation = {
    air_id: "AUTO001",
    name: "Invoice Processing",
    type: "Process",
    brief_description: "Automated invoice processing",
    complexity: "Medium"
};

const response = await fetch('http://localhost:8001/api/automations/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAutomation)
});
```

## 📊 Sample Data & Testing

### CSV Import Format
The application supports CSV import with the following format:

```csv
air_id,name,type,brief_description,coe_fed,complexity,tool_version,process_details,object_details,queue,shared_folders,shared_mailboxes,qa_handshake,preprod_deploy_date,prod_deploy_date,warranty_end_date,comments,documentation,modified
AUTO001,Invoice Processing,Process,Automated invoice processing system,Finance,Medium,UiPath 2023.10,Process invoices from email,Invoice objects,finance_queue,\\shared\\finance,finance@company.com,QA-001,2024-01-15,2024-02-01,2025-02-01,Working well,http://docs.company.com/auto001,2024-01-10
AUTO002,Report Generation,Report,Monthly sales report automation,Sales,Low,Power Automate,Generate monthly reports,Sales data,sales_queue,\\shared\\sales,sales@company.com,QA-002,2024-01-20,2024-02-05,2025-02-05,Needs optimization,http://docs.company.com/auto002,2024-01-15
AUTO003,Data Backup,Process,Daily database backup automation,IT,High,PowerShell 7.0,Backup databases and files,Database objects,backup_queue,\\shared\\backup,backup@company.com,QA-003,2024-01-25,2024-02-10,2025-02-10,Runs at 2 AM daily,http://docs.company.com/auto003,2024-01-20
```

### Sample Data Examples

#### Process Automation
```json
{
  "air_id": "AUTO001",
  "name": "Invoice Processing",
  "type": "Process",
  "brief_description": "Automated invoice processing system",
  "coe_fed": "Finance",
  "complexity": "Medium",
  "tool_version": "UiPath 2023.10",
  "process_details": "Reads invoices from email, extracts data, and processes payments",
  "object_details": "Invoice documents, payment records",
  "queue": "finance_queue",
  "shared_folders": "\\\\shared\\\\finance\\\\invoices",
  "shared_mailboxes": "finance@company.com",
  "qa_handshake": "QA-001",
  "comments": "Working well, processes 100+ invoices daily",
  "documentation": "http://docs.company.com/auto001"
}
```

#### Report Automation
```json
{
  "air_id": "AUTO002",
  "name": "Weekly Sales Report",
  "type": "Report",
  "brief_description": "Automated weekly sales report generation",
  "coe_fed": "Sales",
  "complexity": "Low",
  "tool_version": "Power Automate",
  "process_details": "Generates weekly sales reports from CRM data",
  "object_details": "Sales data, customer information",
  "queue": "sales_queue",
  "shared_folders": "\\\\shared\\\\sales\\\\reports",
  "shared_mailboxes": "sales@company.com",
  "qa_handshake": "QA-002",
  "comments": "Runs every Friday at 5 PM",
  "documentation": "http://docs.company.com/auto002"
}
```

#### API Integration
```json
{
  "air_id": "AUTO003",
  "name": "Customer Data Sync",
  "type": "API",
  "brief_description": "Synchronizes customer data between systems",
  "coe_fed": "IT",
  "complexity": "High",
  "tool_version": "Python 3.11",
  "process_details": "Syncs customer data between CRM and ERP systems",
  "object_details": "Customer records, API endpoints",
  "queue": "integration_queue",
  "shared_folders": "\\\\shared\\\\integration\\\\logs",
  "shared_mailboxes": "integration@company.com",
  "qa_handshake": "QA-003",
  "comments": "Real-time sync, handles 1000+ records/hour",
  "documentation": "http://docs.company.com/auto003"
}
```

### Testing the Application

#### 🧪 Backend Tests
```bash
cd backend
python manage.py test
```

#### 🧪 Frontend Tests
```bash
cd frontend
npm test
```

#### 🧪 API Testing
Use the interactive documentation to test API endpoints:
- **FastAPI Swagger UI**: `http://localhost:8001/docs`
- **Postman Collection**: Import the API endpoints for testing
- **curl Examples**: See the FastAPI README for detailed examples

## ⚙️ Configuration

### Environment Variables

#### Backend Configuration
The backend uses Django settings for configuration:

```python
# backend/automation_db/settings.py
DEBUG = True  # Set to False in production
ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # Add your domain in production

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",  # Django
    "http://localhost:8001",  # FastAPI
]
```

#### Frontend Configuration
The frontend uses environment variables for configuration:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001  # FastAPI endpoint
NEXT_PUBLIC_DJANGO_URL=http://localhost:8000  # Django endpoint
```

### Port Configuration
Default ports used by the application:
- **Django**: 8000
- **FastAPI**: 8001
- **React**: 3000

To change ports, modify:
- **Django**: `python manage.py runserver <port>`
- **FastAPI**: Update `uvicorn.run(app, host="0.0.0.0", port=<port>)` in `fastapi_app.py`
- **React**: `npm run dev -- --port <port>`

### Database Configuration

#### SQLite (Default)
- **File**: `backend/db.sqlite3`
- **No setup required**: Works out of the box
- **Good for**: Development, small deployments

#### PostgreSQL (Production)
```python
# backend/automation_db/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'automation_db',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### CORS Configuration
For production, configure CORS properly:

```python
# backend/automation_db/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://your-api-domain.com",
]

# FastAPI CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)
```

## 🛠️ Development Guide

### Development Workflow

#### 1. Setting up Development Environment
```bash
# Clone and setup
git clone https://github.com/issaczerubbabela/db-django.git
cd db-django

# Use quick setup
./setup_all.sh  # or setup_all.bat on Windows
```

#### 2. Making Changes

**Backend Changes (Django/FastAPI):**
```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Make your changes to:
# - models.py (database models)
# - views.py (Django views)
# - fastapi_app.py (FastAPI endpoints)
# - serializers.py (data serialization)

# Run migrations if model changes
python manage.py makemigrations
python manage.py migrate

# Test your changes
python manage.py test
```

**Frontend Changes (React):**
```bash
cd frontend

# Make your changes to:
# - src/app/components/ (React components)
# - src/app/page.js (main page)
# - src/app/globals.css (styles)

# Test your changes
npm run dev
npm run build  # Test production build
```

#### 3. Adding New Features

**Adding a New API Endpoint:**
1. **Django**: Add to `backend/automations/views.py` and `urls.py`
2. **FastAPI**: Add to `backend/fastapi_app.py`
3. **Frontend**: Update component to use new endpoint

**Adding a New Database Field:**
1. Update `backend/automations/models.py`
2. Create migration: `python manage.py makemigrations`
3. Apply migration: `python manage.py migrate`
4. Update serializers in `backend/automations/serializers.py`
5. Update FastAPI Pydantic models in `backend/fastapi_app.py`
6. Update frontend components to handle new field

**Adding a New React Component:**
1. Create component in `frontend/src/app/components/`
2. Import and use in parent components
3. Add styling with Tailwind CSS
4. Test responsiveness

### Code Style Guidelines

#### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints where possible
- Document functions with docstrings
- Use meaningful variable names

```python
# Good
def get_automation_by_id(air_id: str) -> Optional[Automation]:
    """
    Retrieve an automation by its AIR ID.
    
    Args:
        air_id: The unique automation identifier
        
    Returns:
        Automation object or None if not found
    """
    try:
        return Automation.objects.get(air_id=air_id)
    except Automation.DoesNotExist:
        return None
```

#### JavaScript (Frontend)
- Use ES6+ features
- Use async/await for API calls
- Follow React best practices
- Use meaningful component names

```javascript
// Good
const AutomationCard = ({ automation, onEdit, onDelete }) => {
  const handleEdit = async () => {
    try {
      await onEdit(automation.air_id);
    } catch (error) {
      console.error('Error editing automation:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold">{automation.name}</h3>
      <p className="text-gray-600">{automation.brief_description}</p>
      <button onClick={handleEdit} className="mt-2 btn-primary">
        Edit
      </button>
    </div>
  );
};
```

### Database Migrations

#### Creating Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### Migration Best Practices
- Always backup data before migrations
- Test migrations on development data first
- Use descriptive migration names
- Document breaking changes

### Testing

#### Backend Testing
```bash
cd backend
python manage.py test automations.tests
```

#### Frontend Testing
```bash
cd frontend
npm test
npm run test:watch  # Watch mode
```

#### API Testing
```bash
# Using curl
curl -X GET http://localhost:8001/api/automations/
curl -X POST http://localhost:8001/api/automations/ \
  -H "Content-Type: application/json" \
  -d '{"air_id": "TEST001", "name": "Test", "type": "Process"}'
```

### Debugging

#### Backend Debugging
```python
# Add to your code for debugging
import pdb; pdb.set_trace()

# Or use Django debug toolbar
# Add to settings.py
INSTALLED_APPS = [
    # ... other apps
    'debug_toolbar',
]

MIDDLEWARE = [
    # ... other middleware
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]
```

#### Frontend Debugging
```javascript
// Use browser console
console.log('Debug info:', automation);

// Use React DevTools
// Install React DevTools browser extension

// Use Next.js debugging
// Add to next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}
```

### Performance Optimization

#### Backend Optimization
- Use database indexes on frequently queried fields
- Implement caching for expensive operations
- Use Django's `select_related()` and `prefetch_related()`
- Optimize database queries

#### Frontend Optimization
- Use React.memo for component memoization
- Implement virtual scrolling for large lists
- Optimize bundle size with code splitting
- Use Next.js Image component for optimized images

### Git Workflow

#### Branch Strategy
```bash
# Main branches
main        # Production-ready code
develop     # Integration branch

# Feature branches
feature/add-search-functionality
feature/improve-ui-design
bugfix/fix-api-error
```

#### Commit Messages
```bash
# Good commit messages
feat: add search functionality to automations
fix: resolve API timeout issue
docs: update README with installation guide
refactor: improve code structure in AutomationForm
```

### Deployment Preparation

#### Backend Deployment
```python
# settings.py for production
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']

# Use environment variables
import os
SECRET_KEY = os.environ.get('SECRET_KEY')
DATABASE_URL = os.environ.get('DATABASE_URL')
```

#### Frontend Deployment
```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

## � Deployment

### Production Deployment

#### Backend Deployment Options

**Option 1: Traditional Server (Ubuntu/CentOS)**
```bash
# 1. Install dependencies
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx

# 2. Clone and setup
git clone https://github.com/issaczerubbabela/db-django.git
cd db-django/backend

# 3. Create production environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# 4. Configure production settings
export DEBUG=False
export SECRET_KEY=your-secret-key
export ALLOWED_HOSTS=your-domain.com

# 5. Setup database
python manage.py collectstatic
python manage.py migrate

# 6. Start with Gunicorn
gunicorn automation_db.wsgi:application --bind 0.0.0.0:8000
```

**Option 2: Docker Deployment**
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["gunicorn", "automation_db.wsgi:application", "--bind", "0.0.0.0:8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Option 3: Cloud Deployment (AWS/GCP/Azure)**
- Use services like AWS Elastic Beanstalk, Google App Engine, or Azure App Service
- Configure environment variables through cloud console
- Set up database service (RDS, Cloud SQL, etc.)

#### Frontend Deployment Options

**Option 1: Vercel (Recommended)**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. From frontend directory
cd frontend
vercel

# 3. Configure environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

**Option 2: Netlify**
```bash
# 1. Build the app
npm run build

# 2. Deploy to Netlify
# Upload the .next folder to Netlify
# Configure environment variables in Netlify dashboard
```

**Option 3: Traditional Server**
```bash
# 1. Build the app
npm run build

# 2. Use PM2 for process management
npm install -g pm2
pm2 start npm --name "automation-frontend" -- start

# 3. Configure Nginx as reverse proxy
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Production Checklist

#### Security
- [ ] Set `DEBUG = False` in Django settings
- [ ] Use environment variables for secrets
- [ ] Configure proper CORS settings
- [ ] Use HTTPS in production
- [ ] Set up proper authentication if needed
- [ ] Regular security updates

#### Performance
- [ ] Enable gzip compression
- [ ] Use CDN for static files
- [ ] Implement database connection pooling
- [ ] Set up caching (Redis/Memcached)
- [ ] Monitor application performance

#### Monitoring
- [ ] Set up logging
- [ ] Configure error tracking (Sentry)
- [ ] Monitor server resources
- [ ] Set up uptime monitoring
- [ ] Database monitoring

#### Backup
- [ ] Set up database backups
- [ ] Configure automated backups
- [ ] Test backup restoration
- [ ] Document backup procedures

### Environment Variables for Production

#### Backend (.env)
```bash
DEBUG=False
SECRET_KEY=your-very-secure-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgres://user:pass@host:port/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

#### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_DJANGO_URL=https://your-django-domain.com
```

### Scaling Considerations

#### Horizontal Scaling
- Use load balancers for multiple backend instances
- Implement session storage (Redis)
- Use external database service
- Configure CDN for static assets

#### Vertical Scaling
- Monitor resource usage
- Optimize database queries
- Implement caching strategies
- Use connection pooling

### Monitoring and Maintenance

#### Application Monitoring
```bash
# Install monitoring tools
pip install sentry-sdk django-prometheus

# Configure in Django settings
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
)
```

#### Server Monitoring
- Use tools like New Relic, Datadog, or Prometheus
- Monitor CPU, memory, disk usage
- Set up alerts for critical metrics
- Regular health checks

#### Database Maintenance
- Regular backups
- Index optimization
- Query performance monitoring
- Database size monitoring

## � Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
**Problem**: `OSError: [Errno 98] Address already in use`

**Solutions**:
```bash
# Windows
taskkill /F /IM python.exe
netstat -ano | findstr :8000

# Linux/Mac
lsof -ti:8000 | xargs kill -9
pkill -f python
```

#### 2. Database Issues
**Problem**: `django.db.utils.OperationalError: no such table: automations`

**Solutions**:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate

# If still issues, reset database
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

#### 3. CORS Issues
**Problem**: `Access to fetch at 'http://localhost:8001/api/automations/' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solutions**:
```python
# Check backend/automation_db/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8001",
]

# Ensure corsheaders is installed
pip install django-cors-headers
```

#### 4. Frontend API Errors
**Problem**: `TypeError: Failed to fetch`

**Solutions**:
```bash
# Check frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001

# Verify backend is running
curl http://localhost:8001/api/automations/

# Check browser console for detailed errors
```

#### 5. Module Import Errors
**Problem**: `ModuleNotFoundError: No module named 'django'`

**Solutions**:
```bash
# Ensure virtual environment is activated
cd backend
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### 6. NPM/Node.js Issues
**Problem**: `npm ERR! code ENOENT`

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Update Node.js to latest LTS version
```

#### 7. FastAPI Import Errors
**Problem**: `ImportError: cannot import name 'Automation' from 'automations.models'`

**Solutions**:
```bash
# Ensure Django is properly configured
cd backend
python -c "import django; django.setup(); from automations.models import Automation; print('Success')"

# Check DJANGO_SETTINGS_MODULE
export DJANGO_SETTINGS_MODULE=automation_db.settings
```

#### 8. Permission Errors
**Problem**: `PermissionError: [Errno 13] Permission denied`

**Solutions**:
```bash
# Linux/Mac - fix file permissions
chmod +x setup.sh start_servers.sh

# Windows - run as administrator
# Right-click Command Prompt → Run as administrator
```

#### 9. Database Migration Conflicts
**Problem**: `django.db.migrations.exceptions.InconsistentMigrationHistory`

**Solutions**:
```bash
# Reset migrations
cd backend
rm -rf automations/migrations/
python manage.py makemigrations automations
python manage.py migrate
```

#### 10. Static Files Issues
**Problem**: CSS/JS files not loading

**Solutions**:
```bash
# Collect static files
cd backend
python manage.py collectstatic

# Check Django settings
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### Debugging Tips

#### Backend Debugging
```python
# Add logging to views
import logging
logger = logging.getLogger(__name__)

def my_view(request):
    logger.info(f"Request: {request.method} {request.path}")
    # ... your code
```

#### Frontend Debugging
```javascript
// Enable detailed logging
console.log('API Response:', response);
console.error('Error details:', error);

// Use React DevTools
// Install React DevTools browser extension
```

### Log Files and Monitoring

#### Django Logs
```bash
# Terminal output where you ran:
python manage.py runserver

# Add to settings.py for file logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'root': {
        'handlers': ['file'],
    },
}
```

#### FastAPI Logs
```bash
# Terminal output where you ran:
python fastapi_app.py

# Add structured logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

#### Frontend Logs
```bash
# Browser console (F12)
# Terminal output where you ran:
npm run dev

# Next.js logs in .next folder
```

### Performance Issues

#### Slow API Responses
```python
# Add database indexes
class Automation(models.Model):
    air_id = models.CharField(max_length=100, unique=True, primary_key=True, db_index=True)
    name = models.CharField(max_length=500, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['type', 'complexity']),
            models.Index(fields=['created_at']),
        ]
```

#### Large Dataset Handling
```python
# Use pagination
from django.core.paginator import Paginator

def get_automations(request):
    automations = Automation.objects.all()
    paginator = Paginator(automations, 25)  # Show 25 per page
    page = request.GET.get('page')
    return paginator.get_page(page)
```

### Getting Help

#### Check Documentation
- **Django**: https://docs.djangoproject.com/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Next.js**: https://nextjs.org/docs

#### Common Resources
- **Stack Overflow**: Tag questions with relevant technology
- **GitHub Issues**: Check project issues for known problems
- **Community Forums**: Django, React, and FastAPI communities

#### Debug Information to Collect
When reporting issues, include:
- Operating system and version
- Python version (`python --version`)
- Node.js version (`node --version`)
- Error messages (full stack trace)
- Steps to reproduce the issue
- Console logs from browser (for frontend issues)

### Emergency Recovery

#### Complete Reset
If everything is broken:
```bash
# 1. Clean everything
rm -rf backend/venv
rm -rf frontend/node_modules
rm backend/db.sqlite3

# 2. Restart from scratch
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser

cd ../frontend
npm install

# 3. Test basic functionality
cd ../backend
python manage.py runserver &
python fastapi_app.py &
cd ../frontend
npm run dev
```

#### Backup and Restore
```bash
# Backup database
cp backend/db.sqlite3 backend/db.sqlite3.backup

# Restore database
cp backend/db.sqlite3.backup backend/db.sqlite3
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

We welcome contributions to the Automation Database System! Here's how you can help:

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/db-django.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Set up development environment: `./setup_all.sh`

### Making Changes
1. Make your changes following the code style guidelines
2. Add tests for new functionality
3. Update documentation if needed
4. Test your changes thoroughly

### Submitting Changes
1. Commit your changes: `git commit -m 'Add amazing feature'`
2. Push to your branch: `git push origin feature/amazing-feature`
3. Submit a pull request

### Code Review Process
- All pull requests require review
- Automated tests must pass
- Code must follow style guidelines
- Documentation must be updated

### Types of Contributions
- **Bug fixes**: Fix issues and improve stability
- **New features**: Add functionality to enhance the system
- **Documentation**: Improve guides, examples, and API docs
- **Performance**: Optimize code and database queries
- **Testing**: Add or improve test coverage

## 📧 Support

### Getting Help
- **Documentation**: Check this README and the FastAPI README
- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our community for support and collaboration

### Reporting Issues
When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, Python/Node versions)
- Error messages or logs

### Feature Requests
We love hearing about new feature ideas! Please:
- Check existing issues first
- Describe the use case
- Explain the expected behavior
- Consider implementation complexity

### Contact
- **Repository**: https://github.com/issaczerubbabela/db-django
- **Issues**: https://github.com/issaczerubbabela/db-django/issues
- **Discussions**: https://github.com/issaczerubbabela/db-django/discussions

---

**Happy automating! 🚀**

### Quick Links
- **Live Demo**: [Coming Soon]
- **API Documentation**: http://localhost:8001/docs (when running locally)
- **GitHub Repository**: https://github.com/issaczerubbabela/db-django
- **Issue Tracker**: https://github.com/issaczerubbabela/db-django/issues

### Tech Stack Summary
- **Backend**: Django 5.0.6 + FastAPI + SQLite
- **Frontend**: React 19 + Next.js 15 + Tailwind CSS 4
- **API**: RESTful with automatic OpenAPI documentation
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Ready for implementation
- **Deployment**: Docker-ready, cloud-friendly

### Key Features Summary
✅ **Complete CRUD Operations** - Create, Read, Update, Delete  
✅ **Real-time Search** - Search across multiple fields  
✅ **Bulk Operations** - Handle multiple records efficiently  
✅ **CSV Import/Export** - Easy data management  
✅ **Responsive Design** - Works on all devices  
✅ **API Documentation** - Interactive Swagger UI  
✅ **Type Safety** - Full validation with Pydantic  
✅ **Modern UI** - Clean, professional interface  
✅ **Fast Performance** - Optimized for speed  
✅ **Easy Setup** - One-command installation  

---

*This project is actively maintained and continuously improved. Star ⭐ the repository if you find it useful!*
