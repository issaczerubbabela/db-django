# Import Modal Data Transformation Test

This document shows how the ImportModal transforms CSV data to match the Django backend API format.

## Sample CSV Row:
```csv
air_id: "AIR-2024-001"
name: "Invoice Processing Automation"
type: "RPA"
modified_by: "John Smith"
tool_name: "UiPath"
project_manager: "Sarah Johnson"
developer: "David Rodriguez"
business_stakeholders: "Emily Davis; Michael Torres"
dev_vdi: "DEV-VDI-01"
dev_service_account: "svc_rpa_dev"
post_prod_total_cases: "1250"
artifacts_link: "https://artifacts.company.com/AIR-2024-001"
```

## Transformed API Payload:
```json
{
  "air_id": "AIR-2024-001",
  "name": "Invoice Processing Automation", 
  "type": "RPA",
  "modified_by_name": "John Smith",
  "tool_name": "UiPath",
  "people_data": [
    { "name": "Sarah Johnson", "role": "project_manager" },
    { "name": "David Rodriguez", "role": "developer" },
    { "name": "Emily Davis", "role": "business_stakeholder" },
    { "name": "Michael Torres", "role": "business_stakeholder" }
  ],
  "environments_data": [
    {
      "type": "dev",
      "vdi": "DEV-VDI-01", 
      "service_account": "svc_rpa_dev"
    }
  ],
  "metrics_data": {
    "post_prod_total_cases": "1250"
  },
  "artifacts_data": {
    "artifacts_link": "https://artifacts.company.com/AIR-2024-001"
  }
}
```

## Key Transformations:

1. **Person Fields**: `modified_by` → `modified_by_name`
2. **Role Fields**: Individual role fields → `people_data` array
3. **Multiple People**: Semicolon-separated stakeholders → multiple objects in array  
4. **Environments**: VDI/service account fields grouped by type → `environments_data` array
5. **Metrics**: Individual fields → `metrics_data` object
6. **Artifacts**: Individual fields → `artifacts_data` object

## Backend Processing:

The Django `AutomationCreateSerializer` then:
- Creates/finds Person records by name
- Creates/finds Tool records by name  
- Creates related AutomationPersonRole records
- Creates related Environment records
- Creates related TestData, Metrics, and Artifacts records

This ensures referential integrity while allowing simple CSV import.
