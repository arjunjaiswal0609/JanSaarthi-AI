// Officer & Admin portal — app shell, router and event delegation.
import { t, L, localizeRendered, state as langState, toggleLang } from '../../shared/js/i18n.js';
import { ic } from '../../shared/js/icons.js';
import { $, $$, esc } from '../../shared/js/dom-utils.js';
import { toast, bindGraph } from '../../shared/js/ui.js';
import { renderJabalpurMap } from '../../shared/js/map.js';
import {
  CL, CLUSTERS, ASSET, G, cases, initData, saveAppData, clearAppData, buildGrievances, seedCases,
  findOrCreateCase, syncGrievanceFromCase, shared, audit, nextId
} from '../../shared/js/data-store.js';
import { deptL } from '../../shared/js/categories.js';
import { LOC } from '../../shared/js/geo-jabalpur.js';
import { authState, isLoggedIn, login, logout } from './auth.js';
import * as V from './views.js';

initData();

let activeMap = null;
function destroyMap() { if (activeMap) { try { activeMap.remove(); } catch (e) {} activeMap = null; } }

function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);

  if (hash === '/login') return V.vLogin();
  if (!isLoggedIn()) return `<div class="wrap page"><p class="muted" style="margin-top:60px">${t('loginRequiredOfficer')}</p><a class="btn btn-p" style="margin-top:14px;display:inline-flex" href="#/login">${t('login')}</a></div>`;

  switch (parts[0]) {
    case undefined: return V.vCommand();
    case 'problems': return parts[1] ? V.vProblemDetail(parts[1]) : V.vProblemsList();
    case 'cases': return parts[1] ? V.vCaseDetail(parts[1]) : V.vCasesList();
    case 'emerging': return V.vEmerging();
    case 'recurring': return V.vRecurring();
    case 'assets': return parts[1] ? V.vAssetDetail(parts[1]) : V.vAssetsList();
    case 'departments': return V.vDepartments();
    case 'admin': return V.vAdmin();
    case 'how': return V.vHow();
    default: return V.notFound(t('officerPageMissing'), '#/', t('backToCommand'));
  }
}

const TITLES = { '/': 'Command Center · JanSaarthi Officer', '/login': 'Log in · JanSaarthi Officer', '/problems': 'Public problems · Officer',
  '/cases': 'Cases & SLA · Officer', '/emerging': 'Emerging issues · Officer', '/recurring': 'Recurring problems · Officer',
  '/assets': 'Infrastructure · Officer', '/departments': 'Departments · Officer', '/admin': 'Demo data · Officer', '/how': 'How it works · Officer' };

function shell(inner) {
  const path = location.hash.replace(/^#/, '') || '/';
  if (path === '/login') {
    return `<main id="main" class="auth-main" tabindex="-1">${inner}</main>`;
  }
  if (!isLoggedIn()) {
    return `<header class="top"><div class="wrap"><a class="logo" href="#/" aria-label="Officer portal"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#5B4CFF"/><path d="M6 20c5-1 6-9 10-9s5 7 10 8" stroke="#00D9FF" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="11" r="2.6" fill="#fff"/></svg><span>JanSaarthi</span><span class="badge b-ai" style="margin-left:2px">${t('role_o')}</span></a>
    <div class="tools" style="margin-left:auto"><button class="iconbtn" data-act="lang" aria-label="Switch language">${ic('globe', 17)}</button></div></div></header>
    <main id="main" tabindex="-1">${inner}</main>`;
  }
  const it = [['/', 'activity', t('command')], ['/problems', 'network', t('publicProblemsTitle')], ['/cases', 'clock', t('ccCasesTitle')],
    ['/emerging', 'trend', t('emergingTitle')], ['/recurring', 'repeat', t('recurringTitle')], ['/assets', 'building', t('assetsTitle')],
    ['/departments', 'shield', t('deptTitle')], ['/admin', 'layers', t('adminTitle')], ['/how', 'user', t('how')]];
  const cur = (r) => ((r === '/' ? path === '/' : path === r || path.startsWith(r + '/')) ? 'aria-current="page"' : '');
  return `<header class="top"><div class="wrap">
  <a class="logo" href="#/" aria-label="Officer portal"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#5B4CFF"/><path d="M6 20c5-1 6-9 10-9s5 7 10 8" stroke="#00D9FF" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="11" r="2.6" fill="#fff"/></svg><span>JanSaarthi</span><span class="badge b-ai" style="margin-left:2px">${t('role_o')}</span></a>
  <nav class="nav" aria-label="Main"><a href="#/" ${cur('/')}>${t('command')}</a><a href="#/how" ${cur('/how')}>${t('how')}</a></nav>
  <div class="tools"><button class="chip searchchip" data-act="palette" title="${t('search')} (Ctrl K)">${ic('search', 15)}<span>${t('search')}</span></button>
  <div class="row usermenu" style="gap:8px"><span class="chip userchip"><span class="uname">${esc(authState.user.name)}</span> · ${t('role_o')}</span><button class="btn btn-s btn-sm" data-act="logout">${t('logout')}</button></div>
  <button class="iconbtn" data-act="lang" aria-label="Switch language">${ic('globe', 17)}</button></div></div></header>
  <div class="cc-shell"><nav class="side" aria-label="Officer">${it.map((i) => `<a href="#${i[0]}" ${cur(i[0])}>${ic(i[1], 17)}${i[2]}</a>`).join('')}</nav>
  <main id="main" class="cc-main" tabindex="-1">${inner}</main></div>`;
}

function afterRender() {
  bindGraph();
  destroyMap();
  const ccMap = $('#cc-map'); if (ccMap) activeMap = renderJabalpurMap(ccMap, { layers: V.layerState, selectedClusterId: V.selState.clusterId,
    onClusterClick: (id) => { V.selState.clusterId = id; render(true); }, onAssetClick: (id) => { location.hash = '#/assets/' + id; } });
  const probMap = $('#problem-map'); if (probMap) { const cl = CL(probMap.dataset.cluster);
    activeMap = renderJabalpurMap(probMap, { layers: { dots: true, heat: true, clusters: true, assets: true }, focusLocIds: cl.locs, selectedClusterId: cl.id, showAll: true }); }
  const assetMap = $('#asset-map'); if (assetMap) { const a = ASSET(assetMap.dataset.asset);
    activeMap = renderJabalpurMap(assetMap, { layers: { dots: false, heat: false, clusters: false, assets: true }, focusLocIds: [a.loc] }); }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('[data-count]').forEach((el) => { const to = +el.dataset.count; if (!to) return; const start = performance.now();
      const tick = (n) => { const k = Math.min(1, (n - start) / 700); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); });
  }
}

function render(keep) {
  const y = window.scrollY;
  const inner = route();
  destroyMap();
  $('#app').innerHTML = shell(inner);
  document.body.classList.add('officer-body');
  document.title = TITLES[location.hash.replace(/^#/, '') || '/'] || 'JanSaarthi Officer';
  document.body.classList.toggle('auth-page', (location.hash.replace(/^#/, '') || '/') === '/login');
  afterRender();
  localizeRendered($('#app'));
  if (keep) window.scrollTo(0, y); else window.scrollTo(0, 0);
}

const A = {
  lang() { toggleLang(); render(true); },
  logout() { logout(); toast(t('loggedOut')); location.hash = '#/login'; render(false); },
  doLogin() { const email = ($('#lem') || {}).value || '', password = ($('#lpw') || {}).value || '', name = ($('#lnm') || {}).value || '';
    const res = login({ email, password, name, role: 'officer' });
    if (!res.ok) { V.loginErr.msg = res.error; render(true); return; }
    V.loginErr.msg = ''; toast(t('welcomeOfficer') || 'Logged in.'); location.hash = '#/'; render(false); },
  palette() { openPalette(); },
  layer(d) { V.layerState[d.l] = !V.layerState[d.l]; render(true); },
  closeSel() { V.selState.clusterId = null; render(true); },
  openCase(d) { location.hash = '#/cases/' + d.id; },
  mergeDup(d) { audit('Merged duplicate complaints in ' + d.id); saveAppData(); toast(L('Duplicates merged.', 'डुप्लिकेट मर्ज किए गए।')); },
  keepSep(d) { audit('Kept complaints separate in ' + d.id); saveAppData(); toast(L('Marked as kept separate.', 'अलग रखा गया।')); },
  linkProb(d) { audit('Linked related complaints to ' + d.id); saveAppData(); toast(L('Complaints linked.', 'शिकायतें जोड़ी गईं।')); },
  addNote(d) { const v = ($('#nt') || {}).value.trim(); if (!v) { toast(L('Write a note first.', 'पहले नोट लिखें।')); return; }
    (shared.notes[d.id] = shared.notes[d.id] || []).push(v); audit('Note added on ' + d.id); saveAppData(); toast(t('recordNote')); render(true); },
  ccSetStage(d) { const c = findOrCreateCase(d.id); if (!c) return; const v = +($('#ccstage') || {}).value; if (Number.isNaN(v)) return;
    c.stage = v; if (v >= 7) c.status = 'Resolved';
    c.events.push([L('Officer updated status to: ', 'अधिकारी ने स्थिति अपडेट की: ') + v, 0]);
    syncGrievanceFromCase(c); audit('Set stage of ' + c.id + ' to ' + v); toast(t('stageUpdatedToast')); saveAppData(); render(true); },
  ccAssignDept(d) { const c = findOrCreateCase(d.id); if (!c) return; const v = ($('#ccdept') || {}).value; if (!v) return;
    c.deptOverride = v; c.events.push([L('Assigned to ', 'सौंपा गया: ') + v, 0]); audit('Assigned ' + c.id + ' to ' + v); toast(t('deptAssignedToast')); saveAppData(); render(true); },
  ccAssignOfficer(d) { const c = findOrCreateCase(d.id); if (!c) return; const v = ($('#ccofficer') || {}).value.trim();
    c.assignedOfficer = v; if (v) c.events.push([L('Officer assigned: ', 'अधिकारी नियुक्त: ') + v, 0]); audit('Officer assigned on ' + c.id); toast(t('officerAssignedToast')); saveAppData(); render(true); },
  ccNote(d) { const c = findOrCreateCase(d.id); if (!c) return; const v = ($('#ccnote') || {}).value.trim(); if (!v) { toast(L('Write a note first.', 'पहले नोट लिखें।')); return; }
    c.events.push([v, 0]); audit('Note added on case ' + c.id); toast(t('recordNote')); saveAppData(); render(true); },
  ccQuick(d) { const c = findOrCreateCase(d.id); if (!c) return;
    const map = { investigate: 3, action: 4, resolve: 7, confirm: 7, reopen: 3 };
    const labels = { investigate: t('markInvestigating'), action: t('markActionTaken'), resolve: t('markResolved'), confirm: t('recordCitizenConfirm'), reopen: t('reopenCaseBtn') };
    c.stage = map[d.k]; c.status = d.k === 'reopen' ? 'Reopened' : d.k === 'resolve' || d.k === 'confirm' ? 'Resolved' : 'Investigation';
    c.events.push([labels[d.k], 0]); syncGrievanceFromCase(c); audit(d.k + ' on ' + c.id); toast(t('caseUpdated')); saveAppData(); render(true); },
  caseFilter(d) { V.caseFilter.src = d.f; render(true); },
  simulate() { const cl = CL('PP-GRH'); const w = LOC(cl.locs[0]); const a = Math.random() * Math.PI * 2, rr = 0.004 + Math.random() * 0.006;
    const id = nextId();
    G.push({ id, cluster: cl.id, cat: 'water', loc: cl.locs[0], lat: w.lat + Math.sin(a) * rr, lng: w.lng + Math.cos(a) * rr, daysAgo: 0,
      text: 'Brown water in the tap since this morning', sev: 'high', asset: cl.assets[0][0], dupOf: null, status: 'Assigned', verified: false, source: 'demo' });
    (shared.liveEvents = shared.liveEvents || []).push({ k: 'emerging', h: L('NEW SIGNAL LINKED', 'नया संकेत जुड़ा'), p: `${id} ${L('linked to', 'से जुड़ा')} ${cl.title}`, ref: '#/problems/PP-GRH', when: L('just now', 'अभी-अभी') });
    audit('Simulated grievance ' + id + ' added'); toast(L('New complaint linked.', 'नई शिकायत जोड़ी गई।')); saveAppData(); render(true); },
  resetData() { buildGrievances(); shared.liveEvents = []; seedCases(); shared.notes = {}; shared.overrides = {}; shared.audit = [];
    clearAppData(); saveAppData(); toast(L('Demo scenario reset.', 'डेमो परिदृश्य रीसेट हुआ।')); render(true); },
  clearUserData() { if (!confirm(t('clearUserDataConfirm'))) return;
    for (let i = G.length - 1; i >= 0; i--) if (G[i].source === 'user') G.splice(i, 1);
    const kept = cases.filter((c) => c.source !== 'user'); cases.length = 0; kept.forEach((c) => cases.push(c));
    audit('Cleared citizen-submitted data'); toast(t('userDataCleared')); saveAppData(); render(true); }
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
  fn(el.dataset, e);
});
document.addEventListener('change', (e) => {
  if (e.target.dataset && e.target.dataset.ovr) {
    shared.overrides[e.target.dataset.ovr] = e.target.value; audit('Authority override on ' + e.target.dataset.ovr + ' -> ' + e.target.value);
    toast(L('Authority overridden to ', 'प्राधिकरण बदलकर किया गया: ') + deptL(e.target.value) + '.'); saveAppData(); render(true);
  }
});
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); } });

function openPalette() {
  const cmds = [[t('command'), '#/'], [t('publicProblemsTitle'), '#/problems'], [t('ccCasesTitle'), '#/cases'], [t('emergingTitle'), '#/emerging'],
    [t('recurringTitle'), '#/recurring'], [t('assetsTitle'), '#/assets'], [t('deptTitle'), '#/departments'], [t('adminTitle'), '#/admin']];
  const items = (q) => { q = q.toLowerCase().trim(); let r = cmds.map((c) => ({ l: c[0], h: c[1] }));
    if (q) { r = r.filter((x) => x.l.toLowerCase().includes(q));
      CLUSTERS.filter((c) => c.title.toLowerCase().includes(q)).forEach((c) => r.push({ l: c.title, h: '#/problems/' + c.id }));
      G.filter((g) => g.id.toLowerCase().includes(q) || g.text.toLowerCase().includes(q)).slice(0, 5).forEach((g) => r.push({ l: g.id + ' · ' + g.text.slice(0, 44), h: '#/cases/' + g.id })); }
    return r.slice(0, 10); };
  let sel = 0, list = items('');
  const draw = () => { $('#pl').innerHTML = list.length ? list.map((x, i) => `<li><button role="option" aria-selected="${i === sel}" data-i="${i}">${ic('search', 15)}<span>${esc(x.l)}</span></button></li>`).join('') : `<li class="empty" style="border:0">${L('Nothing found.', 'कुछ नहीं मिला।')}</li>`; };
  $('#modal').innerHTML = `<div class="overlay" id="ov"><div class="pal" role="dialog" aria-modal="true"><input id="pq" placeholder="${t('search')}…" autocomplete="off"><ul id="pl" role="listbox"></ul></div></div>`;
  draw(); $('#pq').focus();
  const close = () => { $('#modal').innerHTML = ''; };
  const go = (i) => { const x = list[i]; if (x) { close(); location.hash = x.h; } };
  $('#ov').onclick = (e) => { if (e.target.id === 'ov') close(); };
  $('#pq').oninput = (e) => { list = items(e.target.value); sel = 0; draw(); };
  $('#pq').onkeydown = (e) => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowDown') { sel = Math.min(list.length - 1, sel + 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter') go(sel); };
  $('#pl').onclick = (e) => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); };
}

window.addEventListener('hashchange', () => { render(false); const m = $('#main'); if (m) m.focus({ preventScroll: true }); });
document.documentElement.lang = langState.lang;
try { localStorage.removeItem('js_theme_officer'); } catch (e) {}
document.documentElement.setAttribute('data-theme', 'light');
if (!isLoggedIn() && (location.hash.replace(/^#/, '') || '/') !== '/login') location.hash = '#/login';
render(false);
