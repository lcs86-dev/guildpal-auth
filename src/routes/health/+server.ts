export async function GET() {
  // You can add more comprehensive health checks here
  // like database connectivity, cache availability, etc.
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}