export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  const res = await fetch(`${url}/get/rebel_projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const projects = data.result ? JSON.parse(data.result) : null;

  return new Response(JSON.stringify({ projects }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
