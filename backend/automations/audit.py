from .models import AuditLog
import json


def log_audit_event(action, object_type, object_id=None, object_name=None, 
                   request=None, details=None):
    """
    Create an audit log entry for database actions.
    
    Args:
        action: The action performed (create, update, delete, etc.)
        object_type: The type of object (Automation, Person, etc.)
        object_id: The ID of the affected object
        object_name: Human-readable name of the object
        request: The HTTP request object (for IP and user agent)
        details: Additional context (dict will be JSON serialized)
    """
    audit_data = {
        'action': action,
        'object_type': object_type,
        'object_id': str(object_id) if object_id else None,
        'object_name': object_name,
    }
    
    if request:
        # Get client IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        audit_data['user_ip'] = ip
        audit_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:1000]  # Limit length
    
    if details:
        # Ensure details can be JSON serialized
        try:
            json.dumps(details)
            audit_data['details'] = details
        except (TypeError, ValueError):
            audit_data['details'] = {'error': 'Details could not be serialized'}
    
    try:
        AuditLog.objects.create(**audit_data)
    except Exception as e:
        # Log audit failures silently to avoid breaking the main operation
        print(f"Failed to create audit log: {e}")


def get_object_changes(old_data, new_data):
    """
    Compare two dictionaries and return the changes.
    
    Args:
        old_data: Dictionary of old values
        new_data: Dictionary of new values
    
    Returns:
        Dictionary with 'changed_fields' containing field changes
    """
    changes = {}
    
    for key, new_value in new_data.items():
        old_value = old_data.get(key)
        if old_value != new_value:
            changes[key] = {
                'old': old_value,
                'new': new_value
            }
    
    return {'changed_fields': changes} if changes else None
