/* =========================================================================
   REKLAMY NA WEBU, V MICROSOFT STORU A NA HERNÍCH PORTÁLECH
   - vlastní web + Microsoft Store (+ aplikace pro Windows/Mac): Google H5 Games Ads
     (AdSense účet pub-8372177693491161; dokud Google účet pro hry neschválí,
     žádná reklama nepřijde a tlačítka se prostě neukážou)
   - CrazyGames / Poki: načte jejich SDK (jiné reklamy tam nejsou povolené)
   - itch.io a aplikace pro Android (AdMob) se tu neřeší
   Hra si sama pozná, kde běží. Reklama nikdy uprostřed bitvy.
   ========================================================================= */
(function () {
  const CLIENT = 'ca-pub-8372177693491161';
  const host = (location.hostname || '').toLowerCase();
  const isItch = /itch\.(io|zone)$/.test(host) || /itch\.(io|zone)/.test((document.referrer || '').toLowerCase());
  const isNative = (() => { try { const C = window.Capacitor; return !!(C && C.isNativePlatform && C.isNativePlatform()); } catch (e) { return false; } })();
  const portal = window.CW_PORTAL || '';
  const local = host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:';

  const load = (src, attrs) => new Promise((ok, bad) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    Object.keys(attrs || {}).forEach(k => s.setAttribute(k, attrs[k]));
    s.onload = ok; s.onerror = bad;
    document.head.appendChild(s);
  });

  /* ---------- portály: jejich SDK ---------- */
  if (portal === 'crazygames') {
    load('https://sdk.crazygames.com/crazygames-sdk-v3.js').then(() => {
      try {
        const S = window.CrazyGames && CrazyGames.SDK;
        if (S && S.init) S.init().then(() => {
          try { S.game.loadingStop(); } catch (e) {}
          /* postup i v cloudu CrazyGames (Data Module) – nic se nemaže, jen zrcadlí */
          try {
            const D = S.data, K = 'hrad-proti-hradu-save-v1';
            if (D && window.Save) {
              const cloud = D.getItem(K);
              let loc = null; try { loc = localStorage.getItem(K); } catch (e) {}
              const lvl = t => { try { const o = JSON.parse(t); return (o.stats && (o.stats.wins || 0)) + (o.gold ? 1 : 0); } catch (e) { return -1; } };
              if (cloud && (!loc || lvl(cloud) > lvl(loc))) {
                try { Save.replace(JSON.parse(cloud), 'crazygames'); location.reload(); return; } catch (e) {}
              }
              const os = Save.save;
              Save.save = function () { const r = os.apply(this, arguments); try { D.setItem(K, JSON.stringify(this.data)); } catch (e) {} return r; };
              try { if (Save.data) D.setItem(K, JSON.stringify(Save.data)); } catch (e) {}
            }
          } catch (e) {}
          /* ztlumení zvuku z nastavení CrazyGames */
          try {
            const mute = () => { try { const m = S.game.settings && S.game.settings.muteAudio; window.Reklamy && Reklamy._mute && Reklamy._mute(!!m); } catch (e) {} };
            mute(); S.game.addSettingsChangeListener && S.game.addSettingsChangeListener(mute);
          } catch (e) {}
          /* CrazyGames chce vědět, kdy se hraje (kvůli reklamám a statistikám) */
          const hook = () => {
            const A = window.App;
            if (!A || !A.startBattle || A._cgHook) return !!(A && A._cgHook);
            A._cgHook = true;
            const st = A.startBattle, cl = A._closeBattle;
            A.startBattle = function () { try { S.game.gameplayStart(); } catch (e) {} return st.apply(this, arguments); };
            if (cl) A._closeBattle = function () { try { S.game.gameplayStop(); } catch (e) {} return cl.apply(this, arguments); };
            return true;
          };
          if (!hook()) window.addEventListener('load', hook);
        }).catch(() => {});
        try { S.game && S.game.loadingStart && S.game.loadingStart(); } catch (e) {}
      } catch (e) {}
    }).catch(() => {});
  } else if (portal === 'poki') {
    load('https://game-cdn.poki.com/scripts/v2/poki-sdk.js').then(() => {
      try { window.PokiSDK && PokiSDK.init().then(() => { try { PokiSDK.gameLoadingFinished(); } catch (e) {} }).catch(() => {}); } catch (e) {}
    }).catch(() => {});
  }

  /* ---------- Google H5 Games Ads (vlastní web, Microsoft Store, počítač) ---------- */
  const H5 = window.CW_H5 = { on: false, ready: false, avail: false, show: null, probing: false };
  if (!portal && !isItch && !isNative && !local) {
    H5.on = true;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); };
    load('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT, {
      'data-ad-client': CLIENT, 'data-ad-frequency-hint': '180s', crossorigin: 'anonymous'
    }).then(() => {
      try {
        adConfig({
          preloadAdBreaks: 'on',
          sound: 'on',
          onReady: () => { H5.ready = true; probe(); }
        });
      } catch (e) {}
    }).catch(() => { H5.on = false; });
  }

  /* zjistí, jestli je reklama za odměnu k dispozici (beforeReward = ano) */
  function probe() {
    if (!H5.ready || H5.avail || H5.probing) return;
    H5.probing = true;
    const ctx = H5.ctx = {};
    try {
      adBreak({
        type: 'reward',
        name: 'odmena',
        beforeAd: () => { try { window.Reklamy && Reklamy._mute && Reklamy._mute(true); } catch (e) {} },
        afterAd: () => { try { window.Reklamy && Reklamy._mute && Reklamy._mute(false); } catch (e) {} },
        beforeReward: show => { H5.avail = true; H5.show = show; H5.probing = false; },
        adDismissed: () => { ctx.done && ctx.done(false); },
        adViewed: () => { ctx.done && ctx.done(true); },
        adBreakDone: () => {
          H5.probing = false;
          if (ctx.done) { const d = ctx.done; ctx.done = null; setTimeout(() => d(false), 300); }
          if (!H5.avail) setTimeout(probe, 60000);   // zatím nic – zkusit za minutu
        }
      });
    } catch (e) { H5.probing = false; }
  }

  /* přehrát reklamu za odměnu; vrací Promise<boolean> */
  H5.play = function () {
    return new Promise(resolve => {
      if (!H5.avail || !H5.show) { resolve(false); return; }
      const ctx = H5.ctx || (H5.ctx = {});
      let over = false;
      ctx.done = v => { if (over) return; over = true; ctx.done = null; resolve(v); };
      const show = H5.show;
      H5.avail = false; H5.show = null;
      try { show(); } catch (e) { ctx.done(false); }
      setTimeout(() => { if (!over) { over = true; resolve(false); } }, 180000);
    }).then(v => { setTimeout(probe, 2000); return v; });
  };

  /* ---------- reklama mezi bitvami (jen web a portály, ne Android) ---------- */
  let lastBreak = Date.now();
  window.CW_AdBetween = function () {
    try {
      const App = window.App;
      if (!App || !App.save) return;
      if (window.Reklamy && Reklamy.ADS && Reklamy.ADS.adFreeProducts.some(id => ((App.save.purchases || {})[id] || 0) > 0)) return;
      const wins = ((App.save.stats || {}).wins || 0) + ((App.save.stats || {}).losses || 0);
      if (wins < 3) return;                                   // nové hráče nerušit
      if (Date.now() - lastBreak < 4 * 60 * 1000) return;     // nejvýš jednou za 4 minuty
      lastBreak = Date.now();
      const mute = on => { try { window.Reklamy && Reklamy._mute && Reklamy._mute(on); } catch (e) {} };
      if (H5.on && H5.ready) {
        adBreak({ type: 'next', name: 'po-bitve', beforeAd: () => mute(true), afterAd: () => mute(false) });
      } else if (portal === 'crazygames' && window.CW_CG_ADS && window.CrazyGames && CrazyGames.SDK && CrazyGames.SDK.ad) {
        CrazyGames.SDK.ad.requestAd('midgame', { adStarted: () => mute(true), adFinished: () => mute(false), adError: () => mute(false) });
      } else if (portal === 'poki' && window.PokiSDK) {
        mute(true); PokiSDK.commercialBreak().then(() => mute(false), () => mute(false));
      }
    } catch (e) { /* reklama nikdy nesmí shodit hru */ }
  };
})();
