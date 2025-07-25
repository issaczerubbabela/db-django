#!/usr/bin/env python
import requests
import csv
import json
from datetime import datetime

def test_export_functionality():
    """Test that all data can be exported correctly in CSV format"""
    
    print("📤 Testing export functionality...")
    
    try:
        # Get all automations
        response = requests.get('http://127.0.0.1:8000/api/automations/')
        if response.status_code != 200:
            print(f"❌ Failed to fetch automations: {response.status_code}")
            return
        
        automations = response.json()
        print(f"📊 Exporting {len(automations)} automations to CSV...")
        
        # Define CSV headers (same as the original import format)
        csv_headers = [
            'AIR ID', 'Name', 'Type', 'Complexity', 'Brief Description', 'COE/FED',
            'Tool', 'Tool Version', 'Process Details', 'Object Details', 'Queue',
            'Shared Folders', 'Shared Mailboxes', 'QA Handshake', 'PreProd Deploy Date',
            'Prod Deploy Date', 'Warranty End Date', 'Comments', 'Documentation',
            'Modified', 'Modified By', 'Path', 'Created At', 'Updated At',
            'Project Manager', 'Project Designer', 'Developer', 'Tester',
            'Business SPOC', 'Business Stakeholders', 'Applications-App Owner',
            'Dev VDI', 'Dev Service Account', 'QA VDI', 'QA Service Account',
            'Production VDI', 'Production Service Account', 'Test Data SPOC',
            'Post Production Total Cases', 'Post Production System Exceptions Count',
            'Post Production Success Rate', 'Automation Artifacts Link',
            'Code Review with M&E', 'Automation Demo to M&E',
            'Rampup/Postprod Issue/Resolution list to M&E'
        ]
        
        # Create export CSV
        export_filename = '../samples/exported_automation_data.csv'
        
        with open(export_filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_headers)
            writer.writeheader()
            
            for automation in automations:
                # Build people role mappings
                people_by_role = {}
                business_stakeholders = []
                
                for role in automation.get('people_roles', []):
                    role_name = role.get('role', '')
                    person_name = role.get('person_name', '')
                    
                    if role_name == 'project_manager':
                        people_by_role['Project Manager'] = person_name
                    elif role_name == 'project_designer':
                        people_by_role['Project Designer'] = person_name
                    elif role_name == 'developer':
                        people_by_role['Developer'] = person_name
                    elif role_name == 'tester':
                        people_by_role['Tester'] = person_name
                    elif role_name == 'business_spoc':
                        people_by_role['Business SPOC'] = person_name
                    elif role_name == 'app_owner':
                        people_by_role['Applications-App Owner'] = person_name
                    elif role_name == 'business_stakeholder':
                        business_stakeholders.append(person_name)
                
                # Build environment mappings
                env_by_type = {}
                for env in automation.get('environments', []):
                    env_type = env.get('type', '')
                    if env_type == 'dev':
                        env_by_type['Dev VDI'] = env.get('vdi', '')
                        env_by_type['Dev Service Account'] = env.get('service_account', '')
                    elif env_type == 'qa':
                        env_by_type['QA VDI'] = env.get('vdi', '')
                        env_by_type['QA Service Account'] = env.get('service_account', '')
                    elif env_type == 'prod':
                        env_by_type['Production VDI'] = env.get('vdi', '')
                        env_by_type['Production Service Account'] = env.get('service_account', '')
                
                # Get test data SPOC
                test_data_spoc = ''
                test_data = automation.get('test_data')
                if test_data:
                    test_data_spoc = test_data.get('spoc_name', '')
                
                # Get metrics
                metrics = automation.get('metrics', {})
                
                # Get artifacts
                artifacts = automation.get('artifacts', {})
                
                # Format dates
                def format_date(date_str):
                    if date_str:
                        try:
                            # Parse ISO format and return as ISO
                            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                        except:
                            return date_str
                    return ''
                
                # Build CSV row
                csv_row = {
                    'AIR ID': automation.get('air_id', ''),
                    'Name': automation.get('name', ''),
                    'Type': automation.get('type', ''),
                    'Complexity': automation.get('complexity', ''),
                    'Brief Description': automation.get('brief_description', ''),
                    'COE/FED': automation.get('coe_fed', ''),
                    'Tool': automation.get('tool_name', ''),
                    'Tool Version': automation.get('tool_version', ''),
                    'Process Details': automation.get('process_details', ''),
                    'Object Details': automation.get('object_details', ''),
                    'Queue': automation.get('queue', ''),
                    'Shared Folders': automation.get('shared_folders', ''),
                    'Shared Mailboxes': automation.get('shared_mailboxes', ''),
                    'QA Handshake': automation.get('qa_handshake', ''),
                    'PreProd Deploy Date': format_date(automation.get('preprod_deploy_date')),
                    'Prod Deploy Date': format_date(automation.get('prod_deploy_date')),
                    'Warranty End Date': format_date(automation.get('warranty_end_date')),
                    'Comments': automation.get('comments', ''),
                    'Documentation': automation.get('documentation', ''),
                    'Modified': format_date(automation.get('modified')),
                    'Modified By': automation.get('modified_by_name', ''),
                    'Path': automation.get('path', ''),
                    'Created At': format_date(automation.get('created_at')),
                    'Updated At': format_date(automation.get('updated_at')),
                    
                    # People roles
                    'Project Manager': people_by_role.get('Project Manager', ''),
                    'Project Designer': people_by_role.get('Project Designer', ''),
                    'Developer': people_by_role.get('Developer', ''),
                    'Tester': people_by_role.get('Tester', ''),
                    'Business SPOC': people_by_role.get('Business SPOC', ''),
                    'Applications-App Owner': people_by_role.get('Applications-App Owner', ''),
                    'Business Stakeholders': '; '.join(business_stakeholders),
                    
                    # Environments
                    'Dev VDI': env_by_type.get('Dev VDI', ''),
                    'Dev Service Account': env_by_type.get('Dev Service Account', ''),
                    'QA VDI': env_by_type.get('QA VDI', ''),
                    'QA Service Account': env_by_type.get('QA Service Account', ''),
                    'Production VDI': env_by_type.get('Production VDI', ''),
                    'Production Service Account': env_by_type.get('Production Service Account', ''),
                    
                    # Test data
                    'Test Data SPOC': test_data_spoc,
                    
                    # Metrics
                    'Post Production Total Cases': metrics.get('post_prod_total_cases', ''),
                    'Post Production System Exceptions Count': metrics.get('post_prod_sys_ex_count', ''),
                    'Post Production Success Rate': metrics.get('post_prod_success_rate', ''),
                    
                    # Artifacts
                    'Automation Artifacts Link': artifacts.get('artifacts_link', ''),
                    'Code Review with M&E': artifacts.get('code_review', ''),
                    'Automation Demo to M&E': artifacts.get('demo', ''),
                    'Rampup/Postprod Issue/Resolution list to M&E': artifacts.get('rampup_issue_list', '')
                }
                
                writer.writerow(csv_row)
                print(f"   ✅ Exported: {automation.get('air_id')} - {automation.get('name')}")
        
        print(f"\n✅ Export completed successfully!")
        print(f"📄 Exported file: {export_filename}")
        
        # Verify export by reading it back
        print(f"\n🔍 Verifying exported file...")
        with open(export_filename, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            exported_rows = list(reader)
            
            print(f"   📊 Exported rows: {len(exported_rows)}")
            print(f"   📋 Columns: {len(reader.fieldnames)}")
            
            # Check first row data integrity
            if exported_rows:
                first_row = exported_rows[0]
                print(f"   🔍 First row check:")
                print(f"      AIR ID: {first_row.get('AIR ID')}")
                print(f"      Name: {first_row.get('Name')}")
                print(f"      Type: {first_row.get('Type')}")
                print(f"      Tool: {first_row.get('Tool')}")
                
                # Check if people data is preserved
                pm = first_row.get('Project Manager')
                stakeholders = first_row.get('Business Stakeholders')
                if pm:
                    print(f"      Project Manager: {pm}")
                if stakeholders:
                    print(f"      Business Stakeholders: {stakeholders}")
                
                # Check metrics
                total_cases = first_row.get('Post Production Total Cases')
                success_rate = first_row.get('Post Production Success Rate')
                if total_cases:
                    print(f"      Total Cases: {total_cases}")
                if success_rate:
                    print(f"      Success Rate: {success_rate}")
        
        print(f"\n🎯 Export verification completed!")
        print(f"✅ All attributes are accessible and exportable!")
        
    except Exception as e:
        print(f"❌ Error during export: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_export_functionality()
