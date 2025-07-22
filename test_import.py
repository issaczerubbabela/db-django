#!/usr/bin/env python3

import requests
import json
import csv

def test_csv_import():
    """Test CSV import functionality by posting a single automation"""
    
    # Test data that matches the CSV structure
    test_automation = {
        'air_id': 'TEST-002',
        'name': 'Test Automation',
        'type': 'RPA',
        'complexity': 'Low',
        'brief_description': 'A simple test automation',
        'coe_fed': 'COE Test',
        'tool_name': 'UiPath',
        'tool_version': '2023.10.3',
        'process_details': 'Simple test process',
        'object_details': 'Test objects',
        'queue': 'TEST_QUEUE',
        'shared_folders': '\\\\shared\\test',
        'shared_mailboxes': 'test@company.com',
        'qa_handshake': 'Completed',
        'preprod_deploy_date': '2024-01-15T09:30:00Z',
        'prod_deploy_date': '2024-02-01T14:20:00Z',
        'warranty_end_date': '2025-02-01T14:20:00Z',
        'comments': 'Test comments',
        'documentation': 'Test documentation',
        'modified': '2024-07-15T16:45:00Z',
        'path': 'C:\\Test',
        'modified_by_name': 'Test User',
        'people_data': [
            {'role': 'project_manager', 'name': 'John Doe'},
            {'role': 'project_designer', 'name': 'Jane Smith'},
            {'role': 'developer', 'name': 'Bob Johnson'},
            {'role': 'tester', 'name': 'Alice Brown'},
            {'role': 'business_spoc', 'name': 'Charlie Wilson'},
            {'role': 'business_stakeholder', 'name': 'David Lee'},
            {'role': 'app_owner', 'name': 'Eve Taylor'}
        ],
        'environments_data': [
            {'type': 'dev', 'vdi': 'DEV-01', 'service_account': 'svc_test_dev'},
            {'type': 'qa', 'vdi': 'QA-01', 'service_account': 'svc_test_qa'},
            {'type': 'prod', 'vdi': 'PROD-01', 'service_account': 'svc_test_prod'}
        ],
        'test_data_data': {
            'spoc': 'Test SPOC'
        },
        'metrics_data': {
            'post_prod_total_cases': 100,
            'post_prod_sys_ex_count': 2,
            'post_prod_success_rate': 98.0
        },
        'artifacts_data': {
            'artifacts_link': 'https://test.com',
            'code_review': 'completed',
            'demo': 'completed',
            'rampup_issue_list': 'No issues'
        }
    }
    
    # Test the API endpoint
    url = 'http://127.0.0.1:8000/api/automations/'
    headers = {'Content-Type': 'application/json'}
    
    print("Testing automation creation...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_automation, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=test_automation)
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 201:
            print("✅ SUCCESS: Automation created successfully!")
            return True
        else:
            print("❌ FAILED: Automation creation failed")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == '__main__':
    test_csv_import()
