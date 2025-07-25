#!/usr/bin/env python3
"""Test if frontend CSV parsing would work for showcase data"""

import json

def test_frontend_csv_parsing():
    """Simulate the frontend CSV parsing logic"""
    
    # Read the showcase CSV file
    with open('../samples/showcase_automation_data.csv', 'r', encoding='utf-8') as file:
        csv_text = file.read()
    
    print(f"📁 CSV text length: {len(csv_text)}")
    print(f"📝 First 200 characters: {csv_text[:200]}")
    
    # Parse using the same logic as frontend - more robust CSV parser
    def parse_csv(csv_text):
        rows = []
        current_row = []
        current_field = ''
        inside_quotes = False
        i = 0
        
        while i < len(csv_text):
            char = csv_text[i]
            next_char = csv_text[i + 1] if i + 1 < len(csv_text) else None
            
            if char == '"':
                if inside_quotes and next_char == '"':
                    # Escaped quote - add one quote to field
                    current_field += '"'
                    i += 2
                    continue
                elif inside_quotes:
                    # End quote
                    inside_quotes = False
                else:
                    # Start quote
                    inside_quotes = True
            elif char == ',' and not inside_quotes:
                # Field separator
                current_row.append(current_field.strip())
                current_field = ''
            elif (char == '\n' or char == '\r') and not inside_quotes:
                # Row separator
                if current_field or current_row:
                    current_row.append(current_field.strip())
                    if any(field != '' for field in current_row):
                        rows.append(current_row)
                    current_row = []
                    current_field = ''
                # Skip \r\n combination
                if char == '\r' and next_char == '\n':
                    i += 1
            else:
                current_field += char
            i += 1
        
        # Add final field and row if there's content
        if current_field or current_row:
            current_row.append(current_field.strip())
            if any(field != '' for field in current_row):
                rows.append(current_row)
        
        return rows
    
    rows = parse_csv(csv_text)
    if len(rows) < 2:
        print("❌ ERROR: CSV must have at least header row and one data row")
        return False
    
    headers = rows[0]
    print(f"📊 Total rows: {len(rows)}")
    print(f"📊 Headers: {len(headers)} found")
    print(f"🏷️  First 5 headers: {headers[:5]}")
    
    valid_automations = 0
    
    for i in range(1, len(rows)):
        values = rows[i]
        print(f"📝 Row {i}: {len(values)} values (expected {len(headers)})")
        
        if len(values) == len(headers):
            automation = {}
            for j, header in enumerate(headers):
                automation[header] = values[j] if j < len(values) else ''
            
            # Check required fields like frontend
            air_id = automation.get('AIR ID', '').strip()
            name = automation.get('Name', '').strip()
            type_val = automation.get('Type', '').strip()
            
            if air_id and name and type_val:
                valid_automations += 1
                print(f"   ✅ Valid: {air_id} - {name}")
            else:
                print(f"   ❌ Invalid: AIR_ID='{air_id}', Name='{name}', Type='{type_val}'")
        else:
            print(f"   ❌ Column count mismatch: got {len(values)}, expected {len(headers)}")
    
    print(f"\n📊 Summary:")
    print(f"   Valid automations: {valid_automations}")
    print(f"   Total rows processed: {len(rows) - 1}")
    
    return valid_automations > 0

if __name__ == '__main__':
    print("🧪 Testing frontend CSV parsing logic...")
    success = test_frontend_csv_parsing()
    
    if success:
        print("\n✅ Frontend CSV parsing should work!")
    else:
        print("\n❌ Frontend CSV parsing has issues!")
