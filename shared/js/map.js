// JanSaarthi AI — real Jabalpur map, built with Leaflet + OpenStreetMap tiles.
// Leaflet itself is loaded globally via a <script> tag in each portal's
// index.html (this module just assumes `window.L` exists).
import { JABALPUR_CENTER, JABALPUR_ZOOM, LOCALITIES, LOC } from './geo-jabalpur.js';
import { CLUSTERS, ASSETS, G, gOf, clusterCount, isOpen, isEmerging, isRecurring, assetStats } from './data-store.js';
import { esc } from './dom-utils.js';
import { L as Lbi, t, localizeRendered } from './i18n.js';
import { assetTypeL, healthL, statusL } from './categories.js';

const SEV_COLOR = { high: '#FF5C6C', medium: '#FFB020', low: '#3FD8F5' };

function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v; }

/**
 * Render a Leaflet map of Jabalpur into `container` (a DOM element already
 * attached to the page). Returns the Leaflet map instance so callers can
 * call `.remove()` before the container is discarded (important because our
 * apps re-render views by replacing innerHTML, which does not clean up
 * Leaflet's own DOM/canvas listeners).
 *
 * opts:
 *   layers      { dots, heat, clusters, assets }  which layers to draw
 *   onClusterClick(clusterId)                     called when a bubble is clicked
 *   onAssetClick(assetId)
 *   focusLocIds [id,...]                           dim everything else
 *   selectedClusterId
 *   showAll     also draw clusters with 0 open complaints (used on citizen
 *               public-problem pages where the story matters more than "is
 *               it currently open")
 */
export function renderJabalpurMap(container, opts = {}) {
  const layers = Object.assign({ dots: true, heat: true, clusters: true, assets: false }, opts.layers || {});
  const map = window.L.map(container, { scrollWheelZoom: true, zoomControl: true, attributionControl: true });
  map.setView(JABALPUR_CENTER, JABALPUR_ZOOM);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(map);

  const focus = opts.focusLocIds || [];
  const dim = (id) => (focus.length && !focus.includes(id) ? 0.28 : 1);

  // faint locality dots + labels for orientation
  LOCALITIES.forEach((w) => {
    window.L.circleMarker([w.lat, w.lng], { radius: 3, color: css('--ink-2'), weight: 1, fillOpacity: .5, opacity: dim(w.id) * .6 })
      .bindTooltip(`${w.name} (simulated)`, { direction: 'top' }).addTo(map);
  });

  if (layers.dots) {
    G.filter(isOpen).forEach((g) => {
      window.L.circleMarker([g.lat, g.lng], { radius: 3.5, color: SEV_COLOR[g.sev] || SEV_COLOR.low, weight: 0, fillOpacity: dim(g.loc) * .85 })
        .bindTooltip(`${g.id} · ${LOC(g.loc).name}`).addTo(map);
    });
  }

  if (layers.assets) {
    ASSETS.forEach((a) => {
      const st = assetStats(a);
      const color = st.health === 'At risk' ? '#FF5C6C' : st.health === 'Watch' ? '#FFB020' : '#2BDC98';
      const m = window.L.circleMarker([...jitterFor(a)], { radius: 6, color, weight: 2, fillColor: css('--surface'), fillOpacity: .9, opacity: dim(a.loc) })
        .addTo(map);
      m.bindPopup(`<b>${esc(a.id)}</b>${esc(assetTypeL(a.type))}<br>${esc(healthL(st.health))} · ${st.complaints} ${Lbi('complaints', 'शिकायतें')}`);
      if (opts.onAssetClick) m.on('click', () => opts.onAssetClick(a.id));
    });
  }

  if (layers.clusters) {
    const list = opts.showAll ? CLUSTERS : CLUSTERS.filter((c) => clusterCount(c) > 0);
    list.forEach((cl) => {
      const gs = gOf(cl.id);
      const useGs = gs.filter(isOpen).length ? gs.filter(isOpen) : gs;
      if (!useGs.length) return;
      const lat = useGs.reduce((a, g) => a + g.lat, 0) / useGs.length;
      const lng = useGs.reduce((a, g) => a + g.lng, 0) / useGs.length;
      const n = clusterCount(cl);
      const color = isEmerging(cl) ? '#FFB020' : isRecurring(cl) ? '#FF5C6C' : (css('--primary') || '#5B4CFF');
      const radius = 14 + Math.sqrt(n) * 3.2;
      const selected = opts.selectedClusterId === cl.id;
      const icon = window.L.divIcon({
        className: '',
        html: `<div class="cluster-pin" style="width:${radius * 1.1}px;height:${radius * 1.1}px;background:${color};${selected ? 'box-shadow:0 0 0 4px #fff, 0 0 0 7px ' + color + ';' : ''}opacity:${dim(cl.locs[0])}">${n}</div>`,
        iconSize: [radius * 1.1, radius * 1.1]
      });
      const m = window.L.marker([lat, lng], { icon }).addTo(map);
      m.bindPopup(`<b>${esc(cl.title)}</b>${n} ${Lbi('complaints', 'शिकायतें')} · ${esc(statusL(cl.status))}`);
      if (opts.onClusterClick) m.on('click', () => opts.onClusterClick(cl.id));
    });
  }

  map.on('popupopen', () => localizeRendered(document));
  map.on('tooltipopen', () => localizeRendered(document));
  return map;
}

function jitterFor(asset) {
  const w = LOC(asset.loc);
  const seed = asset.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100 / 100;
  const ang = seed * Math.PI * 2;
  return [w.lat + Math.sin(ang) * 0.003, w.lng + Math.cos(ang) * 0.003];
}
