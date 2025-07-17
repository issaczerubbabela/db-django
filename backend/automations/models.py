from django.db import models
from django.utils import timezone


class Tool(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name


class Person(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    
    def __str__(self):
        return self.name


class Automation(models.Model):
    air_id = models.CharField(max_length=100, unique=True, primary_key=True)
    name = models.CharField(max_length=500)
    type = models.CharField(max_length=100)
    brief_description = models.TextField(blank=True, null=True)
    coe_fed = models.CharField(max_length=100, blank=True, null=True)
    complexity = models.CharField(max_length=50, blank=True, null=True)
    tool = models.ForeignKey(Tool, on_delete=models.SET_NULL, blank=True, null=True)
    tool_version = models.CharField(max_length=200, blank=True, null=True)
    process_details = models.TextField(blank=True, null=True)
    object_details = models.TextField(blank=True, null=True)
    queue = models.CharField(max_length=200, blank=True, null=True)
    shared_folders = models.TextField(blank=True, null=True)
    shared_mailboxes = models.TextField(blank=True, null=True)
    qa_handshake = models.CharField(max_length=200, blank=True, null=True)
    preprod_deploy_date = models.DateTimeField(blank=True, null=True)
    prod_deploy_date = models.DateTimeField(blank=True, null=True)
    warranty_end_date = models.DateTimeField(blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    documentation = models.TextField(blank=True, null=True)
    modified = models.DateTimeField(blank=True, null=True)
    modified_by = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name='modified_automations')
    path = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'automations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.air_id} - {self.name}"


class AutomationPersonRole(models.Model):
    ROLE_CHOICES = [
        ('project_manager', 'Project Manager'),
        ('project_designer', 'Project Designer'),
        ('developer', 'Developer'),
        ('tester', 'Tester'),
        ('business_spoc', 'Business SPOC'),
        ('business_stakeholder', 'Business Stakeholder'),
        ('app_owner', 'Applications-App Owner'),
    ]
    
    id = models.AutoField(primary_key=True)
    automation = models.ForeignKey(Automation, on_delete=models.CASCADE, related_name='people_roles')
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    
    class Meta:
        unique_together = ['automation', 'person', 'role']
    
    def __str__(self):
        return f"{self.person.name} - {self.get_role_display()}"


class Environment(models.Model):
    ENVIRONMENT_TYPES = [
        ('dev', 'Development'),
        ('qa', 'QA'),
        ('uat', 'UAT'),
        ('prod', 'Production'),
    ]
    
    id = models.AutoField(primary_key=True)
    automation = models.ForeignKey(Automation, on_delete=models.CASCADE, related_name='environments')
    type = models.CharField(max_length=20, choices=ENVIRONMENT_TYPES)
    vdi = models.CharField(max_length=200, blank=True, null=True)
    service_account = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):
        return f"{self.automation.air_id} - {self.get_type_display()}"


class TestData(models.Model):
    id = models.AutoField(primary_key=True)
    automation = models.OneToOneField(Automation, on_delete=models.CASCADE, related_name='test_data')
    spoc = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True)
    
    def __str__(self):
        return f"Test Data for {self.automation.air_id}"


class Metrics(models.Model):
    id = models.AutoField(primary_key=True)
    automation = models.OneToOneField(Automation, on_delete=models.CASCADE, related_name='metrics')
    post_prod_total_cases = models.IntegerField(blank=True, null=True)
    post_prod_sys_ex_count = models.IntegerField(blank=True, null=True)
    post_prod_success_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    def __str__(self):
        return f"Metrics for {self.automation.air_id}"


class Artifacts(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('not_applicable', 'Not Applicable'),
    ]
    
    id = models.AutoField(primary_key=True)
    automation = models.OneToOneField(Automation, on_delete=models.CASCADE, related_name='artifacts')
    artifacts_link = models.URLField(blank=True, null=True)
    code_review = models.CharField(max_length=20, choices=STATUS_CHOICES, blank=True, null=True)
    demo = models.CharField(max_length=20, choices=STATUS_CHOICES, blank=True, null=True)
    rampup_issue_list = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Artifacts for {self.automation.air_id}"
