"""
FastAPI integration for Django models.
This provides a FastAPI interface that can coexist with Django.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automation_db.settings')
django.setup()

from automations.models import Automation, Tool, Person, AutomationPersonRole, Environment, TestData, Metrics, Artifacts

# FastAPI app
app = FastAPI(
    title="Automation Database API",
    description="FastAPI interface for Automation Database",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PersonModel(BaseModel):
    name: str
    role: str

class EnvironmentModel(BaseModel):
    type: str
    vdi: Optional[str] = None
    service_account: Optional[str] = None

class TestDataModel(BaseModel):
    spoc: Optional[str] = None

class MetricsModel(BaseModel):
    post_prod_total_cases: Optional[int] = None
    post_prod_sys_ex_count: Optional[int] = None
    post_prod_success_rate: Optional[float] = None

class ArtifactsModel(BaseModel):
    artifacts_link: Optional[str] = None
    code_review: Optional[str] = None
    demo: Optional[str] = None
    rampup_issue_list: Optional[str] = None

class AutomationBase(BaseModel):
    air_id: str = Field(..., description="Automation AIR ID")
    name: str = Field(..., description="Automation name")
    type: str = Field(..., description="Automation type")
    brief_description: Optional[str] = Field(None, description="Brief description")
    coe_fed: Optional[str] = Field(None, description="COE Fed")
    complexity: Optional[str] = Field(None, description="Complexity level")
    tool_version: Optional[str] = Field(None, description="Tool version")
    process_details: Optional[str] = Field(None, description="Process details")
    object_details: Optional[str] = Field(None, description="Object details")
    queue: Optional[str] = Field(None, description="Queue")
    shared_folders: Optional[str] = Field(None, description="Shared folders")
    shared_mailboxes: Optional[str] = Field(None, description="Shared mailboxes")
    qa_handshake: Optional[str] = Field(None, description="QA handshake")
    preprod_deploy_date: Optional[datetime] = Field(None, description="Pre-prod deploy date")
    prod_deploy_date: Optional[datetime] = Field(None, description="Prod deploy date")
    warranty_end_date: Optional[datetime] = Field(None, description="Warranty end date")
    comments: Optional[str] = Field(None, description="Comments")
    documentation: Optional[str] = Field(None, description="Documentation")
    modified: Optional[datetime] = Field(None, description="Modified date")
    path: Optional[str] = Field(None, description="Path")

class AutomationCreate(AutomationBase):
    # Nested data for creation
    people: Optional[List[PersonModel]] = []
    environments: Optional[List[EnvironmentModel]] = []
    test_data: Optional[TestDataModel] = None
    metrics: Optional[MetricsModel] = None
    artifacts: Optional[ArtifactsModel] = None

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    brief_description: Optional[str] = None
    coe_fed: Optional[str] = None
    complexity: Optional[str] = None
    tool_version: Optional[str] = None
    process_details: Optional[str] = None
    object_details: Optional[str] = None
    queue: Optional[str] = None
    shared_folders: Optional[str] = None
    shared_mailboxes: Optional[str] = None
    qa_handshake: Optional[str] = None
    preprod_deploy_date: Optional[datetime] = None
    prod_deploy_date: Optional[datetime] = None
    warranty_end_date: Optional[datetime] = None
    comments: Optional[str] = None
    documentation: Optional[str] = None
    modified: Optional[datetime] = None
    path: Optional[str] = None

class AutomationResponse(AutomationBase):
    created_at: datetime
    updated_at: datetime
    # Related data
    people: List[PersonModel] = []
    environments: List[EnvironmentModel] = []
    test_data: Optional[TestDataModel] = None
    metrics: Optional[MetricsModel] = None
    artifacts: Optional[ArtifactsModel] = None

    class Config:
        from_attributes = True

# Helper functions
def automation_to_dict(automation: Automation) -> dict:
    """Convert Django model to dict for Pydantic response"""
    # Get related data
    people = [
        {'name': role.person.name, 'role': role.get_role_display()}
        for role in automation.people_roles.all()
    ]
    
    environments = [
        {
            'type': env.get_type_display(),
            'vdi': env.vdi,
            'service_account': env.service_account
        }
        for env in automation.environments.all()
    ]
    
    test_data = None
    if hasattr(automation, 'test_data') and automation.test_data:
        test_data = {
            'spoc': automation.test_data.spoc.name if automation.test_data.spoc else None
        }
    
    metrics = None
    if hasattr(automation, 'metrics') and automation.metrics:
        metrics = {
            'post_prod_total_cases': automation.metrics.post_prod_total_cases,
            'post_prod_sys_ex_count': automation.metrics.post_prod_sys_ex_count,
            'post_prod_success_rate': float(automation.metrics.post_prod_success_rate) if automation.metrics.post_prod_success_rate else None
        }
    
    artifacts = None
    if hasattr(automation, 'artifacts') and automation.artifacts:
        artifacts = {
            'artifacts_link': automation.artifacts.artifacts_link,
            'code_review': automation.artifacts.get_code_review_display() if automation.artifacts.code_review else None,
            'demo': automation.artifacts.get_demo_display() if automation.artifacts.demo else None,
            'rampup_issue_list': automation.artifacts.rampup_issue_list
        }
    
    return {
        'air_id': automation.air_id,
        'name': automation.name,
        'type': automation.type,
        'brief_description': automation.brief_description,
        'coe_fed': automation.coe_fed,
        'complexity': automation.complexity,
        'tool_version': automation.tool_version,
        'process_details': automation.process_details,
        'object_details': automation.object_details,
        'queue': automation.queue,
        'shared_folders': automation.shared_folders,
        'shared_mailboxes': automation.shared_mailboxes,
        'qa_handshake': automation.qa_handshake,
        'preprod_deploy_date': automation.preprod_deploy_date,
        'prod_deploy_date': automation.prod_deploy_date,
        'warranty_end_date': automation.warranty_end_date,
        'comments': automation.comments,
        'documentation': automation.documentation,
        'modified': automation.modified,
        'path': automation.path,
        'created_at': automation.created_at,
        'updated_at': automation.updated_at,
        'people': people,
        'environments': environments,
        'test_data': test_data,
        'metrics': metrics,
        'artifacts': artifacts,
    }

def create_related_data(automation: Automation, data: AutomationCreate):
    """Create related data for an automation"""
    # Create people roles
    if data.people:
        for person_data in data.people:
            person, created = Person.objects.get_or_create(name=person_data.name)
            # Map display role to database role
            role_mapping = {
                'Project Manager': 'project_manager',
                'Project Designer': 'project_designer',
                'Developer': 'developer',
                'Tester': 'tester',
                'Business SPOC': 'business_spoc',
                'Business Stakeholder': 'business_stakeholder',
                'Applications-App Owner': 'app_owner',
            }
            role = role_mapping.get(person_data.role, person_data.role.lower().replace(' ', '_'))
            AutomationPersonRole.objects.create(
                automation=automation,
                person=person,
                role=role
            )
    
    # Create environments
    if data.environments:
        for env_data in data.environments:
            Environment.objects.create(
                automation=automation,
                type=env_data.type.lower(),
                vdi=env_data.vdi,
                service_account=env_data.service_account
            )
    
    # Create test data
    if data.test_data and data.test_data.spoc:
        spoc, created = Person.objects.get_or_create(name=data.test_data.spoc)
        TestData.objects.create(automation=automation, spoc=spoc)
    
    # Create metrics
    if data.metrics and any([data.metrics.post_prod_total_cases, data.metrics.post_prod_sys_ex_count, data.metrics.post_prod_success_rate]):
        Metrics.objects.create(
            automation=automation,
            post_prod_total_cases=data.metrics.post_prod_total_cases,
            post_prod_sys_ex_count=data.metrics.post_prod_sys_ex_count,
            post_prod_success_rate=data.metrics.post_prod_success_rate
        )
    
    # Create artifacts
    if data.artifacts and any([data.artifacts.artifacts_link, data.artifacts.code_review, data.artifacts.demo, data.artifacts.rampup_issue_list]):
        Artifacts.objects.create(
            automation=automation,
            artifacts_link=data.artifacts.artifacts_link,
            code_review=data.artifacts.code_review,
            demo=data.artifacts.demo,
            rampup_issue_list=data.artifacts.rampup_issue_list
        )

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Automation Database FastAPI"}

@app.get("/api/automations/", response_model=List[AutomationResponse])
async def get_automations(search: Optional[str] = None):
    """Get all automations with optional search"""
    try:
        queryset = Automation.objects.select_related('tool', 'modified_by').prefetch_related(
            'people_roles__person',
            'environments',
            'test_data__spoc',
            'metrics',
            'artifacts'
        )
        
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(air_id__icontains=search) |
                Q(name__icontains=search) |
                Q(type__icontains=search) |
                Q(brief_description__icontains=search) |
                Q(coe_fed__icontains=search) |
                Q(complexity__icontains=search)
            )
        
        automations = list(queryset.order_by('-created_at'))
        return [automation_to_dict(automation) for automation in automations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/automations/{air_id}/", response_model=AutomationResponse)
async def get_automation(air_id: str):
    """Get a specific automation by AIR ID"""
    try:
        automation = Automation.objects.select_related('tool', 'modified_by').prefetch_related(
            'people_roles__person',
            'environments',
            'test_data__spoc',
            'metrics',
            'artifacts'
        ).get(air_id=air_id)
        return automation_to_dict(automation)
    except Automation.DoesNotExist:
        raise HTTPException(status_code=404, detail="Automation not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/automations/", response_model=AutomationResponse)
async def create_automation(automation: AutomationCreate):
    """Create a new automation"""
    try:
        # Check if automation already exists
        if Automation.objects.filter(air_id=automation.air_id).exists():
            raise HTTPException(status_code=400, detail="Automation with this AIR ID already exists")
        
        # Create base automation data
        automation_data = automation.dict(exclude={'people', 'environments', 'test_data', 'metrics', 'artifacts'})
        new_automation = Automation.objects.create(**automation_data)
        
        # Create related data
        create_related_data(new_automation, automation)
        
        # Fetch the created automation with all related data
        created_automation = Automation.objects.select_related('tool', 'modified_by').prefetch_related(
            'people_roles__person',
            'environments',
            'test_data__spoc',
            'metrics',
            'artifacts'
        ).get(air_id=new_automation.air_id)
        
        return automation_to_dict(created_automation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/automations/{air_id}/", response_model=AutomationResponse)
async def update_automation(air_id: str, automation: AutomationUpdate):
    """Update an existing automation"""
    try:
        existing_automation = Automation.objects.get(air_id=air_id)
        
        # Update fields
        update_data = automation.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing_automation, field, value)
        
        existing_automation.save()
        
        # Fetch updated automation with all related data
        updated_automation = Automation.objects.select_related('tool', 'modified_by').prefetch_related(
            'people_roles__person',
            'environments',
            'test_data__spoc',
            'metrics',
            'artifacts'
        ).get(air_id=air_id)
        
        return automation_to_dict(updated_automation)
    except Automation.DoesNotExist:
        raise HTTPException(status_code=404, detail="Automation not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/automations/{air_id}/", response_model=AutomationResponse)
async def patch_automation(air_id: str, automation: AutomationUpdate):
    """Partially update an existing automation"""
    return await update_automation(air_id, automation)

@app.delete("/api/automations/{air_id}/")
async def delete_automation(air_id: str):
    """Delete an automation"""
    try:
        automation = Automation.objects.get(air_id=air_id)
        automation.delete()
        return {"message": f"Automation {air_id} deleted successfully"}
    except Automation.DoesNotExist:
        raise HTTPException(status_code=404, detail="Automation not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/automations/bulk/")
async def bulk_create_automations(automations: List[AutomationCreate]):
    """Create multiple automations at once"""
    try:
        created_automations = []
        for automation_data in automations:
            # Check if automation already exists
            if not Automation.objects.filter(air_id=automation_data.air_id).exists():
                # Create base automation
                base_data = automation_data.dict(exclude={'people', 'environments', 'test_data', 'metrics', 'artifacts'})
                new_automation = Automation.objects.create(**base_data)
                
                # Create related data
                create_related_data(new_automation, automation_data)
                
                # Fetch created automation with related data
                created_automation = Automation.objects.select_related('tool', 'modified_by').prefetch_related(
                    'people_roles__person',
                    'environments', 
                    'test_data__spoc',
                    'metrics',
                    'artifacts'
                ).get(air_id=new_automation.air_id)
                
                created_automations.append(automation_to_dict(created_automation))
        
        return {
            "message": f"Created {len(created_automations)} automations",
            "created": created_automations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/automations/bulk/")
async def bulk_delete_automations(air_ids: List[str]):
    """Delete multiple automations at once"""
    try:
        deleted_count = Automation.objects.filter(air_id__in=air_ids).delete()[0]
        return {"message": f"Deleted {deleted_count} automations"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
