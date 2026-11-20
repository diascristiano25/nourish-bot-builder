import { describe, it, expect } from 'vitest';
import { readAttributionFromUrl } from '@/lib/attribution';

describe('readAttributionFromUrl', () => {
  it('lê UTMs e usa utm_source como origem', () => {
    const r = readAttributionFromUrl('?utm_source=meta&utm_medium=cpc&utm_campaign=trial14&utm_content=ad3');
    expect(r).toMatchObject({ signup_source: 'meta', utm_medium: 'cpc', utm_campaign: 'trial14', utm_content: 'ad3' });
  });

  it('usa ?source= quando não há utm_source', () => {
    expect(readAttributionFromUrl('?source=instagram')?.signup_source).toBe('instagram');
  });

  it('registra referrer externo, mas ignora o próprio domínio', () => {
    expect(readAttributionFromUrl('', 'https://www.google.com/search?q=x')).toMatchObject({
      signup_source: 'referral',
      landing_referrer: 'https://www.google.com/search?q=x',
    });
    expect(readAttributionFromUrl('', 'https://nutriflow.inf.br/auth')).toBeNull();
  });

  it('retorna null sem nenhuma pista de origem e limita tamanho', () => {
    expect(readAttributionFromUrl('')).toBeNull();
    expect(readAttributionFromUrl(`?utm_source=${'a'.repeat(500)}`)?.signup_source).toHaveLength(120);
  });
});
