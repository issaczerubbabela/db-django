# Automation Database System - Django + FastAPI + React

A comprehensive automation database management system featuring a normalized database structure, RESTful APIs, and a modern React frontend. This system tracks all aspects of automation projects including people, environments, metrics, artifacts, and timelines.

## 🆕 **LATEST UPDATE: Complete Field Implementation**

**ALL 43 AUTOMATION FIELDS NOW FULLY IMPLEMENTED** with normalized database structure:

✅ Basic Information (6 fields)  
✅ Technical Details (8 fields)  
✅ People & Roles (7 roles - normalized)  
✅ Environment Details (6 environment fields - normalized)  
✅ Quality Assurance (2 fields)  
✅ Artifacts & Documentation (4 fields - normalized)  
✅ Timeline (3 fields)  
✅ Metrics (3 fields - normalized)  
✅ Additional Information (4 fields)  

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed field mapping and implementation status.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Git

### Installation & Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd db-django
   ./setup_all.bat    # Windows
   # or
   ./setup_all.sh     # Linux/Mac
   ```

2. **Start All Services**
   ```bash
   ./start_all.bat    # Windows  
   # or
   ./start_all.sh     # Linux/Mac
   ```

3. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Django Admin**: http://localhost:8000/admin
   - **FastAPI**: http://localhost:8001
   - **API Docs**: http://localhost:8001/docs

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   FastAPI       │    │   Django        │
│   (Frontend)    │────│   (API Layer)   │────│   (Database)    │
│   Port: 3000    │    │   Port: 8001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 15 + React + Tailwind CSS
- **API Layer**: FastAPI with automatic documentation
- **Backend**: Django 5.1 with Django REST Framework
- **Database**: SQLite (production-ready, easily configurable)
- **Authentication**: Django Admin + Custom forms

## 🗄️ Database Schema

### Normalized Database Structure

The system uses a properly normalized database structure to eliminate redundancy and ensure data integrity:

#### Core Tables

**automations** (Main table)
- Basic automation information
- References to normalized related data

**tools**
- Normalized tool information
- Eliminates tool name duplication

**people** 
- Centralized person information
- Used across multiple roles and relationships

#### Relationship Tables

**automation_people_roles**
- Many-to-many relationship between automations and people
- Supports multiple people per role, multiple roles per person

**environments**
- Environment-specific details (Dev, QA, UAT, Prod)
- VDI and service account information

**test_data**
- Test data management information
- Links to test data SPOCs

**metrics**
- Post-production performance metrics
- Success rates, case counts, exception tracking

**artifacts**
- Documentation and artifact tracking
- Status tracking for reviews, demos, and issue lists

### Key Benefits of Normalization
- **Data Integrity**: Foreign key constraints ensure valid relationships
- **No Redundancy**: Person names, tools stored once and referenced
- **Scalability**: Easy to add new roles, environments, or status types
- **Reporting**: Efficient queries across related data

## 🎯 Features

### Comprehensive Data Management
- **All 43 automation fields** supported and implemented
- **Normalized data structure** for better data integrity
- **Rich relationships** between automations, people, environments
- **Full audit trail** with created/updated timestamps

### Advanced User Interface
- **Tabbed Form Interface**: 8 organized tabs for data entry
- **Comprehensive Sidebar**: All fields displayed in organized sections  
- **Search & Filter**: Advanced filtering across all fields
- **Inline Editing**: Quick edit capability for key fields
- **Responsive Design**: Works on desktop and mobile

### API & Integration
- **RESTful FastAPI**: High-performance async API
- **Auto-generated Documentation**: Interactive API docs
- **Django Admin**: Full administrative interface
- **Bulk Operations**: Import/export, bulk create/delete

### Import/Export Capabilities
- **CSV Import**: Supports flat CSV with automatic normalization
- **Excel Export**: All fields in spreadsheet format
- **JSON Export**: Full nested data structure
- **Flexible Export**: Selected items, filtered results, or complete dataset

## 📊 Complete Field Coverage

### Basic Information
1. AIR ID (Primary Key)
2. Automation Name  
3. Automation Type
4. Brief Description
5. COE/FED
6. Automation Complexity

### Technical Details
7. Tool (normalized)
8. Tool Version
9. Process Details
10. Object Details
11. Queue
12. Shared Folders
13. Shared Mailboxes
14. Path

### People & Roles (Normalized)
15. Project Manager
16. Project Designer
17. Developer
18. Tester
19. Business SPOC
20. Business Stakeholders
21. Applications-App Owner

### Environment Details (Normalized)
22. Dev VDI
23. Dev Service Account
24. QA VDI
25. QA Service Account
26. Production VDI
27. Production Service Account

### Quality Assurance
28. Test Data SPOC
29. QA Handshake

### Artifacts & Documentation (Normalized)
30. Automation Artifacts Link
31. Code Review with M&E
32. Automation Demo to M&E
33. Rampup/Postprod Issue/Resolution list to M&E

### Timeline
34. PreProd Deployment Date
35. Prod Deployment Date
36. Warranty End Date

### Metrics (Normalized)
37. Post Production Total Cases
38. Post Production System Exceptions Count
39. Post Production Success Rate

### Additional Information
40. Comments
41. Documentation  
42. Modified
43. Modified By

## 🔧 Development

### Backend Development
```bash
cd backend
python manage.py runserver 8000      # Django
python fastapi_app.py                # FastAPI (port 8001)
```

### Frontend Development
```bash
cd frontend  
npm run dev                          # Next.js (port 3000)
```

### Database Management
```bash
cd backend
python manage.py makemigrations      # Create migrations
python manage.py migrate             # Apply migrations
python manage.py populate_defaults   # Add default tools/people
python manage.py createsuperuser     # Create admin user
```

## 📡 API Endpoints

### FastAPI (Primary API)
- `GET /api/automations/` - List all automations with related data
- `GET /api/automations/{air_id}/` - Get specific automation
- `POST /api/automations/` - Create new automation with nested data
- `PUT /api/automations/{air_id}/` - Update automation
- `DELETE /api/automations/{air_id}/` - Delete automation
- `POST /api/automations/bulk/` - Bulk create automations
- `DELETE /api/automations/bulk/` - Bulk delete automations

### Django REST Framework
- Full CRUD operations available
- Admin interface at `/admin/`
- Browsable API interface

## 🔍 Search & Filter

The system supports comprehensive search and filtering:

- **Text Search**: Across AIR ID, name, type, description
- **Type Filter**: Filter by automation type
- **Complexity Filter**: Low, Medium, High
- **COE/FED Filter**: Filter by classification
- **Description Filter**: With/without description
- **Date Range Filter**: Filter by creation date

## 📤 Export Options

### Export Formats
- **CSV**: All 43+ fields in flat format
- **JSON**: Full nested structure with relationships
- **Excel**: Tabulated format suitable for analysis

### Export Scopes
- **Selected Items**: Export only selected automations
- **Filtered Results**: Export current filtered view
- **Complete Dataset**: Export all data

### Flattened Export Structure
Complex nested data (people, environments, metrics) is intelligently flattened for spreadsheet compatibility while preserving all information.

## 🛠️ Configuration

### Environment Variables
Create `.env` files in respective directories:

**Backend (.env)**
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test              # Django tests
pytest                             # FastAPI tests (if pytest configured)
```

### Frontend Testing  
```bash
cd frontend
npm test                           # React component tests
npm run e2e                        # End-to-end tests (if configured)
```

## 🚢 Production Deployment

### Docker Deployment
```bash
docker-compose up -d               # Start all services
```

### Manual Deployment
1. Set `DEBUG=False` in Django settings
2. Configure production database (PostgreSQL recommended)
3. Set up proper CORS settings
4. Configure static file serving
5. Set up process managers (gunicorn, supervisor)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**Port Conflicts**
- Frontend automatically uses next available port
- Backend services can be configured in start scripts

**Database Issues**
- Run migrations: `python manage.py migrate`
- Reset database: Delete `db.sqlite3` and re-run migrations

**Missing Dependencies**
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

### Getting Help
- Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed field mapping
- Review API documentation at http://localhost:8001/docs
- Check Django admin for data verification at http://localhost:8000/admin

---

## 🏆 Project Status

**✅ COMPLETE**: All 43 automation fields implemented with normalized database structure, comprehensive API coverage, and modern user interface.

**Ready for Production Use** with full CRUD operations, advanced search/filter, comprehensive export capabilities, and proper data normalization.
