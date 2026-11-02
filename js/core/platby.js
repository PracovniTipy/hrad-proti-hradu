/* =========================================================================
   NÁKUPY ZA SKUTEČNÉ PENÍZE PŘES ITCH.IO
   Každá věc za peníze má na itch.io vlastní stránku (castle-wars-<id>).
   1. hráč ji koupí na itch.io (karta, PayPal – itch.io řeší platbu i DPH)
   2. dostane stránku ke stažení s tajným klíčem (i e-mailem)
   3. odkaz vloží do hry → server klíč ověří přes itch.io API
      a zapíše ho k účtu hráče (každý klíč jde uplatnit jen jednou)
   4. hra věci doručí (deliver)
   ========================================================================= */
(function () {
  const FN = 'https://smjplqxwqyraphfeqsyk.supabase.co/functions/v1/itch';
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const STORE = 'https://battlecastle.itch.io/';
  const TERMS = 'https://pracovnitipy.github.io/hrad-proti-hradu/obchodni-podminky.html';
  /* ceny na itch.io (USD) podle ceny v Kč */
  const USD = { 29: 1.49, 59: 2.49, 99: 3.99, 149: 5.99, 199: 7.99, 249: 9.99, 499: 19.99, 999: 39.99, 2500: 99.99 };
  /* verze pro Microsoft Store: pravidla Storu u her nedovolují placení mimo Microsoft,
     takže tam se platí přes Microsoft (Digital Goods API v Edge) a itch.io se neukazuje */
  let MS = (() => {
    try {
      const q = /[?&]store=ms\b/.test(location.search);
      // aplikace z Microsoft Storu se při spuštění hlásí tímto referrerem
      if (q || /^app-info:\/\/platform\/microsoft-store/.test(document.referrer || '')) localStorage.setItem('cw-store', 'ms');
      const app = ['fullscreen', 'standalone', 'minimal-ui'].some(m => matchMedia('(display-mode: ' + m + ')').matches);
      /* nainstalovaná aplikace ve Windows (ne Electron) = verze z Microsoft Storu:
         tam se nikdy nesmí nabízet placení přes itch.io */
      /* + aplikace pro Windows (Electron) – i ta se instaluje z Microsoft Storu */
      const winApp = /Windows/i.test(navigator.userAgent) && (app || /Electron/i.test(navigator.userAgent));
      if (winApp) localStorage.setItem('cw-store', 'ms');
      return q || winApp || (app && localStorage.getItem('cw-store') === 'ms');
    } catch (e) { return /[?&]store=ms\b/.test(location.search); }
  })();
  const MS_BILLING = 'https://store.microsoft.com/billing';
  const msOk = () => typeof window.getDigitalGoodsService === 'function' && typeof window.PaymentRequest === 'function';
  /* id doplňku v Partner Center: cw + id bez podtržítek (gems_g1 → cwgemsg1) */
  const msId = pid => 'cw' + String(pid).replace(/[^a-z0-9]/gi, '').toLowerCase();
  const Platby = {
    get msStore() { return MS; },
    msId,
    available() { return true; },
    on() { return !MS || (msOk() && this._msItems !== false); },
    usd(czk) { return USD[czk] || Math.round(czk / 20) - 0.01; },
    price(czk) { return '$' + this.usd(czk).toFixed(2); },
    terms: TERMS,
    url(id) { return STORE + 'castle-wars-' + String(id).replace(/_/g, '-') + '/purchase'; },
    open(url) {
      if (window.Capacitor) { window.open(url, '_system'); return; }
      const w = window.open(url, '_blank', 'noopener');
      if (!w) location.href = url;
    },
    /* okno nákupu: odkaz na itch.io + pole na vložení odkazu ke stažení */
    /* produkty, které ještě nemají stránku na itch.io / doplněk v Microsoft Storu */
    soon: /^(pass|sada_|skin_)/,
    buy(App, product) {
      if (this.soon && this.soon.test(product.id)) { App.toast(t('pay_soon')); return; }
      if (MS) { this.buyMs(App, product); return; }
      if (window.HraPlatby && window.HraPlatby.buy) {
        window.HraPlatby.buy(product).then(ok => { if (ok) this.showGot(App, this.deliver(App, product.id)); }).catch(() => App.toast(t('pay_failed')));
        return;
      }
      App.modal(`
        <div class="eyebrow">${t('pay_title')}</div>
        <h2>${esc(product.name)}</h2>
        <div class="pay-price">${this.price(product.czk)}</div>
        <p class="muted">${t('itch_note')}</p>
        <a class="btn btn-green btn-big" id="itchBuy" href="${this.url(product.id)}" target="_blank" rel="noopener">${t('itch_buy')}</a>
        <p class="itch-how">${t('itch_how')}</p>
        <div class="code-row"><input id="itchIn" maxlength="300" autocomplete="off" spellcheck="false" placeholder="${t('itch_ph')}"><button class="btn btn-gold" id="itchGo">${t('itch_redeem')}</button></div>
        <label class="itch-ok"><input type="checkbox" id="itchOk"> <span>${t('itch_consent', { link: `<a href="${TERMS}" target="_blank" rel="noopener">${t('itch_terms')}</a>` })}</span></label>
        <p class="muted" id="itchMsg"></p>
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`, (c, close) => {
        c.querySelector('#itchBuy').addEventListener('click', e => { e.preventDefault(); App.persist(); this.open(this.url(product.id)); });
        const inp = c.querySelector('#itchIn'), go = c.querySelector('#itchGo'), msg = c.querySelector('#itchMsg');
        const run = async () => {
          if (go.disabled || inp.value.trim().length < 10) return;
          if (!c.querySelector('#itchOk').checked) { msg.textContent = t('itch_need_ok'); msg.classList.add('err'); return; }
          go.disabled = true; msg.textContent = '…'; msg.classList.remove('err');
          const r = await this.redeemItch(App, inp.value);
          if (r.ok) { close(); if (App.current === 'obchod') App.go('obchod', { keepScroll: true }); this.showGot(App, r); }
          else { msg.textContent = t(r.err); msg.classList.add('err'); go.disabled = false; }
        };
        go.addEventListener('click', run);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
      });
    },
    /* ověření odkazu/klíče z itch.io na serveru */
    async redeemItch(App, input) {
      try {
        await Ucet.ensure();
        if (!Ucet.s || !Ucet.s.token) return { ok: false, err: 'acc_e_net' };
        const r = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: Ucet.apiKey, Authorization: 'Bearer ' + Ucet.apiKey },
          body: JSON.stringify({ token: Ucet.s.token, input: String(input).trim() }) });
        const body = await r.json().catch(() => ({}));
        if (body.product) { const d = this.deliver(App, body.product); return Object.assign({ ok: true }, d); }
        const err = { not_configured: 'itch_soon', itch_used: 'itch_used', itch_invalid: 'itch_invalid', acc_e_session: 'acc_e_session' }[body.error] || 'acc_e_net';
        return { ok: false, err };
      } catch (e) { return { ok: false, err: 'acc_e_net' }; }
    },
    /* ---- Microsoft Store ---- */
    async msSvc() {
      if (!msOk()) throw new Error('nodg');
      if (!this._svc) this._svc = await window.getDigitalGoodsService(MS_BILLING);
      return this._svc;
    },
    _skuToPid(sku) {
      const all = GameData.offers.map(o => o.id).concat(GameData.gemPacks.map(g => 'gems_' + g.id), Object.keys(GameData.divineSets || {}).map(k => 'set_' + k), ['skill_drak', 'pass', 'skin_e', 'skin_l'], (GameData.wolfSets || []).map(w => 'sada_' + w.role));
      return all.find(p => msId(p) === sku) || null;
    },
    async buyMs(App, product) {
      if (this._busy) return;
      this._busy = true;
      try {
        const svc = await this.msSvc();
        const sku = msId(product.id);
        const req = new PaymentRequest([{ supportedMethods: MS_BILLING, data: { sku } }],
          { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } });
        const resp = await req.show();
        const token = resp.details && (resp.details.purchaseToken || resp.details.token);
        await resp.complete('success');
        const d = this.deliver(App, product.id);
        if (token) { try { await svc.consume(token); } catch (e) {} }
        if (App.current === 'obchod') App.go('obchod', { keepScroll: true });
        this.showGot(App, d);
      } catch (e) {
        const m = String(e && (e.name || e.message) || '');
        if (!/Abort/i.test(m)) App.toast(t(m === 'nodg' ? 'pay_ms_off' : 'pay_failed'));
      } finally { this._busy = false; }
    },
    /* nákupy, které se zaplatily, ale nedoručily (pád, zavřené okno) – doručí se při startu */
    async msRestore(App) {
      try {
        const svc = await this.msSvc();
        const list = await svc.listPurchases();
        for (const p of list || []) {
          const pid = this._skuToPid(p.itemId);
          if (!pid) continue;
          const d = this.deliver(App, pid);
          try { await svc.consume(p.purchaseToken); } catch (e) {}
          this.showGot(App, d);
        }
      } catch (e) {}
    },
    showGot(App, r) { Shop.rewardsModal(App, '🎉 ' + r.title, r.got, 'tydenni'); },
    /* doručení nákupu podle id produktu */
    deliver(App, pid) {
      const save = Shop.ensure(App.save);
      save.purchases[pid] = (save.purchases[pid] || 0) + 1;
      let title = pid, got = [];
      const o = GameData.offers.find(x => x.id === pid);
      if (o) { title = o.name; got = Shop.grant(App, o.give); }
      else if (pid.startsWith('gems_')) { const x = GameData.gemPacks.find(g => 'gems_' + g.id === pid); if (x) { title = t('gems_n', { n: x.gems }); got = Shop.grant(App, { gems: x.gems }); } }
      else if (pid.startsWith('set_')) { const id = pid.slice(4), D = GameData.divineSets[id]; if (D) { title = I18N.lang === 'cs' ? D.name : D.en; got = Shop.grant(App, { set: id }); } }
      else if (window.Pas && /^(pass|sada_|skin_)/.test(pid)) { const r = Pas.deliver(App, pid); if (r) { title = r.title; got = r.got; } }
      else if (pid.startsWith('skill_')) { const k = GameData.skillById(pid.slice(6)); if (k) { title = k.name; got = Shop.grant(App, { skills: [k.id] }); } }
      if (window.Stat) Stat.ev('purchase', { p: pid });
      App.persist();
      return { title, got };
    },
    init(App) {
      /* záchrana: služba plateb Microsoft Storu funguje jen v aplikaci nainstalované z Microsoft Storu */
      if (!MS && msOk()) {
        window.getDigitalGoodsService(MS_BILLING).then(svc => {
          MS = true; this._svc = svc;
          try { localStorage.setItem('cw-store', 'ms'); } catch (e) {}
          this.init(App);
        }).catch(() => {});
        return;
      }
      if (!MS) return;
      this._msItems = false;
      if (!msOk()) return;
      /* ověř, že doplňky jsou v Microsoft Storu opravdu nastavené; jinak placené věci skryj */
      this.msSvc().then(svc => svc.getDetails(GameData.gemPacks.map(g => msId('gems_' + g.id)).concat(GameData.offers.map(o => msId(o.id)))))
        .then(d => { this._msItems = !!(d && d.length); })
        .catch(() => { this._msItems = false; })
        .finally(() => { document.body.classList.toggle('paid-off', !this.on()); if (App.current === 'obchod') App.go('obchod', { keepScroll: true }); });
      setTimeout(() => this.msRestore(App), 1500);
    }
  };
  window.Platby = Platby;
})();
