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
  const Platby = {
    available() { return true; },
    on() { return true; },
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
    buy(App, product) {
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
      else if (pid.startsWith('skill_')) { const k = GameData.skillById(pid.slice(6)); if (k) { title = k.name; got = Shop.grant(App, { skills: [k.id] }); } }
      if (window.Stat) Stat.ev('purchase', { p: pid });
      App.persist();
      return { title, got };
    },
    init() { /* nic – nákupy se uplatňují odkazem z itch.io */ }
  };
  window.Platby = Platby;
})();
