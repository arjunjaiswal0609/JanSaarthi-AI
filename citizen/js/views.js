// Citizen portal — view render functions. Each exported function returns
// an HTML string for the #main outlet; app.js wires these into the router.
import { t, L, state as langState } from '../../shared/js/i18n.js';
import { ic } from '../../shared/js/icons.js';
import { esc, reduceMotion } from '../../shared/js/dom-utils.js';
import { catL, deptL, CAT } from '../../shared/js/categories.js';
import {
  CLUSTERS, CL, ASSET, G, cases, gOf, clusterCount, isOpen, isRecurring, isEmerging,
  growth, seriesOf, impact, isMaster, AI, addGrievance, addCase, nextId, saveAppData
} from '../../shared/js/data-store.js';
import { LOC, LOCALITIES } from '../../shared/js/geo-jabalpur.js';
import { badge, timeline, areaChart, graphHTML, beforeAfterSlider, impactBars } from '../../shared/js/ui.js';
import { authState } from './auth.js';

export const crumbs = (items) => `<nav class="crumb" aria-label="Breadcrumb">${items.map((x, i) => (i < items.length - 1 ? `<a href="${x[1]}">${x[0]}</a><span>/</span>` : `<span aria-current="page">${x[0]}</span>`)).join('')}</nav>`;

export const homeVerifyState = { choice: null };

export function notFound(msg, href = '#/', label = t('back')) {
  return `<div class="wrap page"><div class="empty" style="margin-top:40px"><h1 class="h-card">${msg}</h1><a class="btn btn-p" style="margin-top:14px;display:inline-flex" href="${href}">${label}</a></div></div>`;
}

// ========================================================= EDITORIAL UI ===
function workspaceHeader(index, eyebrow, title, sub, status=L('LIVE WORKSPACE','लाइव वर्कस्पेस')) {
  return `<div class="workspace-header reveal">
    <div class="workspace-index">${String(index).padStart(2,'0')}</div>
    <div class="workspace-copy"><span class="workspace-code">AI-${String(index).padStart(2,'0')}</span><span class="workspace-eyebrow">${eyebrow}</span><h1>${title}</h1><p>${sub}</p></div>
    <div class="workspace-status"><span class="status-dot"></span><b>${status}</b><small>${L('evidence-first workflow','साक्ष्य-प्रथम कार्यप्रवाह')}</small></div>
  </div>`;
}
function workspaceSplit(left, right, mode='') { return `<div class="workspace-split ${mode}"><section class="workspace-box workspace-primary">${left}</section><aside class="workspace-box workspace-secondary">${right}</aside></div>`; }

// ================================================================ HOME ===
function heroNet() {
  const labs = L(['Citizen', 'Complaint', 'Related signals', 'Public problem', 'Root cause', 'Government action', 'Verified resolution'],
    ['नागरिक', 'शिकायत', 'संबंधित संकेत', 'सार्वजनिक समस्या', 'मूल कारण', 'सरकारी कार्रवाई', 'सत्यापित समाधान']);
  const P = [[42,300,labs[0]],[145,225,labs[1]],[315,175,labs[2]],[430,220,labs[3]],[535,105,labs[4]],[640,170,labs[5]],[742,82,labs[6]]];
  const path = P.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
  const spokes = [[315,175,275,86],[315,175,300,62],[315,175,340,74],[315,175,365,105],[315,175,382,138],[315,175,250,118],[315,175,240,157],[315,175,265,205],[315,175,292,232],[315,175,345,228],[315,175,385,196],[315,175,350,116]];
  return `<svg class="net" viewBox="0 0 790 360" role="img" aria-label="${L('JanSaarthi public-service intelligence network','जनसारथी सार्वजनिक-सेवा इंटेलिजेंस नेटवर्क')}">
    <defs><filter id="jsGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="jsLine" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#6857ff"/><stop offset=".52" stop-color="#10a9c1"/><stop offset="1" stop-color="#735dff"/></linearGradient></defs>
    <g class="net-spokes">${spokes.map((q,i)=>`<line x1="${q[0]}" y1="${q[1]}" x2="${q[2]}" y2="${q[3]}"/><circle cx="${q[2]}" cy="${q[3]}" r="3" style="--i:${i}"/>`).join('')}</g>
    <path class="net-path" d="${path}" fill="none" stroke="url(#jsLine)" stroke-width="3" stroke-dasharray="6 8"/>
    ${P.map((p,i)=>`<g class="net-node ${i===3?'is-core':''}" style="--i:${i}"><circle class="node-halo" cx="${p[0]}" cy="${p[1]}" r="${i===3?30:21}"/><circle class="node-dot" cx="${p[0]}" cy="${p[1]}" r="${i===3?14:9}"/><text x="${p[0]}" y="${p[1]+(i%2?-22:31)}" text-anchor="middle">${p[2]}</text></g>`).join('')}
  </svg>`;
}

export function vHome() {
  const c1 = CL('PP-GRH'), n1 = clusterCount(c1), em = CL('PP-ADH');
  const tk = CLUSTERS.map((c) => `<a class="tk" href="#/problems/${c.id}"><span class="dot ${isEmerging(c) ? 'w' : isRecurring(c) ? '' : 'a'}"></span>${esc(c.title)} <span class="num muted">${clusterCount(c)} ${L('signals', 'संकेत')}</span></a>`);
  return `
  <section class="hero home-hero"><div class="hero-noise"></div><div class="hero-grid wrap"><div class="hero-copy">
    <div class="hero-eyebrow"><span class="eyebrow-pulse"></span>${L('CITIZEN SIGNAL → PUBLIC INTELLIGENCE', 'नागरिक संकेत → सार्वजनिक इंटेलिजेंस')}<span class="eyebrow-line"></span></div>
    <h1 class="h-hero">${t('heroH')}<span class="hero-accent">.</span></h1>
    <p class="lead hero-lead">${t('heroP')}</p>
    <div class="hero-actions"><a class="btn btn-p btn-lg hero-primary" href="#/report"><span>${t('ctaReport')}</span>${ic('arrow')}</a><a class="btn btn-s btn-lg hero-secondary" href="#/problems"><span class="play-dot">✦</span>${t('ctaExplore')}</a></div>
    <div class="hero-stats" aria-label="JanSaarthi capabilities">
      <div class="hero-stat"><b class="num">${n1}</b><span>${L('linked signals', 'जुड़े संकेत')}</span></div>
      <div class="hero-stat"><b>AI</b><span>${L('pattern detection', 'पैटर्न पहचान')}</span></div>
      <div class="hero-stat"><b>21</b><span>${L('demo stages', 'डेमो चरण')}</span></div>
    </div>
  </div>
  <div class="hero-vis hero-command">
    <div class="hero-gridlines"></div><div class="hero-radar"></div>
    <div class="hero-network-shell">${heroNet()}<span class="network-caption">${L('LIVE SIGNAL GRAPH', 'लाइव सिग्नल ग्राफ')} <i></i></span></div>
    <div class="sig sig-top"><span class="dot a"></span><span><strong class="num">${n1}</strong> ${L('related grievances', 'संबंधित शिकायतें')}<small>${L('merged into one signal cluster', 'एक सिग्नल क्लस्टर में')}</small></span></div>
    <div class="sig sig-right"><span class="dot w"></span><span>${L('Recurring pattern detected', 'पुनरावृत्ति पैटर्न मिला')}<small>${L('infrastructure-linked', 'इंफ्रास्ट्रक्चर लिंक्ड')}</small></span></div>
    <div class="sig sig-bottom"><span class="dot g"></span><span>${L('Verification layer', 'सत्यापन परत')}<small>${L('citizen confirmation required', 'नागरिक पुष्टि आवश्यक')}</small></span></div>
    <div class="command-badge"><span>JS</span><div><b>PUBLIC PROBLEM</b><small>Garha · Ward 17</small></div></div>
  </div></div></section>
  <div class="ticker"><div class="ticker-in">${tk.join('')}${tk.join('')}</div></div>

  <section class="block"><div class="wrap"><div class="oldnew reveal">
    <div class="old"><h2 class="h-card">${L('Complaint-only systems', 'केवल-शिकायत प्रणालियाँ')}</h2>
      <p class="muted" style="margin:8px 0 18px">${L('Every report is its own file.', 'हर रिपोर्ट अपनी अलग फ़ाइल होती है।')}</p>
      <div class="flow-v"><div class="st">${L('Complaint', 'शिकायत')}</div><div class="st">${L('Department', 'विभाग')}</div><div class="st">${L('Closure', 'बंद करना')}</div></div>
      <p class="muted" style="margin-top:18px">${t('closed')}</p></div>
    <div><h2 class="h-card">${L('JanSaarthi model', 'जनसारथी मॉडल')}</h2>
      <p class="muted" style="margin:8px 0 18px">${t('oneMany')}</p>
      <div class="model-flow-grid"><div class="flow-v new">${L(['AI signal','Public problem','Public impact','Citizen verification','Institutional learning'],['AI संकेत','सार्वजनिक समस्या','सार्वजनिक प्रभाव','नागरिक सत्यापन','संस्थागत सीख']).map((x,i)=>`<div class="st ${i===1?'hl':''}">${x}</div>`).join('')}</div><div class="flow-v new">${L(['Related complaints','Possible root cause','Government action','Verified resolution'],['संबंधित शिकायतें','संभावित मूल कारण','सरकारी कार्रवाई','सत्यापित समाधान']).map(x=>`<div class="st">${x}</div>`).join('')}</div></div></div>
  </div></div></section>

  <section class="block"><div class="wrap"><div class="row between" style="align-items:end;margin-bottom:24px"><div>
    <h2 class="h-sec">${t('relH')}</h2>
    <p class="lead" style="margin-top:12px">${L('Complaints are linked by shared location, category and infrastructure into one public problem. Try the live graph.', 'शिकायतों को समान स्थान, श्रेणी और इंफ्रास्ट्रक्चर के आधार पर एक सार्वजनिक समस्या में जोड़ा जाता है। लाइव ग्राफ़ आज़माएँ।')}</p></div>
    <a class="btn btn-s" href="#/problems/PP-GRH">${L('Open Garha problem', 'गढ़ा समस्या खोलें')}</a></div>${graphHTML(c1)}</div></section>

  <section class="block" style="background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
    <div class="grid" style="grid-template-columns:1.2fr 1fr;align-items:center"><div class="mapbox"><div id="home-map" class="leaflet-map"></div><span class="map-note">${L('Simulated demo data on a real map of Jabalpur', 'जबलपुर के वास्तविक मानचित्र पर सिम्युलेटेड डेटा')}</span></div>
    <div><h2 class="h-sec">${L('A real map of Jabalpur', 'जबलपुर का वास्तविक मानचित्र')}</h2>
      <p class="lead" style="margin:14px 0 20px">${L('Rings mark where complaints concentrate around the city. Locations are approximate and no personal information is shown.', 'छल्ले दिखाते हैं कि शहर में शिकायतें कहाँ केंद्रित हैं। स्थान अनुमानित हैं।')}</p>
      <p><a class="btn btn-p" href="#/map">${L('Open impact map', 'प्रभाव मानचित्र खोलें')}</a></p></div></div></div></section>

  <section class="block"><div class="wrap"><div class="grid" style="grid-template-columns:1fr 1fr;gap:40px;align-items:start">
    <div><h2 class="h-sec">${t('closed')}</h2>
      <dl class="kv card" style="margin-top:18px"><dt>${t('citizenChk')}</dt><dd>${t('resolvedLbl')}</dd><dt>${t('citizenChk2')}</dt><dd>${L('Awaiting verification', 'सत्यापन की प्रतीक्षा')}</dd>
      <dt>${t('recurrenceLbl')}</dt><dd>${t('notDetected')}</dd><dt>${t('confidenceLbl')}</dt><dd>${L('High', 'उच्च')} ${badge('ai')}</dd></dl></div>
    <div>${beforeAfterSlider()}<div class="row verify-demo-actions" style="margin-top:14px"><button class="btn btn-ok btn-sm" data-act="homeVerify" data-v="yes">${t('yes')}</button><button class="btn btn-sm btn-part" data-act="homeVerify" data-v="part">${t('part')}</button><button class="btn btn-no btn-sm" data-act="homeVerify" data-v="no">${t('no')}</button></div>${homeVerifyState.choice ? `<div class="verify-result ${homeVerifyState.choice}"><b>${homeVerifyState.choice==='yes'?L('Verified by citizen','नागरिक द्वारा सत्यापित'):homeVerifyState.choice==='part'?L('Partially fixed — review reopened','आंशिक समाधान — समीक्षा फिर खोली गई'):L('Not fixed — case remains open','समस्या ठीक नहीं — मामला खुला है')}</b><span>${homeVerifyState.choice==='yes'?L('The system moves the case into monitoring and watches for recurrence.','सिस्टम मामले को निगरानी में भेजता है और पुनरावृत्ति देखता है।'):homeVerifyState.choice==='part'?L('The department receives a follow-up signal instead of treating the case as solved.','विभाग को फॉलो-अप संकेत मिलता है।'):L('The case is reopened for investigation and action.','मामला जाँच और कार्रवाई के लिए फिर से खोला गया है।')}</span></div>`:''}</div>
  </div></div></section>

  <section class="block" style="background:linear-gradient(180deg,var(--bg),var(--surface-2))"><div class="wrap"><div class="grid g2" style="gap:32px">
    <div><h2 class="h-sec">${t('rootH')}</h2><div class="card" style="margin-top:20px">${areaChart(seriesOf(em, 6), L(['-5d', '-4d', '-3d', '-2d', 'yday', 'today'], ['-5', '-4', '-3', '-2', 'कल', 'आज']), 170, 'var(--warning)')}
      <div class="row between" style="margin-top:6px"><b>${esc(em.title)}</b><span class="badge b-rev">+${growth(em).pct}%</span></div></div></div>
    <div><h2 class="h-sec">${L('Institutional memory', 'संस्थागत स्मृति')}</h2>
      <p class="lead" style="margin:14px 0 18px">${L('Before anyone starts from zero, the system surfaces what happened last time.', 'शुरू करने से पहले, सिस्टम दिखाता है कि पिछली बार क्या हुआ था।')}</p>
      <div class="card"><b>${t('instMemory') || L('Similar issue found in', 'समान समस्या मिली')} ${c1.memory.year}</b>
      <dl class="kv" style="margin-top:10px"><dt>${L('Area', 'क्षेत्र')}</dt><dd>${c1.memory.area}</dd><dt>${L('Intervention', 'हस्तक्षेप')}</dt><dd>${c1.memory.intervention}</dd><dt>${L('Recurred', 'पुनरावृत्ति')}</dt><dd>${c1.memory.recurred}</dd></dl></div></div>
  </div></div></section>

  <section class="block" style="text-align:center"><div class="wrap"><h2 class="h-sec" style="max-width:16ch;margin:0 auto">${t('tagline')}</h2>
    <div class="row" style="justify-content:center;margin-top:24px"><a class="btn btn-p btn-lg" href="#/report">${t('ctaReport')}</a><a class="btn btn-s btn-lg" href="#/problems">${t('ctaExplore')}</a></div></div></section>`;
}

// ============================================================= REPORT ===
const PROC_EN = ['Understanding your report', 'Detecting the issue', 'Checking location', 'Finding related grievances', 'Identifying likely authority', 'Creating case intelligence'];
const PROC_HI = ['आपकी रिपोर्ट को समझा जा रहा है', 'समस्या की पहचान हो रही है', 'स्थान की जाँच हो रही है', 'संबंधित शिकायतें खोजी जा रही हैं', 'संभावित विभाग की पहचान हो रही है', 'केस इंटेलिजेंस बनाई जा रही है'];
const procSteps = () => (langState.lang === 'hi' ? PROC_HI : PROC_EN);

export const reportState = { step: 'input', text: '', files: [], err: '', rec: false, analysis: null, rel: null, pi: 0, created: null };
let procTimer = null;

export function vReport(rerender) {
  const r = reportState;
  const body = {
    input: () => `<div class="rep"><div>
      <h1 class="h-sec">${t('tell')}</h1><p class="lead" style="margin:12px 0 22px">${t('tellP')}</p>
      <label for="rtext">${t('whatHappened')}</label>
      <textarea id="rtext" placeholder="${t('textareaPh')}" aria-describedby="rerr">${esc(r.text)}</textarea>
      <div id="rerr" class="err" role="alert">${esc(r.err)}</div>
      <div class="row" style="margin:10px 0 18px">${['Our tap water has been dirty for five days in Garha.', 'Drain overflowing near the market in Adhartal for 3 days.', 'Streetlight is not working near the park in Napier Town.', 'हमारे इलाके में पाँच दिन से गंदा पानी आ रहा है।'].map((s, i) => `<button class="chip" data-act="example" data-i="${i}">${esc(s.length > 38 ? s.slice(0, 36) + '…' : s)}</button>`).join('')}</div>
      <div class="card flat"><div class="row" style="gap:16px"><button class="mic ${r.rec ? 'rec' : ''}" data-act="mic" aria-label="${r.rec ? t('stopRec') : t('startRec')}">${ic(r.rec ? 'pause' : 'mic', 30)}</button>
        <div><b>${r.rec ? t('recTap') : t('speakInstead')}</b><div class="muted small">${r.rec ? t('listening') : t('mockTrans')}</div></div></div></div>
      <div class="row" style="margin:16px 0"><label class="chip" style="cursor:pointer;margin:0">${ic('clip', 15)}${t('addEvidence')}<input id="rfile" type="file" class="sr" multiple accept=".jpg,.jpeg,.png,.webp,.mp4,.pdf,.docx"></label><span class="chip">${ic('pin', 15)}${t('approxWard')}</span></div>
      <div id="rfiles" class="col small">${r.files.map((f) => `<span class="row">${ic('check', 14)} ${esc(f)}</span>`).join('')}</div>
      <p style="margin-top:20px"><button class="btn btn-p btn-lg" data-act="analyze">${t('analyze')}${ic('arrow')}</button></p></div>
      <aside class="card"><h2 class="h-card">${t('whatNext')}</h2><ol class="col muted" style="padding-left:20px;margin:12px 0 0"><li>${t('nextStep1')}</li><li>${t('nextStep2')}</li><li>${t('nextStep3')}</li><li>${t('nextStep4')}</li></ol>
      <p class="sim" style="margin-top:16px">${t('noPersonalPublic')}</p></aside></div>`,
    processing: () => { const rel = r.rel; return `<div class="rep"><div><h1 class="h-sec">${t('analyzingTitle')}</h1><p class="lead" style="margin:12px 0 22px">${t('analyzingSub')}</p>
      <ul class="steps" aria-live="polite">${procSteps().map((p, i) => `<li class="${i < r.pi ? 'done' : i === r.pi ? 'now' : ''}"><span class="ck">${i < r.pi ? ic('check', 12) : ''}</span>${p}</li>`).join('')}</ul></div>
      <div>${r.pi >= 3 ? `<div class="signal"><b>${t('possibleRecur')}</b><p>${rel.count} ${t('relatedFoundA')}${rel.count === 1 ? '' : 's'} ${t('relatedFoundB')} ${rel.locs} ${t('relatedFoundC')}${rel.locs === 1 ? '' : 's'} ${t('relatedFoundD')}</p></div>` : `<div class="skeleton" style="height:96px"></div>`}<div class="skeleton" style="height:140px;margin-top:14px"></div></div></div>`; },
    summary: () => { const a = r.analysis, rel = r.rel, cl = rel.cluster; return `<div class="rep"><div><h1 class="h-sec">${t('checkUnderstood')}</h1><p class="lead" style="margin:12px 0 20px">${badge('ai')} ${t('editWrong')}</p>
      <div class="card"><div class="grid g2" style="gap:14px">
        <div><label for="fissue">${t('fldIssue')}</label><input id="fissue" value="${esc(a.issue)}"></div>
        <div><label for="fcat">${t('fldService')}</label><select id="fcat">${Object.entries(CAT).map(([k]) => `<option value="${k}" ${k === a.cat ? 'selected' : ''}>${catL(k)}</option>`).join('')}</select></div>
        <div><label for="floc">${t('fldWard')}</label><select id="floc">${LOCALITIES.map((w) => `<option value="${w.id}" ${w.id === a.loc ? 'selected' : ''}>${w.name}</option>`).join('')}</select></div>
        <div><label for="fdur">${t('fldDuration')}</label><input id="fdur" type="number" min="0" max="365" value="${a.durationDays ?? ''}" placeholder="${t('notStated')}"></div>
        <div><label for="fsev">${t('fldSeverity')}</label><select id="fsev">${['low', 'medium', 'high'].map((s) => `<option ${s === a.severity ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div><label>${t('fldEvidence')}</label><div class="chip">${r.files.length ? r.files.length + ' ' + t('fileCount') : t('noneAttached')}</div></div></div>
      <hr class="rule"><p class="muted small">${t('yourWords')}: "${esc(r.text)}"</p></div>
      <p style="margin-top:18px" class="row"><button class="btn btn-p btn-lg" data-act="submitReport">${t('submit')}</button><button class="btn btn-s" data-act="rpBack">${t('back')}</button></p></div>
      <aside class="card"><h2 class="h-card">${t('aiCaseIntel')}</h2><dl class="kv" style="margin-top:12px">
        <dt>${t('suggestedAuth')}</dt><dd>${deptL(a.dept)} ${badge('ai')}</dd><dt>${t('confidenceLbl')}</dt><dd>${Math.round(a.confidence * 100)}%</dd>
        <dt>${t('relatedSignals')}</dt><dd class="num">${rel.count}</dd><dt>${t('publicProblemLbl')}</dt><dd>${cl ? esc(cl.title) : t('noneYet')}</dd></dl>
      <p class="badge b-rev" style="margin-top:14px">${t('humanVerifReq')}</p></aside></div>`; },
    done: () => { const c = r.created, a = c.a, rel = c.rel; return `<div class="wrap" style="max-width:820px"><div class="card" style="text-align:center;padding:34px">
      <div class="badge b-ver" style="margin-bottom:12px">${ic('check', 13)} ${t('reportReceived')}</div><h1 class="h-sec" style="font-size:clamp(28px,4vw,44px)">${t('caseCreatedPfx')} ${c.id} ${t('caseCreatedSfx')}</h1>
      <p class="lead" style="margin:12px auto 0">${rel.cluster ? `${t('connectsTo')} <b>${esc(rel.cluster.title)}</b>.` : t('noClusterYet')}</p></div>
      <div class="grid g2" style="margin-top:18px"><div class="card"><h2 class="h-card">${t('aiCaseIntel')}</h2><dl class="kv" style="margin-top:10px">
        <dt>${t('fldIssue')}</dt><dd>${esc(a.issue)}</dd><dt>${t('locationLbl')}</dt><dd>${LOC(a.loc).name}</dd>
        <dt>${t('publicImpactLbl')}</dt><dd>${rel.cluster ? impact(rel.cluster).label : t('notEnoughSignals')} ${badge('ai')}</dd>
        <dt>${t('relatedSignals')}</dt><dd class="num">${rel.count}</dd><dt>${t('authorityLbl')}</dt><dd>${deptL(a.dept)}</dd></dl>
      <p class="badge b-rev" style="margin-top:12px">${t('humanVerifReq')}</p></div>
      <div class="card"><h2 class="h-card">${t('whatNextQ')}</h2><p class="muted" style="margin:10px 0 16px">${deptL(a.dept)} ${t('deptWillReview')}</p>
      <div class="col"><a class="btn btn-p" href="#/cases/${c.id}">${t('trackCase')}</a>${rel.cluster ? `<a class="btn btn-s" href="#/problems/${rel.cluster.id}">${t('seePublicProblem')}</a>` : ''}</div></div></div></div>`; }
  }[r.step]();
  return `<div class="wrap page editorial-page" style="padding-top:26px">${r.step === 'done' ? '' : crumbs([[t('home'), '#/'], [t('report'), '#/report']])}${workspaceHeader(1,L('CITIZEN SIGNAL WORKSPACE','नागरिक संकेत वर्कस्पेस'),t('report'),t('tellP'),L('LIVE INTAKE','लाइव इनटेक'))}<div class="workspace-step-content">${body}</div></div>`;
}

export function startReportProcessing(rerender) {
  const r = reportState;
  const a = AI.analyzeGrievance(r.text); r.analysis = a; r.rel = AI.findRelationships(a);
  r.step = 'processing'; r.pi = 0; rerender();
  clearInterval(procTimer);
  procTimer = setInterval(() => {
    r.pi++;
    if (r.pi >= procSteps().length) { clearInterval(procTimer); r.step = 'summary'; }
    rerender(true);
  }, reduceMotion() ? 60 : 480);
}

export function submitReportNow() {
  const r = reportState;
  const a = Object.assign({}, r.analysis, {
    issue: document.getElementById('fissue').value || r.analysis.issue,
    cat: document.getElementById('fcat').value,
    loc: +document.getElementById('floc').value || r.analysis.loc,
    durationDays: document.getElementById('fdur').value ? +document.getElementById('fdur').value : null,
    severity: document.getElementById('fsev').value
  });
  a.dept = CAT[a.cat].dept;
  const rel = AI.findRelationships(a);
  const [lat, lng] = jitterNear(a.loc);
  const id = nextId();
  addGrievance({ id, cluster: rel.cluster ? rel.cluster.id : null, cat: a.cat, loc: a.loc, lat, lng, daysAgo: 0,
    text: r.text, sev: a.severity, asset: rel.cluster ? rel.cluster.assets[0][0] : null, dupOf: null, status: 'Assigned', verified: false, source: 'user' });
  addCase({ id, title: a.issue, cat: a.cat, loc: a.loc, cluster: rel.cluster ? rel.cluster.id : null, stage: 2, status: 'Assigned', source: 'user',
    events: [['Reported', 0], ['AI analyzed', 0], ['Assigned to ' + a.dept, 0]], text: r.text });
  r.created = { id, a, rel: AI.findRelationships(a) };
  r.step = 'done';
  saveAppData();
  return id;
}
function jitterNear(locId) { const w = LOC(locId); const a = Math.random() * Math.PI * 2, rr = 0.003 + Math.random() * 0.006; return [w.lat + Math.sin(a) * rr, w.lng + Math.cos(a) * rr]; }

// =============================================================== CASES ===
const STAGES_EN = ['Reported', 'AI analyzed', 'Assigned', 'Investigation', 'Action taken', 'Awaiting your confirmation', 'Monitoring', 'Resolved'];
const STAGES_HI = ['दर्ज हुआ', 'AI विश्लेषण हुआ', 'सौंपा गया', 'जाँच जारी', 'कार्रवाई हुई', 'आपकी पुष्टि प्रतीक्षित', 'निगरानी', 'हल हुआ'];
const stagesArr = () => (langState.lang === 'hi' ? STAGES_HI : STAGES_EN);

export function vCases() {
  const mine = cases.filter((c) => c.demoShowcase || c.source === 'user');
  const rows = mine.map((c) => `<a class="case-row card" href="#/cases/${c.id}" style="text-decoration:none;display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center">
    <span class="case-icon" style="width:48px;height:48px;border-radius:15px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center">${ic(CAT[c.cat].icon, 22)}</span>
    <div><b>${esc(c.title)}</b><div class="muted small">${c.id} · ${LOC(c.loc).name} · ${stagesArr()[c.stage]}${c.status === 'Reopened' ? ' · ' + t('reopenedLbl') : ''}</div>
    <span class="badge ${c.source === 'user' ? 'b-ai' : 'b-fact'}" style="margin-top:6px">${c.source === 'user' ? t('yourReportBadge') : t('sourceDemo')}</span></div>
    <span class="badge ${c.stage === 5 ? 'b-rev' : c.stage === 7 ? 'b-ver' : 'b-pri'}">${c.stage === 5 ? t('needsCheck') : c.stage === 7 ? t('resolvedLbl') : t('inProgress')}</span></a>`).join('');
  const left = `<div class="workspace-label"><span>02</span><b>${t('myCasesTitle')}</b><em>${mine.length} ${L('tracked signals','ट्रैक किए संकेत')}</em></div><div class="case-list">${rows || `<div class="empty">${t('noCasesYet')} <a href="#/report">${t('report')}</a></div>`}</div>`;
  const right = `<span class="badge b-ai">${L('CASE INTELLIGENCE','केस इंटेलिजेंस')}</span><h2 class="h-card">${L('One timeline. Every outcome.','एक टाइमलाइन। हर परिणाम।')}</h2><p class="muted">${L('Follow each signal from citizen report to departmental action and citizen verification.','हर संकेत को नागरिक रिपोर्ट से विभागीय कार्रवाई और नागरिक सत्यापन तक ट्रैक करें।')}</p><div class="insight-stack"><div><strong>${mine.length}</strong><span>active showcase cases</span></div><div><strong>21</strong><span>demo stages linked to the model</span></div><div><strong>1</strong><span>verification layer before resolution</span></div></div><a class="btn btn-p btn-sm" href="#/report">${t('report')} ${ic('arrow',14)}</a>`;
  return `<div class="wrap page editorial-page">${crumbs([[t('home'), '#/'], [t('myCasesTitle'), '#/cases']])}${workspaceHeader(2,L('CASE INTELLIGENCE WORKSPACE','केस इंटेलिजेंस वर्कस्पेस'),t('myCasesTitle'),t('myCasesSub'))}${workspaceSplit(left,right,'list-page')}</div>`;
}

export function vCase(id) {
  const c = cases.find((x) => x.id === id); if (!c) return notFound(t('caseNotFound'), '#/cases', t('backToCases'));
  const cl = c.cluster ? CL(c.cluster) : null; const n = cl ? clusterCount(cl) : 0;
  const next = L(['Your report has been received.', 'AI analysis is complete. A department will pick this up shortly.', 'The department is reviewing your case.',
    'A field officer is investigating. You may be asked for more evidence.', 'The department has taken action and will ask you to verify.',
    'A field officer has inspected the location and submitted an action update. Please verify whether the problem is actually fixed.',
    'You confirmed the fix. We will keep watching for new complaints for 7 days.', 'This case is a verified resolution.'],
    ['आपकी रिपोर्ट प्राप्त हो गई है।', 'AI विश्लेषण पूरा हो गया है।', 'विभाग आपके मामले की समीक्षा कर रहा है।', 'एक फील्ड अधिकारी जाँच कर रहा है।',
      'विभाग ने कार्रवाई कर ली है।', 'कृपया पुष्टि करें कि समस्या सच में ठीक हुई या नहीं।', 'आपने पुष्टि की। हम निगरानी करेंगे।', 'यह मामला सत्यापित समाधान है।'])[c.stage];
  const tl = stagesArr().map((s, i) => ({ t: s, s: i < c.stage ? 'done' : i === c.stage ? 'now' : 'todo' }));
  const verify = c.stage === 5 ? `<div class="card" style="border-color:var(--primary);box-shadow:0 0 0 4px var(--primary-soft)"><h2 class="h-card">${t('fixed')}</h2>
    <p class="muted" style="margin:6px 0 14px">${L('A department marking a case "resolved" is not final. Your answer decides the next step.', 'विभाग द्वारा "हल" चिह्नित करना अंतिम नहीं है। आपका उत्तर अगला कदम तय करता है।')}</p>
    <div class="row"><button class="btn btn-ok" data-act="verify" data-id="${c.id}" data-v="yes">${t('yes')}</button><button class="btn btn-part" data-act="verify" data-id="${c.id}" data-v="part">${t('part')}</button><button class="btn btn-no" data-act="verify" data-id="${c.id}" data-v="no">${t('no')}</button></div><div id="vno"></div></div>` : '';
  return `<div class="wrap page editorial-page">${crumbs([[t('home'), '#/'], [t('myCasesTitle'), '#/cases'], [c.id, '#/cases/' + c.id]])}${workspaceHeader(3,L('CASE REVIEW WORKSPACE','केस समीक्षा वर्कस्पेस'),esc(c.title),`${c.id} · ${LOC(c.loc).name} · ${deptL(c.deptOverride || CAT[c.cat].dept)}`)}
  <div class="row between"><div><span class="badge ${c.source === 'user' ? 'b-ai' : 'b-fact'}">${c.source === 'user' ? t('yourReportBadge') : t('sourceDemo')}</span>
  <h1 class="h-sec" style="font-size:clamp(28px,4vw,44px);margin-top:8px">${esc(c.title)}</h1><p class="muted" style="margin-top:8px">${c.id} · ${catL(c.cat)} · ${LOC(c.loc).name} · ${deptL(c.deptOverride || CAT[c.cat].dept)}</p></div>
  ${c.status === 'Reopened' ? `<span class="badge b-crit">${t('reopenedLbl')}</span>` : ''}</div>
  <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:24px;align-items:start"><div class="col" style="gap:18px">
    <div class="card"><h2 class="h-card" style="margin-bottom:14px">${t('progressLbl')}</h2>${timeline(tl)}<div class="signal"><b>${t('whatNextQ')}</b><p>${next}</p></div></div>${verify}
    ${c.stage >= 5 && c.stage < 7 ? `<div class="card"><h2 class="h-card" style="margin-bottom:10px">${t('beforeAfterHdr')}</h2>${beforeAfterSlider()}</div>` : ''}</div>
  <div class="col" style="gap:18px"><div class="card"><h2 class="h-card">${t('resolutionAssess')}</h2><p class="sim" style="margin:6px 0 12px">${t('protoAssess')}</p>
    <dl class="kv"><dt>${t('citizenChk')}</dt><dd>${c.stage >= 5 ? t('resolvedLbl') : t('open')}</dd><dt>${t('citizenChk2')}</dt><dd>${c.stage === 5 ? L('Awaiting verification', 'सत्यापन की प्रतीक्षा') : c.stage >= 6 ? t('confirmed') : '—'}</dd>
    <dt>${t('recurrenceLbl')}</dt><dd>${cl && isRecurring(cl) ? t('watching') : t('notDetected')}</dd></dl></div>
  ${cl ? `<div class="card"><h2 class="h-card">${t('partOfProblem')}</h2><p style="margin:8px 0 12px"><b>${esc(cl.title)}</b><br><span class="muted">${n} ${t('relatedCompLbl').toLowerCase()}</span></p><a class="btn btn-s btn-sm" href="#/problems/${cl.id}">${t('seeProblem')}</a></div>` : ''}
  <div class="card"><h2 class="h-card" style="margin-bottom:8px">${t('activityLbl')}</h2>${c.events.map((e) => `<div class="row between small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${esc(e[0])}</span></div>`).join('')}</div></div></div></div>`;
}

// ========================================================= PUBLIC PROBLEMS
export const pf = { f: 'all' };
const statusOf = (cl) => (isEmerging(cl) ? 'emerging' : isRecurring(cl) ? 'recurring' : 'active');

export function vProblems() {
  const list = CLUSTERS.filter((c) => pf.f === 'all' || statusOf(c) === pf.f || (pf.f === 'joint' && isMaster(c)));
  const cnt = (k) => CLUSTERS.filter((c) => statusOf(c) === k).length;
  const stW = { emerging: t('filterEmerging'), recurring: t('filterRecurring'), active: t('filterActive') };
  const filters = [['all', t('filterAll') + ' (' + CLUSTERS.length + ')'], ['emerging', t('filterEmerging') + ' (' + cnt('emerging') + ')'], ['recurring', t('filterRecurring') + ' (' + cnt('recurring') + ')'], ['active', t('filterActive') + ' (' + cnt('active') + ')']];
  const left = `<div class="workspace-label"><span>03</span><b>PUBLIC SIGNAL CLUSTERS</b><em>${list.length} visible patterns</em></div><div class="row filter-rail">${filters.map((f) => `<button class="chip" aria-pressed="${pf.f === f[0]}" data-act="pf" data-f="${f[0]}">${f[1]}</button>`).join('')}</div><div class="problem-list">${list.length ? list.map((c) => { const n = clusterCount(c), st = statusOf(c); return `<a href="#/problems/${c.id}" class="problem-row"><span class="num problem-count ${st}">${n}</span><div><b>${esc(c.title)}</b><small>${c.locs.map((l) => LOC(l).name).join(', ')} · ${catL(c.cat)}</small></div><span class="badge ${st === 'emerging' ? 'b-rev' : st === 'recurring' ? 'b-crit' : 'b-pri'}">${stW[st]}</span></a>`; }).join('') : `<div class="empty">${t('noMatch')}</div>`}</div>`;
  const right = `<span class="badge b-ai">${L('PUBLIC PROBLEM ENGINE','सार्वजनिक समस्या इंजन')}</span><h2 class="h-card">${L('Complaints become patterns.','शिकायतें पैटर्न बनती हैं।')}</h2><p class="muted">${L('JanSaarthi groups related signals by locality, issue type and infrastructure context instead of treating every report as an isolated file.','जनसारथी हर रिपोर्ट को अलग फ़ाइल मानने के बजाय क्षेत्र, समस्या प्रकार और इंफ्रास्ट्रक्चर संदर्भ से संबंधित संकेतों को जोड़ता है।')}</p><div class="mini-flow"><span>Citizen signals</span><i>↓</i><span>AI relationship graph</span><i>↓</i><span>Public problem</span><i>↓</i><span>Action + verification</span></div><a class="btn btn-s btn-sm" href="#/map">Explore impact map ${ic('arrow',14)}</a>`;
  return `<div class="wrap page editorial-page">${crumbs([[t('home'), '#/'], [t('publicProblemsTitle'), '#/problems']])}${workspaceHeader(4,L('PUBLIC PROBLEM INTELLIGENCE','सार्वजनिक समस्या इंटेलिजेंस'),t('publicProblemsTitle'),t('publicProblemsSub'))}${workspaceSplit(left,right,'list-page')}</div>`;
}

export function vProblem(id) {
  const cl = CL(id); if (!cl) return notFound(t('couldntLoad'), '#/problems', t('back'));
  const n = clusterCount(cl), gs = gOf(cl.id);
  const ser = seriesOf(cl, cl.id === 'PP-SL' ? 31 : 14), labs = ser.map((_, i) => '' + (ser.length - 1 - i));
  return `<div class="wrap page editorial-page">${crumbs([[t('home'), '#/'], [t('publicProblemsTitle'), '#/problems'], [cl.title, '#/problems/' + cl.id]])}${workspaceHeader(4,L('PUBLIC PROBLEM DETAIL','सार्वजनिक समस्या विवरण'),esc(cl.title),`${n} ${t('relatedReports')} · ${deptL(cl.dept)}`)}
  <div class="row" style="margin-bottom:8px"><span class="badge b-pri">${cl.status}</span>${isEmerging(cl) ? `<span class="badge b-rev">${t('filterEmerging')}</span>` : ''}${isRecurring(cl) ? `<span class="badge b-crit">${t('filterRecurring')}</span>` : ''}</div>
  <h1 class="h-sec">${esc(cl.title)}</h1><p class="lead" style="margin:10px 0 24px">${n} ${t('relatedReports')} ${cl.locs.map((l) => LOC(l).name).join(', ')}. ${t('handledBy')} ${deptL(cl.dept)}.</p>
  <div class="grid" style="grid-template-columns:1.2fr .8fr;align-items:start"><div class="col" style="gap:18px">
    <div class="card"><h2 class="h-card" style="margin-bottom:8px">${t('reportsOverTime')}</h2>${areaChart(ser, labs, 190, 'var(--primary)')}</div>
    <div class="card"><h2 class="h-card" style="margin-bottom:12px">${t('publicTimeline')}</h2>${timeline([{ t: t('firstReports') }, { t: t('linkedInto'), d: t('aiGrouping') }, { t: t('assignedTo') + ' ' + deptL(cl.dept) }, { t: t('investigationProgress'), s: 'now', d: t('rootCauseNotConfirmed') }, { t: t('citizenVerifTodo'), s: 'todo' }, { t: t('verifiedResTodo'), s: 'todo' }])}</div></div>
  <div class="col" style="gap:18px"><div class="mapbox"><div id="problem-map" class="leaflet-map short" data-cluster="${cl.id}"></div><span class="map-note">${t('approxSim')}</span></div>
    <div class="card"><h2 class="h-card">${t('citizenVerifLbl')}</h2><p class="muted" style="margin-top:8px">${cl.id === 'PP-21T' ? t('threeOfFour') : t('noVerifiedYet')}</p></div>
    <p class="sim">${t('namesNeverShown')}</p><a class="btn btn-p" href="#/report">${t('reportRelated')}</a></div></div></div>`;
}

// =================================================================== MAP ===
export function vMap() {
  const cards = CLUSTERS.slice(0, 6).map((c) => `<a class="map-problem card" href="#/problems/${c.id}"><span class="map-problem-dot"></span><div><b>${esc(c.title)}</b><small>${clusterCount(c)} ${L('reports', 'रिपोर्टें')} · ${c.locs.map((l) => LOC(l).name).join(', ')}</small></div>${ic('arrow',14)}</a>`).join('');
  const left = `<div class="workspace-label"><span>05</span><b>JABALPUR SIGNAL MAP</b><em>Live prototype intelligence</em></div><div class="mapbox editorial-map"><div id="citizen-map" class="leaflet-map"></div><span class="map-note">${t('sim')}</span></div>`;
  const right = `<span class="badge b-ai">${L('IMPACT LAYER','प्रभाव परत')}</span><h2 class="h-card">${L('See where signals concentrate.','देखें संकेत कहाँ केंद्रित हैं।')}</h2><p class="muted">${L('Explore public-problem clusters and their approximate affected regions.','सार्वजनिक समस्या क्लस्टर और उनके अनुमानित प्रभावित क्षेत्रों को देखें।')}</p><div class="map-problem-list">${cards}</div>`;
  return `<div class="wrap page editorial-page">${crumbs([[t('home'), '#/'], [t('mapTitle'), '#/map']])}${workspaceHeader(5,L('GEOSPATIAL INTELLIGENCE','भौगोलिक इंटेलिजेंस'),t('mapTitle'),t('mapSub'))}${workspaceSplit(left,right)}</div>`;
}

// ================================================================= DEMO ===
const LIFE_EN=['Citizen signal','AI understanding','Related complaints','Public problem','Root cause','Government action','Citizen verification','Verified resolution'];
const LIFE_HI=['नागरिक संकेत','AI समझ','संबंधित शिकायतें','सार्वजनिक समस्या','मूल कारण','सरकारी कार्रवाई','नागरिक सत्यापन','सत्यापित समाधान'];
const DEMO_TITLES=['Open the JanSaarthi landing page','Click “Report a problem”','Citizen speaks her complaint','AI extracts the structure','System finds related grievances','Relationship graph appears','Public problem created','Map highlights the affected region','Infrastructure intelligence links a pipeline','Possible common cause identified','Routed to Water Supply Department','Officer investigates','Action taken','“Is the problem actually fixed?”','Case reopens automatically','Recurrence detected','Investigation workspace opens','Permanent intervention recorded','Citizen confirms: YES — it’s fixed','Moved to Verified Resolution','From complaint to verified solution'];
const DEMO_ACTORS=['Citizen','Citizen','Citizen','AI','AI','AI','System','Map','Infrastructure AI','AI','System','Officer','Officer','Citizen','Citizen','AI','Officer','Officer','Citizen','System','Finale'];
const DEMO_P=[0,0,0,1,2,2,3,3,3,4,5,5,5,6,6,4,4,5,6,7,7];
const DEMO_BODY_EN=['The citizen starts with one simple idea: a complaint is a signal that can reveal a larger public problem.','No department or category guessing. The citizen only explains what happened.','Text or voice captures the complaint in natural language, with the locality attached.','Issue, locality, severity and suggested authority become an editable AI assessment.','The system compares location, issue type and infrastructure references to connect signals.','One graph makes the relationships between citizens, locations, assets and the problem visible.','Dozens of separate complaints can now represent one shared public-service problem.','The concentration of signals is visible on the Jabalpur map without exposing personal information.','Related complaints are connected to the same infrastructure asset, helping investigators inspect the shared cause.','The model surfaces a hypothesis with evidence and confidence. It is never presented as a proven fact.','Issue type, locality and asset ownership produce a suggested authority. Officers can override it.','The investigation workspace brings evidence, related complaints and infrastructure context together.','The officer records the intervention. Administrative closure is not treated as citizen verification.','The citizen is explicitly asked to verify the claimed fix.','If the problem is still happening, the system reopens the case instead of accepting administrative closure.','Historical patterns and new signals indicate that the issue may be recurring.','The officer sees the problem graph, root-cause hypothesis, infrastructure asset and previous intervention together.','A stronger intervention is recorded, such as pipe replacement and pressure monitoring.','The person who raised the signal confirms the real-world outcome.','Administrative action, citizen confirmation, evidence and recurrence monitoring now agree.','JanSaarthi turns an isolated complaint into a learning loop for public-service delivery.'];
const DEMO_BODY_HI=['नागरिक एक सरल विचार से शुरू करता है: शिकायत एक संकेत है जो बड़ी सार्वजनिक समस्या दिखा सकती है।','कोई विभाग या श्रेणी चुनने की जरूरत नहीं। नागरिक सिर्फ बताता है कि क्या हुआ।','टेक्स्ट या आवाज़ से शिकायत दर्ज होती है और क्षेत्र अपने-आप जुड़ता है।','समस्या, क्षेत्र, गंभीरता और सुझाया गया विभाग संपादन-योग्य AI आकलन बनते हैं।','सिस्टम स्थान, समस्या और इंफ्रास्ट्रक्चर संदर्भों से संकेतों को जोड़ता है।','एक ग्राफ नागरिकों, स्थानों, संपत्तियों और समस्या के संबंध दिखाता है।','अलग-अलग शिकायतें अब एक साझा सार्वजनिक-सेवा समस्या का प्रतिनिधित्व कर सकती हैं।','व्यक्तिगत जानकारी दिखाए बिना संकेतों का समूह जबलपुर के मानचित्र पर दिखाई देता है।','संबंधित शिकायतें उसी इंफ्रास्ट्रक्चर एसेट से जुड़ती हैं, जिससे साझा कारण की जाँच आसान होती है।','मॉडल साक्ष्य और confidence के साथ परिकल्पना देता है; इसे प्रमाणित तथ्य नहीं माना जाता।','समस्या, क्षेत्र और एसेट स्वामित्व से विभाग सुझाया जाता है; अधिकारी इसे बदल सकते हैं।','जाँच वर्कस्पेस में साक्ष्य, संबंधित शिकायतें और इंफ्रास्ट्रक्चर संदर्भ एक साथ आते हैं।','अधिकारी कार्रवाई दर्ज करता है। प्रशासनिक closure को नागरिक सत्यापन नहीं माना जाता।','नागरिक से स्पष्ट रूप से समाधान की पुष्टि करने को कहा जाता है।','समस्या जारी होने पर सिस्टम administrative closure स्वीकार नहीं करता और केस फिर खोलता है।','ऐतिहासिक पैटर्न और नए संकेत बताते हैं कि समस्या दोबारा हो सकती है।','अधिकारी समस्या ग्राफ, root-cause hypothesis, infrastructure asset और पिछली कार्रवाई एक साथ देखता है।','जैसे पाइप बदलना और pressure monitoring लगाना, अधिक स्थायी हस्तक्षेप दर्ज किया जाता है।','जिस नागरिक ने संकेत दिया था, वही वास्तविक परिणाम की पुष्टि करता है।','प्रशासनिक कार्रवाई, नागरिक पुष्टि, साक्ष्य और recurrence monitoring अब एक साथ मिलते हैं।','JanSaarthi एक अकेली शिकायत को public-service learning loop में बदलता है।'];
const DEMO=DEMO_TITLES.map((h,i)=>({p:DEMO_P[i],a:L(DEMO_ACTORS[i],DEMO_ACTORS[i]),h:L(h,h),b:L(DEMO_BODY_EN[i],DEMO_BODY_HI[i])}));
export const demoState={step:0,auto:false};let demoTimer=null;export function stopDemo(){clearInterval(demoTimer);demoTimer=null;demoState.auto=false;}
function demoStage(i){
 const cl=CL('PP-GRH'),n=clusterCount(cl),a=AI.analyzeGrievance('Our tap water has been dirty for five days in Garha.'),pl=ASSET('PL-GRH-01');
 const stages=[
  ()=>`<div class="demo-visual hero-demo"><div class="demo-orbit"><span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span><span class="orb o4"></span><b>YOUR<br>COMPLAINT</b></div><div><span class="badge b-ai">AI SIGNAL</span><h3>${t('heroH')}</h3><p>${t('heroP')}</p></div></div>`,
  ()=>`<div class="demo-visual action-demo"><div class="fake-browser"><div class="browser-bar"><i></i><i></i><i></i><span>JanSaarthi / citizen</span></div><div class="report-card"><span class="badge b-pri">CITIZEN</span><h3>Tell us what happened.</h3><div class="fake-text">Our tap water has been dirty for five days in Garha.</div><div class="row"><span class="btn btn-p btn-sm">${t('ctaReport')} ${ic('arrow',14)}</span><span class="chip">${ic('pin',14)} Garha</span></div></div></div></div>`,
  ()=>`<div class="demo-visual voice-demo"><div class="voice-ring">${ic('mic',28)}</div><div><span class="badge b-ai">VOICE + TEXT</span><h3>Citizen explains naturally</h3><p class="muted">“Dirty water from our tap for five days near Garha.”</p><div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>`,
  ()=>`<div class="grid g2"><div class="card flat"><h3 class="h-card">AI assessment ${badge('ai')}</h3><dl class="kv" style="margin-top:12px"><dt>${t('fldIssue')}</dt><dd>${a.issue}</dd><dt>${t('locationLbl')}</dt><dd>${LOC(a.loc).name}</dd><dt>${t('fldSeverity')}</dt><dd>${a.severity}</dd><dt>${t('suggestedAuth')}</dt><dd>${deptL(a.dept)}</dd><dt>${t('confidenceLbl')}</dt><dd>${Math.round(a.confidence*100)}%</dd></dl></div><div class="ai-confidence"><span class="badge b-ai">EDITABLE AI</span><div class="bar-h"><i style="width:${a.confidence*100}%"></i></div><b>Human verification remains required</b></div></div>`,
  ()=>`<div class="demo-visual signal-merge"><div class="signal-stack"><span>Complaint #01</span><span>Complaint #07</span><span>Complaint #18</span><span>Complaint #31</span></div><div class="merge-arrow">→</div><div class="merge-core"><b>${n}</b><small>related signals</small></div></div>`,
  ()=>graphHTML(cl),
  ()=>`<div class="demo-visual public-problem"><div class="problem-core"><span class="badge b-ai">PUBLIC PROBLEM</span><strong>Garha Water Supply Failure</strong><small>${n} linked complaints · ${cl.locs.length} ward areas</small></div><div class="problem-pills"><span>AI signal</span><span>Related complaints</span><span>Shared infrastructure</span><span>Root-cause hypothesis</span></div></div>`,
  ()=>`<div class="demo-visual map-demo"><div id="demo-map" class="leaflet-map"></div><div class="map-overlay"><b>Affected region</b><span>Garha · ${n} signals</span></div></div>`,
  ()=>`<div class="demo-visual pipeline-demo"><div class="pipe-node">${ic('pin',20)}<b>Garha</b><small>Ward 17</small></div><div class="pipe-line"><i></i><span>PL-GRH-01</span></div><div class="pipe-node active">${ic('droplet',20)}<b>Water pipeline</b><small>${pl?pl.id:'PL-GRH-01'}</small></div><div class="pipe-line"><i></i><span>shared asset</span></div><div class="pipe-node">${ic('layers',20)}<b>Public problem</b><small>${n} signals</small></div></div>`,
  ()=>`<div class="grid g2"><div class="card flat"><div class="row between"><b>${t('possibleRootCause')}</b>${badge('ai')}</div><h2 class="h-card" style="margin:10px 0">${cl.cause}</h2><div class="bar-h"><i style="width:${cl.causeConf*100}%"></i></div><p class="small muted">${t('confidenceLbl')}: ${Math.round(cl.causeConf*100)}%</p></div><div class="hypothesis-box"><span class="badge b-rev">HYPOTHESIS</span><b>Needs field verification</b><span>Evidence is linked; the model does not declare a cause as fact.</span></div></div>`,
  ()=>`<div class="demo-visual route-demo"><div class="route-step done"><b>AI classification</b><span>Water / quality</span></div><div class="route-arrow">↓</div><div class="route-step done"><b>Locality</b><span>Garha · Ward 17</span></div><div class="route-arrow">↓</div><div class="route-step active"><b>Water Supply Department</b><span>Suggested authority</span></div><div class="route-step alt"><b>Officer override</b><span>Always available</span></div></div>`,
  ()=>`<div class="demo-visual officer-demo"><div style="width:100%;border:1px solid var(--line);border-radius:18px;overflow:hidden"><div class="workspace-top"><span class="badge b-pri">INVESTIGATION</span><b>JS-2044 · Garha Water Supply Failure</b><span class="badge b-rev">HIGH PRIORITY</span></div><div class="workspace-grid"><div><h4>Evidence</h4><div class="mini-row">📷 3 citizen photos</div><div class="mini-row">📝 ${n} related signals</div></div><div><h4>Infrastructure</h4><div class="asset-card">PL-GRH-01<br><small>Water pipeline · recurring failures</small></div></div><div><h4>AI hypothesis</h4><div class="asset-card">${cl.cause}<br><small>${Math.round(cl.causeConf*100)}% confidence</small></div></div></div></div></div>`,
  ()=>`<div class="demo-visual action-taken"><div class="action-icon">${ic('check',32)}</div><div><span class="badge b-ver">ACTION RECORDED</span><h3>Line flushed + valve adjusted</h3><p class="muted">Administrative resolution recorded. Citizen verification is still pending.</p></div></div>`,
  ()=>`<div class="demo-visual verify-question"><div class="question-mark">?</div><div><span class="badge b-rev">CITIZEN CHECK</span><h2>${t('fixed')}</h2><p class="muted">A department closure is not the final truth. The citizen gets the final verification step.</p><div class="row"><span class="btn btn-ok btn-sm">${t('yes')}</span><span class="btn btn-part btn-sm">${t('part')}</span><span class="btn btn-no btn-sm">${t('no')}</span></div></div></div>`,
  ()=>`<div class="demo-visual reopen-demo"><div class="reopen-loop"><span>Resolved</span><b>↻</b><span>Reopened</span></div><h3>Problem still happening → case reopens</h3><p class="muted">The unresolved signal returns to investigation instead of disappearing into closure statistics.</p></div>`,
  ()=>`<div class="grid g2"><div class="card flat"><span class="badge b-crit">RECURRING</span><h3 class="h-card" style="margin:10px 0">${pl?pl.id:'PL-GRH-01'}</h3><p class="muted">Repeated failures detected around the same infrastructure asset.</p></div><div class="card flat">${areaChart(seriesOf(cl,8),['-7','-6','-5','-4','-3','-2','-1','now'],190,'var(--warning)')}<b>Recurrence signal</b></div></div>`,
  ()=>`<div class="demo-visual investigation-full"><div style="width:100%;border:1px solid var(--line);border-radius:18px;overflow:hidden"><div class="investigation-header"><b>Investigation workspace</b><span class="badge b-ai">AI + HUMAN</span></div><div class="investigation-columns"><div><b>Public problem</b><div class="big-metric">${n}</div><small>related complaints</small></div><div><b>Root cause</b><p>${cl.cause}</p><span class="badge b-rev">${Math.round(cl.causeConf*100)}% confidence</span></div><div><b>Infrastructure</b><p>PL-GRH-01</p><small>Water pipeline</small></div><div><b>History</b><p>2025</p><small>Similar issue found</small></div></div></div></div>`,
  ()=>`<div class="demo-visual permanent-demo"><div class="intervention-card"><span class="badge b-ver">PERMANENT INTERVENTION</span><h2>Pipe replacement + pressure monitoring</h2><div class="intervention-line"><span>Old</span><i></i><span>New</span></div><p class="muted">Action is linked back to the public problem and infrastructure asset for institutional learning.</p></div></div>`,
  ()=>`<div class="demo-visual citizen-yes"><div class="confirm-circle">✓</div><div><span class="badge b-ver">CITIZEN CONFIRMED</span><h2>YES — it’s fixed</h2><p class="muted">The citizen confirms the real-world outcome after the intervention.</p></div></div>`,
  ()=>`<div class="demo-visual verified-demo"><div class="verified-ring">✓</div><div><span class="badge b-ver">VERIFIED RESOLUTION</span><h2>All signals agree</h2><div class="verification-grid"><span>✓ Admin action</span><span>✓ Citizen confirmation</span><span>✓ Evidence</span><span>✓ Recurrence watch</span></div></div></div>`,
  ()=>`<div class="final dark-zone">${heroNet()}<div class="final-pillars"><span>Signal</span><span>Pattern</span><span>Action</span><span>Verification</span><span>Learning</span></div><h2>From complaint</h2><h2>to verified solution.</h2><p class="tail">${t('tagline')}</p></div>`
 ];return stages[i]();
}
export function vDemo(){const d=demoState,s=DEMO[d.step];return `<div class="wrap page editorial-page">${crumbs([[t('home'),'#/'],[t('demo'),'#/demo']])}${workspaceHeader(6,L('21-STEP PRODUCT STORY','21-चरण उत्पाद कहानी'),t('demoPageTitle'),t('demoPageSub'),L('LIVE DEMO','लाइव डेमो'))}<div class="demo-head"><div><div class="row" style="gap:8px;margin-bottom:8px"><span class="badge b-pri">${t('demo')}</span><span class="badge b-ai">21-STEP STORY</span></div><h1 class="h-sec" style="font-size:clamp(28px,4vw,44px)">${t('demoPageTitle')}</h1><p class="muted" style="margin-top:6px">${t('demoPageSub')} ${t('sim')}.</p></div><div class="row"><button class="btn btn-s btn-sm" data-act="dprev" ${d.step===0?'disabled':''}>${ic('prev',15)} ${t('prevBtn')}</button><button class="btn btn-p btn-sm" data-act="dauto">${ic(d.auto?'pause':'play',15)} ${d.auto?t('pauseDemo'):t('playDemo')}</button><button class="btn btn-s btn-sm" data-act="dnext" ${d.step===DEMO.length-1?'disabled':''}>${t('nextBtn')} ${ic('next',15)}</button><button class="btn btn-s btn-sm" data-act="drestart">${ic('refresh',15)} ${t('restartBtn')}</button></div></div><div class="life">${(langState.lang==='hi'?LIFE_HI:LIFE_EN).map((l,i)=>`<i class="${i<=s.p?'on':''}" title="${l}"></i>`).join('')}</div><div class="demo-shell"><ul class="demo-list demo-list-21" role="list">${DEMO.map((x,i)=>`<li><button data-act="dgo" data-i="${i}" ${i===d.step?'aria-current="step"':''} class="${i<d.step?'past':''}"><span class="n">${String(i+1).padStart(2,'0')}</span><span>${x.h}</span></button></li>`).join('')}</ul><div class="demo-content"><div class="row" style="margin-bottom:10px"><span class="badge b-pri">${t('stepOf')} ${d.step+1} ${t('ofWord')} ${DEMO.length}</span><span class="badge b-fact">${s.a}</span></div><h2 class="h-card" style="font-size:24px">${s.h}</h2><p class="muted" style="margin:6px 0 16px;max-width:850px">${s.b}</p><div class="stage" id="stage">${demoStage(d.step)}</div></div></div></div>`;}
export function demoLength(){return DEMO.length;}export function demoGo(i,rerender){demoState.step=Math.max(0,Math.min(DEMO.length-1,i));rerender(true);}

// ============================================================= HOW IT WORKS
export function vHow() {
  const hi = langState.lang === 'hi';
  const CFEAT = [
    ['plus', ['Report a problem', 'Describe what happened in your own words or by voice.'], ['समस्या दर्ज करें', 'अपने शब्दों में या आवाज़ से बताएँ।']],
    ['clip', ['Upload evidence', 'Attach photos, videos or documents.'], ['प्रमाण जोड़ें', 'फ़ोटो, वीडियो या दस्तावेज़ जोड़ें।']],
    ['pin', ['Location-based reporting', 'Your locality is attached automatically.'], ['स्थान-आधारित रिपोर्टिंग', 'आपका क्षेत्र अपने-आप जुड़ जाता है।']],
    ['zap', ['AI-assisted categorization', 'AI suggests the issue type and department — you can edit it.'], ['AI-सहायित वर्गीकरण', 'AI समस्या और विभाग सुझाता है।']],
    ['clock', ['Track grievance status', 'Follow your case from "reported" to "verified".'], ['स्थिति ट्रैक करें', '“दर्ज” से “सत्यापित” तक देखें।']],
    ['check', ['Respond to verification', 'Confirm, partially confirm, or reject a claimed fix.'], ['सत्यापन का जवाब दें', 'दावा किए गए समाधान की पुष्टि या अस्वीकार करें।']],
    ['network', ['View public problems', 'See the larger patterns your report may be part of.'], ['सार्वजनिक समस्याएँ देखें', 'बड़े पैटर्न को समझें।']],
    ['shield', ['Resolved issues & impact', 'Browse verified resolutions city-wide.'], ['हल हुई समस्याएँ', 'सत्यापित समाधान देखें।']]
  ];
  const cardHtml = (f,i) => { const c = hi ? f[2] : f[1]; return `<div class="feature-tile"><span class="feature-no">${String(i+1).padStart(2,'0')}</span><span class="feature-icon">${ic(f[0], 18)}</span><b>${esc(c[0])}</b><p>${esc(c[1])}</p></div>`; };
  const left = `<div class="workspace-label"><span>07</span><b>THE JANSAARTHI LOOP</b><em>Signal → pattern → action → verification</em></div><div class="feature-grid">${CFEAT.map(cardHtml).join('')}</div>`;
  const right = `<span class="badge b-ai">HOW IT WORKS</span><h2 class="h-card">One public-service loop, end to end.</h2><p class="muted">The interface is designed to show the journey clearly: citizens create signals, AI connects evidence, officers act, and citizens verify the outcome.</p><div class="loop-visual"><div><b>01</b><span>Signal</span></div><i>→</i><div><b>02</b><span>Pattern</span></div><i>→</i><div><b>03</b><span>Action</span></div><i>→</i><div><b>04</b><span>Verify</span></div></div><div class="card-note">${hi ? 'अधिकारी और प्रशासक अलग कंसोल का उपयोग करते हैं।' : 'Officers and admins use a separate console with its own login and investigation workspace.'}</div>`;
  return `<div class="wrap page editorial-page">${crumbs([[t('home'), '#/'], [t('how'), '#/how']])}${workspaceHeader(7,L('CITIZEN EXPERIENCE SYSTEM','नागरिक अनुभव प्रणाली'),t('howTitle'),t('howSub'))}${workspaceSplit(left,right)}</div>`;
}

// ============================================================== LOGIN ETC.
function authCard(title, sub, body) {
  return `<div class="wrap page" style="max-width:440px;padding-top:56px"><div class="card" style="padding:30px"><div class="row" style="justify-content:center;margin-bottom:10px">${ic('user', 20)}</div>
  <h1 class="h-card" style="font-size:24px;text-align:center">${title}</h1>${sub ? `<p class="muted" style="text-align:center;margin:8px 0 22px">${sub}</p>` : '<div style="height:18px"></div>'}${body}</div></div>`;
}
function loginAuthCard(title, sub, body) {
  return `<div class="auth-screen citizen-auth">
    <section class="auth-visual">
      <div class="auth-visual-top"><span class="auth-kicker">${L('CITIZEN INTELLIGENCE ACCESS','नागरिक इंटेलिजेंस एक्सेस')}</span><span class="auth-code">AI 01</span></div>
      <div class="auth-visual-core">
        <div class="auth-mark auth-mark-citizen">${ic('activity', 30)}</div>
        <span class="auth-eyebrow">${L('CITIZEN SIGNAL → PUBLIC INTELLIGENCE','नागरिक संकेत → सार्वजनिक इंटेलिजेंस')}</span>
        <h1>${L('From signal<br>to coordinated<br>action.','संकेत से<br>समन्वित<br>कार्रवाई तक।')}</h1>
        <p>${L('Report what happened, connect evidence and follow the journey from your signal to a verified public-service outcome.','समस्या दर्ज करें, साक्ष्य जोड़ें और अपने संकेत से सत्यापित सार्वजनिक-सेवा परिणाम तक की यात्रा देखें।')}</p>
        <div class="auth-flow"><span>${L('Citizen signal','नागरिक संकेत')}</span><i>→</i><span>${L('AI pattern','AI पैटर्न')}</span><i>→</i><span>${L('Verified action','सत्यापित कार्रवाई')}</span></div>
      </div>
      <div class="auth-orbit"><span class="auth-orbit-dot d1"></span><span class="auth-orbit-dot d2"></span><span class="auth-orbit-dot d3"></span><div class="auth-orbit-ring r1"></div><div class="auth-orbit-ring r2"></div></div>
    </section>
    <section class="auth-form-panel">
      <div class="auth-panel-top"><div class="auth-gov"><span class="auth-mini-logo">${ic('activity', 18)}</span><span>JANSAARTHI / CITIZEN</span></div><div class="auth-access"><i></i>${L('CITIZEN ACCESS','नागरिक एक्सेस')}</div></div>
      <div class="auth-form-wrap">
        <div class="auth-form-icon auth-form-icon-citizen">${ic('user', 25)}</div>
        <h2>${title}</h2><p class="auth-form-sub">${sub}</p>
        ${body}
      </div>
      <div class="auth-panel-foot"><button class="auth-lang" data-act="lang" type="button">${langState.lang === 'hi' ? 'English' : 'हिन्दी'} ${ic('globe',14)}</button><span>${L('Citizen workspace · JanSaarthi AI','नागरिक कार्यक्षेत्र · जनसारथी AI')}</span></div>
    </section>
  </div>`;
}
export const loginErr = { msg: '' };
export function vLogin() {
  return loginAuthCard(t('loginTitle'), t('loginSub'), `
  <form id="loginForm"><label for="lem">${t('emailLbl')}</label><input id="lem" type="email" autocomplete="username" placeholder="you@example.com">
  <div class="auth-field-gap"></div><label for="lpw">${t('passwordLbl')}</label><input id="lpw" type="password" autocomplete="current-password" placeholder="••••••••">
  <div class="auth-field-gap"></div><label for="lnm">${t('nameLbl')} <span class="muted small">(${L('optional', 'वैकल्पिक')})</span></label><input id="lnm" autocomplete="name" placeholder="${L('e.g. Priya Sharma', 'उदा. प्रिया शर्मा')}">
  ${loginErr.msg ? `<div class="err" role="alert" style="margin-top:8px">${esc(loginErr.msg)}</div>` : ''}
  <p class="auth-submit"><button class="btn btn-p btn-lg" style="width:100%;justify-content:center" data-act="doLogin" type="button">${t('loginBtn')}</button></p></form>
  <p class="auth-links"><a href="#/forgot-password" class="small">${t('forgotLink')}</a><span class="small">${t('noAccount')} <a href="#/register">${t('registerLink')}</a></span></p>
  <p class="sim auth-demo">${t('demoCredsNote')}</p>`);
}
export const regErr = { msg: '' };
export function vRegister() {
  return authCard(t('registerTitle'), t('registerSub'), `
  <form id="regForm"><label for="rnm">${t('nameLbl')}</label><input id="rnm" autocomplete="name">
  <div style="height:12px"></div><label for="rem">${t('emailLbl')}</label><input id="rem" type="email" autocomplete="username">
  <div style="height:12px"></div><label for="rpw">${t('passwordLbl')}</label><input id="rpw" type="password" autocomplete="new-password">
  <div style="height:12px"></div><label for="rpw2">${t('confirmLbl')}</label><input id="rpw2" type="password" autocomplete="new-password">
  ${regErr.msg ? `<div class="err" role="alert" style="margin-top:8px">${esc(regErr.msg)}</div>` : ''}
  <p style="margin-top:18px"><button class="btn btn-p btn-lg" style="width:100%;justify-content:center" data-act="doRegister" type="button">${t('registerBtn')}</button></p></form>
  <p class="small" style="margin-top:6px;text-align:center">${t('haveAccount')} <a href="#/login" style="font-weight:700">${t('backToLogin')}</a></p>`);
}
export const resetSent = { v: false };
export function vForgot() {
  if (resetSent.v) return authCard(t('resetSentTitle'), null, `<p class="muted" style="text-align:center">${t('resetSentSub')}</p><p style="margin-top:20px;text-align:center"><a class="btn btn-p" href="#/login">${t('backToLogin')}</a></p>`);
  return authCard(t('resetTitle'), t('resetSub'), `<label for="fem">${t('emailLbl')}</label><input id="fem" type="email" autocomplete="username">
  <p style="margin-top:18px"><button class="btn btn-p btn-lg" style="width:100%;justify-content:center" data-act="doForgot" type="button">${t('sendReset')}</button></p>
  <p class="small" style="margin-top:6px;text-align:center"><a href="#/login" style="font-weight:700">${t('backToLogin')}</a></p>`);
}
