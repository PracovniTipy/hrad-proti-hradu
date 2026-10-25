/* =========================================================================
   PLATBY ZA SKUTEČNÉ PENÍZE
   Hra sama peníze nepřijímá. V aplikaci z Google Play / App Store nebo na
   herním portálu (CrazyGames, Poki…) se sem zapojí jejich platební systém:
     window.HraPlatby = { buy(product) → Promise<boolean> }
   product = { id, name, czk }
   Dokud žádný platební systém zapojený není, nákup se dá jen vyzkoušet
   zdarma (testovací režim) – je to v okně jasně napsané.
   ========================================================================= */
(function () {
  const Platby = {
    available() { return !!(window.HraPlatby && window.HraPlatby.buy); },
    price(czk) { return `${czk} Kč`; },
    /* onOk se zavolá jen po úspěšném (nebo testovacím) nákupu */
    buy(App, product, onOk) {
      if (this.available()) {
        window.HraPlatby.buy(product).then(ok => { if (ok) onOk(); }).catch(() => App.toast(t('pay_failed')));
        return;
      }
      App.modal(`
        <div class="eyebrow">${t('pay_title')}</div>
        <h2>${product.name}</h2>
        <div class="pay-price">${this.price(product.czk)}</div>
        <div class="notice"><div>${HraConfig.dev ? t('pay_demo') : t('pay_soon')}</div></div>
        <div class="modal-actions">
          ${HraConfig.dev ? `<button class="btn btn-green" id="payTest">${t('pay_test')}</button>` : ''}
          <button class="btn" data-close>${t('back')}</button>
        </div>`, (c, close) => {
        const pt = c.querySelector('#payTest');
        if (pt) pt.addEventListener('click', () => { close(); onOk(); });
      });
    }
  };
  window.Platby = Platby;
})();
