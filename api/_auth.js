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
