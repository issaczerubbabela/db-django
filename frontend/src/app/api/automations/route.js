// This file now serves as a proxy to the Django backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/automations/`);
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching automations:', error);
    return Response.json({ error: 'Failed to fetch automations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const automationData = await request.json();
    console.log('Received automation data:', automationData);
    
    const response = await fetch(`${BACKEND_URL}/api/automations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(automationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const newAutomation = await response.json();
    return Response.json(newAutomation, { status: 201 });
  } catch (error) {
    console.error('Error creating automation:', error);
    return Response.json({ 
      error: `Failed to create automation: ${error.message}` 
    }, { status: 500 });
  }
}
