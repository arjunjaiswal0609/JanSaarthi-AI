// Citizen portal — app shell, router and event delegation.
import { t, L, localizeRendered, state as langState, setLang, toggleLang } from '../../shared/js/i18n.js';
import { ic } from '../../shared/js/icons.js';
import { $, $$, esc } from '../../shared/js/dom-utils.js';
import { toast, bindGraph, bindBeforeAfterSlider } from '../../shared/js/ui.js';
import { renderJabalpurMap } from '../../shared/js/map.js';
import { CL, CLUSTERS, cases, initData, saveAppData } from '../../shared/js/data-store.js';
import { authState, isLoggedIn, login, register, logout } from './auth.js';
import * as V from './views.js';

initData();

let activeMap = null; // current Leaflet instance, torn down on every route change
function destroyMap() { if (activeMap) { try { activeMap.remove(); } catch (e) {} activeMap = null; } }

function isProtected(route) { return route === '/report' || route === '/cases' || route.startsWith('/cases/'); }

function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);
  if (hash !== '/demo') V.stopDemo();

  if (isProtected(hash) && !isLoggedIn()) {
    return `<div class="wrap page"><p class="muted" style="margin-top:60px">${t('loginRequiredCitizen')}</p><a class="btn btn-p" style="margin-top:14px;display:inline-flex" href="#/login">${t('login')}</a></div>`;
  }

  switch (parts[0]) {
    case undefined: return V.vHome();
    case 'login': return V.vLogin();
    case 'register': return V.vRegister();
    case 'forgot-password': return V.vForgot();
    case 'report': return V.vReport(render);
    case 'cases': return parts[1] ? V.vCase(parts[1]) : V.vCases();
    case 'problems': return parts[1] ? V.vProblem(parts[1]) : V.vProblems();
    case 'map': return V.vMap();
    case 'demo': return V.vDemo();
    case 'how': return V.vHow();
    default: return V.notFound(t('notFoundGeneric'));
  }
}

const TITLES = { '/': 'JanSaarthi — Your complaint is a signal', '/report': 'Report a problem · JanSaarthi', '/cases': 'My cases · JanSaarthi',
  '/problems': 'Public problems · JanSaarthi', '/map': 'Impact map · JanSaarthi', '/demo': 'Ward demo · JanSaarthi', '/how': 'How it works · JanSaarthi',
  '/login': 'Log in · JanSaarthi', '/register': 'Register · JanSaarthi' };

function shell(inner) {
  const path = (location.hash.replace(/^#/, '') || '/');
  if (path === '/login') {
    return `<main id="main" class="auth-main" tabindex="-1">${inner}</main>`;
  }
  const nav = [['/', t('home')], ['/report', t('report')], ['/cases', t('cases')], ['/problems', t('problems')], ['/map', t('map')], ['/demo', t('demo')], ['/how', t('how')]];
  const cur = (r) => ((r === '/' ? path === '/' : path === r || path.startsWith(r + '/')) ? 'aria-current="page"' : '');
  return `<header class="top"><div class="wrap">
    <a class="logo" href="#/" aria-label="JanSaarthi home"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#5B4CFF"/><path d="M6 20c5-1 6-9 10-9s5 7 10 8" stroke="#00D9FF" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="11" r="2.6" fill="#fff"/></svg><span>JanSaarthi</span><span class="badge b-ai" style="margin-left:2px">AI</span></a>
    <nav class="nav" aria-label="Main">${nav.map((n) => `<a href="#${n[0]}" ${cur(n[0])}>${n[1]}</a>`).join('')}</nav>
    <div class="tools"><button class="chip searchchip" data-act="palette" title="${t('search')} (Ctrl K)">${ic('search', 15)}<span>${t('search')}</span></button>
    ${isLoggedIn() ? `<div class="row usermenu" style="gap:8px"><span class="chip userchip"><span class="uname">${esc(authState.user.name)}</span> · ${t('role_c')}</span><button class="btn btn-s btn-sm" data-act="logout">${t('logout')}</button></div>` : `<a class="btn btn-p btn-sm" href="#/login">${t('login')}</a>`}
    <button class="iconbtn" data-act="lang" aria-label="Switch language">${ic('globe', 17)}</button></div></div></header>
  <main id="main" tabindex="-1">${inner}</main>
  <footer class="foot premium-footer">
    <div class="wrap">
      <div class="footer-topline">
        <span class="footer-live"><i></i>${L('PUBLIC-SERVICE INTELLIGENCE', 'सार्वजनिक-सेवा इंटेलिजेंस')}</span>
        <span class="footer-note">${t('sim')} · ${L('Prototype data for demonstration', 'डेमो के लिए प्रोटोटाइप डेटा')}</span>
      </div>
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="footer-logo" href="#/" aria-label="JanSaarthi home">
            <span class="footer-logo-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="currentColor"/><path d="M6 20c5-1 6-9 10-9s5 7 10 8" stroke="#00D9FF" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="11" r="2.6" fill="#fff"/></svg></span>
            <span>JanSaarthi <em>AI</em></span>
          </a>
          <p>${L('Your complaint is a signal. JanSaarthi connects citizen signals, public problems, infrastructure context and verified outcomes into one learning loop.', 'आपकी शिकायत एक संकेत है। जनसारथी नागरिक संकेतों, सार्वजनिक समस्याओं, इंफ्रास्ट्रक्चर संदर्भ और सत्यापित परिणामों को एक सीखने वाले लूप में जोड़ता है।')}</p>
          <div class="footer-pills"><span>Signal</span><span>Pattern</span><span>Action</span><span>Verification</span></div>
        </div>
        <div><h4>${L('Explore', 'एक्सप्लोर')}</h4><a href="#/">${t('home')}</a><a href="#/report">${t('report')}</a><a href="#/problems">${t('problems')}</a><a href="#/map">${t('map')}</a></div>
        <div><h4>${L('Understand', 'जानें')}</h4><a href="#/demo">${t('demo')}</a><a href="#/how">${t('how')}</a><a href="#/cases">${t('cases')}</a><a href="#/login">${t('login')}</a></div>
        <div class="footer-cta">
          <span class="badge b-ai">AI + HUMAN</span>
          <h4>${L('See a problem become a public signal.', 'देखें कैसे समस्या एक सार्वजनिक संकेत बनती है।')}</h4>
          <p>${L('Follow the complete 21-step JanSaarthi story.', 'जनसारथी की पूरी 21-स्टेप कहानी देखें।')}</p>
          <a class="btn btn-p btn-sm" href="#/demo">${L('Open 21-step demo', '21-स्टेप डेमो खोलें')} ${ic('arrow',14)}</a>
        </div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} JanSaarthi AI · ${L('Citizen prototype', 'सिटीजन प्रोटोटाइप')}</span><span>${L('Government staff: use the separate officer & admin portal.', 'सरकारी कर्मचारी: अलग अधिकारी व प्रशासक पोर्टल का उपयोग करें।')}</span></div>
    </div>
  </footer>
  <nav class="bottomnav" aria-label="Mobile"><a href="#/" ${cur('/')}>${ic('home')}<span>${t('home')}</span></a><a href="#/cases" ${cur('/cases')}>${ic('list')}<span>${t('cases')}</span></a>
  <a class="rp" href="#/report"><span class="pl">${ic('plus', 22)}</span><span style="color:var(--primary)">${t('report')}</span></a>
  <a href="#/problems" ${cur('/problems')}>${ic('layers')}<span>${t('problems')}</span></a><a href="#/how" ${cur('/how')}>${ic('activity')}<span>${t('how')}</span></a></nav>`;
}

function afterRender() {
  bindGraph(); bindBeforeAfterSlider();
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15 });
  $$('.reveal').forEach((x) => io.observe(x));

  destroyMap();
  const homeMap = $('#home-map'); if (homeMap) activeMap = renderJabalpurMap(homeMap, { layers: { dots: true, heat: true, clusters: true, assets: false } });
  const citizenMap = $('#citizen-map'); if (citizenMap) activeMap = renderJabalpurMap(citizenMap, { layers: { dots: false, heat: false, clusters: true, assets: false },
    onClusterClick: (id) => { location.hash = '#/problems/' + id; } });
  const problemMap = $('#problem-map'); if (problemMap) {
    const cl = CL(problemMap.dataset.cluster);
    activeMap = renderJabalpurMap(problemMap, { layers: { dots: true, heat: true, clusters: true, assets: false }, focusLocIds: cl.locs, selectedClusterId: cl.id, showAll: true });
  }
  const demoMap = $('#demo-map'); if (demoMap) {
    const cl = CL('PP-GRH');
    activeMap = renderJabalpurMap(demoMap, { layers: { dots: true, heat: true, clusters: true, assets: true }, focusLocIds: cl.locs, selectedClusterId: cl.id, showAll: true });
  }
}

function render(keep) {
  const y = window.scrollY;
  const inner = route();
  destroyMap();
  $('#app').innerHTML = shell(inner);
  document.title = TITLES[(location.hash.replace(/^#/, '') || '/')] || 'JanSaarthi';
  document.body.classList.toggle('auth-page', (location.hash.replace(/^#/, '') || '/') === '/login');
  afterRender();
  localizeRendered($('#app'));
  if (keep) window.scrollTo(0, y); else window.scrollTo(0, 0);
}

// ---------- actions ----------
const A = {
  lang() { toggleLang(); render(true); },
  logout() { logout(); toast(t('loggedOut')); location.hash = '#/'; render(false); },
  palette() { openPalette(); },
  example(d) { const ex = ['Our tap water has been dirty for five days in Garha.', 'Drain overflowing near the market in Adhartal for 3 days.', 'Streetlight is not working near the park in Napier Town.', 'हमारे इलाके में पाँच दिन से गंदा पानी आ रहा है।'];
    V.reportState.text = ex[+d.i]; V.reportState.err = ''; render(true); },
  mic() { const r = V.reportState;
    if (r.rec) { r.rec = false; r.text = ($('#rtext') || {}).value || r.text || 'Our tap water has been dirty for five days in Garha.'; toast(L('Transcription ready (mock).', 'ट्रांसक्रिप्शन तैयार (मॉक)।')); render(true); return; }
    r.text = ($('#rtext') || {}).value || ''; r.rec = true; render(true);
    setTimeout(() => { if (r.rec) { r.rec = false; if (!r.text) r.text = 'Our tap water has been dirty for five days in Garha.'; toast(L('Transcription ready (mock).', 'ट्रांसक्रिप्शन तैयार (मॉक)।')); if (location.hash === '#/report') render(true); } }, 2200); },
  analyze() { const v = ($('#rtext') || {}).value || ''; V.reportState.text = v.trim();
    if (V.reportState.text.length < 10) { V.reportState.err = L('Please describe the problem in at least a sentence.', 'कृपया समस्या को कम से कम एक वाक्य में बताएँ।'); render(true); return; }
    V.reportState.err = ''; V.startReportProcessing(render); },
  rpBack() { V.reportState.step = 'input'; render(); },
  submitReport() { const id = V.submitReportNow(); toast(L('Report submitted. Case ', 'रिपोर्ट जमा हुई। केस ') + id + L(' created.', ' बनाया गया।')); render(); },
  homeVerify(d) { V.homeVerifyState.choice=d.v; toast(d.v==='yes'?L('Citizen verification recorded.','नागरिक सत्यापन दर्ज हुआ।'):d.v==='part'?L('Partial fix recorded — follow-up required.','आंशिक समाधान दर्ज — फॉलो-अप जरूरी।'):L('Case remains open for investigation.','मामला जाँच के लिए खुला है।')); render(true); },
  verify(d) { const c=cases.find((x)=>x.id===d.id); if(!c)return;
    if(d.v==='yes'){c.stage=6;c.status='Monitoring';c.verification='yes';c.events.push(['You confirmed the fix',0]);saveAppData();toast(L('Verification recorded. Case moved to monitoring.','सत्यापन दर्ज। मामला निगरानी में भेजा गया।'));render(true);}
    else if(d.v==='part'){c.stage=4;c.status='Partially fixed — follow-up required';c.verification='part';c.events.push(['You reported that some issue remains — follow-up required',0]);saveAppData();toast(L('Partial fix recorded. Follow-up required.','आंशिक समाधान दर्ज। फॉलो-अप जरूरी।'));render(true);}
    else {const box=$('#vno');if(!box)return;if(box.dataset.open){const tx=($('#vtxt')||{}).value||'';c.stage=3;c.status='Reopened';c.verification='no';c.events.push(['Case reopened: '+(tx.slice(0,80)||'still happening'),0]);saveAppData();toast(L('Reopened for investigation.','जाँच के लिए मामला फिर खोला गया।'));render(true);return;}box.dataset.open=1;box.innerHTML=`<div style="margin-top:14px"><label for="vtxt">${L('What is still happening?','अभी भी क्या हो रहा है?')}</label><textarea id="vtxt"></textarea><p class="row" style="margin-top:8px"><button class="btn btn-no btn-sm" data-act="verify" data-id="${c.id}" data-v="no">${L('Reopen this case','यह मामला फिर से खोलें')}</button></p></div>`;$('#vtxt').focus();} },
  pf(d) { V.pf.f = d.f; render(true); },
  dnext() { V.demoGo(V.demoState.step + 1, render); }, dprev() { V.demoGo(V.demoState.step - 1, render); }, dgo(d) { V.demoGo(+d.i, render); },
  drestart() { V.stopDemo(); V.demoGo(0, render); },
  dauto() { if (V.demoState.auto) { V.stopDemo(); render(true); return; }
    if (V.demoState.step === V.demoLength() - 1) V.demoState.step = 0;
    V.demoState.auto = true;
    let timer = setInterval(() => { if (location.hash !== '#/demo') { clearInterval(timer); V.demoState.auto = false; return; }
      if (V.demoState.step >= V.demoLength() - 1) { clearInterval(timer); V.demoState.auto = false; render(true); return; }
      V.demoState.step++; render(true); }, 4200);
    render(true); },
  doLogin() { const email = ($('#lem') || {}).value || '', password = ($('#lpw') || {}).value || '', name = ($('#lnm') || {}).value || '';
    const res = login({ email, password, name });
    if (!res.ok) { V.loginErr.msg = res.error; render(true); return; }
    V.loginErr.msg = ''; toast(t('welcomeCitizen')); location.hash = '#/'; render(false); },
  doRegister() { const name = ($('#rnm') || {}).value.trim(), email = ($('#rem') || {}).value || '', password = ($('#rpw') || {}).value || '', confirm = ($('#rpw2') || {}).value || '';
    const res = register({ name, email, password, confirm });
    if (!res.ok) { V.regErr.msg = res.error; render(true); return; }
    V.regErr.msg = ''; toast(t('welcomeCitizen')); location.hash = '#/'; render(false); },
  doForgot() { const em = ($('#fem') || {}).value || ''; if (!em) { toast(t('errRequired')); return; } V.resetSent.v = true; render(true); }
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
  fn(el.dataset, e);
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
  if (location.hash === '#/demo' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
    if (e.key === 'ArrowRight') A.dnext(); if (e.key === 'ArrowLeft') A.dprev();
  }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'rfile') {
    const ok = /\.(jpe?g|png|webp|mp4|pdf|docx)$/i; const bad = [];
    [...e.target.files].forEach((f) => { if (!ok.test(f.name)) bad.push(f.name); else V.reportState.files.push(f.name); });
    V.reportState.text = ($('#rtext') || {}).value || V.reportState.text;
    V.reportState.err = bad.length ? L('Unsupported file(s): ', 'असमर्थित फ़ाइल(ें): ') + bad.join(', ') : '';
    if (!bad.length) toast(L('Evidence attached.', 'साक्ष्य जोड़ा गया।'));
    render(true);
  }
});

// ---------- lightweight command palette ----------
function openPalette() {
  const cmds = [[t('home'), '#/'], [t('report'), '#/report'], [t('cases'), '#/cases'], [t('problems'), '#/problems'], [t('map'), '#/map'], [t('demo'), '#/demo'], [t('how'), '#/how']];
  const items = (q) => { q = q.toLowerCase().trim(); let r = cmds.map((c) => ({ l: c[0], h: c[1] }));
    if (q) { r = r.filter((x) => x.l.toLowerCase().includes(q)); CLUSTERS.filter((c) => c.title.toLowerCase().includes(q)).forEach((c) => r.push({ l: c.title, h: '#/problems/' + c.id })); }
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

// ---------- boot ----------
window.addEventListener('hashchange', () => { render(false); const m = $('#main'); if (m) m.focus({ preventScroll: true }); });
document.documentElement.lang = langState.lang;
try { localStorage.removeItem('js_theme_citizen'); } catch (e) {}
document.documentElement.setAttribute('data-theme', 'light');
render(false);
