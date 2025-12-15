export async function onRequest(context: any) {
  const { request, env, params } = context;
  
  // Handle API routes
  const url = new URL(request.url);
  const path = params.path;
  
  // Forward to appropriate API handler
  try {
    // Import and call the appropriate API route handler
    const response = await fetch(`${url.origin}/api/${path}`, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'API route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}