# FastAPI Integration for Automation Database

This document explains the FastAPI integration that provides a high-performance API layer for the Django-based Automation Database system.

## 🚀 Overview

The FastAPI integration (`fastapi_app.py`) provides a modern, high-performance API layer that coexists with the Django backend. It offers:

- **High Performance**: Built on Starlette and Pydantic for maximum speed
- **Automatic API Documentation**: Interactive Swagger UI and ReDoc
- **Type Safety**: Full type hints and validation with Pydantic
- **Async Support**: Asynchronous request handling
- **Django Integration**: Direct access to Django models and ORM

## 📋 Features

### Core Functionality
- **CRUD Operations**: Complete Create, Read, Update, Delete operations
- **Search**: Advanced search across multiple fields
- **Bulk Operations**: Create and delete multiple records at once
- **Data Validation**: Automatic request/response validation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

### API Documentation
- **Swagger UI**: Interactive API documentation at `/docs`
- **ReDoc**: Alternative documentation at `/redoc`
- **OpenAPI Schema**: Automatic schema generation

## 🏗️ Architecture

### Django Integration
```python
# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automation_db.settings')
django.setup()

# Import Django models
from automations.models import Automation
```

### Pydantic Models
The API uses Pydantic models for data validation and serialization:

- **`AutomationBase`**: Base model with all automation fields
- **`AutomationCreate`**: Model for creating new automations
- **`AutomationUpdate`**: Model for updating existing automations
- **`AutomationResponse`**: Model for API responses

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔗 API Endpoints

### Core Endpoints

#### 1. Get All Automations
```http
GET /api/automations/
```

**Parameters:**
- `search` (optional): Search term to filter automations

**Response:**
```json
[
  {
    "air_id": "AUTO001",
    "name": "Invoice Processing",
    "type": "Process",
    "brief_description": "Automated invoice processing system",
    "coe_fed": "Finance",
    "complexity": "Medium",
    "tool_version": "UiPath 2023.10",
    "process_details": "Process invoices from email",
    "object_details": "Invoice objects",
    "queue": "finance_queue",
    "shared_folders": "\\\\shared\\\\finance",
    "shared_mailboxes": "finance@company.com",
    "qa_handshake": "QA-001",
    "preprod_deploy_date": "2024-01-15T00:00:00",
    "prod_deploy_date": "2024-02-01T00:00:00",
    "warranty_end_date": "2025-02-01T00:00:00",
    "comments": "Working well",
    "documentation": "http://docs.company.com/auto001",
    "modified": "2024-01-10T00:00:00",
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-10T15:30:00"
  }
]
```

#### 2. Get Specific Automation
```http
GET /api/automations/{air_id}/
```

**Parameters:**
- `air_id`: Unique automation identifier

**Response:** Single automation object (same structure as above)

#### 3. Create New Automation
```http
POST /api/automations/
```

**Request Body:**
```json
{
  "air_id": "AUTO003",
  "name": "Data Backup",
  "type": "Process",
  "brief_description": "Daily data backup automation",
  "coe_fed": "IT",
  "complexity": "Low",
  "tool_version": "PowerShell 7.0",
  "process_details": "Backup database and files",
  "object_details": "Database and file objects",
  "queue": "backup_queue",
  "shared_folders": "\\\\shared\\\\backup",
  "shared_mailboxes": "backup@company.com",
  "qa_handshake": "QA-003",
  "preprod_deploy_date": "2024-03-01T00:00:00",
  "prod_deploy_date": "2024-03-15T00:00:00",
  "warranty_end_date": "2025-03-15T00:00:00",
  "comments": "Scheduled for 2 AM daily",
  "documentation": "http://docs.company.com/auto003",
  "modified": "2024-02-20T00:00:00"
}
```

#### 4. Update Automation
```http
PUT /api/automations/{air_id}/
```

**Request Body:** Same as create, but all fields are optional

#### 5. Partially Update Automation
```http
PATCH /api/automations/{air_id}/
```

**Request Body:** Only the fields you want to update

#### 6. Delete Automation
```http
DELETE /api/automations/{air_id}/
```

**Response:**
```json
{
  "message": "Automation AUTO003 deleted successfully"
}
```

### Bulk Operations

#### 7. Bulk Create Automations
```http
POST /api/automations/bulk/
```

**Request Body:**
```json
[
  {
    "air_id": "AUTO004",
    "name": "Email Processor",
    "type": "Process",
    // ... other fields
  },
  {
    "air_id": "AUTO005",
    "name": "Report Generator",
    "type": "Report",
    // ... other fields
  }
]
```

**Response:**
```json
{
  "message": "Created 2 automations",
  "created": [
    // ... created automation objects
  ]
}
```

#### 8. Bulk Delete Automations
```http
DELETE /api/automations/bulk/
```

**Request Body:**
```json
["AUTO004", "AUTO005", "AUTO006"]
```

**Response:**
```json
{
  "message": "Deleted 3 automations"
}
```

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
pip install fastapi uvicorn django pydantic
```

### 2. Configure Django Settings
Ensure your Django settings are properly configured:

```python
# automation_db/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'automations',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",  # FastAPI
]
```

### 3. Run the FastAPI Server
```bash
cd backend
python fastapi_app.py
```

The server will start on `http://localhost:8000`

## 📚 Usage Examples

### Python Client Example
```python
import requests
import json

# Base URL
BASE_URL = "http://localhost:8000"

# Get all automations
response = requests.get(f"{BASE_URL}/api/automations/")
automations = response.json()

# Search automations
response = requests.get(f"{BASE_URL}/api/automations/?search=invoice")
filtered_automations = response.json()

# Create new automation
new_automation = {
    "air_id": "AUTO999",
    "name": "Test Automation",
    "type": "Process",
    "brief_description": "Test automation for API",
    "complexity": "Low"
}

response = requests.post(
    f"{BASE_URL}/api/automations/",
    json=new_automation
)
created_automation = response.json()

# Update automation
update_data = {
    "name": "Updated Test Automation",
    "complexity": "Medium"
}

response = requests.patch(
    f"{BASE_URL}/api/automations/AUTO999/",
    json=update_data
)
updated_automation = response.json()

# Delete automation
response = requests.delete(f"{BASE_URL}/api/automations/AUTO999/")
result = response.json()
```

### JavaScript/React Example
```javascript
// API service
const API_BASE_URL = 'http://localhost:8000';

// Get all automations
async function getAutomations(search = '') {
  const url = search 
    ? `${API_BASE_URL}/api/automations/?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/api/automations/`;
  
  const response = await fetch(url);
  return await response.json();
}

// Create automation
async function createAutomation(automationData) {
  const response = await fetch(`${API_BASE_URL}/api/automations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(automationData),
  });
  return await response.json();
}

// Update automation
async function updateAutomation(airId, updateData) {
  const response = await fetch(`${API_BASE_URL}/api/automations/${airId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  return await response.json();
}

// Delete automation
async function deleteAutomation(airId) {
  const response = await fetch(`${API_BASE_URL}/api/automations/${airId}/`, {
    method: 'DELETE',
  });
  return await response.json();
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Configure database URL
DATABASE_URL=sqlite:///./db.sqlite3

# Optional: Configure CORS origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Optional: Configure debug mode
DEBUG=True
```

### Production Configuration
For production deployment, modify the CORS settings:

```python
# Allow specific origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "https://your-api-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)
```

## 🐛 Error Handling

The API provides comprehensive error handling:

### Common Error Responses

#### 400 Bad Request
```json
{
  "detail": "Automation with this AIR ID already exists"
}
```

#### 404 Not Found
```json
{
  "detail": "Automation not found"
}
```

#### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "air_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

## 📈 Performance

### Optimization Tips

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Query Optimization**: Use Django's `select_related()` and `prefetch_related()`
3. **Caching**: Implement Redis caching for frequent queries
4. **Pagination**: Add pagination for large datasets

### Monitoring
Monitor API performance using:
- **FastAPI's built-in metrics**
- **APM tools** (New Relic, Datadog)
- **Custom logging** for debugging

## 🧪 Testing

### Unit Tests
```python
# test_fastapi.py
import pytest
from fastapi.testclient import TestClient
from fastapi_app import app

client = TestClient(app)

def test_get_automations():
    response = client.get("/api/automations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_automation():
    automation_data = {
        "air_id": "TEST001",
        "name": "Test Automation",
        "type": "Process",
        "brief_description": "Test automation",
        "complexity": "Low"
    }
    
    response = client.post("/api/automations/", json=automation_data)
    assert response.status_code == 200
    assert response.json()["air_id"] == "TEST001"

def test_get_automation():
    response = client.get("/api/automations/TEST001/")
    assert response.status_code == 200
    assert response.json()["air_id"] == "TEST001"

def test_update_automation():
    update_data = {"name": "Updated Test Automation"}
    response = client.patch("/api/automations/TEST001/", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Test Automation"

def test_delete_automation():
    response = client.delete("/api/automations/TEST001/")
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]
```

### Run Tests
```bash
pytest test_fastapi.py -v
```

## 🚀 Deployment

### Development Server
```bash
python fastapi_app.py
```

### Production Server
```bash
# Using Uvicorn
uvicorn fastapi_app:app --host 0.0.0.0 --port 8000 --workers 4

# Using Gunicorn
gunicorn fastapi_app:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📋 Troubleshooting

### Common Issues

1. **Django Setup Error**
   ```
   django.core.exceptions.ImproperlyConfigured: Requested setting INSTALLED_APPS
   ```
   **Solution**: Ensure Django is properly configured before importing models

2. **CORS Error**
   ```
   Access to fetch at 'http://localhost:8000/api/automations/' from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   **Solution**: Check CORS middleware configuration

3. **Database Connection Error**
   ```
   django.db.utils.OperationalError: no such table: automations
   ```
   **Solution**: Run Django migrations first

4. **Port Already in Use**
   ```
   OSError: [Errno 98] Address already in use
   ```
   **Solution**: Kill existing processes or use a different port

### Debug Mode
Enable debug mode for detailed error messages:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, debug=True, reload=True)
```

## 📚 Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Pydantic Documentation**: https://pydantic-docs.helpmanual.io/
- **Django Documentation**: https://docs.djangoproject.com/
- **Uvicorn Documentation**: https://www.uvicorn.org/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes to `fastapi_app.py`
4. Add tests for new functionality
5. Update this documentation
6. Submit a pull request

---

**Happy API building! 🚀**
