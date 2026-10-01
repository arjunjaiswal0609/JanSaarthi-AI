// JanSaarthi AI — shared UI-building helpers used by both portals.
import { t, L, localizeRendered } from './i18n.js';
import { ic } from './icons.js';
import { esc } from './dom-utils.js';
import { catL, deptL, assetTypeL, healthL } from './categories.js';
import { ASSET, gOf, assetStats, clusterCount } from './data-store.js';
import { LOC } from './geo-jabalpur.js';

export function toast(msg) {
  const box = document.getElementById('toasts'); if (!box) return;
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg;
  box.appendChild(d); setTimeout(() => d.remove(), 3600);
}

export function badge(kind) {
  const map = {
    fact: `<span class="badge b-fact">${t('fact')}</span>`,
    ai: `<span class="badge b-ai">${t('aiAssess')}</span>`,
    ver: `<span class="badge b-ver">${t('verified')}</span>`,
    rev: `<span class="badge b-rev">${t('needsReview')}</span>`
  };
  return map[kind] || '';
}

export function timeline(events) {
  return `<ol class="tracker">${events.map((e) => `<li class="${e.s || 'done'}"><span class="m">${e.s === 'now' || e.s === 'todo' ? '' : ic('check', 14)}</span><div><div class="t">${esc(e.t)}</div>${e.d ? `<div class="muted small">${esc(e.d)}</div>` : ''}</div></li>`).join('')}</ol>`;
}

export function sparkline(vals, w = 120, h = 26, color = 'var(--cyan)') {
  const mx = Math.max(1, ...vals), n = vals.length;
  const pts = vals.map((v, i) => [(i / (n - 1 || 1)) * w, h - 2 - (v / mx) * (h - 6)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="sp" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d} L${w} ${h} L0 ${h}Z" fill="${color}" opacity=".16"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8"/></svg>`;
}

export function areaChart(vals, labels, h = 190, color = 'var(--cyan)') {
  const w = 560, pl = 32, pb = 24, pt = 12, mx = Math.max(1, ...vals), n = vals.length;
  const X = (i) => pl + (n === 1 ? 0 : (i / (n - 1)) * (w - pl - 10));
  const Y = (v) => pt + (1 - v / mx) * (h - pt - pb);
  const d = vals.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  let grid = '';
  for (let k = 0; k <= 3; k++) { const v = Math.round((mx * k) / 3); grid += `<line x1="${pl}" x2="${w - 4}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="10" fill="var(--ink-2)" font-family="var(--font-num)">${v}</text>`; }
  const step = Math.ceil(n / 7);
  const xl = labels.map((l, i) => (i % step === 0 || i === n - 1 ? `<text x="${X(i)}" y="${h - 6}" text-anchor="middle" font-size="10" fill="var(--ink-2)">${l}</text>` : '')).join('');
  const dots = vals.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.4" fill="${color}"><title>${labels[i]}: ${v}</title></circle>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="trend chart">${grid}<path d="${d} L${X(n - 1)} ${Y(0)} L${X(0)} ${Y(0)}Z" fill="${color}" opacity=".16"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round"/>${dots}${xl}</svg>`;
}

export function impactBars(im) {
  const LBL = { High: L('High', 'उच्च'), Medium: L('Medium', 'मध्यम'), Low: L('Low', 'निम्न') };
  const CK = { 'Citizen impact': L('Citizen impact', 'नागरिक प्रभाव'), 'Duration': t('durationLbl'), 'Recurrence': t('recurrenceLbl'),
    'Growth': L('Growth', 'वृद्धि'), 'Location context': L('Location context', 'स्थान संदर्भ'), 'Safety context': L('Safety context', 'सुरक्षा संदर्भ') };
  return `<div class="row between"><b>${t('publicImpactLbl')}</b><span class="badge ${im.label === 'High' ? 'b-crit' : 'b-rev'}">${LBL[im.label]}</span></div>
  <div class="col" style="gap:9px;margin-top:10px">${Object.entries(im.comp).map(([k, v]) => `<div><div class="row between small"><span>${CK[k] || k}</span><span class="num">${Math.round(v)}</span></div><div class="bar-h"><i style="width:${Math.round(v)}%"></i></div></div>`).join('')}</div>
  <p class="sim" style="margin-top:10px">${L('Prototype metric, not an official government score', 'प्रोटोटाइप मीट्रिक, कोई आधिकारिक सरकारी स्कोर नहीं')}</p>`;
}

export function recurrenceTimeline(asset) {
  if (!asset.hist.length) return `<div class="empty">${L('No recurring pattern detected for this asset.', 'इस संपत्ति के लिए कोई बार-बार होने वाला पैटर्न नहीं मिला।')}</div>`;
  const lab = { issue: [L('Issue reported', 'समस्या दर्ज'), 'var(--danger)'], repair: [L('Repair', 'मरम्मत'), 'var(--warning)'], resolved: [L('Marked resolved', 'हल के रूप में चिह्नित'), 'var(--success)'] };
  const items = asset.hist.map((h, i) => `<div style="flex:1;text-align:center;position:relative">
    <div style="height:4px;background:${i ? 'var(--line)' : 'transparent'};position:absolute;left:0;right:50%;top:12px"></div>
    <div style="height:4px;background:${i < asset.hist.length - 1 ? 'var(--line)' : 'transparent'};position:absolute;left:50%;right:0;top:12px"></div>
    <span style="position:relative;display:inline-block;width:20px;height:20px;border-radius:50%;background:${lab[h[1]][1]};border:3px solid var(--surface)"></span>
    <div class="small" style="font-weight:700;margin-top:6px">${lab[h[1]][0]}</div></div>`).join('');
  return `<div style="overflow-x:auto"><div style="display:flex;gap:0;min-width:${asset.hist.length * 100}px;padding:10px 0 4px">${items}</div></div>
  <p style="margin-top:10px;font-weight:700">${asset.failures >= 3
    ? L('Issue returned after each "resolved" closure. Repeated closure is not the same as permanent resolution.', 'हर "हल" किए जाने के बाद समस्या फिर लौट आई। बार-बार बंद करना स्थायी समाधान के समान नहीं है।')
    : L('Limited recurrence so far. Monitoring continues.', 'अभी तक सीमित पुनरावृत्ति। निगरानी जारी है।')}</p>`;
}

export function beforeAfterSlider() {
  return `<div class="ba" id="ba">
  <div class="lay" style="background:linear-gradient(160deg,#5a4318,#8a6a2b 55%,#4a3712)"><svg viewBox="0 0 400 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="40" y="70" width="320" height="26" rx="13" fill="#3b2d0e"/><rect x="176" y="96" width="14" height="46" fill="#3b2d0e"/><ellipse cx="183" cy="176" rx="70" ry="16" fill="#c79a3c" opacity=".7"/></svg></div>
  <div class="lay after" style="background:linear-gradient(160deg,#0d3a55,#1a7a9c 55%,#0d3a55)"><svg viewBox="0 0 400 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="40" y="70" width="320" height="26" rx="13" fill="#0a2a3d"/><rect x="176" y="96" width="14" height="46" fill="#0a2a3d"/><ellipse cx="183" cy="176" rx="46" ry="9" fill="#7fe6ff" opacity=".55"/></svg></div>
  <span class="tag" style="left:10px">${L('Before', 'पहले')}</span><span class="tag" style="right:10px">${L('After', 'बाद में')}</span>
  <div class="divider"></div><input type="range" min="2" max="98" value="50" aria-label="Before and after comparison slider"></div>
  <p class="small muted" style="margin-top:8px">${L('Illustrative demo evidence.', 'उदाहरणात्मक डेमो साक्ष्य।')} ${badge('ai')} ${L('Visual change detected. This does not prove the fix: verification is still required.', 'दृश्य परिवर्तन का पता चला। यह समाधान साबित नहीं करता: सत्यापन अभी भी आवश्यक है।')}</p>`;
}
export function bindBeforeAfterSlider(root = document) {
  const box = root.querySelector('#ba'); if (!box) return;
  const input = box.querySelector('input');
  input.oninput = () => box.style.setProperty('--p', input.value + '%');
}

// ---------- relationship graph (complaints -> problem -> cause -> resolution) ----------
let graphNodeIndex = {};
function buildGraph(cl) {
  const gs = gOf(cl.id).sort((a, b) => a.daysAgo - b.daysAgo);
  const nodes = [], edges = []; graphNodeIndex = {};
  const add = (n) => { nodes.push(n); graphNodeIndex[n.id] = n; };
  const sample = gs.slice(0, 7);
  const cy = (i) => 36 + i * (360 / Math.max(1, sample.length));
  sample.forEach((g, i) => add({ id: g.id, kind: 'cmp', x: 60, y: cy(i) + 8, label: g.id, sub: `${LOC(g.loc).name} · ${g.daysAgo}${L('d ago', ' दिन पहले')}`,
    info: { title: L('Complaint ', 'शिकायत ') + g.id, badge: 'fact', rows: [[L('Reported', 'दर्ज'), g.daysAgo], [t('ward'), LOC(g.loc).name], [t('fldSeverity'), g.sev], [L('Asset', 'संपत्ति'), g.asset || '—']], text: '"' + g.text + '"' } }));
  const rest = gs.length - sample.length;
  if (rest > 0) add({ id: 'more', kind: 'cmp', x: 60, y: cy(sample.length) + 8, label: `+${rest} ${L('more', 'अधिक')}`, sub: L('Complaints in cluster', 'समूह में शिकायतें'),
    info: { title: rest + ' ' + L('more complaints', 'और शिकायतें'), badge: 'fact', rows: [[L('In this problem', 'इस समस्या में'), gs.length]], text: '' } });
  const locs = cl.locs.map((w, i) => { const nd = { id: 'loc' + w, kind: 'loc', x: 300, y: 60 + i * 70, label: LOC(w).name, sub: L('Locality (sim.)', 'क्षेत्र (सिम्युलेटेड)'),
    info: { title: LOC(w).name, badge: 'fact', rows: [[L('Complaints here', 'यहाँ शिकायतें'), gs.filter((g) => g.loc === w).length]], text: '' } }; add(nd); return nd; });
  const assetsNodes = cl.assets.map(([aid], i) => { const a = ASSET(aid); const st = assetStats(a);
    const nd = { id: aid, kind: 'ast', x: 300, y: 290 + i * 62, label: aid, sub: assetTypeL(a.type),
      info: { title: aid + ' · ' + assetTypeL(a.type), badge: 'fact', rows: [[t('assetHealthLbl'), healthL(st.health)], [t('assetComplLbl'), st.complaints], [t('assetFailLbl'), a.failures]], text: L('Same physical asset referenced by multiple complaints.', 'कई शिकायतों में एक ही भौतिक संपत्ति का उल्लेख है।'), link: `#/assets/${aid}` } };
    add(nd); return nd; });
  add({ id: 'problem', kind: 'prob', x: 520, y: 200, label: t('publicProblemLbl'), sub: cl.title.length > 26 ? cl.title.slice(0, 25) + '…' : cl.title,
    info: { title: cl.title, badge: 'ai', rows: [[t('thComplaints') || 'Complaints', gs.length], [t('thWards'), cl.locs.length]], text: L('AI groups these complaints as one public problem because they share category, location and infrastructure references. Requires officer confirmation.', 'AI इन शिकायतों को समान श्रेणी, स्थान और इंफ्रास्ट्रक्चर के आधार पर एक समस्या में समूहित करता है। अधिकारी की पुष्टि आवश्यक है।') } });
  add({ id: 'cause', kind: 'cause', x: 720, y: 110, label: t('possibleRootCause'), sub: Math.round(cl.causeConf * 100) + '% ' + L('confidence', 'विश्वास'),
    info: { title: t('possibleRootCause'), badge: 'ai', rows: [[L('Hypothesis', 'परिकल्पना'), cl.cause], [t('confidenceLbl'), Math.round(cl.causeConf * 100) + '%']], text: L('Hypothesis only. Human verification required before any intervention is planned.', 'यह केवल परिकल्पना है। हस्तक्षेप से पहले मानव सत्यापन आवश्यक है।') } });
  add({ id: 'dept', kind: 'cmp', x: 720, y: 290, label: deptL(cl.dept), sub: t('suggestedAuth'),
    info: { title: deptL(cl.dept), badge: 'ai', rows: [], text: L('Officer or admin can override the suggested authority.', 'अधिकारी सुझाए गए प्राधिकरण को बदल सकते हैं।') } });
  add({ id: 'res', kind: 'res', x: 900, y: 200, label: t('verifiedResTodo'), sub: L('Pending citizen check', 'नागरिक जाँच लंबित'),
    info: { title: t('verifiedResTodo'), badge: 'rev', rows: [], text: L('A case is only verified after citizens confirm and no new complaints arrive during monitoring.', 'नागरिकों की पुष्टि और निगरानी में कोई नई शिकायत न आने पर ही मामला सत्यापित होता है।') } });
  const E = (a, b, l, cls = '') => edges.push({ a, b, l, cls });
  const RELC = L('Related complaint', 'संबंधित शिकायत'), SAMEI = L('Same infrastructure', 'समान इंफ्रास्ट्रक्चर'), SAMEP = L('Same public problem', 'समान सार्वजनिक समस्या');
  sample.forEach((g) => { E(g.id, 'loc' + g.loc, RELC); if (g.asset) E(g.id, g.asset, SAMEI, 'hot'); });
  if (rest > 0) E('more', 'loc' + cl.locs[0], RELC);
  locs.forEach((l) => E(l.id, 'problem', SAMEP, 'hot')); assetsNodes.forEach((a) => E(a.id, 'problem', SAMEP, 'hot'));
  E('problem', 'cause', L('Possible cause · needs verification', 'संभावित कारण · सत्यापन आवश्यक'), 'hot');
  E('problem', 'dept', t('suggestedAuth')); E('cause', 'res', L('Intervention → verify', 'हस्तक्षेप → सत्यापित करें')); E('dept', 'res', L('Action → verify', 'कार्रवाई → सत्यापित करें'));
  return { nodes, edges };
}

export function graphHTML(cl) {
  const { nodes, edges } = buildGraph(cl);
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const bw = (k) => (k === 'prob' || k === 'cause' || k === 'res' ? 150 : 118), bh = 44;
  let e = '', nn = '';
  edges.forEach((ed) => {
    const a = N[ed.a], b = N[ed.b]; if (!a || !b) return;
    const ax = a.x + bw(a.kind) / 2, ay = a.y, bx = b.x - bw(b.kind) / 2, by = b.y, mx = (ax + bx) / 2;
    e += `<g class="gedge"><path class="l ${ed.cls}" d="M${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}"/><path class="hit" d="M${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}"/><text x="${mx}" y="${(ay + by) / 2 - 4}" text-anchor="middle">${ed.l}</text></g>`;
  });
  nodes.forEach((n) => {
    const w = bw(n.kind);
    nn += `<g class="gnode ${n.kind}" data-node="${n.id}" tabindex="0" role="button" aria-label="${esc(n.label)}"><rect x="${n.x - w / 2}" y="${n.y - bh / 2}" width="${w}" height="${bh}" rx="12"/><text x="${n.x - w / 2 + 12}" y="${n.y - 3}">${esc(n.label)}</text><text class="sub" x="${n.x - w / 2 + 12}" y="${n.y + 12}">${esc(n.sub)}</text></g>`;
  });
  return `<div class="graph-box"><div class="gtools"><button class="iconbtn" data-gz="in" aria-label="Zoom in">${ic('plus', 16)}</button><button class="iconbtn" data-gz="out" aria-label="Zoom out"><svg class="ic" width="16" height="16" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button><button class="iconbtn" data-gz="reset" aria-label="Reset">${ic('refresh', 16)}</button></div>
  <svg class="graph-svg" viewBox="0 0 980 420" role="img" aria-label="Relationship graph"><g class="gz">${e}${nn}</g></svg>
  <div class="glegend"><span><i class="hot"></i>${L('Same infrastructure / same problem', 'समान इंफ्रास्ट्रक्चर / समस्या')}</span><span><i></i>${L('Related complaint', 'संबंधित शिकायत')}</span><span class="muted">${L('Drag to pan · scroll to zoom · click a node', 'खींचें · ज़ूम करें · नोड पर क्लिक करें')}</span></div></div>
  <div class="card flat" id="gInfo" style="margin-top:12px" aria-live="polite"><div class="muted small">${L('Click any node to see what it is and why it is connected.', 'किसी नोड पर क्लिक करें कि वह क्या है और क्यों जुड़ा है।')}</div></div>`;
}

export function bindGraph(root = document) {
  root.querySelectorAll('.graph-box').forEach((box) => {
    const svg = box.querySelector('.graph-svg'), g = box.querySelector('.gz');
    let sc = 1, tx = 0, ty = 0, drag = null;
    const ap = () => g.setAttribute('transform', `translate(${tx} ${ty}) scale(${sc})`);
    svg.addEventListener('wheel', (e) => { e.preventDefault(); sc = Math.max(.5, Math.min(2.6, sc * (e.deltaY < 0 ? 1.1 : .91))); ap(); }, { passive: false });
    svg.addEventListener('pointerdown', (e) => { if (e.target.closest('.gnode')) return; drag = { x: e.clientX, y: e.clientY, tx, ty }; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', (e) => { if (!drag) return; const r = svg.getBoundingClientRect(); const f = 980 / r.width; tx = drag.tx + (e.clientX - drag.x) * f; ty = drag.ty + (e.clientY - drag.y) * f; ap(); });
    svg.addEventListener('pointerup', () => { drag = null; });
    box.querySelectorAll('[data-gz]').forEach((b) => { b.onclick = () => { const a = b.dataset.gz; if (a === 'in') sc = Math.min(2.6, sc * 1.2); else if (a === 'out') sc = Math.max(.5, sc / 1.2); else { sc = 1; tx = 0; ty = 0; } ap(); }; });
    const show = (id) => {
      const n = graphNodeIndex[id]; if (!n) return;
      box.querySelectorAll('.gnode').forEach((x) => x.classList.toggle('sel', x.dataset.node === id));
      const i = n.info;
      box.querySelector('#gInfo').innerHTML = `<div class="row between"><b class="h-card" style="font-size:18px">${esc(i.title)}</b>${badge(i.badge)}</div>
        <dl class="kv" style="margin:10px 0">${i.rows.map((r) => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>
        ${i.text ? `<p class="muted">${esc(i.text)}</p>` : ''}${i.link ? `<p style="margin-top:8px"><a class="btn btn-s btn-sm" href="${i.link}">${L('Open asset page', 'संपत्ति पेज खोलें')}</a></p>` : ''}`;
      localizeRendered(box);
    };
    box.querySelectorAll('.gnode').forEach((nd) => { nd.onclick = () => show(nd.dataset.node); nd.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(nd.dataset.node); } }; });
  });
}
