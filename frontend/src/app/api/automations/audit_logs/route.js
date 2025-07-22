// Proxy for audit logs endpoint
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/automations/audit-logs/${queryString ? `?${queryString}` : ''}`);
    
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch audit logs' }, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return Response.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
