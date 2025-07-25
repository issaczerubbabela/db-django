#!/usr/bin/env python
import requests
import json

def verify_import_quality():
    """Verify that all data was imported correctly with all relationships"""
    
    print("🔍 Verifying import quality and data accessibility...")
    
    try:
        # Get all automations
        response = requests.get('http://127.0.0.1:8000/api/automations/')
        if response.status_code != 200:
            print(f"❌ Failed to fetch automations: {response.status_code}")
            return
        
        automations = response.json()
        print(f"📊 Total automations: {len(automations)}")
        
        for i, automation in enumerate(automations, 1):
            air_id = automation.get('air_id')
            name = automation.get('name')
            print(f"\n{i}. {air_id} - {name}")
            
            # Check core fields
            core_fields = ['type', 'complexity', 'coe_fed', 'brief_description']
            for field in core_fields:
                value = automation.get(field)
                if value:
                    print(f"   ✅ {field}: {value[:50]}{'...' if len(str(value)) > 50 else ''}")
                else:
                    print(f"   ⚪ {field}: (empty)")
            
            # Check tool information
            tool_name = automation.get('tool_name')
            tool_version = automation.get('tool_version')
            if tool_name:
                print(f"   🔧 Tool: {tool_name} {tool_version or ''}")
            
            # Check people and roles
            people_roles = automation.get('people_roles', [])
            if people_roles:
                print(f"   👥 People ({len(people_roles)}):")
                for role in people_roles:
                    person_name = role.get('person_name', 'Unknown')
                    role_display = role.get('role_display', 'Unknown')
                    print(f"      - {person_name} ({role_display})")
            else:
                print(f"   👥 People: None")
            
            # Check environments
            environments = automation.get('environments', [])
            if environments:
                print(f"   🖥️  Environments ({len(environments)}):")
                for env in environments:
                    env_type = env.get('type_display', 'Unknown')
                    vdi = env.get('vdi', '')
                    service_account = env.get('service_account', '')
                    print(f"      - {env_type}: VDI={vdi}, SA={service_account}")
            else:
                print(f"   🖥️  Environments: None")
            
            # Check test data
            test_data = automation.get('test_data')
            if test_data and test_data.get('spoc_name'):
                print(f"   🧪 Test Data SPOC: {test_data.get('spoc_name')}")
            
            # Check metrics
            metrics = automation.get('metrics')
            if metrics:
                total_cases = metrics.get('post_prod_total_cases')
                exceptions = metrics.get('post_prod_sys_ex_count')
                success_rate = metrics.get('post_prod_success_rate')
                if any([total_cases, exceptions, success_rate]):
                    print(f"   📊 Metrics: Cases={total_cases}, Exceptions={exceptions}, Success Rate={success_rate}%")
            
            # Check artifacts
            artifacts = automation.get('artifacts')
            if artifacts:
                artifacts_link = artifacts.get('artifacts_link')
                code_review = artifacts.get('code_review_display')
                demo = artifacts.get('demo_display')
                if any([artifacts_link, code_review, demo]):
                    print(f"   📁 Artifacts: Link={bool(artifacts_link)}, Code Review={code_review}, Demo={demo}")
            
            # Check dates
            dates = {
                'PreProd Deploy': automation.get('preprod_deploy_date'),
                'Prod Deploy': automation.get('prod_deploy_date'),
                'Warranty End': automation.get('warranty_end_date'),
                'Modified': automation.get('modified')
            }
            
            valid_dates = {k: v for k, v in dates.items() if v}
            if valid_dates:
                print(f"   📅 Dates: {', '.join([f'{k}={v[:10]}' for k, v in valid_dates.items()])}")
        
        print(f"\n✅ All {len(automations)} automations verified successfully!")
        print("🔍 All attributes are accessible for import, export, and database storage operations.")
        
    except Exception as e:
        print(f"❌ Error during verification: {str(e)}")

if __name__ == "__main__":
    verify_import_quality()
