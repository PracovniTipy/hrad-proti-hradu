/* =========================================================================
   REKLAMY ZA ODMĚNU (rewarded ads) – jen dobrovolné, nikdy nepřeruší hru
   -------------------------------------------------------------------------
   Kde se ukazují (každé místo má denní limit a případně odpočet):
     win2x   po vítězství: „Zdvojnásob odměnu“ (×2 zlato z bitvy)
     second  po prohře:    „Druhá šance“ (útěšné zlato, bitva musela trvat ≥ 30 s)
     gems    obchod:       „Drahokamy zdarma“ (+15 💎)
     chest   obchod + denní odměny: „Denní truhla zdarma“ (1× denně)
   Kde reklamy fungují:
     • Android aplikace (Capacitor) s pluginem @capacitor-community/admob
     • herní portály, jejichž SDK je na stránce (CrazyGames SDK v3, Poki SDK)
     • jinde (web, PWA, itch.io, Microsoft Store) se tlačítka vůbec neukážou.
   Odměna se připíše JEN když SDK nahlásí, že hráč reklamu dokoukal.
   Žádné vynucené (interstitial) reklamy tu nejsou a nikdy nebudou.

   ►► JAK VLOŽIT SKUTEČNÁ ID Z GOOGLE ADMOB ◄◄
   1. admob.google.com → Aplikace → Přidat aplikaci (Android, cz.broswars.castlewars)
   2. zkopíruj „ID aplikace“ (ca-app-pub-XXXX~YYYY) do ADS.appId níže
      A STEJNÉ ID do tools/android_patch.py (ADMOB_APP_ID) – to jde do AndroidManifestu
   3. vytvoř reklamní jednotku typu „S odměnou“ a její ID (ca-app-pub-XXXX/ZZZZ) dej do ADS.rewardedId
   4. přepni TEST na false
   5. v AdMob → Ochrana soukromí a zasílání zpráv vytvoř zprávu GDPR (souhlas pro EU)
   ========================================================================= */
(function () {
  const ADS = {
    /* true = Googlovy veřejné TESTOVACÍ reklamy (nic nevydělávají, ale nehrozí zablokování účtu) */
    TEST: false,
    appId: 'ca-app-pub-8372177693491161~7297121142',          // ID aplikace AdMob (musí sedět s AndroidManifestem)
    rewardedId: 'ca-app-pub-8372177693491161/8362790801',     // reklamní jednotka „S odměnou“
    testDevices: [],                                          // ID testovacích telefonů (z Logcatu), nepovinné
    maxAdContentRating: 'ParentalGuidance',                   // General | ParentalGuidance | Teen | MatureAudience
    /* produkty „bez reklam“ – kdo některý koupí, tlačítka reklam se mu už nezobrazí */
    adFreeProducts: []
  };
  /* Google testovací ID: kdyby někdo přepnul TEST na false a zapomněl vložit vlastní ID, zůstanou testovací reklamy */
  const TEST_UNIT = 'ca-app-pub-3940256099942544/5224354917';

  /* ---- místa a limity ---- */
  const PLACES = {
    win2x: { cap: 5, cd: 0 },
    second: { cap: 3, cd: 0 },
    gems: { cap: 5, cd: 45, gems: 15 },
    chest: { cap: 1, cd: 0 }
  };
  const MAX_WIN_BONUS = 5000;   // strop zlata za jedno zdvojnásobení
  const MIN_LOSS_TIME = 30;     // prohra musí trvat aspoň 30 s (žádné „vzdám se hned a koukám na reklamy“)

  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;   // překlad: js/i18n_l.js
  const fmt = n => Math.round(n).toLocaleString('cs-CZ');
  const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const stat = (ev, p) => { try { if (window.Stat) Stat.ev(ev, { p }); } catch (e) { /* nic */ } };
  const icon = n => (typeof window.ico === 'function' ? window.ico(n) : '');

  /* ---------- poskytovatel reklam ---------- */
  const cap = () => window.Capacitor;
  const isNative = () => { try { const C = cap(); return !!(C && C.isNativePlatform && C.isNativePlatform()); } catch (e) { return false; } };
  const admob = () => {
    if (!isNative()) return null;
    const C = cap();
    try { if (C.isPluginAvailable && !C.isPluginAvailable('AdMob')) return null; } catch (e) { /* nic */ }
    return (C.Plugins && C.Plugins.AdMob) || null;
  };
  const crazy = () => { const S = window.CrazyGames && window.CrazyGames.SDK; return S && S.ad && typeof S.ad.requestAd === 'function' ? S : null; };
  const poki = () => (window.PokiSDK && typeof window.PokiSDK.rewardedBreak === 'function') ? window.PokiSDK : null;
  function provider() {
    if (admob()) return 'admob';
    if (crazy()) return 'crazygames';
    if (poki()) return 'poki';
    return '';
  }

  /* ---------- místní záznam (App.save.ads) ---------- */
  function rec(save) {
    const A = save.ads && typeof save.ads === 'object' ? save.ads : (save.ads = {});
    const k = dayKey();
    if (A.day !== k) { A.day = k; A.n = {}; }
    A.n = A.n || {}; A.last = A.last || {};
    A.total = A.total || 0;
    return A;
  }
  const adFree = save => ADS.adFreeProducts.some(id => ((save.purchases || {})[id] || 0) > 0);

  /* ---------- AdMob (Android) ---------- */
  const N = { init: null, loaded: false, loading: null };
  function admobInit(A, withForm) {
    if (N.init) return N.init;
    N.init = (async () => {
      await A.initialize({ initializeForTesting: ADS.TEST, testingDevices: ADS.testDevices, maxAdContentRating: ADS.maxAdContentRating });
      /* souhlas GDPR (Google UMP): formulář jen když ho Google pro hráče vyžaduje */
      try {
        let info = await A.requestConsentInfo();
        if (withForm && info && info.status === 'REQUIRED' && info.isConsentFormAvailable) info = await A.showConsentForm();
        if (info && info.canRequestAds === false) { N.init = null; throw new Error('consent'); }
      } catch (e) { if (e && e.message === 'consent') throw e; /* bez nastavené zprávy GDPR vrací UMP chybu – pokračujeme */ }
    })();
    N.init.catch(() => { N.init = null; });
    return N.init;
  }
  function admobLoad(A) {
    if (N.loaded) return Promise.resolve();
    if (N.loading) return N.loading;
    const unit = ADS.TEST ? TEST_UNIT : (ADS.rewardedId || TEST_UNIT);
    N.loading = A.prepareRewardVideoAd({ adId: unit, isTesting: ADS.TEST, immersiveMode: true })
      .then(() => { N.loaded = true; })
      .finally(() => { N.loading = null; });
    return N.loading;
  }
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  async function admobShow(tok) {
    const A = admob();
    await withTimeout(admobInit(A, true), 30000);
    await withTimeout(admobLoad(A), 15000);
    if (tok.cancelled) return 'cancel';
    ui.hideWait();
    const earned = await new Promise(resolve => {
      let got = false, over = false;
      const hs = [];
      const finish = () => { if (over) return; over = true; clearTimeout(wd); hs.forEach(h => { try { h && h.remove && h.remove(); } catch (e) { /* nic */ } }); resolve(got); };
      const on = (ev, fn) => { try { const h = A.addListener(ev, fn); if (h && h.then) h.then(x => { if (over) { try { x.remove(); } catch (e) { /* nic */ } } else hs.push(x); }); else hs.push(h); } catch (e) { /* nic */ } };
      on('onRewardedVideoAdReward', () => { got = true; });
      on('onRewardedVideoAdDismissed', () => setTimeout(finish, 700));   // odměna může dorazit těsně po zavření
      on('onRewardedVideoAdFailedToShow', () => finish());
      const wd = setTimeout(finish, 180000);
      N.loaded = false;   // reklama se dá ukázat jen jednou
      Promise.resolve(A.showRewardVideoAd()).then(r => { if (r) got = true; }).catch(() => setTimeout(finish, 700));
    });
    /* další reklamu připravit dopředu, ať příště naběhne hned */
    setTimeout(() => { admobLoad(A).catch(() => {}); }, 1500);
    return earned;
  }

  /* ---------- portály ---------- */
  let crazyInit = null;
  async function crazyShow() {
    const S = crazy();
    if (S.init && !crazyInit) { crazyInit = Promise.resolve().then(() => S.init()).catch(() => {}); }
    if (crazyInit) await crazyInit;
    ui.hideWait();
    return new Promise(resolve => {
      let over = false;
      const end = v => { if (!over) { over = true; resolve(v); } };
      try {
        S.ad.requestAd('rewarded', { adStarted: () => {}, adFinished: () => end(true), adError: () => end(false) });
      } catch (e) { end(false); }
      setTimeout(() => end(false), 180000);
    });
  }
  async function pokiShow() {
    ui.hideWait();
    try { return !!(await poki().rewardedBreak()); } catch (e) { return false; }
  }

  /* ztlumit hru po dobu reklamy (bez uložení do nastavení) */
  function mute(on) {
    try {
      const s = window.App && App.save && App.save.settings;
      if (!s || !window.Zvuk) return;
      if (on) { mute.prev = { sfx: s.sfx, music: s.music }; s.sfx = false; s.music = false; }
      else if (mute.prev) { s.sfx = mute.prev.sfx; s.music = mute.prev.music; mute.prev = null; }
      Zvuk.apply();
    } catch (e) { /* nic */ }
  }

  /* ---------- čekací vrstva (samostatná – nenahrazuje otevřené okno s výsledkem bitvy) ---------- */
  const ui = {
    tok: null,
    showWait(tok) {
      this.tok = tok;
      let w = document.getElementById('adWait');
      if (!w) {
        w = document.createElement('div'); w.id = 'adWait'; w.className = 'ad-wait';
        w.innerHTML = `<div class="ad-wait-card"><i class="ad-spin"></i><b></b><button class="btn btn-sm" type="button"></button></div>`;
        document.body.appendChild(w);
        w.querySelector('button').addEventListener('click', () => { const k = this.tok; this.hideWait(); if (k && k.cancel) k.cancel(); });
      }
      w.querySelector('b').textContent = L('Načítám reklamu…', 'Loading ad…');
      w.querySelector('button').textContent = L('Zrušit', 'Cancel');
      w.hidden = false;
    },
    hideWait() { const w = document.getElementById('adWait'); if (w) w.hidden = true; }
  };

  /* ---------- styl tlačítek (vlastní soubor CSS není potřeba) ---------- */
  function css() {
    if (document.getElementById('adCss')) return;
    const st = document.createElement('style'); st.id = 'adCss';
    st.textContent = `
.ad-btn{position:relative;display:flex;align-items:center;justify-content:flex-start;gap:10px;width:100%;min-height:58px;padding:8px 12px 8px 8px;text-align:left;
  background:linear-gradient(#7a4fe0,#4a2a9c);border:2px solid #b99cff;color:#fff;box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 3px 0 #1e1240,0 0 18px rgba(150,110,255,.35)}
.ad-btn .ad-play{flex:0 0 40px;height:40px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#fff6,#0000 60%),linear-gradient(#ffd77a,#e09a1c);box-shadow:0 2px 0 #6a4307}
.ad-btn .ad-play svg{width:18px;height:18px;margin-left:3px;fill:#3a2203}
.ad-btn .ad-txt{display:flex;flex-direction:column;line-height:1.15;min-width:0;flex:1}
.ad-btn .ad-txt b{font-family:var(--font-display,inherit);font-size:17px;letter-spacing:.2px}
.ad-btn .ad-txt small{font-size:13px;opacity:.9;display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.ad-btn .ad-txt small .ico{width:15px;height:15px}
.ad-btn .ad-free{flex:0 0 auto;align-self:center;background:linear-gradient(#5fe07a,#2ea84a);color:#062a10;font-weight:900;font-size:11px;letter-spacing:.8px;padding:2px 8px;border-radius:9px;border:1.5px solid #0b3a18;box-shadow:0 2px 0 #0b3a18}
.ad-btn:not([disabled]) .ad-play{animation:adPulse 1.8s ease-in-out infinite}
.ad-btn[disabled] .ad-free{display:none}
.ad-btn.ad-done{background:linear-gradient(#3e8a4a,#24572c);border-color:#7fd28a}
.ad-btn.ad-done .ad-play{background:linear-gradient(#bdf5c4,#5fbf6a)}
@keyframes adPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.ad-slot{margin:10px 0 2px}
.ad-dots{display:inline-flex;gap:3px;margin-left:4px}.ad-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.28)}.ad-dots i.on{background:#ffd77a}
.ad-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:6px}
.ad-wait{position:fixed;inset:0;z-index:99999;background:rgba(5,8,14,.72);display:grid;place-items:center}
.ad-wait[hidden]{display:none}
.ad-wait-card{display:flex;flex-direction:column;align-items:center;gap:12px;padding:22px 30px;border-radius:14px;background:#141b2a;border:2px solid #b99cff;color:#fff}
.ad-spin{width:34px;height:34px;border-radius:50%;border:4px solid rgba(255,255,255,.2);border-top-color:#ffd77a;animation:adSpin .8s linear infinite}
@keyframes adSpin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ad-btn .ad-play{animation:none!important}}`;
    document.head.appendChild(st);
  }
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>';
  const dots = (used, capN) => capN > 1 ? `<span class="ad-dots" aria-hidden="true">${Array.from({ length: capN }, (_, i) => `<i class="${i < used ? 'on' : ''}"></i>`).join('')}</span>` : '';
  function btnHtml(place, title, sub, extra) {
    const st = Reklamy.state(place);
    const off = !st.ok;
    const why = st.why === 'cap' ? L('Dnes už vyčerpáno – zítra znovu', 'All used today – back tomorrow') : st.why === 'cd' ? L(`Další za ${st.cdLeft} s`, `Next in ${st.cdLeft}s`) : sub;
    return `<button type="button" class="btn ad-btn" data-ad="${place}" ${off ? 'disabled' : ''} ${extra || ''}>
      <span class="ad-play">${PLAY}</span>
      <span class="ad-txt"><b>${title}</b><small>${why}${dots(st.used, PLACES[place].cap)}</small></span>
      <span class="ad-free">${L('ZDARMA', 'FREE')}</span>
    </button>`;
  }
  /* okno dává fokus prvnímu tlačítku – reklama ho dostat nesmí */
  function refocus(card, sel) {
    setTimeout(() => {   // App.modal dává fokus až po navázání tlačítek
      const a = document.activeElement;
      if (a && a.closest && a.closest('[data-ad]') && card.contains(a)) { const b = card.querySelector(sel); if (b) b.focus(); else a.blur(); }
    }, 0);
  }
  function markDone(btn, text) {
    if (!btn) return;
    btn.disabled = true; btn.classList.add('ad-done');
    const s = btn.querySelector('.ad-txt small'); if (s) s.innerHTML = text;
  }

  /* ========================================================================= */
  const Reklamy = {
    ADS, PLACES,
    provider,
    /* reklamy jsou na tomhle zařízení k dispozici */
    available() {
      const App = window.App;
      if (!App || !App.save) return false;
      if (adFree(App.save)) return false;
      return !!provider();
    },
    state(place) {
      const P = PLACES[place], A = rec(window.App.save);
      const used = A.n[place] || 0;
      const cdLeft = P.cd ? Math.max(0, Math.ceil((P.cd * 1000 - (Date.now() - (A.last[place] || 0))) / 1000)) : 0;
      if (used >= P.cap) return { ok: false, why: 'cap', used, left: 0, cdLeft };
      if (cdLeft > 0) return { ok: false, why: 'cd', used, left: P.cap - used, cdLeft };
      return { ok: true, used, left: P.cap - used, cdLeft: 0 };
    },
    /* Ukáže reklamu; onReward se zavolá JEN po nahlášené odměně. Vrací true/false. */
    async show(place, onReward) {
      const App = window.App;
      if (this._busy) return false;
      if (!this.available()) { App.toast(L('Reklamy tu nejsou dostupné.', 'Ads are not available here.')); return false; }
      if (App.battle && !App.battle.over) return false;          // nikdy uprostřed bitvy
      const st = this.state(place);
      if (!st.ok) { App.toast(st.why === 'cap' ? L('Dnešní limit je vyčerpaný. Zítra znovu!', 'Daily limit reached. Come back tomorrow!') : L(`Další reklama za ${st.cdLeft} s.`, `Next ad in ${st.cdLeft}s.`)); return false; }
      if (navigator.onLine === false) { App.toast(L('Reklama potřebuje internet.', 'Ads need an internet connection.')); return false; }
      this._busy = true;
      const prov = provider();
      let earned = false;
      const tok = { cancelled: false };
      const cancelled = new Promise(res => { tok.cancel = () => { tok.cancelled = true; res('cancel'); }; });
      ui.showWait(tok);
      mute(true);
      try {
        stat('ad_req', place);
        const run = prov === 'admob' ? admobShow(tok) : prov === 'crazygames' ? crazyShow() : pokiShow();
        run.catch(() => {});
        const r = await Promise.race([run, cancelled]);
        if (r === 'cancel') return false;
        stat('ad_shown', place);
        earned = r === true;
      } catch (e) {
        if (!tok.cancelled) App.toast(e && e.message === 'consent'
          ? L('Bez souhlasu se nedá reklama přehrát. Zkus to znovu.', 'The ad cannot play without consent. Please try again.')
          : L('Reklama teď není k dispozici. Zkus to za chvíli.', 'No ad available right now. Please try again later.'));
        stat('ad_fail', place);
        return false;
      } finally {
        ui.hideWait(); mute(false); this._busy = false;
      }
      if (!earned) { App.toast(L('Reklama nebyla dokoukaná – odměna nepřipsána.', 'The ad was not finished – no reward.')); return false; }
      const A = rec(App.save);
      A.n[place] = (A.n[place] || 0) + 1; A.last[place] = Date.now(); A.total++;
      A.consent = true;
      stat('ad_reward', place);
      try { onReward && onReward(); } finally { App.persist(); }
      return true;
    },

    /* ---------- po bitvě ---------- */
    _battle: null,
    battleHtml(App, cfg, res, goldWon) {
      this._battle = null;
      if (!this.available() || cfg.film) return '';
      css();
      if (res.win) {
        const bonus = Math.min(MAX_WIN_BONUS, Math.max(0, Math.round(goldWon || 0)));
        if (bonus < 10) return '';
        this._battle = { place: 'win2x', gold: bonus };
        return `<div class="ad-slot">${btnHtml('win2x', L('Zdvojnásob odměnu', 'Double your reward'), `${icon('coin')} +${fmt(bonus)} · ${L('zhlédni krátkou reklamu', 'watch a short ad')}`)}</div>`;
      }
      if (res.reason === 'spojeni' || (res.time || 0) < MIN_LOSS_TIME) return '';
      const base = cfg.level && cfg.level.reward && cfg.level.reward.gold ? cfg.level.reward.gold : 300;
      const gold = Math.max(100, Math.min(2000, Math.round(base * 0.5 / 10) * 10));
      this._battle = { place: 'second', gold };
      return `<div class="ad-slot">${btnHtml('second', L('Druhá šance', 'Second chance'), `${icon('coin')} +${fmt(gold)} ${L('i za prohru', 'even for a loss')}`)}</div>`;
    },
    battleBind(App, card) {
      const o = this._battle, btn = card.querySelector('[data-ad="win2x"],[data-ad="second"]');
      if (!o || !btn) return;
      refocus(card, '#resBack');   // Enter/mezerník nesmí omylem spustit reklamu
      let used = false;
      btn.addEventListener('click', () => {
        if (used) return;
        this.show(o.place, () => {
          used = true;
          App.save.gold += o.gold;
          markDone(btn, `✓ ${icon('coin')} +${fmt(o.gold)} ${L('připsáno', 'added')}`);
          const row = card.querySelector('.reward-row');
          const pill = `<span class="pill">${icon('coin')} +${fmt(o.gold)} ▶</span>`;
          if (row) row.insertAdjacentHTML('beforeend', pill);
          App.toast(o.place === 'win2x' ? L(`Odměna zdvojnásobena! +${fmt(o.gold)} zlata`, `Reward doubled! +${fmt(o.gold)} gold`) : L(`Druhá šance: +${fmt(o.gold)} zlata`, `Second chance: +${fmt(o.gold)} gold`));
          if (window.Zvuk) try { Zvuk.play('coin'); } catch (e) { /* nic */ }
        });
      });
    },

    /* ---------- obchod (záložka Nabídky) ---------- */
    shopHtml(App) {
      if (!this.available()) return '';
      css();
      const g = PLACES.gems.gems;
      return `<div class="sec-head"><h2>${L('Zdarma za reklamu', 'Free for an ad')}</h2><span class="muted">${L('Dobrovolné · krátké video · odměna hned', 'Optional · short video · instant reward')}</span></div>
        <div class="ad-row">
          ${btnHtml('gems', `${L('Drahokamy zdarma', 'Free gems')}`, `${icon('gem')} +${g} · ${L(`dnes ${this.state('gems').used}/${PLACES.gems.cap}`, `today ${this.state('gems').used}/${PLACES.gems.cap}`)}`)}
          ${this.chestHtml(App)}
        </div>`;
    },
    shopBind(App, el) {
      if (!this.available()) return;
      const gb = el.querySelector('[data-ad="gems"]');
      if (gb) {
        gb.addEventListener('click', () => this.show('gems', () => {
          App.save.gems += PLACES.gems.gems;
          App.toast(L(`+${PLACES.gems.gems} drahokamů!`, `+${PLACES.gems.gems} gems!`));
          if (window.Zvuk) try { Zvuk.play('coin'); } catch (e) { /* nic */ }
          setTimeout(() => { if (App.current === 'obchod') App.go('obchod', { keepScroll: true }); }, 0);
        }));
        /* odpočet do další reklamy */
        const st = this.state('gems');
        if (st.why === 'cd') {
          const tm = setInterval(() => {
            if (!gb.isConnected) { clearInterval(tm); return; }
            const s = this.state('gems');
            if (s.why !== 'cd') { clearInterval(tm); if (App.current === 'obchod') App.go('obchod', { keepScroll: true }); return; }
            const sm = gb.querySelector('.ad-txt small'); if (sm) sm.firstChild.textContent = L(`Další za ${s.cdLeft} s`, `Next in ${s.cdLeft}s`);
          }, 1000);
        }
      }
      this.chestBind(App, el, () => { if (App.current === 'obchod') App.go('obchod', { keepScroll: true }); });
    },

    /* ---------- denní truhla zdarma (obchod + okno denních odměn) ---------- */
    chestHtml() {
      if (!this.available() || !GameData.chests || !GameData.chests.denni) return '';
      css();
      const ch = GameData.chests.denni;
      const sub = window.CW_BE ? `${icon('coin')} +3 000` : `${icon('coin')} ${fmt(ch.gold[0])}–${fmt(ch.gold[1])} · ${L('šance na skin', 'skin chance')}`;
      return btnHtml('chest', window.CW_BE ? L('Pytel zlata zdarma', 'Free bag of gold') : L('Denní truhla zdarma', 'Free daily chest'), sub);
    },
    chestBind(App, el, after) {
      const b = el.querySelector('[data-ad="chest"]');
      if (!b) return;
      b.addEventListener('click', () => this.show('chest', () => {
        const ch = GameData.chests.denni;
        /* Belgie: žádný náhodný obsah → pevná odměna */
        let give;
        if (window.CW_BE) give = { gold: 3000 };
        else {
          const r = (a, c) => Math.round(a + Math.random() * (c - a));
          give = { gold: Math.round(r(ch.gold[0], ch.gold[1]) / 10) * 10, random: [] };
          for (let i = 0; i < (ch.gearCount || 1); i++) if (Math.random() < ch.gearChance) give.random.push({ odds: ch.tierOdds });
        }
        const got = Shop.grant(App, give);
        if (after) after();
        Shop.rewardsModal(App, window.CW_BE ? L('Pytel zlata', 'Bag of gold') : ch.name, got, 'denni');
      }));
    },
    denniHtml(App) {
      const h = this.chestHtml(App);
      return h ? `<div class="ad-slot">${h}</div>` : '';
    },
    denniBind(App, card, close) { refocus(card, '#ddClaim, [data-close]'); this.chestBind(App, card, () => { try { close && close(); } catch (e) { /* nic */ } }); },

    /* Při startu: kdo už reklamu jednou viděl (souhlas vyřešen), tomu se další připraví dopředu.
       Nováčkovi se nic nenačítá a žádný formulář neukazuje, dokud sám neklepne na reklamu. */
    init(App) {
      try {
        const A = admob();
        if (!A || !App.save || !(App.save.ads && App.save.ads.consent)) return;
        setTimeout(() => { admobInit(A, false).then(() => admobLoad(A)).catch(() => {}); }, 8000);
      } catch (e) { /* nic */ }
    }
  };
  window.Reklamy = Reklamy;
  /* start až po načtení hry (App vzniká v main.js) */
  window.addEventListener('load', () => setTimeout(() => { if (window.App && App.save) Reklamy.init(App); }, 0));
})();
