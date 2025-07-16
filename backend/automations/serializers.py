from rest_framework import serializers
from .models import Automation


class AutomationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Automation
        fields = '__all__'
        
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
