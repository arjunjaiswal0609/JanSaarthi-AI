// JanSaarthi AI — Jabalpur (Madhya Pradesh) geography.
// Coordinates are approximate locality centres, used only to place the
// SIMULATED demo dataset on a real map. Not surveyed administrative
// boundaries — clearly labelled "simulated" everywhere it is shown.

export const JABALPUR_CENTER = [23.1815, 79.9864];
export const JABALPUR_ZOOM = 12;

export const LOCALITIES = [
  { id: 1,  name: 'Napier Town',      lat: 23.166, lng: 79.986, pop: 24000 },
  { id: 2,  name: 'Wright Town',      lat: 23.163, lng: 79.947, pop: 21000 },
  { id: 3,  name: 'Civil Lines',      lat: 23.168, lng: 79.958, pop: 15000 },
  { id: 4,  name: 'Sadar',            lat: 23.155, lng: 79.935, pop: 19000 },
  { id: 5,  name: 'Adhartal',         lat: 23.211, lng: 79.951, pop: 32000 },
  { id: 6,  name: 'Ranjhi',           lat: 23.219, lng: 79.970, pop: 27000 },
  { id: 7,  name: 'Garha',            lat: 23.130, lng: 79.970, pop: 30000 },
  { id: 8,  name: 'Gorakhpur',        lat: 23.195, lng: 79.965, pop: 28000 },
  { id: 9,  name: 'Madan Mahal',      lat: 23.146, lng: 79.945, pop: 22000 },
  { id: 10, name: 'Vijay Nagar',      lat: 23.128, lng: 79.945, pop: 18000 },
  { id: 11, name: 'Tilwara Ghat',     lat: 23.100, lng: 79.910, pop: 12000 },
  { id: 12, name: 'Gwarighat',        lat: 23.108, lng: 79.965, pop: 14000 },
  { id: 13, name: 'Bargi',            lat: 23.078, lng: 79.850, pop: 9000  },
  { id: 14, name: 'Damoh Naka',       lat: 23.175, lng: 79.920, pop: 20000 },
  { id: 15, name: 'Katanga',          lat: 23.140, lng: 79.955, pop: 23000 },
  { id: 16, name: 'Hanumantal',       lat: 23.172, lng: 79.950, pop: 16000 },
  { id: 17, name: 'Sanjeevani Nagar', lat: 23.205, lng: 79.995, pop: 17000 },
  { id: 18, name: 'Ghamapur',         lat: 23.100, lng: 80.020, pop: 11000 },
  { id: 19, name: 'Panagar',          lat: 23.270, lng: 80.090, pop: 26000 },
  { id: 20, name: 'Khamaria',         lat: 23.185, lng: 80.010, pop: 19000 }
];

export const LOC = (id) => LOCALITIES.find((w) => w.id === id);

// deterministic-ish jitter so demo points scatter naturally around a
// locality centre without landing exactly on top of each other
export function jitterPoint(locId, seed = Math.random()) {
  const w = LOC(locId) || LOCALITIES[0];
  const a = seed * Math.PI * 2;
  const r = 0.004 + (seed % 1) * 0.01; // ~450m to ~1.5km
  return [w.lat + Math.sin(a) * r, w.lng + Math.cos(a) * r];
}
