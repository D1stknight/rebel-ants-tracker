export const config = { runtime: 'edge' };

import { checkPassword, checkTicket, json } from './_auth.js';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  // Saves come from the Rebel Console with a one-time admin ticket. The old password
  // still works until the public admin button is removed.
  if (body && typeof body.ticket === 'string') {
    const t = await checkTicket(body.ticket);
    if (t === 'not-configured') return json({ ok: false, error: 'REBEL_APP_KEY is not set in Vercel' }, 503);
    if (t !== 'ok') return json({ ok: false, error: 'Unauthorized' }, 401);
  } else {
    const auth = checkPassword(req.headers.get('x-admin-password') || '');
    if (auth === 'not-configured') {
      return json({ ok: false, error: 'ADMIN_PASSWORD is not set in Vercel' }, 500);
    }
    if (!auth) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }
  }
  if (!Array.isArray(body.projects) || body.projects.length > 60) {
    return json({ ok: false, error: 'projects must be a list of at most 60' }, 400);
  }
  const clean = [];
  for (const p of body.projects) {
    const id = Number(p && p.id), pct = Math.round(Number(p && p.pct));
    const name = String((p && p.name) || '').trim().slice(0, 80);
    let url = String((p && p.url) || '').trim().slice(0, 300);
    if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
    if (!Number.isInteger(id) || !name || !Number.isFinite(pct) || (url && !/^https?:\/\/[^\s"'<>]+$/i.test(url))) {
      return json({ ok: false, error: 'A project is not valid' }, 400);
    }
    clean.push({ id, name, pct: Math.min(100, Math.max(0, pct)), url });
  }
  body.projects = clean;

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
