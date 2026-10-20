export const config = { runtime: 'edge' };

import { checkPassword, json } from './_auth.js';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  // Only the admin (correct password) can save
  const auth = checkPassword(req.headers.get('x-admin-password') || '');
  if (auth === 'not-configured') {
    return json({ ok: false, error: 'ADMIN_PASSWORD is not set in Vercel' }, 500);
  }
  if (!auth) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }
  if (!Array.isArray(body.projects)) {
    return json({ ok: false, error: 'projects must be an array' }, 400);
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  const kvRes = await fetch(`${url}/set/rebel_projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(JSON.stringify(body.projects))
  });

  if (!kvRes.ok) {
    return json({ ok: false, error: 'Database save failed' }, 502);
  }
  return json({ ok: true });
}
