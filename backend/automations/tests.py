from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Automation


class AutomationModelTest(TestCase):
    def setUp(self):
        self.automation = Automation.objects.create(
            air_id="TEST001",
            name="Test Automation",
            type="Process",
            brief_description="Test automation for unit testing",
            complexity="Medium"
        )
    
    def test_automation_creation(self):
        """Test that automation is created correctly"""
        self.assertEqual(self.automation.air_id, "TEST001")
        self.assertEqual(self.automation.name, "Test Automation")
        self.assertEqual(self.automation.type, "Process")
        self.assertEqual(str(self.automation), "TEST001 - Test Automation")
    
    def test_automation_str_method(self):
        """Test the string representation of automation"""
        expected_str = f"{self.automation.air_id} - {self.automation.name}"
        self.assertEqual(str(self.automation), expected_str)


class AutomationAPITest(APITestCase):
    def setUp(self):
        self.automation = Automation.objects.create(
            air_id="API001",
            name="API Test Automation",
            type="API",
            brief_description="Test automation for API testing",
            complexity="High"
        )
        self.list_url = reverse('automation-list')
        self.detail_url = reverse('automation-detail', kwargs={'air_id': self.automation.air_id})
    
    def test_get_automation_list(self):
        """Test getting list of automations"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_get_automation_detail(self):
        """Test getting a specific automation"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['air_id'], self.automation.air_id)
    
    def test_create_automation(self):
        """Test creating a new automation"""
        data = {
            'air_id': 'NEW001',
            'name': 'New Test Automation',
            'type': 'Process',
            'brief_description': 'New automation for testing',
            'complexity': 'Low'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Automation.objects.count(), 2)
    
    def test_update_automation(self):
        """Test updating an existing automation"""
        data = {
            'name': 'Updated Test Automation',
            'complexity': 'Medium'
        }
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.automation.refresh_from_db()
        self.assertEqual(self.automation.name, 'Updated Test Automation')
        self.assertEqual(self.automation.complexity, 'Medium')
    
    def test_delete_automation(self):
        """Test deleting an automation"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Automation.objects.count(), 0)
    
    def test_search_automations(self):
        """Test searching automations"""
        # Create another automation for search testing
        Automation.objects.create(
            air_id="SEARCH001",
            name="Search Test",
            type="Search",
            brief_description="Test search functionality",
            complexity="Low"
        )
        
        # Search by name
        response = self.client.get(self.list_url, {'search': 'Search'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Search Test')
    
    def test_create_automation_validation(self):
        """Test validation when creating automation"""
        # Test missing required fields
        data = {
            'air_id': '',
            'name': '',
            'type': ''
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test duplicate air_id
        data = {
            'air_id': self.automation.air_id,
            'name': 'Duplicate Test',
            'type': 'Process'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
