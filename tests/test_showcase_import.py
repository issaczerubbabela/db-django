#!/usr/bin/env python3
"""Test showcase CSV import"""

import json
import requests
import csv

def parse_csv_properly(filename):
    automations = []
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Log first automation for debugging
            if len(automations) == 0:
                print("First automation raw data:")
                for key, value in row.items():
                    print(f"  {key}: '{value}'")
                print()
            
            # Process the automation similar to frontend logic
            automation = {
                'air_id': row['AIR ID'].strip(),
                'name': row['Name'].strip(),
                'type': row['Type'].strip(),
                'brief_description': row['Brief Description'].strip() or None,
                'coe_fed': row['COE/FED'].strip() or None,
                'complexity': row['Complexity'].strip() or None,
                'tool_name': row['Tool'].strip() or None,
                'tool_version': row['Tool Version'].strip() or None,
                'process_details': row['Process Details'].strip() or None,
                'object_details': row['Object Details'].strip() or None,
                'queue': row['Queue'].strip() or None,
                'shared_folders': row['Shared Folders'].strip() or None,
                'shared_mailboxes': row['Shared Mailboxes'].strip() or None,
                'qa_handshake': row['QA Handshake'].strip() or None,
                'comments': row['Comments'].strip() or None,
                'documentation': row['Documentation'].strip() or None,
                'path': row['Path'].strip() or None,
                'modified_by_name': row['Modified By'].strip() or None,
            }
            
            # Parse dates
            for date_field, csv_field in [
                ('preprod_deploy_date', 'PreProd Deploy Date'),
                ('prod_deploy_date', 'Prod Deploy Date'),
                ('warranty_end_date', 'Warranty End Date'),
                ('modified', 'Modified'),
                ('created_at', 'Created At'),
                ('updated_at', 'Updated At'),
            ]:
                date_str = row[csv_field].strip()
                if date_str:
                    automation[date_field] = date_str
                else:
                    automation[date_field] = None
            
            # Parse people data
            people_data = []
            if row['Project Manager'].strip():
                people_data.append({'role': 'project_manager', 'name': row['Project Manager'].strip()})
            if row['Project Designer'].strip():
                people_data.append({'role': 'project_designer', 'name': row['Project Designer'].strip()})
            if row['Developer'].strip():
                people_data.append({'role': 'developer', 'name': row['Developer'].strip()})
            if row['Tester'].strip():
                people_data.append({'role': 'tester', 'name': row['Tester'].strip()})
            if row['Business SPOC'].strip():
                people_data.append({'role': 'business_spoc', 'name': row['Business SPOC'].strip()})
            if row['Applications-App Owner'].strip():
                people_data.append({'role': 'app_owner', 'name': row['Applications-App Owner'].strip()})
            
            # Handle Business Stakeholders (semicolon separated)
            if row['Business Stakeholders'].strip():
                stakeholders = row['Business Stakeholders'].split(';')
                for stakeholder in stakeholders:
                    if stakeholder.strip():
                        people_data.append({'role': 'business_stakeholder', 'name': stakeholder.strip()})
            
            automation['people_data'] = people_data
            
            # Parse environments
            environments_data = []
            if row['Dev VDI'].strip() or row['Dev Service Account'].strip():
                environments_data.append({
                    'type': 'dev',
                    'vdi': row['Dev VDI'].strip(),
                    'service_account': row['Dev Service Account'].strip()
                })
            if row['QA VDI'].strip() or row['QA Service Account'].strip():
                environments_data.append({
                    'type': 'qa',
                    'vdi': row['QA VDI'].strip(),
                    'service_account': row['QA Service Account'].strip()
                })
            if row['Production VDI'].strip() or row['Production Service Account'].strip():
                environments_data.append({
                    'type': 'prod',
                    'vdi': row['Production VDI'].strip(),
                    'service_account': row['Production Service Account'].strip()
                })
            
            automation['environments_data'] = environments_data
            
            # Parse test data
            if row['Test Data SPOC'].strip():
                automation['test_data_data'] = {'spoc': row['Test Data SPOC'].strip()}
            else:
                automation['test_data_data'] = {}
            
            # Parse metrics
            metrics_data = {}
            if row['Post Production Total Cases'].strip():
                try:
                    metrics_data['post_prod_total_cases'] = int(row['Post Production Total Cases'].strip())
                except ValueError:
                    pass
            if row['Post Production System Exceptions Count'].strip():
                try:
                    metrics_data['post_prod_sys_ex_count'] = int(row['Post Production System Exceptions Count'].strip())
                except ValueError:
                    pass
            if row['Post Production Success Rate'].strip():
                try:
                    metrics_data['post_prod_success_rate'] = float(row['Post Production Success Rate'].strip())
                except ValueError:
                    pass
            
            automation['metrics_data'] = metrics_data
            
            # Parse artifacts
            artifacts_data = {}
            if row['Automation Artifacts Link'].strip():
                artifacts_data['artifacts_link'] = row['Automation Artifacts Link'].strip()
            if row['Code Review with M&E'].strip():
                artifacts_data['code_review'] = row['Code Review with M&E'].strip()
            if row['Automation Demo to M&E'].strip():
                artifacts_data['demo'] = row['Automation Demo to M&E'].strip()
            if row['Rampup/Postprod Issue/Resolution list to M&E'].strip():
                artifacts_data['rampup_issue_list'] = row['Rampup/Postprod Issue/Resolution list to M&E'].strip()
            
            automation['artifacts_data'] = artifacts_data
            
            # Only add if required fields are present
            if automation['air_id'] and automation['name'] and automation['type']:
                automations.append(automation)
                print(f"✅ Parsed: {automation['air_id']} - {automation['name']}")
            else:
                print(f"❌ Skipped invalid row: AIR ID='{automation['air_id']}', Name='{automation['name']}', Type='{automation['type']}'")
    
    return automations

def test_import(automation):
    """Test importing a single automation"""
    url = 'http://localhost:8000/api/automations/'
    headers = {'Content-Type': 'application/json'}
    
    print(f"\n🧪 Testing import of: {automation['air_id']}")
    print("Data to send:")
    print(json.dumps(automation, indent=2))
    
    response = requests.post(url, json=automation, headers=headers)
    
    print(f"\nResponse Status: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ SUCCESS!")
        return True
    else:
        print("❌ FAILED!")
        print("Response:", response.text)
        return False

if __name__ == '__main__':
    print("🚀 Testing showcase CSV import...")
    
    automations = parse_csv_properly('../samples/showcase_automation_data.csv')
    print(f"\n📊 Parsed {len(automations)} automations")
    
    if automations:
        # Test first automation
        success = test_import(automations[0])
        
        if success:
            print(f"\n✅ First automation imported successfully!")
            print("Try importing the rest if needed.")
        else:
            print(f"\n❌ First automation failed. Check the error above.")
