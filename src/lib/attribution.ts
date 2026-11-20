// Primeira origem do visitante (first-touch). Guardada no navegador até o cadastro
// e enviada junto com o signUp, para saber qual anúncio traz nutricionista que usa.

const STORAGE_KEY = 'nf_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type Attribution = {
  signup_source: string;
  landing_referrer?: string;
} & Partial<Record<(typeof UTM_KEYS)[number], string>>;

const clean = (value: string | null | undefined, max = 120): string | undefined => {
  const v = (value ?? '').trim().slice(0, max);
  return v || undefined;
};

export function readAttributionFromUrl(search: string, referrer = ''): Attribution | null {
  const params = new URLSearchParams(search);
  const found: Attribution = { signup_source: '' };
  let hasUtm = false;

  for (const key of UTM_KEYS) {
    const value = clean(params.get(key));
    if (value) {
      found[key] = value;
      hasUtm = true;
    }
  }

  const explicit = clean(params.get('source'));
  let externalReferrer: string | undefined;
  try {
    const host = referrer ? new URL(referrer).hostname : '';
    if (host && !host.endsWith('nutriflow.inf.br')) externalReferrer = clean(referrer, 500);
  } catch { /* referrer inválido */ }

  if (!hasUtm && !explicit && !externalReferrer) return null;

  found.signup_source = found.utm_source ?? explicit ?? 'referral';
  if (externalReferrer) found.landing_referrer = externalReferrer;
  return found;
}

export function captureAttribution(): void {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return; // first-touch: não sobrescreve
    const found = readAttributionFromUrl(window.location.search, document.referrer);
    if (found) localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch { /* storage indisponível */ }
}

export function getAttribution(): Attribution {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Attribution;
      if (parsed?.signup_source) return parsed;
    }
  } catch { /* ignora */ }
  return { signup_source: 'direct' };
}
