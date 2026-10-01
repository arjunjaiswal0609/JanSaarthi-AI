// JanSaarthi AI — shared data layer.
// Both portals import this single module so citizen submissions made in one
// browser tab are visible to the officer portal opened in another tab of the
// SAME browser (this is a client-only prototype: data lives in
// localStorage, not a real shared backend — see README).
import { CAT } from './categories.js';
import { LOCALITIES, LOC, jitterPoint } from './geo-jabalpur.js';
import { L, state as langState } from './i18n.js';

// ---------- tiny seeded RNG so the demo dataset is stable across reloads ----------
function rng(seed) {
  let a = seed | 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const TODAY = new Date(2026, 8, 28);
export const dayLbl = (d) => { const x = new Date(TODAY); x.setDate(x.getDate() - d); return x.toLocaleDateString(langState.lang === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'short' }); };

// ---------- infrastructure assets (real Jabalpur localities) ----------
export const ASSETS = [
  { id:'PL-GRH-01', type:'Water pipeline', name:'Trunk pipeline, Garha',            loc:7,  cat:'water',       failures:4, maint:'02 Sep 2026', recur:12, hist:[[42,'issue'],[39,'repair'],[38,'resolved'],[29,'issue'],[27,'repair'],[26,'resolved'],[17,'issue'],[15,'repair'],[14,'resolved'],[6,'issue']] },
  { id:'PL-KTG-01', type:'Water pipeline', name:'Distribution main, Katanga',       loc:15, cat:'water',       failures:2, maint:'19 Aug 2026', recur:20, hist:[[33,'issue'],[31,'repair'],[30,'resolved'],[9,'issue']] },
  { id:'SL-NPT-1082', type:'Streetlight',  name:'Streetlight, Napier Town',         loc:1,  cat:'streetlight', failures:5, maint:'14 Aug 2026', recur:31, hist:[[30,'issue'],[27,'repair'],[26,'resolved'],[22,'issue'],[20,'repair'],[19,'resolved'],[15,'issue'],[13,'repair'],[12,'resolved'],[8,'issue'],[1,'issue']] },
  { id:'DR-ADH-07', type:'Drain',          name:'Storm drain corridor, Adhartal',   loc:5,  cat:'drainage',    failures:3, maint:'11 Jun 2026', recur:18, hist:[[60,'issue'],[57,'repair'],[56,'resolved'],[6,'issue']] },
  { id:'RD-SDR-11', type:'Road',           name:'Ring road stretch, Sadar',         loc:4,  cat:'roads',       failures:2, maint:'30 Jul 2026', recur:26, hist:[[45,'issue'],[42,'repair'],[41,'resolved'],[18,'issue']] },
  { id:'GP-WGT-02', type:'Garbage point',  name:'Collection point, Wright Town',    loc:2,  cat:'sanitation',  failures:3, maint:'03 Sep 2026', recur:9,  hist:[[28,'issue'],[26,'resolved'],[17,'issue'],[15,'resolved'],[7,'issue']] },
  { id:'PT-GKP-01', type:'Public toilet',  name:'Community toilet, Gorakhpur',      loc:8,  cat:'facilities',  failures:1, maint:'22 Aug 2026', recur:0,  hist:[[10,'issue']] },
  { id:'TR-CVL-09', type:'Transformer',    name:'Distribution transformer, Civil Lines', loc:3, cat:'electricity', failures:2, maint:'05 Aug 2026', recur:15, hist:[[25,'issue'],[23,'repair'],[22,'resolved'],[9,'issue']] },
  { id:'SW-MDM-05', type:'Sewer line',     name:'Sewer line, Madan Mahal',          loc:9,  cat:'sanitation',  failures:2, maint:'28 Jul 2026', recur:22, hist:[[40,'issue'],[38,'resolved'],[11,'issue']] },
  { id:'TS-DMN-03', type:'Traffic signal', name:'Signal junction, Damoh Naka',      loc:14, cat:'facilities',  failures:1, maint:'12 Sep 2026', recur:0,  hist:[[5,'issue']] },
  { id:'WT-RNJ-02', type:'Water tank',     name:'Overhead tank, Ranjhi',            loc:6,  cat:'water',       failures:2, maint:'21 Aug 2026', recur:19, hist:[[35,'issue'],[33,'resolved'],[12,'issue']] },
  { id:'DR-HNT-03', type:'Drain',          name:'Nala junction, Hanumantal',        loc:16, cat:'drainage',    failures:3, maint:'01 Jul 2026', recur:16, hist:[[50,'issue'],[47,'resolved'],[14,'issue']] },
  { id:'SL-NPT-1090', type:'Streetlight',  name:'Streetlight, Napier Town (2)',     loc:1,  cat:'streetlight', failures:0, maint:'09 Sep 2026', recur:0,  hist:[] },
  { id:'PL-TLW-01', type:'Water pipeline', name:'Distribution main, Tilwara',       loc:11, cat:'water',       failures:0, maint:'15 Sep 2026', recur:0,  hist:[] },
  { id:'RD-GRH-03', type:'Road',           name:'Inner road, Garha',                loc:7,  cat:'roads',       failures:0, maint:'01 Sep 2026', recur:0,  hist:[] },
  { id:'BL-PNG-01', type:'Public building',name:'Ward office & health post, Panagar', loc:19, cat:'facilities', failures:0, maint:'20 Aug 2026', recur:0, hist:[] }
];
export const ASSET = (id) => ASSETS.find((a) => a.id === id);

// ---------- public problem clusters ----------
export const CLUSTERS = [
  { id:'PP-GRH', title:'Garha Water Supply Failure', cat:'water', locs:[7,15,10], dist:[19,7,5],
    series:{13:0,12:0,11:1,10:1,9:1,8:2,7:2,6:2,5:3,4:3,3:4,2:4,1:4,0:4}, assets:[['PL-GRH-01',.6],['PL-KTG-01',.2]],
    failed:4, prevRes:2, cause:'Possible pipeline pressure or distribution failure', causeConf:.86, status:'Investigation Required',
    texts:['Dirty water coming from our tap for the last {d} days','Yellow, foul-smelling water in the tap. Children have stomach problems',
      'Muddy water and very low pressure in our lane since {d} days','No supply in the morning and brown water in the evening','Tap water smells of sewage, unsafe to drink'],
    memory:{year:2025,title:'Garha–Katanga discoloured water',area:'Garha, Katanga',intervention:'Flushing and chlorination, no pipe replacement',ttr:'9 days',recurred:'Yes, after 41 days',outcome:'Reported resolved; issue returned'},
    recurrenceDays:12, facility:'2 schools and 1 health post nearby' },
  { id:'PP-ADH', title:'Adhartal Drainage Surge', cat:'drainage', locs:[5,6], dist:[30,8],
    series:{5:2,4:3,3:5,2:8,1:11,0:14}, assets:[['DR-ADH-07',.7]], failed:1, prevRes:1,
    cause:'Possible blocked drainage corridor', causeConf:.87, status:'Investigation Required',
    texts:['Drain overflowing near the market, water entering shops','Nala choked with plastic, foul smell all day',
      'Water stagnating on the road for {d} days','Blocked drain near the school gate, mosquitoes increasing'],
    memory:{year:2025,title:'Monsoon drain blockage, Adhartal',area:'Adhartal',intervention:'Silt removal + 60 m culvert cleaning',ttr:'6 days',recurred:'No recurrence within 90 days',outcome:'Verified by citizens'},
    recurrenceDays:0, facility:'1 market and 1 school nearby' },
  { id:'PP-SL', title:'Napier Town Streetlight Repeated Failure', cat:'streetlight', locs:[1], dist:[8],
    series:{30:1,29:1,22:1,15:2,8:1,1:2}, assets:[['SL-NPT-1082',1]], failed:5, prevRes:3,
    cause:'Possible wiring or feeder fault; repeated repair may be treating a symptom', causeConf:.71, status:'Recurring Failure',
    texts:['Streetlight is not working, the whole stretch is dark','Light near the park keeps going off at night','Lamp flickering, unsafe for women walking home'],
    memory:null, recurrenceDays:31, facility:'1 park nearby' },
  { id:'PP-5R', title:'Sadar Pothole Belt', cat:'roads', locs:[4], dist:[14],
    series:'u18', assets:[['RD-SDR-11',.6]], failed:2, prevRes:2, cause:'Possible poor drainage under carriageway', causeConf:.64, status:'Under Investigation',
    texts:['Deep potholes near the crossing, two-wheelers slipping','Road surface broken after pipe work','Broken road edge near the bus stop'],
    memory:null, recurrenceDays:26, facility:'1 bus stop nearby' },
  { id:'PP-9G', title:'Wright Town Garbage Point Overflow', cat:'sanitation', locs:[2], dist:[11],
    series:'u21', assets:[['GP-WGT-02',.8]], failed:3, prevRes:3, cause:'Possible mismatch between pickup schedule and volume', causeConf:.68, status:'Recurring Failure',
    texts:['Garbage not collected for {d} days at the collection point','Dustbin overflowing near the temple','Waste dumped on the road, stray animals'],
    memory:null, recurrenceDays:9, facility:'1 temple nearby' },
  { id:'PP-21T', title:'Gorakhpur Public Toilet Water Failure', cat:'facilities', locs:[8], dist:[6],
    series:'u12', assets:[['PT-GKP-01',.8]], failed:1, prevRes:1, cause:'Possible overhead tank supply issue', causeConf:.6, status:'Assigned',
    texts:['Public toilet has no water and is locked','Toilet block unusable, no running water'],
    memory:null, recurrenceDays:0, facility:'1 bus depot nearby' },
  { id:'PP-3E', title:'Civil Lines Low Voltage Complaints', cat:'electricity', locs:[3], dist:[9],
    series:'u16', assets:[['TR-CVL-09',.7]], failed:2, prevRes:2, cause:'Possible transformer overload', causeConf:.7, status:'Under Investigation',
    texts:['Frequent low voltage in the evenings','Transformer sparking near our lane','Voltage dips make fans and pumps stop'],
    memory:null, recurrenceDays:15, facility:'—' },
  { id:'PP-14S', title:'Madan Mahal Sewage Overflow', cat:'sanitation', locs:[9], dist:[12],
    series:'u20', assets:[['SW-MDM-05',.7]], failed:2, prevRes:2, cause:'Possible sewer line blockage shared with drainage', causeConf:.66, status:'Joint Investigation',
    master:{lead:'Sanitation', support:['Drainage','Municipal Engineering']},
    texts:['Sewage overflowing on the street','Manhole overflowing, foul smell in the whole lane'],
    memory:null, recurrenceDays:22, facility:'1 dispensary nearby' },
  { id:'PP-8T', title:'Damoh Naka Signal Failures', cat:'facilities', locs:[14], dist:[5],
    series:'u10', assets:[['TS-DMN-03',.8]], failed:1, prevRes:1, cause:'Possible controller fault', causeConf:.6, status:'Assigned',
    texts:['Traffic signal stuck on red','Signal not working at rush hour'],
    memory:null, recurrenceDays:0, facility:'1 school nearby' },
  { id:'PP-20W', title:'Ranjhi Water Tank Supply Gaps', cat:'water', locs:[6], dist:[10],
    series:'u14', assets:[['WT-RNJ-02',.7]], failed:2, prevRes:2, cause:'Possible pumping schedule gap', causeConf:.65, status:'Under Investigation',
    texts:['No water from the overhead tank in the mornings','Supply timing keeps changing, only 20 minutes of water'],
    memory:null, recurrenceDays:19, facility:'—' },
  { id:'PP-2W', title:'Hanumantal Waterlogging', cat:'drainage', locs:[16,3], dist:[11,5],
    series:'u9', assets:[['DR-HNT-03',.6]], failed:3, prevRes:3, cause:'Possible combined drainage, road-level and street-electrical issues', causeConf:.72, status:'Joint Investigation',
    master:{lead:'Municipal Engineering', support:['Drainage','Sanitation','Electricity']},
    texts:['Road waterlogged after every rain, vehicles stall','Water entering houses at the low junction','Waterlogging plus dark street, live wire risk'],
    memory:null, recurrenceDays:16, facility:'1 primary school nearby' }
];
CLUSTERS.forEach((c) => { c.dept = c.master ? c.master.lead : CAT[c.cat].dept; c.n0 = c.dist.reduce((a, b) => a + b, 0); });
export const CL = (id) => CLUSTERS.find((c) => c.id === id);

// ---------- grievances (deterministic generator, consistent with clusters) ----------
export let G = [];
export let idCounter = 2000;
export function nextId() { idCounter += 1; return 'JS-' + idCounter; }
export function bumpIdCounter(n) { if (n > idCounter) idCounter = n; }

export function buildGrievances() {
  const R = rng(2026); G.length = 0; const tmp = [];
  CLUSTERS.forEach((cl) => {
    let series = cl.series;
    if (typeof series === 'string') {
      const span = +series.slice(1); series = {};
      for (let k = 0; k < cl.n0; k++) { const d = Math.floor(R() * span); series[d] = (series[d] || 0) + 1; }
    }
    const days = []; Object.entries(series).forEach(([d, c]) => { for (let k = 0; k < c; k++) days.push(+d); });
    while (days.length < cl.n0) days.push(Math.floor(R() * 10));
    days.length = cl.n0;
    const locSeq = []; cl.locs.forEach((w, wi) => { for (let k = 0; k < cl.dist[wi]; k++) locSeq.push(w); });
    days.sort((a, b) => b - a);
    days.forEach((d, i) => {
      const loc = locSeq[Math.floor(R() * locSeq.length)];
      const [lat, lng] = jitterPoint(loc, R());
      const r = R(); let asset = null, acc = 0;
      for (const [aid, sh] of cl.assets) { acc += sh; if (r < acc) { asset = aid; break; } }
      let text = cl.texts[i % cl.texts.length].replace('{d}', 2 + Math.floor(R() * 5));
      const dup = i % 9 === 1 && i > 0;
      const sev = cl.cat === 'water' || cl.cat === 'electricity' || cl.id === 'PP-14S' ? (R() < .6 ? 'high' : 'medium') : (R() < .3 ? 'high' : R() < .7 ? 'medium' : 'low');
      tmp.push({ cluster: cl.id, cat: cl.cat, loc, lat, lng, daysAgo: d, text, sev, asset, dupOf: dup ? 'prev' : null, resolvedR: R(), verR: R() });
    });
  });
  for (let k = 0; k < 16; k++) {
    const cats = Object.keys(CAT); const cat = cats[Math.floor(R() * cats.length)];
    const loc = 1 + Math.floor(R() * LOCALITIES.length); const [lat, lng] = jitterPoint(loc, R());
    tmp.push({ cluster: null, cat, loc, lat, lng, daysAgo: Math.floor(R() * 14),
      text: ['Small leakage near the corner', 'Stray dog menace near the park', 'Request for a new dustbin', 'Broken footpath tile', 'Noise from the workshop'][k % 5],
      sev: 'low', asset: null, dupOf: null, resolvedR: R(), verR: R() });
  }
  tmp.sort((a, b) => b.daysAgo - a.daysAgo);
  let prev = null;
  tmp.forEach((g) => {
    g.id = nextId(); g.source = 'demo';
    const old = g.daysAgo >= 8 && g.resolvedR < .55;
    g.status = old ? 'Resolved' : (g.daysAgo >= 4 ? 'Investigation' : 'Assigned');
    g.verified = g.status === 'Resolved' && g.verR < .4;
    if (g.dupOf && prev) { g.text = prev.text; g.dupOf = prev.id; g.loc = prev.loc; g.lat = prev.lat + 0.0008; g.lng = prev.lng + 0.0006; }
    prev = g; G.push(g);
  });
}
buildGrievances();

// ---------- cases (citizen-facing lifecycle records) ----------
export let cases = [];
export function seedCases() {
  cases = [
    { id:'JS-2044', title:'Dirty water in our lane', cat:'water', loc:7, cluster:'PP-GRH', stage:5, status:'Action taken', source:'demo', demoShowcase:true,
      events:[['Reported',15],['AI analyzed',15],['Assigned to Water Supply',14],['Field officer inspected the site',12],['Department submitted action update: line flushed, valve adjusted',2]],
      text:'Dirty water coming from our tap for the last five days.' },
    { id:'JS-2031', title:'Streetlight not working', cat:'streetlight', loc:1, cluster:'PP-SL', stage:3, status:'Investigation', source:'demo', demoShowcase:true,
      events:[['Reported',9],['AI analyzed',9],['Assigned to Electricity (Street Lighting)',8],['Marked as recurring failure: 5 previous failures',6]],
      text:'Streetlight near the park keeps going off.' },
    { id:'JS-1987', title:'Garbage not collected', cat:'sanitation', loc:2, cluster:'PP-9G', stage:7, status:'Resolved', source:'demo', demoShowcase:true,
      events:[['Reported',24],['Assigned',23],['Action taken',19],['You confirmed the fix',17],['Monitoring complete: no new complaints for 7 days',10]],
      text:'Garbage not collected for 4 days.' }
  ];
}
seedCases();

// ---------- mutable UI-shared state (notes / overrides / audit) ----------
export const shared = { notes: {}, overrides: {}, audit: [], liveEvents: [] };
export function audit(msg) { shared.audit.push(new Date().toLocaleTimeString('en-IN') + ' — ' + msg); }

// ---------- local persistence (real/user-created data survives refresh) ----------
const APP_DATA_KEY = 'js_appdata_v3';
export function saveAppData() {
  try { localStorage.setItem(APP_DATA_KEY, JSON.stringify({ G, cases, notes: shared.notes, overrides: shared.overrides, audit: shared.audit, liveEvents: shared.liveEvents, idCounter })); } catch (e) {}
}
export function loadAppData() {
  try {
    const raw = localStorage.getItem(APP_DATA_KEY); if (!raw) return false;
    const d = JSON.parse(raw); if (!d || !Array.isArray(d.G) || !Array.isArray(d.cases)) return false;
    G.length = 0; d.G.forEach((x) => G.push(x)); cases = d.cases;
    shared.notes = d.notes || {}; shared.overrides = d.overrides || {}; shared.audit = d.audit || []; shared.liveEvents = d.liveEvents || [];
    bumpIdCounter(d.idCounter || 0);
    return true;
  } catch (e) { return false; }
}
export function clearAppData() { try { localStorage.removeItem(APP_DATA_KEY); } catch (e) {} }
export function initData() { seedCases(); loadAppData(); }

// ---------- mock AI provider (deterministic; swap-able for a real provider with the same interface) ----------
function catLower(cat) { return CAT[cat].l.toLowerCase(); }
export const AI = {
  name: 'mock (deterministic, keyword-based)',
  analyzeGrievance(text) {
    const x = text.toLowerCase();
    const rules = [['water', /water|tap|pipeline|supply|पानी|नल|पेयजल/], ['drainage', /drain|nala|waterlog|नाली|नाला/],
      ['streetlight', /street ?light|lamp|light|dark|बत्ती/], ['roads', /road|pothole|सड़क|गड्ढ/],
      ['sanitation', /garbage|waste|dustbin|sewage|kachra|कचरा|मैला/], ['electricity', /voltage|electric|transformer|बिजली/],
      ['facilities', /toilet|signal|park|school|शौचालय/]];
    let cat = 'water', hits = 0;
    for (const [c, re] of rules) { if (re.test(x)) { cat = c; hits++; break; } }
    const lm = x.match(/napier|wright|civil lines|sadar|adhartal|ranjhi|garha|gorakhpur|madan mahal|vijay nagar|tilwara|gwarighat|bargi|damoh naka|katanga|hanumantal|sanjeevani|ghamapur|panagar|khamaria/);
    const loc = lm ? (LOCALITIES.find((w) => w.name.toLowerCase().includes(lm[0])) || LOCALITIES[6]).id : 7;
    const words = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7,'एक':1,'दो':2,'तीन':3,'चार':4,'पाँच':5,'पांच':5,'छह':6 };
    let dur = null;
    const dm = x.match(/(\d+|one|two|three|four|five|six|seven|एक|दो|तीन|चार|पाँच|पांच|छह)\s*(days?|din|दिन|weeks?|हफ्त)/);
    if (dm) { const n = /^\d+$/.test(dm[1]) ? +dm[1] : words[dm[1]]; dur = /week|हफ्त/.test(dm[2]) ? n * 7 : n; }
    const risky = /dirty|sewage|unsafe|sparking|ill|sick|foul|muddy|गंदा|बीमार/.test(x);
    const sev = risky || (dur && dur >= 5) ? 'high' : (dur && dur >= 2 ? 'medium' : 'low');
    const conf = Math.min(.96, .78 + hits * .06 + (lm ? .05 : 0) + (dur ? .05 : 0));
    const issueMap = { water:'Water quality or supply complaint', drainage:'Drainage / waterlogging complaint', streetlight:'Streetlight failure',
      roads:'Road damage', sanitation:'Sanitation / waste complaint', electricity:'Electricity supply complaint', facilities:'Public facility complaint' };
    const potentialMap = { water:'Pipeline', drainage:'Drain / culvert', streetlight:'Streetlight / feeder', roads:'Road surface',
      sanitation:'Collection point / sewer', electricity:'Transformer / feeder', facilities:'Public facility' };
    return { issue: issueMap[cat], cat, loc, durationDays: dur, severity: sev, dept: CAT[cat].dept, confidence: +conf.toFixed(2),
      locFromText: !!lm, potential: potentialMap[cat] };
  },
  findRelationships(a) {
    const cl = CLUSTERS.find((c) => c.cat === a.cat && c.locs.includes(a.loc));
    if (cl) return { cluster: cl, count: clusterCount(cl), locs: cl.locs.length, assets: cl.assets.length };
    const nearby = G.filter((g) => g.cat === a.cat && g.daysAgo <= 14);
    return { cluster: null, count: nearby.length, locs: new Set(nearby.map((g) => g.loc)).size, assets: 0 };
  },
  suggestAuthority(a) {
    return { dept: a.dept, why: `${catLower(a.cat)} issue + ${LOC(a.loc).name} + municipal ${a.potential.toLowerCase()} context`, confidence: a.confidence };
  }
};

// ---------- computed analytics ----------
export const gOf = (clusterId) => G.filter((g) => g.cluster === clusterId);
export const clusterCount = (cl) => gOf(cl.id).length;
export const isOpen = (g) => g.status !== 'Resolved';
export const dlDays = (g) => (g.sev === 'high' ? 3 : g.sev === 'medium' ? 5 : 7);
export function slaState(g) {
  const r = g.daysAgo / dlDays(g);
  return r < .5 ? ['n', 'Normal'] : r < .8 ? ['a', 'Approaching'] : r < 1 ? ['r', 'At risk'] : r < 1.5 ? ['o', 'Overdue'] : ['e', 'Escalated'];
}
export function seriesOf(cl, days) { const g = gOf(cl.id); const out = []; for (let d = days - 1; d >= 0; d--) out.push(g.filter((x) => x.daysAgo === d).length); return out; }
export function growth(cl) {
  const s = seriesOf(cl, 6); const a = s.slice(3).reduce((x, y) => x + y, 0), b = s.slice(0, 3).reduce((x, y) => x + y, 0);
  return { pct: Math.round(((a - b) / Math.max(1, b)) * 100), last: a, prior: b };
}
export const isEmerging = (cl) => clusterCount(cl) >= 10 && growth(cl).pct >= 150;
export const isRecurring = (cl) => cl.failed >= 2 && cl.recurrenceDays > 0;
export const isMaster = (cl) => !!cl.master;
export const openClusters = () => CLUSTERS.filter((c) => c.status !== 'Verified Resolution');
export function assetStats(a) {
  const gs = G.filter((g) => g.asset === a.id);
  const health = a.failures >= 3 || gs.length >= 8 ? 'At risk' : gs.length >= 3 ? 'Watch' : 'Healthy';
  return { complaints: gs.length, health, related: new Set(gs.map((g) => g.cluster)).size + gs.length };
}
export function impact(cl) {
  const n = clusterCount(cl), gr = growth(cl);
  const comp = { 'Citizen impact': Math.min(100, n * 3), 'Duration': Math.min(100, Math.max(...gOf(cl.id).map((g) => g.daysAgo), 0) * 7),
    'Recurrence': Math.min(100, cl.failed * 20), 'Growth': Math.max(8, Math.min(100, gr.pct / 2.5)),
    'Location context': cl.facility && cl.facility !== '—' ? 72 : 30,
    'Safety context': cl.cat === 'water' || cl.cat === 'electricity' || cl.cat === 'streetlight' ? 82 : cl.cat === 'drainage' ? 66 : 38 };
  const avg = Object.values(comp).reduce((a, b) => a + b, 0) / 6;
  return { comp, label: avg >= 62 ? 'High' : avg >= 44 ? 'Medium' : 'Low', score: Math.round(avg) };
}
export function dailyAll() { const o = []; for (let d = 13; d >= 0; d--) o.push(G.filter((g) => g.daysAgo === d).length); return o; }
export function kpis() {
  const open = G.filter(isOpen);
  return {
    active: { v: open.length, s: dailyAll() },
    problems: { v: openClusters().length },
    emerging: { v: CLUSTERS.filter(isEmerging).length },
    recurring: { v: CLUSTERS.filter(isRecurring).length },
    sla: { v: open.filter((g) => ['r', 'o', 'e'].includes(slaState(g)[0])).length },
    unver: { v: G.filter((g) => g.status === 'Resolved' && !g.verified).length }
  };
}
export function deptStats(name) {
  const gs = G.filter((g) => { const cl = g.cluster ? CL(g.cluster) : null; return CAT[g.cat].dept === name || (cl && cl.dept === name) || (cl && cl.master && cl.master.support.includes(name)); });
  const open = gs.filter(isOpen);
  return { name, open: open.length, risk: open.filter((g) => ['r', 'o', 'e'].includes(slaState(g)[0])).length,
    avg: open.length ? (open.reduce((a, g) => a + g.daysAgo, 0) / open.length).toFixed(1) : '—',
    recur: CLUSTERS.filter((c) => c.dept === name && isRecurring(c)).length,
    unver: gs.filter((g) => g.status === 'Resolved' && !g.verified).length,
    emerg: CLUSTERS.filter((c) => (c.dept === name || (c.master && c.master.support.includes(name))) && isEmerging(c)).length,
    multi: CLUSTERS.filter((c) => c.master && (c.master.lead === name || c.master.support.includes(name))).length };
}
export function feedEvents() {
  const ev = [];
  CLUSTERS.filter(isEmerging).forEach((c) => { const g = growth(c); ev.push({ k:'emerging', h:L('EMERGING ISSUE DETECTED','उभरती समस्या का पता चला'), p:`${c.title} (+${g.pct}% in 3 days)`, ref:`#/problems/${c.id}`, when:L('12 min ago','12 मिनट पहले') }); });
  const sl = ASSET('SL-NPT-1082');
  ev.push({ k:'recurring', h:L('RECURRING FAILURE','बार-बार होने वाली विफलता'), p:`${L('Streetlight generated another complaint','स्ट्रीटलाइट पर एक और शिकायत')} (${assetStats(sl).complaints} total, ${sl.failures} failures)`, ref:'#/assets/SL-NPT-1082', when:L('34 min ago','34 मिनट पहले') });
  const s2 = G.filter((g) => isOpen(g) && slaState(g)[0] === 'e')[0] || G.filter((g) => isOpen(g) && slaState(g)[0] === 'o')[0];
  if (s2) ev.push({ k:'sla', h:L('SLA RISK','SLA जोखिम'), p:`${L('Case','केस')} #${s2.id} ${L('is past its escalation threshold','एस्केलेशन सीमा पार कर चुका है')}`, ref:'#/cases', when:L('1 hr ago','1 घंटे पहले') });
  ev.push({ k:'chal', h:L('RESOLUTION CHALLENGED','समाधान को चुनौती दी गई'), p:L('A citizen reported that the Garha water issue remains unresolved','एक नागरिक ने बताया कि गढ़ा की जल समस्या हल नहीं हुई'), ref:'#/problems/PP-GRH', when:L('2 hr ago','2 घंटे पहले') });
  ev.push({ k:'ok', h:L('CITIZEN VERIFIED','नागरिक ने सत्यापित किया'), p:L('Gorakhpur toilet block: fix confirmed by citizens','गोरखपुर शौचालय: नागरिकों ने समाधान की पुष्टि की'), ref:'#/problems/PP-21T', when:L('3 hr ago','3 घंटे पहले') });
  shared.liveEvents.forEach((e) => ev.unshift(e));
  return ev;
}

// ---------- case management helpers (shared by both portals) ----------
export function findOrCreateCase(id) {
  let c = cases.find((x) => x.id === id); if (c) return c;
  const g = G.find((x) => x.id === id); if (!g) return null;
  c = { id: g.id, title: g.text.slice(0, 60), cat: g.cat, loc: g.loc, cluster: g.cluster,
    stage: g.status === 'Resolved' ? 7 : (g.daysAgo <= 1 ? 2 : 3), status: g.status, source: g.source || 'demo',
    events: [[L('Reported', 'दर्ज'), g.daysAgo]], text: g.text };
  cases.push(c); return c;
}
export function syncGrievanceFromCase(c) {
  const g = G.find((x) => x.id === c.id); if (!g) return;
  g.status = c.stage >= 7 ? 'Resolved' : (c.status === 'Reopened' ? 'Investigation' : (g.status === 'Resolved' ? 'Investigation' : g.status));
  g.verified = c.stage === 7;
}
export function addGrievance(g) { G.push(g); }
export function addCase(c) { cases.unshift(c); }
export function getCases() { return cases; }
