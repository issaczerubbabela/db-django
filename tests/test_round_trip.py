#!/usr/bin/env python
import csv
import json
import requests
import os
import time

def test_round_trip_import():
    """Test importing the exported CSV to verify round-trip compatibility"""
    
    export_file = '../samples/exported_automation_data.csv'
    
    if not os.path.exists(export_file):
        print(f"❌ Exported CSV file {export_file} not found!")
        return
    
    print("🔄 Testing round-trip import from exported CSV...")
    
    # Read and parse the exported CSV
    with open(export_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        automations = []
        
        for row_num, row in enumerate(reader, 1):
            # Extract required fields
            air_id = row.get('AIR ID', '').strip()
            name = row.get('Name', '').strip()
            type_val = row.get('Type', '').strip()
            
            if not air_id or not name or not type_val:
                print(f"⚠️  Skipping row {row_num}: Missing required fields")
                continue
            
            # Parse dates properly
            def parse_date(date_str):
                if not date_str or not date_str.strip():
                    return None
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(date_str.strip().replace('Z', '+00:00'))
                    return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                except:
                    return None
            
            # Build automation object
            automation = {
                'air_id': air_id,
                'name': name,
                'type': type_val,
                'brief_description': row.get('Brief Description', '').strip() or None,
                'coe_fed': row.get('COE/FED', '').strip() or None,
                'complexity': row.get('Complexity', '').strip() or None,
                'tool_version': row.get('Tool Version', '').strip() or None,
                'process_details': row.get('Process Details', '').strip() or None,
                'object_details': row.get('Object Details', '').strip() or None,
                'queue': row.get('Queue', '').strip() or None,
                'shared_folders': row.get('Shared Folders', '').strip() or None,
                'shared_mailboxes': row.get('Shared Mailboxes', '').strip() or None,
                'qa_handshake': row.get('QA Handshake', '').strip() or None,
                'comments': row.get('Comments', '').strip() or None,
                'documentation': row.get('Documentation', '').strip() or None,
                'path': row.get('Path', '').strip() or None,
                
                # Dates
                'preprod_deploy_date': parse_date(row.get('PreProd Deploy Date', '')),
                'prod_deploy_date': parse_date(row.get('Prod Deploy Date', '')),
                'warranty_end_date': parse_date(row.get('Warranty End Date', '')),
                'modified': parse_date(row.get('Modified', '')),
                
                # Tool and modified by
                'tool_name': row.get('Tool', '').strip() or None,
                'modified_by_name': row.get('Modified By', '').strip() or None,
                
                'people_data': [],
                'environments_data': [],
                'test_data_data': {},
                'metrics_data': {},
                'artifacts_data': {}
            }
            
            # Parse people data
            people_roles = []
            
            role_mappings = {
                'Project Manager': 'project_manager',
                'Project Designer': 'project_designer',
                'Developer': 'developer',
                'Tester': 'tester',
                'Business SPOC': 'business_spoc',
                'Applications-App Owner': 'app_owner'
            }
            
            for csv_field, role in role_mappings.items():
                person_name = row.get(csv_field, '').strip()
                if person_name:
                    people_roles.append({'role': role, 'name': person_name})
            
            # Handle business stakeholders
            stakeholders = row.get('Business Stakeholders', '').strip()
            if stakeholders:
                for stakeholder in stakeholders.split(';'):
                    if stakeholder.strip():
                        people_roles.append({
                            'role': 'business_stakeholder',
                            'name': stakeholder.strip()
                        })
            
            automation['people_data'] = people_roles
            
            # Parse environment data
            environments = []
            
            env_mappings = [
                ('dev', 'Dev VDI', 'Dev Service Account'),
                ('qa', 'QA VDI', 'QA Service Account'),
                ('prod', 'Production VDI', 'Production Service Account')
            ]
            
            for env_type, vdi_field, sa_field in env_mappings:
                vdi = row.get(vdi_field, '').strip()
                service_account = row.get(sa_field, '').strip()
                if vdi or service_account:
                    environments.append({
                        'type': env_type,
                        'vdi': vdi,
                        'service_account': service_account
                    })
            
            automation['environments_data'] = environments
            
            # Test data
            test_spoc = row.get('Test Data SPOC', '').strip()
            if test_spoc:
                automation['test_data_data'] = {'spoc': test_spoc}
            
            # Metrics data
            try:
                total_cases = row.get('Post Production Total Cases', '').strip()
                exceptions = row.get('Post Production System Exceptions Count', '').strip()
                success_rate = row.get('Post Production Success Rate', '').strip()
                
                metrics = {}
                if total_cases:
                    metrics['post_prod_total_cases'] = int(float(total_cases))
                if exceptions:
                    metrics['post_prod_sys_ex_count'] = int(float(exceptions))
                if success_rate:
                    metrics['post_prod_success_rate'] = float(success_rate)
                
                if metrics:
                    automation['metrics_data'] = metrics
            except ValueError as e:
                print(f"⚠️  Warning: Invalid metrics data in row {row_num}: {e}")
            
            # Artifacts data
            artifacts = {}
            artifacts_link = row.get('Automation Artifacts Link', '').strip()
            code_review = row.get('Code Review with M&E', '').strip()
            demo = row.get('Automation Demo to M&E', '').strip()
            rampup_issues = row.get('Rampup/Postprod Issue/Resolution list to M&E', '').strip()
            
            if artifacts_link:
                artifacts['artifacts_link'] = artifacts_link
            if code_review:
                artifacts['code_review'] = code_review
            if demo:
                artifacts['demo'] = demo
            if rampup_issues:
                artifacts['rampup_issue_list'] = rampup_issues
            
            if artifacts:
                automation['artifacts_data'] = artifacts
            
            automations.append(automation)
            print(f"✅ Prepared automation {row_num}: {air_id}")
    
    print(f"\n📊 Total automations to re-import: {len(automations)}")
    
    # Import automations
    success_count = 0
    error_count = 0
    
    for automation in automations:
        try:
            response = requests.post(
                'http://127.0.0.1:8000/api/automations/',
                json=automation,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 201:
                success_count += 1
                print(f"   ✅ SUCCESS: {automation['air_id']}")
            else:
                error_count += 1
                print(f"   ❌ FAILED: {automation['air_id']} - {response.text}")
            
            time.sleep(0.1)
            
        except Exception as e:
            error_count += 1
            print(f"   ❌ ERROR: {automation['air_id']} - {str(e)}")
    
    print(f"\n🎯 Round-trip Import Summary:")
    print(f"   ✅ Successful re-imports: {success_count}")
    print(f"   ❌ Failed re-imports: {error_count}")
    
    # Verify final count
    try:
        response = requests.get('http://127.0.0.1:8000/api/automations/')
        if response.status_code == 200:
            final_count = len(response.json())
            print(f"   🔍 Final count in database: {final_count}")
            
            if final_count == success_count == len(automations):
                print("   🎉 Perfect round-trip! All data preserved.")
            else:
                print("   ⚠️  Data count mismatch detected.")
        else:
            print(f"   ⚠️  Could not verify final count: {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  Could not verify final count: {e}")

if __name__ == "__main__":
    test_round_trip_import()
