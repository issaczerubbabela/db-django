from django.contrib import admin
from .models import Automation

@admin.register(Automation)
class AutomationAdmin(admin.ModelAdmin):
    list_display = ['air_id', 'name', 'type', 'complexity', 'coe_fed', 'created_at', 'updated_at']
    list_filter = ['type', 'complexity', 'coe_fed', 'created_at']
    search_fields = ['air_id', 'name', 'type', 'brief_description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('air_id', 'name', 'type', 'brief_description', 'coe_fed', 'complexity')
        }),
        ('Technical Details', {
            'fields': ('tool_version', 'process_details', 'object_details', 'queue')
        }),
        ('Resources', {
            'fields': ('shared_folders', 'shared_mailboxes', 'qa_handshake')
        }),
        ('Deployment', {
            'fields': ('preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date')
        }),
        ('Additional Information', {
            'fields': ('comments', 'documentation', 'modified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
