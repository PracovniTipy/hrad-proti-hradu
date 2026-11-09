// Castle WARS – uplatnění nákupu z itch.io.
// POST { token, input, bw? } – input je odkaz na stránku ke stažení (…itch.io/<slug>/download/<KLÍČ>) nebo samotný klíč;
//   bw = id kliknutí BrosWars Partner (bw_ + 20 znaků), pokud hráč přišel přes odkaz / kód tvůrce.
// POST { action: 'diag' } – jen ověří, že klíč k itch.io API funguje (nic neprozradí).
// Klíč se ověří přes itch.io API (ITCH_API_KEY) a každý jde uplatnit jen jednou.
// Po ověřeném PRVNÍM uplatnění se zapíše provize tvůrci (rpc aff_record) – chyba záznamu nákup nikdy neovlivní.
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

// záložní ceník (USD na itch.io) – použije se, když chybí v hra.itch_produkty
const PRICE_USD: Record<string, number> = {
  start: 1.49, mesec: 1.49, hrst: 1.49, kovar: 1.49, zbrojir: 1.49, lucist: 1.49, valecny: 1.49, hraniceri: 1.49, hradni: 1.49, kopinik: 1.49,
  hrdina: 2.49, skill_drak: 2.49, drak: 3.99, pevnost: 5.99, kral: 5.99, kniha: 5.99, legie: 7.99, arzenal: 7.99, cisar: 19.99,
  gems_g1: 1.49, gems_g2: 3.99, gems_g3: 9.99, gems_g4: 19.99, gems_g5: 39.99, set_andel: 99.99, set_kral: 99.99
};
const sha256 = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))))
  .map(b => b.toString(16).padStart(2, '0')).join('');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const API = Deno.env.get('ITCH_API_KEY');
  if (!API) return json({ error: 'not_configured' }, 503);
  let p: { token?: string; input?: string; action?: string; bw?: string } = {};
  try { p = await req.json(); } catch (_e) { return json({ error: 'bad_json' }, 400); }

  if (p.action === 'diag') {
    const r = await fetch('https://api.itch.io/credentials/info', { headers: { Authorization: 'Bearer ' + API } });
    const b = await r.json().catch(() => ({}));
    return json({ api: r.ok && !b.errors ? 'ok' : 'bad', type: b.type || null, scopes: b.scopes || null });
  }

  const input = String(p.input || '').trim();
  if (!p.token || input.length < 10 || input.length > 400) return json({ error: 'itch_invalid' }, 400);
  const clickId = typeof p.bw === 'string' && /^bw_[a-z0-9]{20}$/.test(p.bw) ? p.bw : null;

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: acc, error: accErr } = await db.rpc('hra_itch_ucet', { p_token: p.token });
  if (accErr || !acc) return json({ error: 'acc_e_session' }, 401);

  // klíč a případně název stránky z odkazu
  let key = input, slug = '';
  const m = input.match(/([a-z0-9-]+)\.itch\.io\/([a-z0-9-]+)\/download\/([A-Za-z0-9_-]+)/i);
  if (m) { slug = m[2].toLowerCase(); key = m[3]; }
  else { const k = input.match(/download\/([A-Za-z0-9_-]+)/); if (k) key = k[1]; }
  if (!/^[A-Za-z0-9_-]{10,120}$/.test(key)) return json({ error: 'itch_invalid' }, 400);

  const { data: prods } = await db.rpc('hra_itch_produkty');
  const list = (prods || []) as { product: string; game_id: number; slug: string; usd?: number | string | null }[];
  const cands = slug ? list.filter(x => x.slug === slug) : list;
  if (!cands.length) return json({ error: 'itch_invalid' }, 400);

  let apiBad = false;
  for (const c of cands) {
    const r = await fetch(`https://api.itch.io/games/${c.game_id}/download_keys?download_key=${encodeURIComponent(key)}`, { headers: { Authorization: 'Bearer ' + API } });
    if (r.status === 401 || r.status === 403) { apiBad = true; continue; }
    if (!r.ok) continue;
    const body = await r.json().catch(() => ({}));
    const dk = body && body.download_key;
    if (dk && Number(dk.game_id) === Number(c.game_id) && dk.key === key) {
      const { data: st } = await db.rpc('hra_itch_uplatnit', { p_acc: acc, p_key: key, p_product: c.product, p_key_id: dk.id || null });
      if (st === 'used') return json({ error: 'itch_used' }, 409);
      // BrosWars Partner: provize jen za ověřené první uplatnění s platným kliknutím (okno 365 dní ověří hub)
      if (st === 'ok' && clickId) {
        try {
          const usd = Number(c.usd ?? PRICE_USD[c.product]);
          const created = dk.created_at ? new Date(String(dk.created_at).replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(String(dk.created_at)) ? '' : 'Z')) : null;
          const paidAt = created && !isNaN(created.getTime()) ? created.toISOString() : new Date().toISOString();
          if (usd > 0) {
            const { error: affErr } = await db.rpc('aff_record', {
              p_source: 'castlewars',
              p_external_id: 'itch:' + (dk.id ? String(dk.id) : await sha256(key)),
              p_click_id: clickId,
              p_amount: usd,
              p_currency: 'USD',
              p_paid_at: paidAt,
              p_description: c.product
            });
            if (affErr) console.error('aff_record:', affErr.message);
          }
        } catch (e) { console.error('aff_record selhal:', e instanceof Error ? e.message : String(e)); }
      }
      return json({ product: c.product });
    }
  }
  if (apiBad) { console.error('itch API odmítlo klíč ITCH_API_KEY'); return json({ error: 'not_configured' }, 503); }
  return json({ error: 'itch_invalid' }, 404);
});
