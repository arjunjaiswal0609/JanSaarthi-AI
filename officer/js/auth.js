// Officer & Admin portal auth — entirely separate from the citizen portal.
// Different localStorage namespace, different login page, different app.
// There is no link to this portal from the citizen site; officers reach it
// via its own URL (see README).
import { t } from '../../shared/js/i18n.js';

const AUTH_KEY = 'js_auth_officer_v1';
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authState = { user: null };
try { const raw = localStorage.getItem(AUTH_KEY); if (raw) authState.user = JSON.parse(raw); } catch (e) {}

function nameFromEmail(em) {
  const n = em.split('@')[0].replace(/[._\d]+/g, ' ').trim();
  return n ? n.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Officer';
}

export function isLoggedIn() { return !!authState.user; }

export function login({ email, password, name, role }) {
  if (!email || !password) return { ok: false, error: t('errRequired') };
  if (!EMAIL_RE.test(email)) return { ok: false, error: t('errEmail') };
  if (password.length < 6) return { ok: false, error: t('errPassword') };
  authState.user = { name: (name && name.trim()) || nameFromEmail(email), email, role: role || 'officer' };
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(authState.user)); } catch (e) {}
  return { ok: true };
}

export function logout() {
  authState.user = null;
  try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
}
