export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  const res = await fetch(`${url}/get/rebel_projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  let projects = null;
  if (data.result) {
    try {
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      projects = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
    } catch(e) {
      projects = null;
    }
  }

  return new Response(JSON.stringify({ projects }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
