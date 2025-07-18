// Advanced search API route that proxies to Django backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '50';
    const fuzzy = searchParams.get('fuzzy') || 'true';
    
    // Build query string for backend
    const backendParams = new URLSearchParams({
      q: query,
      limit: limit,
      fuzzy: fuzzy
    });
    
    const response = await fetch(`${BACKEND_URL}/api/automations/search/?${backendParams}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data);
    
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ 
      error: 'Search service unavailable',
      exact_matches: [],
      fuzzy_matches: [],
      suggestions: [],
      total_count: 0
    }, { status: 500 });
  }
}
