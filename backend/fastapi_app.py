"""
FastAPI integration for Django models.
This provides a FastAPI interface that can coexist with Django.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automation_db.settings')
django.setup()

from automations.models import Automation

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

class AutomationCreate(AutomationBase):
    pass

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

class AutomationResponse(AutomationBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Helper functions
def automation_to_dict(automation: Automation) -> dict:
    """Convert Django model to dict for Pydantic response"""
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
        'created_at': automation.created_at,
        'updated_at': automation.updated_at,
    }

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Automation Database FastAPI"}

@app.get("/api/automations/", response_model=List[AutomationResponse])
async def get_automations(search: Optional[str] = None):
    """Get all automations with optional search"""
    try:
        queryset = Automation.objects.all()
        
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
        automation = Automation.objects.get(air_id=air_id)
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
        
        # Create new automation
        new_automation = Automation.objects.create(**automation.dict())
        return automation_to_dict(new_automation)
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
        return automation_to_dict(existing_automation)
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
                new_automation = Automation.objects.create(**automation_data.dict())
                created_automations.append(automation_to_dict(new_automation))
        
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
