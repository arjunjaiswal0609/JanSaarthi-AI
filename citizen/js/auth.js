// Citizen portal auth — deliberately separate from the officer portal.
// Session key, "known users" memory, everything lives under its own
// localStorage namespace so the two portals never bleed into each other.
import { t } from '../../shared/js/i18n.js';

const AUTH_KEY = 'js_auth_citizen_v1';
const USERS_KEY = 'js_citizen_users_v1';
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authState = { user: null };
try { const raw = localStorage.getItem(AUTH_KEY); if (raw) authState.user = JSON.parse(raw); } catch (e) {}

let knownUsers = {};
try { knownUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch (e) {}

function nameFromEmail(em) {
  const n = em.split('@')[0].replace(/[._\d]+/g, ' ').trim();
  return n ? n.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Citizen';
}
function rememberUser(email, name) {
  knownUsers[email.toLowerCase()] = name;
  try { localStorage.setItem(USERS_KEY, JSON.stringify(knownUsers)); } catch (e) {}
}
function resolveName(email, typed) {
  if (typed && typed.trim()) return typed.trim();
  const known = knownUsers[email.toLowerCase()];
  return known || nameFromEmail(email);
}

export function isLoggedIn() { return !!authState.user; }

export function login({ email, password, name }) {
  if (!email || !password) return { ok: false, error: t('errRequired') };
  if (!EMAIL_RE.test(email)) return { ok: false, error: t('errEmail') };
  if (password.length < 6) return { ok: false, error: t('errPassword') };
  const resolved = resolveName(email, name);
  rememberUser(email, resolved);
  authState.user = { name: resolved, email };
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(authState.user)); } catch (e) {}
  return { ok: true };
}

export function register({ name, email, password, confirm }) {
  if (!name || !email || !password || !confirm) return { ok: false, error: t('errRequired') };
  if (!EMAIL_RE.test(email)) return { ok: false, error: t('errEmail') };
  if (password.length < 6) return { ok: false, error: t('errPassword') };
  if (password !== confirm) return { ok: false, error: t('errMatch') };
  rememberUser(email, name);
  authState.user = { name, email };
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(authState.user)); } catch (e) {}
  return { ok: true };
}

export function logout() {
  authState.user = null;
  try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
}
