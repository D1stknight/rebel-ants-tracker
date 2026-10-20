export const config = { runtime: 'edge' };

import { checkPassword, json } from './_auth.js';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let password = '';
  try {
    const body = await req.json();
    password = body.password || '';
  } catch (e) {
    password = '';
  }

  const result = checkPassword(password);
  if (result === 'not-configured') {
    return json({ ok: false, error: 'ADMIN_PASSWORD is not set in Vercel' }, 500);
  }
  if (!result) {
    // small delay to slow down password guessing
    await new Promise(r => setTimeout(r, 800));
    return json({ ok: false }, 401);
  }
  return json({ ok: true });
}
