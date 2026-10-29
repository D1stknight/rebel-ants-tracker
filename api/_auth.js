// Shared admin-password check. The password is stored in the Vercel
// environment variable ADMIN_PASSWORD (Project → Settings → Environment Variables),
// so it can be changed from the Vercel dashboard/app without editing code.

export function checkPassword(given) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return 'not-configured';
  if (typeof given !== 'string') return false;

  // constant-time comparison
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a[i] || 0) ^ (b[i] || 0);
  }
  return diff === 0;
}

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// The Rebel Console (economy.rebelants.io/admin/tracker) saves with a one-time admin ticket.
// The Tracker asks the economy whether the ticket is real, using its own Authorized App key
// (REBEL_APP_KEY, created in the console under Connected apps & keys with "tracker" in its slug).
// Returns 'ok', 'bad' (not a real ticket) or 'not-configured' (no key set yet).
export async function checkTicket(ticket) {
  const key = (process.env.REBEL_APP_KEY || '').trim();
  if (!key) return 'not-configured';
  if (typeof ticket !== 'string' || !ticket.startsWith('rat_') || ticket.length > 100) return 'bad';
  const economy = (process.env.REBEL_ECONOMY_URL || 'https://economy.rebelants.io').replace(/\/+$/, '');
  try {
    const res = await fetch(economy + '/api/internal/admin-ticket', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, scope: 'tracker.save' }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return 'bad';
    const data = await res.json();
    return data && data.ok === true && (data.role === 'owner' || data.role === 'admin') ? 'ok' : 'bad';
  } catch (e) {
    return 'bad';
  }
}
