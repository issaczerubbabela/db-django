#!/usr/bin/env python
import csv
import json
import requests
import os
import time

def import_all_csv_data():
    """Import all data from the CSV file with proper error handling"""
    csv_file = 'samples/example_automation_data.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file {csv_file} not found!")
        return
    
    print("🚀 Starting comprehensive CSV import...")
    
    # Clear existing data first
    print("🧹 Clearing existing data...")
    try:
        response = requests.get('http://127.0.0.1:8000/api/automations/')
        if response.status_code == 200:
            existing_automations = response.json()
            for auto in existing_automations:
                air_id = auto.get('air_id')
                if air_id:
                    print(f"   Deleting existing automation: {air_id}")
                    requests.delete(f'http://127.0.0.1:8000/api/automations/{air_id}/')
    except Exception as e:
        print(f"⚠️  Warning: Could not clear existing data: {e}")
    
    # Read and parse CSV
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        automations = []
        
        for row_num, row in enumerate(reader, 1):
            # Extract and validate required fields
            air_id = row.get('AIR ID', '').strip()
            name = row.get('Name', '').strip()
            type_val = row.get('Type', '').strip()
            
            if not air_id or not name or not type_val:
                print(f"⚠️  Skipping row {row_num}: Missing required fields")
                print(f"   AIR ID: '{air_id}', Name: '{name}', Type: '{type_val}'")
                continue
            
            # Parse dates properly
            def parse_date(date_str):
                if not date_str or not date_str.strip():
                    return None
                try:
                    from datetime import datetime
                    # Handle various date formats
                    for fmt in ['%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']:
                        try:
                            dt = datetime.strptime(date_str.strip(), fmt)
                            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                        except ValueError:
                            continue
                    return None
                except:
                    return None
            
            # Build comprehensive automation object
            automation = {
                # Core required fields
                'air_id': air_id,
                'name': name,
                'type': type_val,
                
                # Optional fields
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
                
                # People data
                'people_data': [],
                'environments_data': [],
                'test_data_data': {},
                'metrics_data': {},
                'artifacts_data': {}
            }
            
            # Build people data
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
            
            # Handle business stakeholders (multiple, separated by semicolon)
            stakeholders = row.get('Business Stakeholders', '').strip()
            if stakeholders:
                for stakeholder in stakeholders.split(';'):
                    if stakeholder.strip():
                        people_roles.append({
                            'role': 'business_stakeholder',
                            'name': stakeholder.strip()
                        })
            
            automation['people_data'] = people_roles
            
            # Build environment data
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
                    metrics['post_prod_total_cases'] = int(total_cases)
                if exceptions:
                    metrics['post_prod_sys_ex_count'] = int(exceptions)
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
            print(f"✅ Prepared automation {row_num}: {air_id} - {name}")
    
    print(f"\n📊 Total automations to import: {len(automations)}")
    
    # Import automations one by one
    success_count = 0
    error_count = 0
    errors = []
    
    for i, automation in enumerate(automations, 1):
        try:
            print(f"\n🔄 Importing {i}/{len(automations)}: {automation['air_id']}")
            
            response = requests.post(
                'http://127.0.0.1:8000/api/automations/',
                json=automation,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 201:
                success_count += 1
                result = response.json()
                print(f"   ✅ SUCCESS: {result.get('air_id')} - {result.get('name')}")
            else:
                error_count += 1
                error_msg = response.text
                print(f"   ❌ FAILED: {automation['air_id']} - {error_msg}")
                errors.append(f"{automation['air_id']}: {error_msg}")
            
            # Small delay to avoid overwhelming the server
            time.sleep(0.1)
            
        except Exception as e:
            error_count += 1
            error_msg = str(e)
            print(f"   ❌ ERROR: {automation['air_id']} - {error_msg}")
            errors.append(f"{automation['air_id']}: {error_msg}")
    
    print(f"\n🎯 Import Summary:")
    print(f"   ✅ Successful imports: {success_count}")
    print(f"   ❌ Failed imports: {error_count}")
    print(f"   📊 Total processed: {len(automations)}")
    
    if errors:
        print(f"\n❌ Errors encountered:")
        for error in errors[:10]:  # Show first 10 errors
            print(f"   {error}")
        if len(errors) > 10:
            print(f"   ... and {len(errors) - 10} more errors")
    
    # Verify final count
    try:
        response = requests.get('http://127.0.0.1:8000/api/automations/')
        if response.status_code == 200:
            final_count = len(response.json())
            print(f"\n🔍 Final verification: {final_count} automations in database")
        else:
            print(f"\n⚠️  Could not verify final count: {response.status_code}")
    except Exception as e:
        print(f"\n⚠️  Could not verify final count: {e}")

if __name__ == "__main__":
    import_all_csv_data()
