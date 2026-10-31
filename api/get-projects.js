export const config = { runtime: 'edge' };

// Returns { projects, updated } — `updated` is when the list was last saved from the Rebel Console
// (null until the first save after this change).
export default async function handler(req) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  let projects = null;
  let updated = null;
  try {
    const res = await fetch(`${url}/mget/rebel_projects/rebel_projects_updated`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const [raw, when] = Array.isArray(data.result) ? data.result : [null, null];
    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        projects = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
      } catch (e) {
        projects = null;
      }
    }
    if (typeof when === 'string' && !Number.isNaN(Date.parse(when))) updated = when;
  } catch (e) {
    projects = null;
  }

  return new Response(JSON.stringify({ projects, updated }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
