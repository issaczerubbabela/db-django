from rest_framework import serializers
from .models import Automation, Tool, Person, AutomationPersonRole, Environment, TestData, Metrics, Artifacts


class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = '__all__'


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'


class AutomationPersonRoleSerializer(serializers.ModelSerializer):
    person_name = serializers.CharField(source='person.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = AutomationPersonRole
        fields = ['id', 'person', 'person_name', 'role', 'role_display']


class EnvironmentSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Environment
        fields = ['id', 'type', 'type_display', 'vdi', 'service_account']


class TestDataSerializer(serializers.ModelSerializer):
    spoc_name = serializers.CharField(source='spoc.name', read_only=True)
    
    class Meta:
        model = TestData
        fields = ['id', 'spoc', 'spoc_name']


class MetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metrics
        fields = ['id', 'post_prod_total_cases', 'post_prod_sys_ex_count', 'post_prod_success_rate']


class ArtifactsSerializer(serializers.ModelSerializer):
    code_review_display = serializers.CharField(source='get_code_review_display', read_only=True)
    demo_display = serializers.CharField(source='get_demo_display', read_only=True)
    
    class Meta:
        model = Artifacts
        fields = ['id', 'artifacts_link', 'code_review', 'code_review_display', 'demo', 'demo_display', 'rampup_issue_list']


class AutomationSerializer(serializers.ModelSerializer):
    # Related data
    people_roles = AutomationPersonRoleSerializer(many=True, read_only=True)
    environments = EnvironmentSerializer(many=True, read_only=True)
    test_data = TestDataSerializer(read_only=True)
    metrics = MetricsSerializer(read_only=True)
    artifacts = ArtifactsSerializer(read_only=True)
    
    # Additional fields for compatibility
    tool_name = serializers.CharField(source='tool.name', read_only=True)
    modified_by_name = serializers.CharField(source='modified_by.name', read_only=True)
    
    # Legacy format for people (for backward compatibility)
    people = serializers.SerializerMethodField()
    
    class Meta:
        model = Automation
        fields = '__all__'
        
    def get_people(self, obj):
        """Return people in legacy format for backward compatibility"""
        return [
            {
                'name': role.person.name,
                'role': role.get_role_display()
            }
            for role in obj.people_roles.all()
        ]
        
    def validate_air_id(self, value):
        """Validate that air_id is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("AIR ID cannot be empty")
        return value.strip()
        
    def validate_name(self, value):
        """Validate that name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        return value.strip()
        
    def validate_type(self, value):
        """Validate that type is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Type cannot be empty")
        return value.strip()


class AutomationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating automations with nested related data"""
    tool_name = serializers.CharField(required=False, write_only=True)
    people_data = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)
    environments_data = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)
    test_data_data = serializers.DictField(required=False, write_only=True)
    metrics_data = serializers.DictField(required=False, write_only=True)
    artifacts_data = serializers.DictField(required=False, write_only=True)
    
    class Meta:
        model = Automation
        fields = '__all__'
        extra_kwargs = {
            'tool_name': {'write_only': True},
            'people_data': {'write_only': True},
            'environments_data': {'write_only': True},
            'test_data_data': {'write_only': True},
            'metrics_data': {'write_only': True},
            'artifacts_data': {'write_only': True},
        }
    
    def create(self, validated_data):
        # Extract nested data
        tool_name = validated_data.pop('tool_name', None)
        people_data = validated_data.pop('people_data', [])
        environments_data = validated_data.pop('environments_data', [])
        test_data_data = validated_data.pop('test_data_data', {})
        metrics_data = validated_data.pop('metrics_data', {})
        artifacts_data = validated_data.pop('artifacts_data', {})
        
        # Handle tool creation/assignment
        if tool_name:
            tool, created = Tool.objects.get_or_create(name=tool_name)
            validated_data['tool'] = tool
        
        # Create automation
        automation = Automation.objects.create(**validated_data)
        
        # Create related objects
        self._create_people_roles(automation, people_data)
        self._create_environments(automation, environments_data)
        self._create_test_data(automation, test_data_data)
        self._create_metrics(automation, metrics_data)
        self._create_artifacts(automation, artifacts_data)
        
        return automation
    
    def _create_people_roles(self, automation, people_data):
        for person_data in people_data:
            if person_data.get('name') and person_data.get('role'):
                person, created = Person.objects.get_or_create(name=person_data['name'])
                AutomationPersonRole.objects.create(
                    automation=automation,
                    person=person,
                    role=person_data['role']
                )
    
    def _create_environments(self, automation, environments_data):
        for env_data in environments_data:
            if env_data.get('type'):
                Environment.objects.create(
                    automation=automation,
                    type=env_data['type'],
                    vdi=env_data.get('vdi', ''),
                    service_account=env_data.get('service_account', '')
                )
    
    def _create_test_data(self, automation, test_data_data):
        if test_data_data.get('spoc'):
            spoc, created = Person.objects.get_or_create(name=test_data_data['spoc'])
            TestData.objects.create(automation=automation, spoc=spoc)
    
    def _create_metrics(self, automation, metrics_data):
        if any(metrics_data.values()):
            Metrics.objects.create(
                automation=automation,
                post_prod_total_cases=metrics_data.get('post_prod_total_cases'),
                post_prod_sys_ex_count=metrics_data.get('post_prod_sys_ex_count'),
                post_prod_success_rate=metrics_data.get('post_prod_success_rate')
            )
    
    def _create_artifacts(self, automation, artifacts_data):
        if any(artifacts_data.values()):
            Artifacts.objects.create(
                automation=automation,
                artifacts_link=artifacts_data.get('artifacts_link'),
                code_review=artifacts_data.get('code_review'),
                demo=artifacts_data.get('demo'),
                rampup_issue_list=artifacts_data.get('rampup_issue_list')
            )
