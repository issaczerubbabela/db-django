#!/usr/bin/env python3

import requests
import json
import csv

def parse_csv_like_frontend(csv_file_path):
    """Parse CSV data using the same logic as the frontend"""
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    lines = [line for line in content.split('\n') if line.strip()]
    if len(lines) < 2:
        return []

    # Parse CSV headers
    headers = [h.strip().strip('"') for h in lines[0].split(',')]
    print(f"CSV Headers: {headers}")
    
    automations = []
    
    for i, line in enumerate(lines[1:], start=1):
        # Simple CSV parsing (assumes no commas in quoted fields for this test)
        values = [v.strip().strip('"') for v in line.split(',')]
        
        if len(values) == len(headers):
            automation = {}
            for header, value in zip(headers, values):
                automation[header] = value
            
            # Build the automation object using the same mapping as frontend
            cleaned_automation = {
                # Core fields
                'air_id': automation.get('AIR ID', '').strip() or '',
                'name': automation.get('Name', '').strip() or '',
                'type': automation.get('Type', '').strip() or '',
                'brief_description': automation.get('Brief Description', '').strip() or None,
                'coe_fed': automation.get('COE/FED', '').strip() or None,
                'complexity': automation.get('Complexity', '').strip() or None,
                'tool_version': automation.get('Tool Version', '').strip() or None,
                'process_details': automation.get('Process Details', '').strip() or None,
                'object_details': automation.get('Object Details', '').strip() or None,
                'queue': automation.get('Queue', '').strip() or None,
                'shared_folders': automation.get('Shared Folders', '').strip() or None,
                'shared_mailboxes': automation.get('Shared Mailboxes', '').strip() or None,
                'qa_handshake': automation.get('QA Handshake', '').strip() or None,
                'preprod_deploy_date': automation.get('PreProd Deploy Date', '').strip() or None,
                'prod_deploy_date': automation.get('Prod Deploy Date', '').strip() or None,
                'warranty_end_date': automation.get('Warranty End Date', '').strip() or None,
                'comments': automation.get('Comments', '').strip() or None,
                'documentation': automation.get('Documentation', '').strip() or None,
                'modified': automation.get('Modified', '').strip() or None,
                'path': automation.get('Path', '').strip() or None,
                
                # Tool name for backend processing
                'tool_name': automation.get('Tool', '').strip() or None,
                'modified_by_name': automation.get('Modified By', '').strip() or None,
                
                # Build nested data structures for related models
                'people_data': [],
                'environments_data': [],
                'test_data_data': {},
                'metrics_data': {},
                'artifacts_data': {}
            }
            
            # Parse people data from role fields
            people_roles = []
            
            if automation.get('Project Manager', '').strip():
                people_roles.append({'role': 'project_manager', 'name': automation['Project Manager'].strip()})
            if automation.get('Project Designer', '').strip():
                people_roles.append({'role': 'project_designer', 'name': automation['Project Designer'].strip()})
            if automation.get('Developer', '').strip():
                people_roles.append({'role': 'developer', 'name': automation['Developer'].strip()})
            if automation.get('Tester', '').strip():
                people_roles.append({'role': 'tester', 'name': automation['Tester'].strip()})
            if automation.get('Business SPOC', '').strip():
                people_roles.append({'role': 'business_spoc', 'name': automation['Business SPOC'].strip()})
            if automation.get('Applications-App Owner', '').strip():
                people_roles.append({'role': 'app_owner', 'name': automation['Applications-App Owner'].strip()})
            
            # Handle Business Stakeholders (might be multiple, separated by semicolon)
            if automation.get('Business Stakeholders', '').strip():
                stakeholders = automation['Business Stakeholders'].split(';')
                for stakeholder in stakeholders:
                    if stakeholder.strip():
                        people_roles.append({'role': 'business_stakeholder', 'name': stakeholder.strip()})
            
            cleaned_automation['people_data'] = people_roles
            
            # Parse environment data
            environments = []
            
            if automation.get('Dev VDI', '').strip() or automation.get('Dev Service Account', '').strip():
                environments.append({
                    'type': 'dev',
                    'vdi': automation.get('Dev VDI', '').strip() or '',
                    'service_account': automation.get('Dev Service Account', '').strip() or ''
                })
            
            if automation.get('QA VDI', '').strip() or automation.get('QA Service Account', '').strip():
                environments.append({
                    'type': 'qa',
                    'vdi': automation.get('QA VDI', '').strip() or '',
                    'service_account': automation.get('QA Service Account', '').strip() or ''
                })
            
            if automation.get('Production VDI', '').strip() or automation.get('Production Service Account', '').strip():
                environments.append({
                    'type': 'prod',
                    'vdi': automation.get('Production VDI', '').strip() or '',
                    'service_account': automation.get('Production Service Account', '').strip() or ''
                })
            
            cleaned_automation['environments_data'] = environments
            
            # Parse test data
            if automation.get('Test Data SPOC', '').strip():
                cleaned_automation['test_data_data'] = {'spoc': automation['Test Data SPOC'].strip()}
            
            # Parse metrics data
            total_cases = automation.get('Post Production Total Cases', '').strip()
            exceptions_count = automation.get('Post Production System Exceptions Count', '').strip()
            success_rate = automation.get('Post Production Success Rate', '').strip()
            
            if total_cases or exceptions_count or success_rate:
                metrics = {}
                if total_cases:
                    try:
                        metrics['post_prod_total_cases'] = int(total_cases)
                    except ValueError:
                        pass
                if exceptions_count:
                    try:
                        metrics['post_prod_sys_ex_count'] = int(exceptions_count)
                    except ValueError:
                        pass
                if success_rate:
                    try:
                        metrics['post_prod_success_rate'] = float(success_rate)
                    except ValueError:
                        pass
                
                if metrics:
                    cleaned_automation['metrics_data'] = metrics
            
            # Parse artifacts data
            artifacts_link = automation.get('Automation Artifacts Link', '').strip()
            code_review = automation.get('Code Review with M&E', '').strip()
            demo = automation.get('Automation Demo to M&E', '').strip()
            rampup_issue = automation.get('Rampup/Postprod Issue/Resolution list to M&E', '').strip()
            
            if artifacts_link or code_review or demo or rampup_issue:
                cleaned_automation['artifacts_data'] = {
                    'artifacts_link': artifacts_link or None,
                    'code_review': code_review or None,
                    'demo': demo or None,
                    'rampup_issue_list': rampup_issue or None
                }
            
            # Ensure required fields exist and are not empty
            if cleaned_automation['air_id'] and cleaned_automation['name'] and cleaned_automation['type']:
                automations.append(cleaned_automation)
                print(f"Parsed automation {i}: {cleaned_automation['air_id']} - {cleaned_automation['name']}")
            else:
                print(f"Skipping automation on line {i}: missing required fields")
                print(f"  AIR ID: '{cleaned_automation['air_id']}'")
                print(f"  Name: '{cleaned_automation['name']}'")
                print(f"  Type: '{cleaned_automation['type']}'")
        else:
            print(f"Line {i} has {len(values)} values but expected {len(headers)}")
    
    return automations

def test_csv_import():
    """Test CSV import functionality"""
    
    # Parse the real CSV file
    csv_file = 'd:/Repositories/db-django/samples/example_automation_data.csv'
    automations = parse_csv_like_frontend(csv_file)
    
    print(f"\nParsed {len(automations)} automations from CSV")
    
    if not automations:
        print("No automations to import!")
        return
    
    # Test importing the first automation
    first_automation = automations[0]
    print(f"\nTesting import of first automation: {first_automation['air_id']}")
    print(f"Data: {json.dumps(first_automation, indent=2)}")
    
    url = 'http://127.0.0.1:8000/api/automations/'
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, headers=headers, json=first_automation)
        print(f"\nResponse Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ SUCCESS: First automation imported successfully!")
            result = response.json()
            print(f"Created automation with AIR ID: {result['air_id']}")
        else:
            print("❌ FAILED: Automation import failed")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == '__main__':
    test_csv_import()
