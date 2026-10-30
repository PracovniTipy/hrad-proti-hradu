/* =========================================================================
   PLATBY ZA SKUTEČNÉ PENÍZE (Stripe Checkout přes Supabase)
   1. hra založí platbu na serveru (cena je vždy z katalogu na serveru)
   2. server vytvoří platební stránku Stripe a hra na ni přejde
   3. po zaplacení Stripe pošle serveru potvrzení (webhook)
   4. hra si zaplacené nákupy vyzvedne (každý jen jednou) a hráč je dostane
   Nákup je vázaný na účet hráče, takže se neztratí ani při zavření hry.
   V nativní aplikaci se dá zapojit i vlastní systém: window.HraPlatby.buy(product)
   ========================================================================= */
(function () {
  const FN = 'https://smjplqxwqyraphfeqsyk.supabase.co/functions/v1/platba';
  const Platby = {
    configured: null,   // null = nevíme, false = Stripe ještě není nastavený
    available() { return !!(window.HraPlatby && window.HraPlatby.buy) || this.configured !== false; },
    on() { return true; },
    price(czk) { return `${Number(czk).toLocaleString('cs-CZ')} Kč`; },
    soonModal(App, product) {
      App.modal(`
        <div class="eyebrow">${t('pay_title')}</div>
        <h2>${product.name}</h2>
        <div class="pay-price">${this.price(product.czk)}</div>
        <div class="notice"><div>${t('pay_soon')}</div></div>
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`);
    },
    /* onOk se tu nepoužívá – nákup se vždy doručí přes deliver() po potvrzení serverem */
    async buy(App, product) {
      if (window.HraPlatby && window.HraPlatby.buy) {
        window.HraPlatby.buy(product).then(ok => { if (ok) this.deliver(App, product.id); }).catch(() => App.toast(t('pay_failed')));
        return;
      }
      if (this._busy) return; this._busy = true;
      const close = App.modal(`<div class="eyebrow">${t('pay_title')}</div><h2>${product.name}</h2><div class="pay-price">${this.price(product.czk)}</div><p class="muted">${t('pay_opening')}</p>`);
      try {
        const p = await Ucet.payStart(product.id);
        const r = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: Ucet.apiKey, Authorization: 'Bearer ' + Ucet.apiKey },
          body: JSON.stringify({ action: 'start', id: p.id, back: location.href.split('?')[0].split('#')[0] }) });
        const body = await r.json().catch(() => ({}));
        if (body.error === 'not_configured') { this.configured = false; close(); this.soonModal(App, product); return; }
        if (!body.url) throw new Error(body.error || 'pay');
        this.configured = true;
        try { sessionStorage.setItem('cw_pay_wait', String(Date.now())); } catch (e) { /* nic */ }
        App.persist();
        if (window.Capacitor) window.open(body.url, '_system'); else location.href = body.url;
        this.poll(App, 10 * 60 * 1000);
      } catch (e) {
        close(); App.toast(t('pay_failed'));
      } finally { this._busy = false; }
    },
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
      App.persist();
      return { title, got };
    },
    /* vyzvednout zaplacené nákupy (bezpečné volat kdykoli) */
    async claim(App) {
      if (this._claiming || !window.Ucet) return 0; this._claiming = true;
      try {
        const list = await Ucet.payClaim();
        if (!list || !list.length) return 0;
        let all = [], title = '';
        list.forEach(it => { const r = this.deliver(App, it.product); all = all.concat(r.got); title = title ? t('pay_more') : r.title; });
        try { sessionStorage.removeItem('cw_pay_wait'); } catch (e) { /* nic */ }
        if (App.current === 'obchod') App.go('obchod', { keepScroll: true });
        Shop.rewardsModal(App, '🎉 ' + title, all, 'tydenni');
        return list.length;
      } catch (e) { return 0; } finally { this._claiming = false; }
    },
    poll(App, ms) {
      const until = Date.now() + ms;
      clearInterval(this._pt);
      this._pt = setInterval(async () => {
        if (Date.now() > until) { clearInterval(this._pt); return; }
        if (await this.claim(App)) clearInterval(this._pt);
      }, 4000);
    },
    init(App) {
      const q = new URLSearchParams(location.search);
      const st = q.get('platba');
      if (st) { history.replaceState(null, '', location.pathname); if (st === 'ok') { App.toast(t('pay_ok_wait')); this.poll(App, 3 * 60 * 1000); } }
      let waiting = false; try { waiting = !!sessionStorage.getItem('cw_pay_wait'); } catch (e) { /* nic */ }
      setTimeout(() => this.claim(App), 2500);
      if (waiting) this.poll(App, 5 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.claim(App); });
      window.addEventListener('focus', () => this.claim(App));
    }
  };
  window.Platby = Platby;
})();
