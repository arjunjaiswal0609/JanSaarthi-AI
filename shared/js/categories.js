// JanSaarthi AI — shared category & department taxonomy
import { state } from './i18n.js';

export const CAT = {
  water:       { l: 'Water supply', dept: 'Water Supply',                 icon: 'droplet' },
  drainage:    { l: 'Drainage',     dept: 'Drainage',                     icon: 'waves' },
  roads:       { l: 'Roads',        dept: 'Roads & Engineering',          icon: 'route' },
  sanitation:  { l: 'Sanitation',   dept: 'Sanitation',                   icon: 'trash' },
  electricity: { l: 'Electricity',  dept: 'Electricity',                  icon: 'zap' },
  streetlight: { l: 'Streetlights', dept: 'Electricity (Street Lighting)',icon: 'bulb' },
  facilities:  { l: 'Public facilities', dept: 'Public Facilities',       icon: 'building' }
};

const CAT_HI = { water:'जल आपूर्ति', drainage:'जल निकासी', roads:'सड़कें', sanitation:'स्वच्छता',
  electricity:'बिजली', streetlight:'स्ट्रीटलाइट', facilities:'सार्वजनिक सुविधाएँ' };

const DEPT_HI = {
  'Water Supply':'जल आपूर्ति विभाग', 'Drainage':'जल निकासी विभाग', 'Roads & Engineering':'सड़क एवं अभियंत्रण विभाग',
  'Sanitation':'स्वच्छता विभाग', 'Electricity':'विद्युत विभाग', 'Electricity (Street Lighting)':'विद्युत विभाग (स्ट्रीट लाइटिंग)',
  'Public Facilities':'सार्वजनिक सुविधा विभाग', 'Municipal Engineering':'नगर अभियंत्रण विभाग'
};

const ASSETTYPE_HI = { 'Water pipeline':'जल पाइपलाइन', 'Streetlight':'स्ट्रीटलाइट', 'Drain':'नाला', 'Road':'सड़क',
  'Garbage point':'कचरा संग्रहण बिंदु', 'Public toilet':'सार्वजनिक शौचालय', 'Transformer':'ट्रांसफार्मर',
  'Sewer line':'सीवर लाइन', 'Traffic signal':'ट्रैफ़िक सिग्नल', 'Water tank':'पानी की टंकी', 'Public building':'सार्वजनिक भवन' };

const HEALTH_HI = { 'At risk':'जोखिम में', 'Watch':'निगरानी में', 'Healthy':'ठीक' };
const STATUS_HI = { 'Investigation Required':'जाँच आवश्यक', 'Recurring Failure':'बार-बार होने वाली विफलता',
  'Under Investigation':'जाँच जारी', 'Assigned':'सौंपा गया', 'Joint Investigation':'संयुक्त जाँच', 'Verified Resolution':'सत्यापित समाधान' };

export const DEPTS = [...new Set(Object.values(CAT).map(c => c.dept).concat(['Municipal Engineering']))];

export const catL = (k) => (state.lang === 'hi' ? CAT_HI[k] : CAT[k].l);
export const deptL = (d) => (state.lang === 'hi' ? (DEPT_HI[d] || d) : d);
export const assetTypeL = (s) => (state.lang === 'hi' ? (ASSETTYPE_HI[s] || s) : s);
export const healthL = (s) => (state.lang === 'hi' ? (HEALTH_HI[s] || s) : s);
export const statusL = (s) => (state.lang === 'hi' ? (STATUS_HI[s] || s) : s);
