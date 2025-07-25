#!/usr/bin/env python
import csv
import json
import requests
import os

def test_frontend_csv_import():
    """Test CSV import exactly like the frontend does"""
    csv_file = '../samples/example_automation_data.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file {csv_file} not found!")
        return
    
    # Read CSV content exactly like frontend does
    with open(csv_file, 'r', encoding='utf-8') as f:
        csv_text = f.read()
    
    print(f"📁 CSV text length: {len(csv_text)}")
    print(f"📝 First 200 characters: {csv_text[:200]}")
    
    # Parse CSV exactly like frontend parseCsvData function
    lines = csv_text.split('\n')
    filtered_lines = [line for line in lines if line.strip()]
    
    print(f"📊 Total lines: {len(lines)}")
    print(f"📊 Non-empty lines: {len(filtered_lines)}")
    
    if len(filtered_lines) < 2:
        print("❌ No data rows found")
        return
    
    # Parse header
    header_line = filtered_lines[0]
    headers = [h.strip().strip('"') for h in header_line.split(',')]
    print(f"🏷️  Headers ({len(headers)}): {headers[:5]}...")
    
    # Parse each data row
    validation_errors = []
    automations = []
    
    for i in range(1, len(filtered_lines)):
        line = filtered_lines[i]
        values = [v.strip().strip('"') for v in line.split(',')]
        
        print(f"\n📝 Processing row {i}: {len(values)} values")
        
        if len(values) != len(headers):
            print(f"⚠️  Row {i}: Expected {len(headers)} values, got {len(values)}")
            continue
        
        # Create automation object
        automation = {}
        for j, header in enumerate(headers):
            automation[header] = values[j] if j < len(values) else ''
        
        # Extract required fields
        air_id = automation.get('AIR ID', '').strip()
        name = automation.get('Name', '').strip()
        type_val = automation.get('Type', '').strip()
        
        print(f"   AIR ID: '{air_id}'")
        print(f"   Name: '{name}'")
        print(f"   Type: '{type_val}'")
        
        # Validate required fields
        if not air_id:
            validation_errors.append(f"Row {i}: AIR ID is required")
        if not name:
            validation_errors.append(f"Row {i}: Name is required")
        if not type_val:
            validation_errors.append(f"Row {i}: Type is required")
        
        # Build cleaned automation object like frontend does
        if air_id and name and type_val:
            cleaned_automation = {
                'air_id': air_id,
                'name': name,
                'type': type_val,
                'brief_description': automation.get('Brief Description', '').strip() or None,
                'coe_fed': automation.get('COE/FED', '').strip() or None,
                'complexity': automation.get('Complexity', '').strip() or None,
                'tool_name': automation.get('Tool', '').strip() or None,
                'people_data': [],
                'environments_data': [],
                'test_data_data': {},
                'metrics_data': {},
                'artifacts_data': {}
            }
            
            automations.append(cleaned_automation)
            print(f"   ✅ Valid automation: {air_id}")
        else:
            print(f"   ❌ Invalid automation - missing required fields")
    
    print(f"\n📊 Summary:")
    print(f"   Valid automations: {len(automations)}")
    print(f"   Validation errors: {len(validation_errors)}")
    
    if validation_errors:
        print(f"\n❌ Validation Errors:")
        for error in validation_errors:
            print(f"   {error}")
    
    # Test import of first automation if valid
    if automations:
        print(f"\n🧪 Testing import of first automation...")
        first_auto = automations[0]
        
        try:
            response = requests.post(
                'http://127.0.0.1:8000/api/automations/',
                json=first_auto,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Response Status: {response.status_code}")
            if response.status_code == 201:
                print("   ✅ SUCCESS: Automation imported successfully!")
                result = response.json()
                print(f"   Created automation: {result.get('air_id')} - {result.get('name')}")
            else:
                print("   ❌ FAILED: Import failed")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")

if __name__ == "__main__":
    test_frontend_csv_import()
