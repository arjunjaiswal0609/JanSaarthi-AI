// Officer & Admin portal — view render functions.
import { t, L, state as langState } from '../../shared/js/i18n.js';
import { ic } from '../../shared/js/icons.js';
import { esc } from '../../shared/js/dom-utils.js';
import { catL, deptL, assetTypeL, healthL, statusL, CAT, DEPTS } from '../../shared/js/categories.js';
import {
  CLUSTERS, CL, ASSET, ASSETS, G, cases, gOf, clusterCount, isOpen, isRecurring, isEmerging, isMaster,
  growth, seriesOf, impact, kpis, feedEvents, deptStats, slaState, dlDays, assetStats, findOrCreateCase,
  shared
} from '../../shared/js/data-store.js';
import { LOC, LOCALITIES } from '../../shared/js/geo-jabalpur.js';
import { badge, timeline, areaChart, sparkline, graphHTML, impactBars, recurrenceTimeline } from '../../shared/js/ui.js';


function workspaceHeader(index, eyebrow, title, sub, status=L('LIVE GOVERNMENT WORKSPACE','लाइव सरकारी कार्यक्षेत्र')) {
  return `<div class="workspace-header reveal gov-workspace-header">
    <div class="workspace-index">${String(index).padStart(2,'0')}</div>
    <div class="workspace-copy"><span class="workspace-code">GOV-${String(index).padStart(2,'0')}</span><span class="workspace-eyebrow">${eyebrow}</span><h1>${title}</h1><p>${sub}</p></div>
    <div class="workspace-status"><span class="status-dot"></span><b>${status}</b><small>${L('evidence-first government workflow','साक्ष्य-प्रथम सरकारी कार्यप्रवाह')}</small></div>
  </div>`;
}

export const crumbs = (items) => `<nav class="crumb" aria-label="Breadcrumb">${items.map((x, i) => (i < items.length - 1 ? `<a href="${x[1]}">${x[0]}</a><span>/</span>` : `<span aria-current="page">${x[0]}</span>`)).join('')}</nav>`;
export function notFound(msg, href, label) { return `<div class="wrap page"><div class="empty" style="margin-top:40px"><h1 class="h-card">${msg}</h1><a class="btn btn-p" style="margin-top:14px;display:inline-flex" href="${href}">${label}</a></div></div>`; }

const stagesEN = ['Reported', 'AI analyzed', 'Assigned', 'Investigation', 'Action taken', 'Awaiting citizen confirmation', 'Monitoring', 'Resolved'];
const stagesHI = ['दर्ज हुआ', 'AI विश्लेषण हुआ', 'सौंपा गया', 'जाँच जारी', 'कार्रवाई हुई', 'नागरिक पुष्टि प्रतीक्षित', 'निगरानी', 'हल हुआ'];
const stagesArr = () => (langState.lang === 'hi' ? stagesHI : stagesEN);

// ================================================================ LOGIN ===
export const loginErr = { msg: '' };
export function vLogin() {
  return `<div class="auth-screen officer-auth">
    <section class="auth-visual">
      <div class="auth-visual-top"><span class="auth-kicker">${L('GOVERNMENT INTELLIGENCE ACCESS','सरकारी इंटेलिजेंस एक्सेस')}</span><span class="auth-code">AI 01</span></div>
      <div class="auth-visual-core">
        <div class="auth-mark auth-mark-officer">${ic('shield', 30)}</div>
        <span class="auth-eyebrow">${L('SIGNAL → INVESTIGATION → ACTION','संकेत → जाँच → कार्रवाई')}</span>
        <h1>${L('From signal<br>to coordinated<br>action.','संकेत से<br>समन्वित<br>कार्रवाई तक।')}</h1>
        <p>${L('Investigate public problems, connect infrastructure evidence and verify outcomes from one operational workspace.','सार्वजनिक समस्याओं की जाँच करें, इन्फ्रास्ट्रक्चर साक्ष्य जोड़ें और एक ही ऑपरेशनल कार्यक्षेत्र से परिणाम सत्यापित करें।')}</p>
        <div class="auth-flow"><span>${L('Signal intake','सिग्नल इनटेक')}</span><i>→</i><span>${L('Investigation','जाँच')}</span><i>→</i><span>${L('Action','कार्रवाई')}</span></div>
      </div>
      <div class="auth-orbit"><span class="auth-orbit-dot d1"></span><span class="auth-orbit-dot d2"></span><span class="auth-orbit-dot d3"></span><div class="auth-orbit-ring r1"></div><div class="auth-orbit-ring r2"></div></div>
    </section>
    <section class="auth-form-panel">
      <div class="auth-panel-top"><div class="auth-gov"><span class="auth-mini-logo">${ic('shield', 18)}</span><span>JANSAARTHI / GOV</span></div><div class="auth-access"><i></i>${L('STAFF ACCESS','स्टाफ एक्सेस')}</div></div>
      <div class="auth-form-wrap">
        <div class="auth-form-icon auth-form-icon-officer">${ic('shield', 25)}</div>
        <h2>${t('officerPortalName')}</h2><p class="auth-form-sub">${t('loginSubOfficer')}</p>
        <form id="loginForm"><label for="lem">${t('emailLbl')}</label><input id="lem" type="email" autocomplete="username" placeholder="officer@jansaarthi.gov.in">
        <div class="auth-field-gap"></div><label for="lpw">${t('passwordLbl')}</label><input id="lpw" type="password" autocomplete="current-password" placeholder="••••••••">
        <div class="auth-field-gap"></div><label for="lnm">${t('nameLbl')} <span class="muted small">(${L('optional', 'वैकल्पिक')})</span></label><input id="lnm" autocomplete="name" placeholder="${L('e.g. R. Kumar, Water Supply Dept.', 'उदा. आर. कुमार, जल विभाग')}">
        ${loginErr.msg ? `<div class="err" role="alert" style="margin-top:8px">${esc(loginErr.msg)}</div>` : ''}
        <p class="auth-submit"><button class="btn btn-p btn-lg" style="width:100%;justify-content:center" data-act="doLogin" type="button">${t('loginBtn')}</button></p></form>
        <p class="sim auth-demo">${t('demoCredsNote')}</p>
        <p class="small muted auth-staff-note">${L('This console is for government staff. Citizens should use the citizen portal.','यह कंसोल सरकारी कर्मचारियों के लिए है। नागरिक कृपया नागरिक पोर्टल का उपयोग करें।')}</p>
      </div>
      <div class="auth-panel-foot"><button class="auth-lang" data-act="lang" type="button">${langState.lang === 'hi' ? 'English' : 'हिन्दी'} ${ic('globe',14)}</button><span>${L('Government operations · JanSaarthi AI','सरकारी संचालन · जनसारथी AI')}</span></div>
    </section>
  </div>`;
}

// ============================================================ COMMAND ====
export const layerState = { heat: true, clusters: true, dots: true, assets: true };
export const selState = { clusterId: null };

export function vCommand() {
  const k = kpis(); const em = CLUSTERS.filter(isEmerging);
  const KLBL = { active: L('Active grievances', 'सक्रिय शिकायतें'), problems: t('publicProblemsLbl2'), emerging: t('emergingProblems'),
    recurring: t('recurringFailures'), sla: L('SLA risks', 'SLA जोखिम'), unver: L('Unverified resolutions', 'असत्यापित समाधान') };
  const kp = Object.entries(k).map(([key, x]) => `<div class="kpi"><div class="v num" data-count="${x.v}">${x.v}</div><div class="l">${KLBL[key]}</div>${x.s ? sparkline(x.s) : '<div style="height:32px"></div>'}</div>`).join('');
  const sel = selState.clusterId ? CL(selState.clusterId) : null;
  return `${workspaceHeader(1,L('GOVERNMENT INTELLIGENCE','सरकारी इंटेलिजेंस'),t('ccTitle'),t('ccSub'))}<div class="kpis">${kp}</div>
  <div class="cc-grid"><div class="panel" style="padding:0;overflow:hidden;position:relative">
  <div class="mapbox" style="border:0;border-radius:0"><div class="map-tools">${[['heat', L('Density', 'घनत्व')], ['clusters', L('Problems', 'समस्याएँ')], ['dots', L('Complaints', 'शिकायतें')], ['assets', L('Assets', 'संपत्तियाँ')]].map((l) => `<button class="chip" aria-pressed="${layerState[l[0]]}" data-act="layer" data-l="${l[0]}">${l[1]}</button>`).join('')}</div>
  <div id="cc-map" class="leaflet-map"></div><span class="map-note">${L('Jabalpur · simulated demo data', 'जबलपुर · सिम्युलेटेड डेमो डेटा')}</span></div>
  ${sel ? `<aside class="side-panel"><div class="row between"><b>${esc(sel.title)}</b><button class="iconbtn" data-act="closeSel">${ic('x', 16)}</button></div>
    <div class="num" style="font-size:40px;font-weight:700;margin-top:10px">${clusterCount(sel)}</div><div class="muted small">${t('relatedCompLbl')}</div>
    <p class="small" style="margin:12px 0"><b>${t('possibleRootCause')}:</b> ${sel.cause}</p><a class="btn btn-p btn-sm" href="#/problems/${sel.id}">${L('Open investigation', 'जाँच खोलें')}</a></aside>` : ''}</div>
  <div class="col" style="gap:18px"><div class="panel"><div class="row between"><h3>${t('liveSignals')}</h3><button class="btn btn-s btn-sm" data-act="simulate">${ic('zap', 14)} ${t('simulateNew')}</button></div>
  <div class="feed">${feedEvents().slice(0, 6).map((e) => `<a class="ev ${e.k}" href="${e.ref}"><span class="bar"></span><div><b>${e.h}</b><p>${esc(e.p)}</p><small>${e.when}</small></div></a>`).join('')}</div></div></div></div>
  <div class="grid g2" style="margin-top:18px;align-items:start"><div class="panel"><h3>${t('emergingProblems')}</h3>${em.length ? em.map((c) => { const g = growth(c); return `<a href="#/problems/${c.id}" style="text-decoration:none;display:block"><div class="row between"><b>${esc(c.title)}</b><span class="badge b-rev">+${g.pct}%</span></div>${areaChart(seriesOf(c, 6), ['-5', '-4', '-3', '-2', '', ''], 120, 'var(--warning)')}</a>`; }).join('') : `<div class="empty">${t('noEmerging')}</div>`}</div>
  <div class="panel"><h3>${t('recurringFailures')}</h3>${ASSETS.filter((a) => a.failures >= 3).sort((a, b) => b.failures - a.failures).slice(0, 4).map((a) => { const s = assetStats(a); return `<a href="#/assets/${a.id}" style="display:grid;grid-template-columns:1fr auto;gap:8px;padding:12px 0;border-bottom:1px solid var(--line);text-decoration:none"><div><b>${a.id}</b> <span class="muted small">${assetTypeL(a.type)} · ${LOC(a.loc).name}</span></div><span class="badge b-crit">${healthL(s.health)}</span></a>`; }).join('')}<p class="small muted" style="margin-top:10px">${t('repeatWarn')}</p></div></div>`;
}

// ======================================================= PUBLIC PROBLEMS ==
export const probFilter = { f: 'all' };
export function vProblemsList() {
  const list = CLUSTERS;
  return `<div>${workspaceHeader(2,L('PUBLIC PROBLEM INTELLIGENCE','सार्वजनिक समस्या इंटेलिजेंस'),t('publicProblemsTitle'),t('publicProblemsSub'))}${crumbs([[t('command'), '#/'], [t('publicProblemsTitle'), '#/problems']])}
  <div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>${t('thProblem')}</th><th>${t('thSignals')}</th><th>${t('thWards')}</th><th>${t('thImpact')}</th><th>${t('thAuthority')}</th><th>${t('thStatus')}</th></tr></thead>
  <tbody>${list.map((c) => { const im = impact(c); const LBL = { High: L('High', 'उच्च'), Medium: L('Medium', 'मध्यम'), Low: L('Low', 'निम्न') };
    return `<tr><td><a href="#/problems/${c.id}"><b>${esc(c.title)}</b></a><div class="small muted">${c.cause}</div></td><td class="num">${clusterCount(c)}</td><td>${c.locs.map((l) => LOC(l).name).join(', ')}</td>
    <td><span class="badge ${im.label === 'High' ? 'b-crit' : 'b-rev'}">${LBL[im.label]}</span></td><td>${deptL(shared.overrides[c.id] || c.dept)}${isMaster(c) ? ' +' + c.master.support.length : ''}</td><td>${statusL(c.status)}</td></tr>`; }).join('')}</tbody></table></div></div>`;
}

export function vProblemDetail(id) {
  const cl = CL(id); if (!cl) return notFound(t('couldntLoad') || 'Not found', '#/problems', t('backToCommand'));
  const n = clusterCount(cl), gs = gOf(cl.id);
  const ser = seriesOf(cl, cl.id === 'PP-SL' ? 31 : 14), labs = ser.map((_, i) => '' + (ser.length - 1 - i));
  const dept = shared.overrides[cl.id] || cl.dept;
  const note = shared.notes[cl.id] || [];
  return `<div>${workspaceHeader(3,L('CASE / PROBLEM INVESTIGATION','केस / समस्या जाँच'),esc(cl.title),`${t('investigationWs')} · ${n} ${L('signals','संकेत')} · ${cl.locs.length} ${t('wardsWord')}`)}${crumbs([[t('command'), '#/'], [t('publicProblemsTitle'), '#/problems'], [cl.title, '#/problems/' + cl.id]])}
  <div class="row between" style="align-items:flex-start;flex-wrap:wrap;gap:10px"><div><div class="row" style="margin-bottom:8px"><span class="badge b-pri">${statusL(cl.status)}</span>${isEmerging(cl) ? `<span class="badge b-rev">${t('filterEmerging')}</span>` : ''}${isRecurring(cl) ? `<span class="badge b-crit">${t('filterRecurring')}</span>` : ''}${isMaster(cl) ? `<span class="badge b-ai">${t('masterProblem')}</span>` : ''}</div><p class="muted" style="margin-top:6px">${t('investigationWs')} · ${n} ${L('signals', 'संकेत')} · ${cl.locs.length} ${t('wardsWord')}</p></div>
  <div class="row"><button class="btn btn-s btn-sm" data-act="mergeDup" data-id="${cl.id}">${t('mergeDup')}</button><button class="btn btn-s btn-sm" data-act="keepSep" data-id="${cl.id}">${t('keepSep')}</button><button class="btn btn-p btn-sm" data-act="linkProb" data-id="${cl.id}">${t('linkProb')}</button></div></div>
  <div style="margin-top:18px">${graphHTML(cl)}</div>
  <div class="grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:18px;align-items:start">
  <div class="panel"><h3>${t('aiInvestigation')}</h3><div class="row between"><b>${t('possibleRootCause')}</b>${badge('ai')}</div><p style="font-size:18px;font-weight:800;margin:8px 0">${cl.cause}</p>
  <div class="row between small"><span>${t('confidenceLbl')}</span><b class="num">${Math.round(cl.causeConf * 100)}%</b></div><div class="bar-h"><i style="width:${cl.causeConf * 100}%"></i></div><p style="margin-top:12px"><span class="badge b-rev">${t('humanVerifReq')}</span></p></div>
  <div class="panel">${impactBars(impact(cl))}</div>
  <div class="panel"><h3>${t('routingLbl')}</h3><p><b>${t('suggestedAuth')}:</b> ${deptL(dept)}</p>
  ${isMaster(cl) ? `<hr class="rule"><b class="small">${t('masterProblem')}</b><p class="small">${t('leadLbl')}: ${deptL(cl.master.lead)}<br>${t('supportingLbl')}: ${cl.master.support.map(deptL).join(', ')}</p>` : ''}
  <label for="ovr" style="margin-top:12px">${t('overrideAuth')}</label><select id="ovr" data-ovr="${cl.id}">${DEPTS.map((d) => `<option ${d === dept ? 'selected' : ''}>${deptL(d)}</option>`).join('')}</select></div></div>
  <div class="grid" style="grid-template-columns:1.2fr 1fr;margin-top:18px;align-items:start"><div class="panel"><h3>${t('evidenceTimeline')}</h3>${areaChart(ser, labs, 200, 'var(--cyan)')}</div>
  <div class="panel"><h3>${t('mapLbl')}</h3><div class="mapbox"><div id="problem-map" class="leaflet-map short" data-cluster="${cl.id}"></div></div></div></div>
  <div class="grid g2" style="margin-top:18px;align-items:start">
  <div class="panel">${cl.memory ? `<h3 style="font-size:18px">${t('instMemory')} ${cl.memory.year}</h3><dl class="kv" style="margin-top:10px"><dt>${t('prevCase')}</dt><dd>${cl.memory.title}</dd><dt>${t('interventionLbl')}</dt><dd>${cl.memory.intervention}</dd><dt>${t('recurredLbl')}</dt><dd>${cl.memory.recurred}</dd></dl>` : `<div class="empty">${t('noHistorical')}</div>`}</div>
  <div class="panel"><h3>${t('invNotes')}</h3>${note.map((x) => `<p class="small" style="padding:6px 0;border-bottom:1px solid var(--line)">${esc(x)}</p>`).join('')}
  <label for="nt" style="margin-top:10px">${t('noteLbl')}</label><textarea id="nt" style="min-height:70px" placeholder="${t('addNotePh')}"></textarea>
  <p style="margin-top:10px"><button class="btn btn-p btn-sm" data-act="addNote" data-id="${cl.id}">${t('recordNote')}</button></p></div></div></div>`;
}

// ============================================================= CASES/SLA ==
export const caseFilter = { src: 'all' };
export function vCasesList() {
  let rows = G.filter(isOpen);
  if (caseFilter.src !== 'all') rows = rows.filter((g) => (g.source || 'demo') === caseFilter.src);
  rows = rows.map((g) => ({ g, s: slaState(g), r: g.daysAgo / dlDays(g) })).sort((a, b) => b.r - a.r).slice(0, 30);
  const SLAW = { n: L('Normal', 'सामान्य'), a: L('Approaching', 'नज़दीक'), r: L('At risk', 'जोखिम में'), o: L('Overdue', 'समय-सीमा पार'), e: L('Escalated', 'एस्केलेटेड') };
  const userN = G.filter((g) => g.source === 'user').length;
  return `<div>${workspaceHeader(4,L('CASE OPERATIONS','केस संचालन'),t('ccCasesTitle'),t('ccCasesSub'))}${crumbs([[t('command'), '#/'], [t('ccCasesTitle'), '#/cases']])}<div class="row between" style="flex-wrap:wrap;gap:10px"><div></div>
  <span class="chip">${ic('user', 14)} ${userN} ${t('citizenReportsCount')}</span></div>
  <div class="row" style="margin:14px 0">${[['all', t('allSources')], ['demo', t('demoOnly')], ['user', t('userOnly')]].map((f) => `<button class="chip" aria-pressed="${caseFilter.src === f[0]}" data-act="caseFilter" data-f="${f[0]}">${f[1]}</button>`).join('')}</div>
  <div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>${t('thCase')}</th><th>${t('thIssue')}</th><th>${t('thWard')}</th><th>${t('thAge')}</th><th>${t('thSla')}</th><th>${t('dataSourceLbl')}</th><th>${t('thWhy')}</th></tr></thead>
  <tbody>${rows.length ? rows.map(({ g, s }) => { const cl = g.cluster ? CL(g.cluster) : null; return `<tr class="clickrow" data-act="openCase" data-id="${g.id}" style="cursor:pointer"><td class="num"><b>${g.id}</b></td><td>${esc(g.text.slice(0, 50))}</td><td>${LOC(g.loc).name}</td>
    <td class="num">${g.daysAgo}${L('d', ' दिन')}</td><td><span class="sla ${s[0]}">${SLAW[s[0]]}</span></td><td><span class="badge ${g.source === 'user' ? 'b-ai' : 'b-fact'}">${g.source === 'user' ? t('sourceUser') : t('sourceDemo')}</span></td>
    <td class="small muted">${s[0] === 'e' || s[0] === 'o' ? `${L('Escalated: deadline passed by', 'एस्केलेटेड: समय-सीमा पार हुई')} ${g.daysAgo - dlDays(g)}${L('d', ' दिन')}${cl && isRecurring(cl) ? L(', recurring', ', बार-बार') : ''}` : '—'}</td></tr>`; }).join('') : `<tr><td colspan="7"><div class="empty">${t('noCasesToManage')}</div></td></tr>`}</tbody></table></div></div>`;
}

export function vCaseDetail(id) {
  const c = findOrCreateCase(id); if (!c) return notFound(t('caseNotFound'), '#/cases', t('backToCases'));
  const cl = c.cluster ? CL(c.cluster) : null;
  const dept = c.deptOverride || (cl ? (shared.overrides[cl.id] || cl.dept) : CAT[c.cat].dept);
  const src = c.source === 'user' ? t('sourceUser') : t('sourceDemo');
  return `<div>${workspaceHeader(5,L('CASE REVIEW WORKSPACE','केस समीक्षा वर्कस्पेस'),esc(c.title),`${c.id} · ${LOC(c.loc).name} · ${deptL(dept)}`)}${crumbs([[t('command'), '#/'], [t('ccCasesTitle'), '#/cases'], [c.id, '#/cases/' + c.id]])}
  <div class="row" style="margin-bottom:6px"><span class="badge ${c.source === 'user' ? 'b-ai' : 'b-fact'}">${src}</span><span class="badge b-pri">${catL(c.cat)}</span></div>
  <p class="muted" style="margin-top:6px">${c.id} · ${LOC(c.loc).name}</p>
  <div class="grid" style="grid-template-columns:1.3fr 1fr;margin-top:18px;align-items:start"><div class="col" style="gap:18px">
  <div class="panel"><h3>${t('citizenDescription')}</h3><p style="margin-top:8px">"${esc(c.text)}"</p>${cl ? `<p style="margin-top:10px"><b>${t('linkedProblem')}:</b> <a href="#/problems/${cl.id}">${esc(cl.title)}</a></p>` : `<p class="muted" style="margin-top:10px">${t('notLinked')}</p>`}</div>
  <div class="panel"><h3>${t('progressLbl')}</h3>${timeline(stagesArr().map((s, i) => ({ t: s, s: i < c.stage ? 'done' : i === c.stage ? 'now' : 'todo' })))}</div>
  <div class="panel"><h3>${t('activityLbl')}</h3>${c.events.map((e) => `<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${esc(e[0])}</span></div>`).join('')}</div></div>
  <div class="col" style="gap:18px">
  <div class="panel"><h3>${t('quickActions')}</h3><div class="col" style="gap:8px;margin-top:10px">
    <button class="btn btn-s btn-sm" data-act="ccQuick" data-id="${c.id}" data-k="investigate">${t('markInvestigating')}</button>
    <button class="btn btn-s btn-sm" data-act="ccQuick" data-id="${c.id}" data-k="action">${t('markActionTaken')}</button>
    <button class="btn btn-p btn-sm" data-act="ccQuick" data-id="${c.id}" data-k="resolve">${t('markResolved')}</button>
    <button class="btn btn-ok btn-sm" data-act="ccQuick" data-id="${c.id}" data-k="confirm">${t('recordCitizenConfirm')}</button>
    <button class="btn btn-no btn-sm" data-act="ccQuick" data-id="${c.id}" data-k="reopen">${t('reopenCaseBtn')}</button></div></div>
  <div class="panel"><h3>${t('currentStatus')}</h3><p class="small muted" style="margin:6px 0 10px">${stagesArr()[c.stage]}</p>
    <label for="ccstage">${t('changeStatusTo')}</label><select id="ccstage">${stagesArr().map((s, i) => `<option value="${i}" ${i === c.stage ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <p style="margin-top:10px"><button class="btn btn-p btn-sm" data-act="ccSetStage" data-id="${c.id}">${t('updateStageBtn')}</button></p></div>
  <div class="panel"><h3>${t('suggestedAuth')}</h3><p class="small muted" style="margin:6px 0 10px">${deptL(dept)}</p>
    <label for="ccdept">${t('overrideAuth')}</label><select id="ccdept">${DEPTS.map((d) => `<option ${d === dept ? 'selected' : ''}>${deptL(d)}</option>`).join('')}</select>
    <p style="margin-top:10px"><button class="btn btn-s btn-sm" data-act="ccAssignDept" data-id="${c.id}">${t('assignDeptBtn')}</button></p>
    <label for="ccofficer" style="margin-top:14px">${t('assignedOfficerLbl')}</label><input id="ccofficer" placeholder="${t('assignedOfficerPh')}" value="${esc(c.assignedOfficer || '')}">
    <p style="margin-top:10px"><button class="btn btn-s btn-sm" data-act="ccAssignOfficer" data-id="${c.id}">${t('assignDeptBtn')}</button></p></div>
  <div class="panel"><h3>${t('noteLbl')}</h3><textarea id="ccnote" style="min-height:70px" placeholder="${t('addNotePh')}"></textarea><p style="margin-top:10px"><button class="btn btn-p btn-sm" data-act="ccNote" data-id="${c.id}">${t('recordNote')}</button></p></div>
  </div></div></div>`;
}

// ============================================================= EMERGING ===
export function vEmerging() {
  const list = CLUSTERS.map((c) => ({ c, g: growth(c) })).sort((a, b) => b.g.pct - a.g.pct).slice(0, 6);
  return `<div>${workspaceHeader(6,L('EMERGING ISSUE INTELLIGENCE','उभरती समस्या इंटेलिजेंस'),t('emergingTitle'),t('emergingSub'))}${crumbs([[t('command'), '#/'], [t('emergingTitle'), '#/emerging']])}<p class="muted" style="margin-bottom:16px">${t('emergingSub')}</p>
  <div class="col" style="gap:16px">${list.map(({ c, g }) => `<div class="panel"><div class="row between"><div><b style="font-size:18px">${isEmerging(c) ? t('rapidDetected') + ' · ' : ''}${esc(c.title)}</b><div class="small muted">${c.locs.map((l) => LOC(l).name).join(', ')} · ${catL(c.cat)} · ~${Math.round(clusterCount(c) * 5.5)} ${t('peopleAffectedEst')}</div></div><span class="badge ${isEmerging(c) ? 'b-rev' : 'b-fact'}">${g.pct >= 0 ? '+' : ''}${g.pct}%</span></div>
  ${areaChart(seriesOf(c, 6), ['-5', '-4', '-3', '-2', '', ''], 140, isEmerging(c) ? 'var(--warning)' : 'var(--cyan)')}<div class="small muted">${t('last3')}: ${g.last} · ${t('prior3')}: ${g.prior} · <a href="#/problems/${c.id}">${t('investigateLnk')}</a></div></div>`).join('')}</div></div>`;
}

// ============================================================= RECURRING ==
export function vRecurring() {
  const as = ASSETS.filter((a) => a.failures >= 2).sort((a, b) => b.failures - a.failures);
  return `<div>${workspaceHeader(7,L('RECURRING FAILURE INTELLIGENCE','बार-बार विफलता इंटेलिजेंस'),t('recurringTitle'),t('recurringSub'))}${crumbs([[t('command'), '#/'], [t('recurringTitle'), '#/recurring']])}<p class="lead" style="margin-bottom:18px">${t('recurringSub')}</p>
  <div class="col" style="gap:16px">${as.map((a) => { const s = assetStats(a); return `<div class="panel"><div class="row between"><a href="#/assets/${a.id}"><b style="font-size:18px">${a.id}</b></a><span class="small muted">${assetTypeL(a.type)} · ${LOC(a.loc).name} · ${s.complaints} ${L('complaints', 'शिकायतें')} · ${a.failures} ${L('failures', 'विफलताएँ')}</span></div>${recurrenceTimeline(a)}</div>`; }).join('')}</div>`;
}

// ============================================================ INFRASTRUCTURE
export function vAssetsList() {
  return `<div>${workspaceHeader(8,L('INFRASTRUCTURE INTELLIGENCE','इंफ्रास्ट्रक्चर इंटेलिजेंस'),t('assetsTitle'),L('Infrastructure evidence linked to complaints, failures and maintenance history.','शिकायतों, विफलताओं और रखरखाव इतिहास से जुड़े इंफ्रास्ट्रक्चर साक्ष्य।'))}${crumbs([[t('command'), '#/'], [t('assetsTitle'), '#/assets']])}
  <div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>${t('thAsset')}</th><th>${t('thType')}</th><th>${t('ward')}</th><th>${t('thHealth')}</th><th>${t('thComplaints')}</th><th>${t('thFailures')}</th><th>${t('thMaint')}</th></tr></thead>
  <tbody>${ASSETS.map((a) => { const s = assetStats(a); return `<tr><td><a href="#/assets/${a.id}"><b>${a.id}</b></a></td><td>${assetTypeL(a.type)}</td><td>${LOC(a.loc).name}</td><td><span class="badge ${s.health === 'At risk' ? 'b-crit' : s.health === 'Watch' ? 'b-rev' : 'b-ver'}">${healthL(s.health)}</span></td><td class="num">${s.complaints}</td><td class="num">${a.failures}</td><td>${a.maint}</td></tr>`; }).join('')}</tbody></table></div></div>`;
}

export function vAssetDetail(id) {
  const a = ASSET(id); if (!a) return notFound(t('assetNotFound'), '#/assets', t('backToAssets'));
  const s = assetStats(a); const gs = G.filter((g) => g.asset === a.id);
  return `<div>${workspaceHeader(9,L('ASSET INVESTIGATION','संपत्ति जाँच'),`${assetTypeL(a.type).toUpperCase()} · ${a.id}`,`${a.name} · ${LOC(a.loc).name}`)}${crumbs([[t('command'), '#/'], [t('assetsTitle'), '#/assets'], [a.id, '#/assets/' + a.id]])}
  <div class="row" style="margin-bottom:6px"><span class="badge ${s.health === 'At risk' ? 'b-crit' : s.health === 'Watch' ? 'b-rev' : 'b-ver'}">${healthL(s.health)}</span>${badge('fact')}</div>
  <p class="muted" style="margin:6px 0 18px">${a.name} · ${LOC(a.loc).name} (${L('simulated', 'सिम्युलेटेड')})</p>
  <div class="kpis" style="grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="v num">${s.complaints}</div><div class="l">${t('assetComplLbl')}</div></div><div class="kpi"><div class="v num">${a.failures}</div><div class="l">${t('assetFailLbl')}</div></div>
  <div class="kpi"><div class="v num">${a.recur || '—'}</div><div class="l">${t('assetRecurLbl')}</div></div><div class="kpi"><div class="v num">${s.related}</div><div class="l">${t('assetRelCasesLbl')}</div></div></div>
  <div class="grid g2" style="margin-top:18px;align-items:start"><div class="panel"><h3>${L('Recurrence timeline', 'पुनरावृत्ति समयरेखा')}</h3>${recurrenceTimeline(a)}</div>
  <div class="panel"><h3>${t('mapLbl')}</h3><div class="mapbox"><div id="asset-map" class="leaflet-map short" data-asset="${a.id}"></div></div></div></div>
  <div class="grid g2" style="margin-top:18px;align-items:start"><div class="panel"><h3>${t('maintenancePlan')}</h3><p class="small muted">${t('lastMaint')}: ${a.maint}</p>
  <p style="margin-top:10px"><b>${t('possibleIntervention')}:</b> ${a.failures >= 3 ? t('permanentInsp') : t('routineInsp')} ${badge('ai')}</p></div>
  <div class="panel"><h3>${t('compHistory')}</h3>${gs.length ? gs.slice(-6).reverse().map((g) => `<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${g.id} · ${esc(g.text.slice(0, 40))}</span></div>`).join('') : `<div class="empty">${t('noLinkedComp')}</div>`}</div></div></div>`;
}

// ============================================================ DEPARTMENTS =
export function vDepartments() {
  return `<div>${workspaceHeader(10,L('DEPARTMENT INTELLIGENCE','विभाग इंटेलिजेंस'),t('deptTitle'),t('deptSub'))}${crumbs([[t('command'), '#/'], [t('deptTitle'), '#/departments']])}<p class="sim" style="margin-bottom:16px">${t('deptSub')}</p>
  <div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>${t('thDept')}</th><th>${t('thOpen')}</th><th>${t('thSlaRisk')}</th><th>${t('thAvgAge')}</th><th>${t('thRecur')}</th><th>${t('thUnver')}</th><th>${t('thEmergInv')}</th><th>${t('thMultiDep')}</th></tr></thead>
  <tbody>${DEPTS.map(deptStats).map((d) => `<tr><td><b>${deptL(d.name)}</b></td><td class="num">${d.open}</td><td class="num">${d.risk}</td><td class="num">${d.avg}</td><td class="num">${d.recur}</td><td class="num">${d.unver}</td><td class="num">${d.emerg}</td><td class="num">${d.multi}</td></tr>`).join('')}</tbody></table></div></div>`;
}

// =================================================================== ADMIN
export function vAdmin() {
  const userG = G.filter((g) => g.source === 'user').length, demoG = G.length - userG;
  const userC = cases.filter((c) => c.source === 'user').length, demoC = cases.length - userC;
  return `<div>${workspaceHeader(11,L('DATA & SCENARIO CONTROL','डेटा और परिदृश्य नियंत्रण'),t('adminTitle'),L('Manage prototype data, scenario controls and audit history.','प्रोटोटाइप डेटा, परिदृश्य नियंत्रण और ऑडिट इतिहास प्रबंधित करें।'))}${crumbs([[t('command'), '#/'], [t('adminTitle'), '#/admin']])}
  <div class="grid g2"><div class="panel"><h3>${t('scenarioControls')}</h3><p class="muted small" style="margin-bottom:12px">${t('protoNote')}</p>
  <div class="col"><button class="btn btn-p" data-act="simulate">${ic('zap', 15)} ${t('genSample')}</button><button class="btn btn-s" data-act="resetData">${ic('refresh', 15)} ${t('resetScenario')}</button><button class="btn btn-s" data-act="clearUserData">${ic('x', 15)} ${t('clearUserData')}</button></div></div>
  <div class="panel"><h3>${t('datasetLbl')}</h3><dl class="kv"><dt>${t('grievancesLbl')}</dt><dd class="num">${G.length}</dd><dt>&nbsp;&nbsp;${t('sourceDemo')}</dt><dd class="num">${demoG}</dd><dt>&nbsp;&nbsp;${t('sourceUser')}</dt><dd class="num">${userG}</dd>
  <dt>${t('publicProblemsLbl2')}</dt><dd class="num">${CLUSTERS.length}</dd><dt>${t('assetsLbl')}</dt><dd class="num">${ASSETS.length}</dd><dt>${t('wardsLbl')}</dt><dd class="num">${LOCALITIES.length}</dd></dl></div></div>
  <div class="panel" style="margin-top:18px"><h3>${L('Cases', 'मामले')}</h3><dl class="kv"><dt>${t('demoOnly')}</dt><dd class="num">${demoC}</dd><dt>${t('userOnly')}</dt><dd class="num">${userC}</dd></dl>
  <p class="sim" style="margin-top:10px">${L('Data is stored in this browser only (localStorage).', 'डेटा केवल इस ब्राउज़र में संग्रहीत है।')}</p></div>
  <div class="panel" style="margin-top:18px"><h3>${t('auditLog')}</h3>${(shared.audit || []).length ? shared.audit.slice().reverse().map((a) => `<div class="small row between" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${esc(a)}</span></div>`).join('') : `<div class="empty">${t('noAudit')}</div>`}</div></div>`;
}

// ============================================================ HOW IT WORKS
export function vHow() {
  const hi = langState.lang === 'hi';
  const OFEAT = [
    ['activity', ['Command Center', 'A live dashboard of grievances, problems and SLA risk.'], ['कमांड सेंटर', 'लाइव डैशबोर्ड।']],
    ['network', ['Manage public problems', 'View AI-grouped problems and their investigation status.'], ['सार्वजनिक समस्याएँ प्रबंधित करें', 'AI-समूहित समस्याएँ देखें।']],
    ['zap', ['AI duplicate detection', 'See which reports likely describe the same issue.'], ['AI डुप्लिकेट पहचान', 'समान शिकायतें पहचानें।']],
    ['search', ['Case investigation', 'Relationships, root cause, evidence and notes.'], ['केस जाँच', 'संबंध, मूल कारण, साक्ष्य।']],
    ['route', ['Assign departments & officers', 'Route a case to the right department or officer.'], ['विभाग और अधिकारी सौंपें', 'सही विभाग को भेजें।']],
    ['clock', ['SLA monitoring', 'Track deadlines from normal to escalated.'], ['SLA निगरानी', 'समय-सीमाएँ ट्रैक करें।']],
    ['trend', ['Emerging & recurring detection', 'Spot spikes and repeat failures early.'], ['उभरती और बार-बार होने वाली समस्याएँ', 'जल्दी पहचानें।']],
    ['building', ['Infrastructure correlation', 'Link complaints to the physical asset behind them.'], ['इंफ्रास्ट्रक्चर सह-संबंध', 'भौतिक संपत्ति से जोड़ें।']],
    ['check', ['Verify citizen reports', 'Review evidence and confirm reports.'], ['नागरिक रिपोर्ट सत्यापित करें', 'साक्ष्य की समीक्षा करें।']],
    ['refresh', ['Update case status', 'Move a case through investigation to resolution.'], ['केस स्थिति अपडेट करें', 'मामले को आगे बढ़ाएँ।']],
    ['shield', ['Resolve & close cases', 'Mark a case resolved once action is taken.'], ['मामले हल करें', 'कार्रवाई के बाद हल चिह्नित करें।']],
    ['user', ['Citizen confirmation', 'See whether the citizen agrees it is fixed.'], ['नागरिक पुष्टि', 'नागरिक की पुष्टि देखें।']],
    ['repeat', ['Impact & analytics', 'Department workload and recurrence counts.'], ['प्रभाव और विश्लेषण', 'विभागीय कार्यभार देखें।']],
    ['layers', ['Data & demo management', 'Seed, reset or clear citizen-submitted data.'], ['डेटा और डेमो प्रबंधन', 'डेटा प्रबंधित करें।']]
  ];
  const cardHtml = (f) => { const c = hi ? f[2] : f[1]; return `<div class="card flat" style="padding:16px"><span style="width:36px;height:36px;border-radius:10px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;margin-bottom:10px">${ic(f[0], 18)}</span><b style="font-size:14.5px">${esc(c[0])}</b><p class="muted small" style="margin-top:5px">${esc(c[1])}</p></div>`; };
  return `<div class="wrap page editorial-page">${crumbs([[t('command'), '#/'], [t('how'), '#/how']])}${workspaceHeader(12,L('GOVERNMENT WORKSPACE GUIDE','सरकारी कार्यक्षेत्र मार्गदर्शिका'),t('howTitle'),t('howSub'))}<p class="lead" style="margin:10px 0 26px">${t('howSub')}</p>
  <h2 class="h-card" style="margin-bottom:14px">${t('forOfficers')}</h2><div class="grid g4">${OFEAT.map(cardHtml).join('')}</div></div>`;
}
