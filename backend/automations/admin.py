from django.contrib import admin
from .models import Automation, Tool, Person, AutomationPersonRole, Environment, TestData, Metrics, Artifacts, AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'action', 'object_type', 'object_id', 'object_name', 'user_ip', 'timestamp']
    list_filter = ['action', 'object_type', 'timestamp']
    search_fields = ['object_id', 'object_name', 'user_ip']
    readonly_fields = ['id', 'action', 'object_type', 'object_id', 'object_name', 'user_ip', 'user_agent', 'details', 'timestamp']
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    
    def has_add_permission(self, request):
        return False  # Prevent manual creation of audit logs
    
    def has_change_permission(self, request, obj=None):
        return False  # Prevent modification of audit logs
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Only superusers can delete audit logs


@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


class AutomationPersonRoleInline(admin.TabularInline):
    model = AutomationPersonRole
    extra = 1


class EnvironmentInline(admin.TabularInline):
    model = Environment
    extra = 1


class TestDataInline(admin.StackedInline):
    model = TestData


class MetricsInline(admin.StackedInline):
    model = Metrics


class ArtifactsInline(admin.StackedInline):
    model = Artifacts


@admin.register(Automation)
class AutomationAdmin(admin.ModelAdmin):
    list_display = ['air_id', 'name', 'type', 'complexity', 'coe_fed', 'created_at', 'updated_at']
    list_filter = ['type', 'complexity', 'coe_fed', 'created_at', 'tool']
    search_fields = ['air_id', 'name', 'type', 'brief_description']
    readonly_fields = ['created_at', 'updated_at']
    
    inlines = [
        AutomationPersonRoleInline,
        EnvironmentInline,
        TestDataInline,
        MetricsInline,
        ArtifactsInline,
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('air_id', 'name', 'type', 'brief_description', 'coe_fed', 'complexity')
        }),
        ('Technical Details', {
            'fields': ('tool', 'tool_version', 'process_details', 'object_details', 'queue', 'path')
        }),
        ('Resources', {
            'fields': ('shared_folders', 'shared_mailboxes', 'qa_handshake')
        }),
        ('Deployment', {
            'fields': ('preprod_deploy_date', 'prod_deploy_date', 'warranty_end_date')
        }),
        ('Additional Information', {
            'fields': ('comments', 'documentation', 'modified', 'modified_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AutomationPersonRole)
class AutomationPersonRoleAdmin(admin.ModelAdmin):
    list_display = ['automation', 'person', 'role']
    list_filter = ['role']
    search_fields = ['automation__air_id', 'automation__name', 'person__name']


@admin.register(Environment)
class EnvironmentAdmin(admin.ModelAdmin):
    list_display = ['automation', 'type', 'vdi', 'service_account']
    list_filter = ['type']
    search_fields = ['automation__air_id', 'automation__name']


@admin.register(TestData)
class TestDataAdmin(admin.ModelAdmin):
    list_display = ['automation', 'spoc']
    search_fields = ['automation__air_id', 'automation__name']


@admin.register(Metrics)
class MetricsAdmin(admin.ModelAdmin):
    list_display = ['automation', 'post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate']
    search_fields = ['automation__air_id', 'automation__name']


@admin.register(Artifacts)
class ArtifactsAdmin(admin.ModelAdmin):
    list_display = ['automation', 'code_review', 'demo', 'artifacts_link']
    list_filter = ['code_review', 'demo']
    search_fields = ['automation__air_id', 'automation__name']
