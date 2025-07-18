// This file now serves as a proxy to the Django backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function DELETE(request, { params }) {
  try {
    const { air_id } = await params;
    
    if (!air_id) {
      return Response.json({ error: 'AIR ID is required' }, { status: 400 });
    }
    
    const response = await fetch(`${BACKEND_URL}/api/automations/${air_id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      return Response.json({ error: 'Automation not found' }, { status: 404 });
    }
    
    return Response.json({ 
      message: `Automation with AIR ID ${air_id} deleted successfully` 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting automation:', error);
    return Response.json({ 
      error: `Failed to delete automation: ${error.message}` 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { air_id } = await params;
    
    if (!air_id) {
      return Response.json({ error: 'AIR ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Validate that we have some data to update
    if (!updateData || Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No update data provided' }, { status: 400 });
    }
    
    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();
    
    const response = await fetch(`${BACKEND_URL}/api/automations/${air_id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const updatedAutomation = await response.json();
    return Response.json(updatedAutomation, { status: 200 });
  } catch (error) {
    console.error('Error updating automation:', error);
    return Response.json({ 
      error: `Failed to update automation: ${error.message}` 
    }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { air_id } = await params;
    
    if (!air_id) {
      return Response.json({ error: 'AIR ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Validate that we have some data to update
    if (!updateData || Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No update data provided' }, { status: 400 });
    }
    
    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();
    
    const response = await fetch(`${BACKEND_URL}/api/automations/${air_id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const updatedAutomation = await response.json();
    return Response.json(updatedAutomation, { status: 200 });
  } catch (error) {
    console.error('Error updating automation:', error);
    return Response.json({ 
      error: `Failed to update automation: ${error.message}` 
    }, { status: 500 });
  }
}
