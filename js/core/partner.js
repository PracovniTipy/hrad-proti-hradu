/* =========================================================================
   BROSWARS PARTNER (kód tvůrce) + ZACHYCENÍ POZVÁNKY OD KAMARÁDA
   Načítá se hned po portal.js, aby parametry z adresy zmizely co nejdřív.
   - ?bw=<clickId> (odkaz tvůrce) → localStorage bw_click = {id, at}; poslední klik vyhrává,
     platí 365 dní od POSLEDNÍHO kliknutí (server okno ověří znovu podle svého času).
   - kód tvůrce: POST …/functions/v1/aff/code {code, to:'castlewars'} → {click_id} → bw_click
   - ?pozvanka=<kód hráče> → localStorage cw-pozvanka (zpracuje js/ui/pozvi.js)
   Kontrakt: broswars-studio/partneri/KONTRAKT.md
   ========================================================================= */
(function () {
  const KEY = 'bw_click', CODE_KEY = 'cw-bw-kod', INV_KEY = 'cw-pozvanka', DEV_KEY = 'cw-zarizeni';
  const DAY = 864e5, WINDOW = 365 * DAY;
  const AFF = 'https://smjplqxwqyraphfeqsyk.supabase.co/functions/v1/aff/code';
  const RE = /^bw_[a-z0-9]{20}$/;
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* prohlížeč ukládání nepovolil */ } };

  /* parametry z adresy: uložit a odstranit (history.replaceState) */
  try {
    const u = new URL(location.href);
    let dirty = false;
    const bw = u.searchParams.get('bw');
    if (bw !== null) {
      if (RE.test(bw)) { set(KEY, JSON.stringify({ id: bw, at: Date.now() })); set(CODE_KEY, null); }
      u.searchParams.delete('bw'); dirty = true;
    }
    const inv = u.searchParams.get('pozvanka');
    if (inv !== null) {
      const c = inv.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
      if (c.length >= 4) set(INV_KEY, JSON.stringify({ code: c, at: Date.now() }));
      u.searchParams.delete('pozvanka'); dirty = true;
    }
    if (dirty && history.replaceState) history.replaceState(history.state, '', u.pathname + u.search + u.hash);
  } catch (e) { /* stará adresa / file:// – nic */ }

  const Partner = {
    /* platné kliknutí (≤ 365 dní) nebo null */
    click() {
      try {
        const c = JSON.parse(get(KEY) || 'null');
        if (c && RE.test(c.id) && typeof c.at === 'number' && Date.now() - c.at <= WINDOW && Date.now() - c.at >= -DAY) return c.id;
      } catch (e) { /* nic */ }
      return null;
    },
    /* kód tvůrce, který hráč zadal (jen pro zobrazení) */
    code() { return this.click() ? get(CODE_KEY) : null; },
    /* v herních portálech je obchod skrytý → i kód tvůrce */
    available() { return !window.CW_PORTAL; },
    async enterCode(code) {
      const c = String(code || '').trim().replace(/\s+/g, '').slice(0, 40);
      if (c.length < 2) return { ok: false, err: 'cc_bad' };
      try {
        const r = await fetch(AFF, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: c, to: 'castlewars' }) });
        const b = await r.json().catch(() => ({}));
        if (r.ok && b && RE.test(b.click_id || '')) {
          set(KEY, JSON.stringify({ id: b.click_id, at: Date.now() }));
          set(CODE_KEY, c.toUpperCase());
          if (window.Stat) try { Stat.ev('creator_code', {}); } catch (e) { /* nic */ }
          return { ok: true, code: c.toUpperCase() };
        }
        return { ok: false, err: r.status >= 400 && r.status < 500 ? 'cc_bad' : 'acc_e_net' };
      } catch (e) { return { ok: false, err: 'acc_e_net' }; }
    },
    /* pozvánka od kamaráda čekající na zpracování */
    invite() { try { const v = JSON.parse(get(INV_KEY) || 'null'); return v && v.code ? v : null; } catch (e) { return null; } },
    clearInvite() { set(INV_KEY, null); },
    /* náhodné id zařízení (jen pro ochranu pozvánek proti pozvání sebe sama) */
    device() {
      let d = get(DEV_KEY);
      if (!d || !/^[a-z0-9]{16,40}$/.test(d)) {
        const a = new Uint8Array(12);
        try { crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); }
        d = Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
        set(DEV_KEY, d);
      }
      return d;
    }
  };
  window.Partner = Partner;
})();
