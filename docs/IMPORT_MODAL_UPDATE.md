# Import Modal Template Headers Update

## Summary
Updated the ImportModal component's template headers to align with the Django models structure, fixed the example CSV file format, and added data transformation for proper API integration.

## Changes Made

### 1. ImportModal Template Headers Update
The template headers in `ImportModal.js` have been updated to match the database schema:

#### Core Automation Fields (from Automation model):
- `air_id`, `name`, `type`, `brief_description`, `coe_fed`, `complexity`
- `tool_name`, `tool_version`, `process_details`, `object_details`, `queue`
- `shared_folders`, `shared_mailboxes`, `qa_handshake`
- `preprod_deploy_date`, `prod_deploy_date`, `warranty_end_date`
- `comments`, `documentation`, `modified`, `modified_by`, `path`
- `created_at`, `updated_at`

#### Person Roles (from AutomationPersonRole model):
- `project_manager`, `project_designer`, `developer`, `tester`
- `business_spoc`, `business_stakeholders`, `app_owner`

#### Environment Configurations (from Environment model):
- `dev_vdi`, `dev_service_account`
- `qa_vdi`, `qa_service_account`
- `uat_vdi`, `uat_service_account`
- `prod_vdi`, `prod_service_account`

#### Test Data (from TestData model):
- `test_data_spoc`

#### Metrics (from Metrics model):
- `post_prod_total_cases`, `post_prod_sys_ex_count`, `post_prod_success_rate`

#### Artifacts (from Artifacts model):
- `artifacts_link`, `code_review`, `demo`, `rampup_issue_list`

### 2. CSV File Headers Updated
Both `example_automation_data.csv` and `test_import.csv` have been updated with the new header format that matches the template headers.

### 3. Date Validation Enhanced
Added `created_at` and `updated_at` fields to the date validation logic in the ImportModal.

### 4. Data Transformation for API Integration
Added `transformDataForAPI()` function that transforms CSV data to match Django backend expectations:

#### Field Transformations:
- `modified_by` → `modified_by_name` (for Person lookup/creation)
- Person role fields → `people_data` array with proper role mapping
- Environment fields → `environments_data` array grouped by environment type
- `test_data_spoc` → `test_data_data` object
- Metrics fields → `metrics_data` object
- Artifacts fields → `artifacts_data` object

#### Role Mapping:
- `project_manager` → `'project_manager'`
- `project_designer` → `'project_designer'`
- `developer` → `'developer'`
- `tester` → `'tester'`
- `business_spoc` → `'business_spoc'`
- `business_stakeholders` → `'business_stakeholder'` (supports multiple people separated by semicolon)
- `app_owner` → `'app_owner'`

## New CSV Import Format

The CSV files should now use these exact column headers:
```
air_id,name,type,brief_description,coe_fed,complexity,tool_name,tool_version,process_details,object_details,queue,shared_folders,shared_mailboxes,qa_handshake,preprod_deploy_date,prod_deploy_date,warranty_end_date,comments,documentation,modified,modified_by,path,created_at,updated_at,project_manager,project_designer,developer,tester,business_spoc,business_stakeholders,app_owner,dev_vdi,dev_service_account,qa_vdi,qa_service_account,uat_vdi,uat_service_account,prod_vdi,prod_service_account,test_data_spoc,post_prod_total_cases,post_prod_sys_ex_count,post_prod_success_rate,artifacts_link,code_review,demo,rampup_issue_list
```

## Model Mapping

### Database Schema Alignment:
- **Automation**: Core automation fields map directly to the Automation model
- **Tool**: `tool_name` maps to Tool.name (foreign key relationship, auto-created if not exists)
- **Person**: Person names in role fields map to Person.name (foreign key relationships, auto-created if not exists)
- **AutomationPersonRole**: Role fields create relationships between automations and people
- **Environment**: Environment fields (dev/qa/uat/prod) map to Environment model records
- **TestData**: `test_data_spoc` maps to TestData.spoc
- **Metrics**: Metrics fields map directly to Metrics model
- **Artifacts**: Artifacts fields map directly to Artifacts model

## API Integration

The transformation function handles:
1. **Person Creation**: Automatically creates Person records if they don't exist
2. **Tool Creation**: Automatically creates Tool records if they don't exist  
3. **Nested Data**: Properly structures data for related models
4. **Multiple People**: Handles semicolon-separated business stakeholders
5. **Environment Grouping**: Groups VDI and service account fields by environment type

## Required Fields
The following fields are required for import:
- `air_id` (Primary Key)
- `name`
- `type`

All other fields are optional and will be handled with proper null values if not provided.

## Date Format
Date fields should be in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
Example: `2024-01-15T09:30:00Z`

## Error Handling
- Improved error message display with detailed JSON error responses
- Proper handling of validation errors from the Django backend
- Graceful handling of missing or malformed data

## Testing
Use `test_import.csv` for testing the import functionality with the new format.
