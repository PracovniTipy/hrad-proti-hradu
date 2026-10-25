/* =========================================================================
   INSTALACE JEDNÍM KLIKNUTÍM: v Chromu / Edge (Windows, Mac, Android) nabídne
   prohlížeč „Nainstalovat“ a hra se objeví na ploše jako aplikace.
   Na iPhonu to Apple neumožňuje automaticky – ukážeme 2 kroky v Safari.
   ========================================================================= */
(function () {
  let deferred = null;
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;
  const installed = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches
    || navigator.standalone === true || !!window.Capacitor || /Electron/i.test(navigator.userAgent);
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inFrame = () => { try { return window.top !== window.self; } catch (e) { return true; } };

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; refresh(); });
  window.addEventListener('appinstalled', () => { deferred = null; refresh(); if (window.App) App.toast(L('Hra je nainstalovaná – najdeš ji na ploše.', 'Installed – you will find it on your desktop / home screen.')); });

  function refresh() { document.querySelectorAll('[data-install]').forEach(b => { b.hidden = !Instalace.available(); }); }

  const Instalace = {
    /* ukázat tlačítko? (ne v nainstalované aplikaci) */
    available() { return !installed() && (!!deferred || isIOS() || inFrame() || /Android|Windows|Macintosh|Linux/.test(navigator.userAgent)); },
    async run(App) {
      if (deferred) {
        deferred.prompt();
        const r = await deferred.userChoice.catch(() => null);
        deferred = null; refresh();
        return r && r.outcome === 'accepted';
      }
      // hra běží ve vloženém okně (itch.io) – instalace jde jen z vlastní stránky hry
      const site = 'https://pracovnitipy.github.io/hrad-proti-hradu/';
      if (inFrame()) { window.open(site + '#instalovat', '_blank', 'noopener'); return; }
      const ios = isIOS();
      App.modal(`<div class="eyebrow">Castle WARS</div><h2>${L('Nainstalovat na plochu', 'Install on your home screen')}</h2>
        ${ios ? `<ol class="inst-steps">
            <li>${L('Dole klepni na', 'Tap')} <b class="ios-share">⬆︎</b> <b>${L('Sdílet', 'Share')}</b></li>
            <li>${L('Zvol', 'Choose')} <b>${L('Přidat na plochu', 'Add to Home Screen')}</b> ${L('a potvrď', 'and confirm')} <b>${L('Přidat', 'Add')}</b></li>
          </ol><p class="muted">${L('Funguje v Safari. Hra se pak spouští z ikony přes celou obrazovku jako aplikace.', 'Works in Safari. The game then starts from its icon in full screen like an app.')}</p>`
        : `<p>${L('V adresním řádku prohlížeče klikni na ikonu instalace', 'In the browser address bar click the install icon')} <b>⊕</b> ${L('(nebo v menu ⋮ zvol', '(or in the ⋮ menu choose')} <b>${L('Nainstalovat aplikaci / Přidat na plochu', 'Install app / Add to Home screen')}</b>).</p>
           <p class="muted">${L('Nejlépe funguje v Chromu nebo Edge. Na počítači si můžeš stáhnout i instalačku pro Windows nebo Mac.', 'Works best in Chrome or Edge. On a computer you can also download the Windows or Mac installer.')}</p>
           <div class="modal-actions"><a class="btn btn-gold" href="https://github.com/PracovniTipy/hrad-proti-hradu/releases/download/pocitac/CastleWARS-Windows.exe">Windows</a><a class="btn btn-gold" href="https://github.com/PracovniTipy/hrad-proti-hradu/releases/download/pocitac/CastleWARS-Mac.dmg">Mac</a><a class="btn btn-gold" href="https://github.com/PracovniTipy/hrad-proti-hradu/releases/latest/download/CastleWARS.apk">Android</a></div>`}
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`);
    },
    button(cls) { return `<button class="${cls || 'install-btn'}" data-install ${this.available() ? '' : 'hidden'}><span class="inst-ico">⬇</span><span>${L('Nainstalovat', 'Install')}</span></button>`; },
    bind(App, el) { el.querySelectorAll('[data-install]').forEach(b => b.addEventListener('click', () => this.run(App))); }
  };
  window.Instalace = Instalace;
})();
