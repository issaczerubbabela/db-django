#!/usr/bin/env python

def test_updated_frontend_csv_parsing():
    """Test the updated frontend CSV parsing logic"""
    
    # Read the CSV file
    csv_file = '../samples/showcase_automation_data.csv'
    with open(csv_file, 'r', encoding='utf-8') as f:
        csv_text = f.read()
    
    print("🔧 Testing updated frontend CSV parsing...")
    
    # Simulate the updated frontend parsing logic
    lines = csv_text.split('\n')
    filtered_lines = [line for line in lines if line.strip()]
    
    def parseCSVLine(line):
        result = []
        current = ''
        inQuotes = False
        i = 0
        
        while i < len(line):
            char = line[i]
            
            if char == '"':
                if inQuotes:
                    # Check if this is an escaped quote
                    if i + 1 < len(line) and line[i + 1] == '"':
                        current += '"'
                        i += 2  # Skip both quotes
                        continue
                    else:
                        # End of quoted field
                        inQuotes = False
                else:
                    # Start of quoted field
                    inQuotes = True
            elif char == ',' and not inQuotes:
                # Field separator outside quotes
                result.append(current.strip())
                current = ''
            else:
                current += char
            i += 1
        
        # Add the last field
        result.append(current.strip())
        
        # Remove surrounding quotes from fields if present
        cleaned_result = []
        for field in result:
            trimmed = field.strip()
            if trimmed.startswith('"') and trimmed.endswith('"'):
                cleaned_result.append(trimmed[1:-1])
            else:
                cleaned_result.append(trimmed)
        
        return cleaned_result
    
    # Test parsing
    headers = parseCSVLine(filtered_lines[0])
    print(f"📋 Headers: {len(headers)}")
    print(f"First 5 headers: {headers[:5]}")
    
    # Test first data line
    first_data = parseCSVLine(filtered_lines[1])
    print(f"\n📝 First data line: {len(first_data)} values")
    print(f"First 3 values: {first_data[:3]}")
    
    # Check if counts match
    if len(headers) == len(first_data):
        print("✅ SUCCESS: Header and data counts match!")
        
        # Test that required fields are properly extracted
        automation = {}
        for j, header in enumerate(headers):
            automation[header] = first_data[j] if j < len(first_data) else ''
        
        air_id = automation.get('AIR ID', '').strip()
        name = automation.get('Name', '').strip()
        type_val = automation.get('Type', '').strip()
        
        print(f"\n🔍 Required field extraction:")
        print(f"   AIR ID: '{air_id}' (length: {len(air_id)})")
        print(f"   Name: '{name}' (length: {len(name)})")
        print(f"   Type: '{type_val}' (length: {len(type_val)})")
        
        if air_id and name and type_val:
            print("✅ All required fields extracted successfully!")
        else:
            print("❌ Required fields are empty or missing!")
            
    else:
        print(f"❌ MISMATCH: Headers={len(headers)}, Data={len(first_data)}")
    
    # Test all data lines
    print(f"\n📊 Testing all {len(filtered_lines) - 1} data lines...")
    valid_count = 0
    error_count = 0
    
    for i in range(1, len(filtered_lines)):
        line_data = parseCSVLine(filtered_lines[i])
        
        if len(line_data) == len(headers):
            automation = {}
            for j, header in enumerate(headers):
                automation[header] = line_data[j] if j < len(line_data) else ''
            
            air_id = automation.get('AIR ID', '').strip()
            name = automation.get('Name', '').strip()
            type_val = automation.get('Type', '').strip()
            
            if air_id and name and type_val:
                valid_count += 1
                print(f"   ✅ Row {i}: {air_id} - {name}")
            else:
                error_count += 1
                print(f"   ❌ Row {i}: Missing required fields - AIR ID:'{air_id}', Name:'{name}', Type:'{type_val}'")
        else:
            error_count += 1
            print(f"   ❌ Row {i}: Column count mismatch - {len(line_data)} vs {len(headers)}")
    
    print(f"\n🎯 Summary: {valid_count} valid, {error_count} errors")

if __name__ == "__main__":
    test_updated_frontend_csv_parsing()
