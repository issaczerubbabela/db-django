#!/usr/bin/env python3

import requests
import json
import csv
import sys

def parse_csv_line(line):
    """Parse a CSV line handling quoted fields with commas"""
    result = []
    current = ''
    in_quotes = False
    
    for i, char in enumerate(line):
        if char == '"':
            in_quotes = not in_quotes
        elif char == ',' and not in_quotes:
            result.append(current.strip().strip('"'))
            current = ''
        else:
            current += char
    
    result.append(current.strip().strip('"'))
    return result

def parse_csv_data(csv_file_path):
    """Parse CSV data with proper quoted field handling"""
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    lines = [line for line in content.split('\n') if line.strip()]
    if len(lines) < 2:
        return []

    # Parse CSV headers
    headers = parse_csv_line(lines[0])
    print(f"Found {len(headers)} headers")
    
    automations = []
    
    for i, line in enumerate(lines[1:], start=1):
        values = parse_csv_line(line)
        
        if len(values) == len(headers):
            automation = {}
            for header, value in zip(headers, values):
                automation[header] = value if value.strip() else ''
            
            # Build the automation object
            cleaned_automation = {
                'air_id': automation.get('AIR ID', '').strip(),
                'name': automation.get('Name', '').strip(),
                'type': automation.get('Type', '').strip(),
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
                'tool_name': automation.get('Tool', '').strip() or None,
                'modified_by_name': automation.get('Modified By', '').strip() or None,
                'people_data': [],
                'environments_data': [],
                'test_data_data': {},
                'metrics_data': {},
                'artifacts_data': {}
            }
            
            # Parse people data
            people_roles = []
            role_mappings = [
                ('Project Manager', 'project_manager'),
                ('Project Designer', 'project_designer'),
                ('Developer', 'developer'),
                ('Tester', 'tester'),
                ('Business SPOC', 'business_spoc'),
                ('Applications-App Owner', 'app_owner')
            ]
            
            for csv_field, role in role_mappings:
                if automation.get(csv_field, '').strip():
                    people_roles.append({
                        'role': role,
                        'name': automation[csv_field].strip()
                    })
            
            # Handle multiple business stakeholders
            if automation.get('Business Stakeholders', '').strip():
                stakeholders = automation['Business Stakeholders'].split(';')
                for stakeholder in stakeholders:
                    if stakeholder.strip():
                        people_roles.append({
                            'role': 'business_stakeholder',
                            'name': stakeholder.strip()
                        })
            
            cleaned_automation['people_data'] = people_roles
            
            # Parse environment data
            environments = []
            env_mappings = [
                ('Dev VDI', 'Dev Service Account', 'dev'),
                ('QA VDI', 'QA Service Account', 'qa'),
                ('Production VDI', 'Production Service Account', 'prod')
            ]
            
            for vdi_field, service_field, env_type in env_mappings:
                vdi = automation.get(vdi_field, '').strip()
                service = automation.get(service_field, '').strip()
                if vdi or service:
                    environments.append({
                        'type': env_type,
                        'vdi': vdi,
                        'service_account': service
                    })
            
            cleaned_automation['environments_data'] = environments
            
            # Parse test data
            if automation.get('Test Data SPOC', '').strip():
                cleaned_automation['test_data_data'] = {
                    'spoc': automation['Test Data SPOC'].strip()
                }
            
            # Parse metrics data
            metrics = {}
            try:
                if automation.get('Post Production Total Cases', '').strip():
                    metrics['post_prod_total_cases'] = int(automation['Post Production Total Cases'])
            except ValueError:
                pass
            
            try:
                if automation.get('Post Production System Exceptions Count', '').strip():
                    metrics['post_prod_sys_ex_count'] = int(automation['Post Production System Exceptions Count'])
            except ValueError:
                pass
            
            try:
                if automation.get('Post Production Success Rate', '').strip():
                    metrics['post_prod_success_rate'] = float(automation['Post Production Success Rate'])
            except ValueError:
                pass
            
            if metrics:
                cleaned_automation['metrics_data'] = metrics
            
            # Parse artifacts data
            artifacts = {}
            artifact_fields = [
                ('Automation Artifacts Link', 'artifacts_link'),
                ('Code Review with M&E', 'code_review'),
                ('Automation Demo to M&E', 'demo'),
                ('Rampup/Postprod Issue/Resolution list to M&E', 'rampup_issue_list')
            ]
            
            for csv_field, field_name in artifact_fields:
                value = automation.get(csv_field, '').strip()
                if value:
                    artifacts[field_name] = value
            
            if artifacts:
                cleaned_automation['artifacts_data'] = artifacts
            
            # Ensure required fields exist
            if cleaned_automation['air_id'] and cleaned_automation['name'] and cleaned_automation['type']:
                automations.append(cleaned_automation)
            else:
                print(f"❌ Skipping line {i}: missing required fields")
                print(f"   AIR ID: '{cleaned_automation['air_id']}'")
                print(f"   Name: '{cleaned_automation['name']}'")  
                print(f"   Type: '{cleaned_automation['type']}'")
        else:
            print(f"❌ Line {i}: {len(values)} values vs {len(headers)} headers")
    
    return automations

def import_all_automations():
    """Import all automations from CSV"""
    
    csv_file = 'd:/Repositories/db-django/example_automation_data.csv'
    automations = parse_csv_data(csv_file)
    
    print(f"\n📊 Parsed {len(automations)} automations from CSV")
    
    if not automations:
        print("❌ No automations to import!")
        return
    
    # Import all automations
    url = 'http://127.0.0.1:8000/api/automations/'
    headers = {'Content-Type': 'application/json'}
    
    success_count = 0
    error_count = 0
    errors = []
    
    for i, automation in enumerate(automations, 1):
        try:
            print(f"\n[{i}/{len(automations)}] Importing: {automation['air_id']} - {automation['name']}")
            
            response = requests.post(url, headers=headers, json=automation)
            
            if response.status_code == 201:
                success_count += 1
                print(f"✅ Successfully imported: {automation['air_id']}")
            else:
                error_count += 1
                error_text = response.text
                print(f"❌ Failed to import: {automation['air_id']}")
                print(f"   Status: {response.status_code}")
                print(f"   Error: {error_text}")
                errors.append(f"{automation['air_id']}: {error_text}")
                
        except Exception as e:
            error_count += 1
            print(f"❌ Exception importing {automation['air_id']}: {str(e)}")
            errors.append(f"{automation['air_id']}: {str(e)}")
    
    print(f"\n🎯 IMPORT SUMMARY:")
    print(f"   ✅ Successful: {success_count}")
    print(f"   ❌ Failed: {error_count}")
    print(f"   📊 Total: {len(automations)}")
    
    if errors:
        print(f"\n🚨 ERRORS:")
        for error in errors[:5]:  # Show first 5 errors
            print(f"   {error}")
        if len(errors) > 5:
            print(f"   ... and {len(errors) - 5} more errors")

if __name__ == '__main__':
    import_all_automations()
