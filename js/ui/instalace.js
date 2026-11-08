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
    available() { return !window.CW_PORTAL && !installed() && (!!deferred || isIOS() || inFrame() || /Android|Windows|Macintosh|Linux/.test(navigator.userAgent)); },
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
           <p class="muted">${L('Nejlépe funguje v Chromu nebo Edge. Na Windows hru nainstaluješ bezpečně z Microsoft Storu.', 'Works best in Chrome or Edge. On Windows, install it safely from the Microsoft Store.')}</p>
           <div class="modal-actions"><a class="btn btn-gold" href="https://apps.microsoft.com/detail/9pnwtzcm0mlw" target="_blank" rel="noopener">Windows (Microsoft Store)</a><a class="btn btn-gold" href="https://github.com/PracovniTipy/hrad-proti-hradu/releases/download/pocitac/CastleWARS-Mac.dmg">Mac</a><a class="btn btn-gold" href="https://github.com/PracovniTipy/hrad-proti-hradu/releases/latest/download/CastleWARS.apk">Android</a></div>`}
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`);
    },
    button(cls) { return `<button class="${cls || 'install-btn'}" data-install ${this.available() ? '' : 'hidden'}><span class="inst-ico">⬇</span><span>${L('Nainstalovat', 'Install')}</span></button>`; },
    bind(App, el) { el.querySelectorAll('[data-install]').forEach(b => b.addEventListener('click', () => this.run(App))); },

    /* KARTA „Hraj na Androidu jako první“ – nábor testerů uzavřeného testu Google Play.
       Jen mimo nativní aplikaci pro Android (web, itch.io, Microsoft Store, počítač), ne na iPhonu
       a ne na herních portálech. Po zavření (×) se už neukáže. */
    testBanner(App, el) {
      const KEY = 'cw-gp-test-skryto';
      let hidden = false;
      try { hidden = localStorage.getItem(KEY) === '1'; } catch (e) { hidden = false; }
      const nativeAndroid = (() => { try { const C = window.Capacitor; return !!(C && C.isNativePlatform && C.isNativePlatform() && C.getPlatform && C.getPlatform() === 'android'); } catch (e) { return false; } })();
      if (hidden || nativeAndroid || window.CW_PORTAL || isIOS()) return;
      const host = el.querySelector('.hero-live');
      if (!host) return;
      const GROUP = 'https://groups.google.com/g/castlewars-testers';
      const PLAY = 'https://play.google.com/apps/testing/cz.broswars.castlewars';
      const card = document.createElement('aside');
      card.className = 'gp-test';
      card.setAttribute('aria-label', L('Testování na Androidu', 'Android testing'));
      card.innerHTML = `<button class="gp-x" aria-label="${L('Zavřít', 'Close')}">×</button>
        <div class="gp-head"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3.5v17l9-8.5z" fill="#34a853"/><path d="M4 3.5l12.2 6.9L13 12.5z" fill="#4285f4"/><path d="M4 20.5l12.2-6.9L13 11.5z" fill="#ea4335"/><path d="M16.2 10.4L20 12.5l-3.8 2.1L13 12z" fill="#fbbc04"/></svg>
          <div><b>${L('Hraj Castle WARS na Androidu jako první', 'Play Castle WARS on Android first')}</b>
          <small>${L('Hledáme testery z Google Play – 2 kroky:', 'Become a Google Play tester in 2 steps:')}</small></div></div>
        <ol class="gp-steps">
          <li><a href="${GROUP}" target="_blank" rel="noopener">${L('Přidej se do skupiny testerů', 'Join the testers group')}</a>
            <small>${L('Klikni na „Připojit se ke skupině“ – s Google účtem z telefonu s Androidem.', 'Click "Join group" – use the Google account from your Android phone.')}</small></li>
          <li><a href="${PLAY}" target="_blank" rel="noopener">${L('Nainstaluj z Google Play', 'Install from Google Play')}</a>
            <small>${L('Klikni na „Stát se testerem“, nainstaluj hru a nech ji v telefonu aspoň 14 dní.', 'Tap "Become a tester", install the game and keep it installed for at least 14 days.')}</small></li>
        </ol>`;
      card.querySelector('.gp-x').addEventListener('click', () => {
        try { localStorage.setItem(KEY, '1'); } catch (e) { /* prohlížeč ukládání nepovolil */ }
        card.remove();
      });
      card.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (window.Stat) try { Stat.ev('gp_test', {}); } catch (e) {} }));
      host.appendChild(card);
      /* karta vždy nad spodní lištou (na telefonu je dole, na počítači nahoře) */
      const fit = () => {
        if (!card.isConnected) { window.removeEventListener('resize', fit); return; }
        const n = document.getElementById('nav'), r = n && n.getBoundingClientRect(), hr = host.getBoundingClientRect();
        const low = r && r.height && r.top > hr.top + hr.height / 2;
        card.style.setProperty('--gp-bottom', (low ? Math.max(8, Math.round(hr.bottom - r.top + 12)) : 16) + 'px');
      };
      fit(); window.addEventListener('resize', fit);
    }
  };
  window.Instalace = Instalace;
})();
