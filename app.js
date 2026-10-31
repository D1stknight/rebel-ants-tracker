import { CONTENT, EXTRAS, CATS, UPDATED_FALLBACK } from './content.js';
import { ICONS } from './icons.js';

const $ = (s, r = document) => r.querySelector(s);
const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const STATUS = {
  live:     { label: 'Live',        cls: 's-live',     color: '#6FE7B7', filter: 'Live' },
  building: { label: 'Building',    cls: 's-building', color: '#FFC768', filter: 'Building' },
  planned:  { label: 'Coming next', cls: 's-planned',  color: '#C7B3FF', filter: 'Planned' },
};
const ORDER = { live: 0, building: 1, planned: 2 };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, cls = 'i') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.sparkles}</svg>`;
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function safeUrl(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; }
}
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

// ── Data ───────────────────────────────────────────────
function shape(p, c) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(p.pct) || 0)));
  let url = safeUrl(p.url);
  if (c.url && (!url || host(url) === host(c.url) || (c.oldHosts || []).includes(host(url)))) url = safeUrl(c.url);
  const self = !!c.self || host(url) === location.hostname || host(url) === 'tracker.rebelants.io';
  const status = c.status || (url || pct >= 100 ? 'live' : pct < 15 ? 'planned' : 'building');
  const cat = c.cat || { live: 'collection', building: 'game', planned: 'media' }[status];
  return {
    id: String(p.id), title: c.title || String(p.name || '').trim() || 'Untitled', pct, url, self, status, cat,
    icon: c.icon || 'sparkles',
    tagline: c.tagline || { live: 'Live now.', building: 'In the works.', planned: 'Coming next.' }[status],
    done: c.done || [], next: c.next || [],
  };
}

function merge(list) {
  const out = list.map((p) => {
    const c = CONTENT[p.id];
    // Only use the extra public text while the console name still matches it
    const ok = c && (!c.match || [].concat(c.match).some((m) => norm(p.name).startsWith(norm(m))));
    return shape(p, ok ? c : {});
  });
  const hosts = new Set(out.map((p) => host(p.url)).filter(Boolean));
  for (const x of EXTRAS) if (!hosts.has(host(x.url))) out.push(shape(x, x));
  // Live first, then building (closest to done first), then coming next; console order otherwise
  return out
    .map((p, i) => ({ p, i }))
    .sort((a, b) => ORDER[a.p.status] - ORDER[b.p.status] ||
      (a.p.status === 'building' ? b.p.pct - a.p.pct : 0) || a.i - b.i)
    .map((x) => x.p);
}

const state = { projects: [], filter: 'all', updated: null };

async function load() {
  try {
    const res = await fetch('/api/get-projects', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data.projects) || !data.projects.length) throw new Error('empty');
    state.projects = merge(data.projects);
    state.updated = data.updated || UPDATED_FALLBACK;
    renderSummary();
    lastW = 0; layoutStage();
    renderFilters(false);
    renderGrid(true);
    openFromHash();
  } catch (e) {
    $('#grid').innerHTML = `<li class="state glass">The project list didn't load. Check your connection and try again.<br><button class="nav-link" type="button" id="retry">Try again</button></li>`;
    $('#retry').onclick = () => { $('#grid').innerHTML = ''; load(); };
  }
}

// ── Summary + ring ─────────────────────────────────────
function renderSummary() {
  const all = state.projects;
  const avg = Math.round(all.reduce((a, p) => a + p.pct, 0) / all.length);
  const n = (s) => all.filter((p) => p.status === s).length;
  countUp($('#overall'), avg);
  $('#overall-sub').textContent = `across ${all.length} projects`;
  $('#counts').innerHTML = ['live', 'building', 'planned'].map((s) =>
    `<span class="count ${STATUS[s].cls}"><span class="dot"></span><span class="label">${n(s)} ${STATUS[s].label.toLowerCase()}</span></span>`).join('');
  const u = String(state.updated || ''), dm = u.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = dm ? new Date(+dm[1], dm[2] - 1, +dm[3]) : new Date(u);
  $('#updated').textContent = isNaN(d) ? '' : 'Updated ' + new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  for (const ring of document.querySelectorAll('.ring')) {
    ring.style.setProperty('--pct', avg / 100);
    requestAnimationFrame(() => requestAnimationFrame(() => ring.classList.add('is-on')));
  }
}

function countUp(el, to) {
  const small = el.querySelector('small').outerHTML;
  if (reduced) { el.innerHTML = to + small; return; }
  const t0 = performance.now(), dur = 1400;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
    el.innerHTML = Math.round(to * e) + small;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Filters ────────────────────────────────────────────
const filters = $('#filters');
function renderFilters(animate = true) {
  const c = { all: state.projects.length };
  for (const s of Object.keys(STATUS)) c[s] = state.projects.filter((p) => p.status === s).length;
  for (const b of filters.querySelectorAll('button')) {
    b.querySelector('.n').textContent = c[b.dataset.f];
    b.setAttribute('aria-pressed', String(b.dataset.f === state.filter));
  }
  moveThumb(animate);
}
function moveThumb(animate = true) {
  const b = filters.querySelector(`button[data-f="${state.filter}"]`);
  const thumb = $('#thumb');
  filters.classList.toggle('no-anim', !animate);
  thumb.style.width = b.offsetWidth + 'px';
  thumb.style.transform = `translateX(${b.offsetLeft - 5}px)`;
}
filters.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.dataset.f === state.filter) return;
  state.filter = b.dataset.f;
  renderFilters(true);
  const go = () => renderGrid(false);
  if (document.startViewTransition && !reduced) document.startViewTransition(go); else go();
  ant?.play('roundhouse_kick');
  const top = $('#projects').getBoundingClientRect().top + scrollY - 70;
  if (scrollY > top + 40) scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
});
addEventListener('resize', () => moveThumb(false));

// ── Cards ──────────────────────────────────────────────
function ring(p, lg = false) {
  return `<span class="pring${lg ? ' lg' : ''}" style="--pct:${p.pct};--c:${STATUS[p.status].color}" role="img" aria-label="${p.pct}% complete">
    <svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="15.5" fill="none" stroke-width="3.4"/><circle class="fg" cx="18" cy="18" r="15.5" fill="none" stroke-width="3.4" pathLength="100"/></svg>
    <b>${p.pct}</b></span>`;
}
const iconTile = (p, xl = false) => {
  const [a, b] = CATS[p.cat] || CATS.collection;
  return `<span class="icon${xl ? ' xl' : ''}" style="--a:${a};--b:${b}">${icon(p.icon)}</span>`;
};
const statusPill = (p) => `<span class="status ${STATUS[p.status].cls}"><span class="dot"></span><span class="t">${STATUS[p.status].label}</span></span>`;
const openBtn = (p, label = 'Open') => p.self
  ? `<span class="here">You're here</span>`
  : p.url ? `<a class="open" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${esc(label + ' ' + p.title)} (opens in a new tab)">${esc(label)} ${icon('arrow-up-right')}</a>` : '';

function renderGrid(first) {
  const grid = $('#grid');
  const list = state.projects.filter((p) => state.filter === 'all' || p.status === state.filter);
  grid.classList.toggle('settled', !first && !!document.startViewTransition && !reduced);
  grid.innerHTML = list.map((p, i) => `
    <li style="--i:${Math.min(i, 12)};view-transition-name:p-${esc(p.id)}">
      <article class="card glass">
        ${iconTile(p)}
        <div class="body">
          <h3><button class="stretch" type="button" data-id="${esc(p.id)}" aria-haspopup="dialog">${esc(p.title)}</button></h3>
          <p>${esc(p.tagline)}</p>
        </div>
        ${ring(p)}
        <div class="foot">${statusPill(p)}${p.status === 'live' ? openBtn(p) : ''}</div>
      </article>
    </li>`).join('') || `<li class="state glass">Nothing here yet.</li>`;
  requestAnimationFrame(() => requestAnimationFrame(() => grid.querySelectorAll('.pring').forEach((r) => r.classList.add('on'))));
}
$('#grid').addEventListener('click', (e) => {
  const b = e.target.closest('.stretch');
  if (b) openSheet(state.projects.find((p) => p.id === b.dataset.id));
});

// ── Detail sheet ───────────────────────────────────────
const sheet = $('#sheet'), panel = $('#sheet-panel');
let lastFocus = null;
function openSheet(p, fromHash = false) {
  if (!p) return;
  lastFocus = document.activeElement;
  const list = (arr, cls, ic) => arr.length ? `<section class="${cls}"><h4>${cls === 'done' ? 'What’s done' : 'What’s next'}</h4><ul>${arr.map((t) => `<li>${icon(ic)}<span>${esc(t)}</span></li>`).join('')}</ul></section>` : '';
  panel.innerHTML = `
    <div class="grab-zone"><div class="grabber"></div></div>
    <button class="close" type="button" aria-label="Close">${icon('x')}</button>
    <div class="sheet-head">
      ${iconTile(p, true)}
      <div><h2 id="sheet-title">${esc(p.title)}</h2>${statusPill(p)}</div>
      ${ring(p, true)}
    </div>
    <p class="tagline">${esc(p.tagline)}</p>
    <div class="bar" style="--c:${STATUS[p.status].color}"><i></i></div>
    ${list(p.done, 'done', 'check')}
    ${list(p.next, 'next', 'circle-dashed')}
    ${p.url && !p.self ? `<div class="cta">${openBtn(p, 'Open ' + (host(p.url) || 'site'))}</div>` : ''}`;
  html.style.overflow = 'hidden';
  sheet.showModal();
  panel.scrollTop = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sheet.classList.add('in');
    panel.querySelector('.pring').classList.add('on');
    panel.querySelector('.bar i').style.width = p.pct + '%';
  }));
  panel.querySelector('.close').onclick = closeSheet;
  if (!fromHash) history.replaceState(null, '', '#p-' + p.id);
  ant?.play('spin_flip_kick');
}
function closeSheet() {
  if (!sheet.open) return;
  sheet.classList.remove('in', 'dragging');
  sheet.style.removeProperty('--drag');
  history.replaceState(null, '', location.pathname + location.search);
  setTimeout(() => { sheet.close(); html.style.overflow = ''; lastFocus?.focus?.({ preventScroll: true }); }, reduced ? 0 : 380);
}
sheet.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(); });
sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
function openFromHash() {
  const m = location.hash.match(/^#p-(.+)$/);
  if (m) openSheet(state.projects.find((p) => p.id === decodeURIComponent(m[1])), true);
}
addEventListener('hashchange', openFromHash);

// Swipe the sheet down to close (phones)
{
  let y0 = null, t0 = 0, dy = 0;
  panel.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.grab-zone, .sheet-head') || matchMedia('(min-width: 700px)').matches) return;
    y0 = e.clientY; t0 = performance.now(); dy = 0;
    sheet.classList.add('dragging'); panel.setPointerCapture(e.pointerId);
  });
  panel.addEventListener('pointermove', (e) => {
    if (y0 === null) return;
    dy = Math.max(0, e.clientY - y0);
    sheet.style.setProperty('--drag', dy + 'px');
  });
  const end = () => {
    if (y0 === null) return;
    const v = dy / Math.max(1, performance.now() - t0);
    y0 = null; sheet.classList.remove('dragging');
    if (dy > 110 || v > 0.6) closeSheet(); else sheet.style.removeProperty('--drag');
  };
  panel.addEventListener('pointerup', end);
  panel.addEventListener('pointercancel', end);
}

// ── Scroll choreography ────────────────────────────────
const stage = $('#stage');
// On phones and tablets, fit the ant between the headline and the summary card
let lastW = 0;
function layoutStage() {
  if (innerWidth === lastW) return;
  lastW = innerWidth;
  if (innerWidth >= 900) { stage.style.removeProperty('height'); stage.style.removeProperty('bottom'); return; }
  const y = scrollY, copy = $('.hero-copy').getBoundingClientRect(), sum = $('#summary').getBoundingClientRect();
  const top = copy.bottom + y - 22, bottom = sum.top + y - 6;
  stage.style.height = Math.max(220, bottom - top) + 'px';
  stage.style.bottom = (innerHeight - bottom) + 'px';
}
layoutStage();
addEventListener('resize', layoutStage);
let ant = null, ticking = false, kicked = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const h = innerHeight;
    const p = Math.max(0, Math.min(1, scrollY / (h * 0.8)));
    stage.style.setProperty('--p', p.toFixed(3));
    ant?.setScroll(scrollY, p);
    if (!kicked && p > 0.45) { kicked = true; ant?.play('hurricane_kick'); }
  });
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
document.addEventListener('touchstart', () => {}, { passive: true }); // enables :active on iOS

// ── Live 3D ant (only where it will run smoothly) ──────
const conn = navigator.connection || {};
const apple = /iPhone|iPad|Macintosh/.test(navigator.userAgent);
const lowEnd = (navigator.deviceMemory && navigator.deviceMemory < 4) ||
  (!apple && navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
  conn.saveData || /(^|-)2g/.test(conn.effectiveType || '');
if (lowEnd) html.classList.add('lite');

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
if (!lowEnd && !reduced && webglOK()) {
  const start = () => import('./ant3d.js')
    .then((m) => m.startAnt($('#ant3d'), stage))
    .then((a) => { ant = a; ant.setScroll(scrollY, Number(stage.style.getPropertyValue('--p')) || 0); })
    .catch(() => {});
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 800));
  if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
}

// Icons in static markup
for (const el of document.querySelectorAll('svg[data-icon]')) {
  el.outerHTML = icon(el.dataset.icon);
}

load();
