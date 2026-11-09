/* =========================================================================
   ŠÍŘENÍ HRY
   - Pozvi kamaráda: vlastní kód/odkaz, 200 drahokamů oběma po první výhře
     pozvaného, exkluzivní mazlíček Posel za 5 pozvaných
   - Sdílet bitvu: obrázek s výsledkem a odkazem (TikTok, Instagram, WhatsApp)
   - Výzva kamarádovi: odkaz spustí bitvu proti hradu odesílatele
   - Týdenní turnaj: žebříček vítězství za týden, odměny pro nejlepší
   - Režim natáčení: bitva bez ovládání, filmová kamera, obří bitvy na klik
   - Upozornění v Android aplikaci (denní odměna, návrat do hry)
   Na herních portálech (CrazyGames…) se nic z odkazů ven nezobrazuje.
   ========================================================================= */
(function () {
  const G = window.GameData;
  const SITE = 'https://pracovnitipy.github.io/hrad-proti-hradu/';
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n || 0).toLocaleString('cs-CZ');
  const REF_GEMS = 200, REF_PET = 5;
  const portal = () => !!window.CW_PORTAL;
  const net = () => window.Ucet && navigator.onLine !== false;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* nic */ } } };

  /* ---------- kódování výzvy do odkazu ---------- */
  const b64e = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => { try { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (e) { return null; } };

  /* ---------- exkluzivní mazlíček za pozvánky ---------- */
  if (G && G.pets) {
    if (!G.pets.find(p => p.id === 'posel')) G.pets.push({ id: 'posel', cs: 'Posel, poštovní holub', en: 'Herald the Carrier Pigeon',
      d: ['Exkluzivní mazlíček jen za pozvané přátele. Nosí zprávy v pouzdře na noze. Každých 10 s přinese 30 mincí a za každé zabití 3 mince navíc.',
          'Exclusive pet only for inviting friends. Carries messages in a tube on its leg. Every 10 s it brings 30 coins and grabs 3 extra coins per kill.'],
      need: { k: 'refs', n: REF_PET }, cd: 10, kind: 'gold', col: '#7fb8ff', rar: 'legendary', excl: true });
    const P = G.pets.find(p => p.id === 'posel'); P.name = L(P.cs, P.en); P.desc = L(P.d[0], P.d[1]);
    const oldProg = G.petProgress;
    G.petProgress = (s, p) => (G.petNeed(p).k === 'refs' ? (s.refCount || 0) : oldProg(s, p));
  }
  /* kresba holuba (stejný styl jako ostatní mazlíčci) */
  if (G && G.petDrawFns && G.petKit) {
    const K = G.petKit, TAU = Math.PI * 2, OUT = K.OUT;
    G.petDrawFns.posel = function (c, t, act) {
      const bob = Math.sin(t * 3) * 2, flap = Math.sin(t * (act ? 22 : 9));
      c.save(); c.translate(0, bob - 6);
      // zadní křídlo
      c.save(); c.translate(-4, -6); c.rotate(-0.5 - flap * 0.45);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-18, -22, -30, -14); c.quadraticCurveTo(-22, -6, -26, 2); c.quadraticCurveTo(-12, 2, 0, 4); c.closePath();
      K.fill(c, K.lg(c, 0, -20, 0, 4, ['#9fb2cc', '#5f7896']), 1.4); c.restore();
      // ocas
      c.beginPath(); c.moveTo(-14, 4); c.lineTo(-32, 0); c.lineTo(-34, 8); c.lineTo(-30, 14); c.lineTo(-12, 12); c.closePath();
      K.fill(c, K.lg(c, -34, 0, -12, 12, ['#4c5f7a', '#8aa0bd']), 1.4);
      c.beginPath(); c.moveTo(-31, 2); c.lineTo(-32, 12); K.stroke(c, '#2a3548', 1.2);
      // tělo
      c.beginPath(); c.ellipse(0, 4, 18, 13, -0.15, 0, TAU);
      K.fill(c, K.rg(c, 4, 0, 2, 22, ['#e2ecf8', '#a9bdd6', '#7088a8'], -2, -4), 1.6);
      // krk s duhovým leskem
      c.beginPath(); c.ellipse(10, -8, 9, 10, 0.3, 0, TAU);
      K.fill(c, K.lg(c, 2, -16, 16, 2, ['#5fd0a8', '#7a6ad8', '#9fb2cc']), 1.4);
      // hlava
      c.beginPath(); c.arc(16, -18, 8.5, 0, TAU); K.fill(c, K.rg(c, 18, -21, 1, 10, ['#f2f6fc', '#a9bdd6']), 1.5);
      // zobák
      c.beginPath(); c.moveTo(23, -19); c.lineTo(31, -16.5); c.lineTo(23, -14.5); c.closePath(); K.fill(c, '#f2b84a', 1.2);
      c.beginPath(); c.ellipse(23.5, -19.5, 2, 1.3, 0, 0, TAU); c.fillStyle = '#fff4dc'; c.fill();
      K.eye(c, 17.5, -20, 3.4, '#e8742a', 0.4, (t % 4.2) > 4.05 ? 0.9 : 0);
      // poštovní čepička
      c.beginPath(); c.moveTo(9, -24); c.quadraticCurveTo(16, -32, 24, -25); c.lineTo(22, -23); c.quadraticCurveTo(16, -27, 10, -22); c.closePath();
      K.fill(c, K.lg(c, 9, -30, 24, -22, ['#d6453c', '#8a1e1a']), 1.2);
      c.beginPath(); c.moveTo(20, -24.5); c.lineTo(28, -23.5); K.stroke(c, '#2a1a10', 2);
      // nohy + pouzdro se zprávou
      c.beginPath(); c.moveTo(-2, 15); c.lineTo(-3, 22); c.moveTo(5, 15); c.lineTo(6, 22); K.stroke(c, '#e88a5a', 2.2);
      c.save(); c.translate(6, 18); c.rotate(-0.2);
      c.beginPath(); c.rect(-2.2, -5, 4.4, 9); K.fill(c, K.lg(c, -2, 0, 2, 0, ['#8a5a2a', '#d8a050', '#8a5a2a']), 1);
      c.restore();
      // přední křídlo
      c.save(); c.translate(0, -2); c.rotate(-0.25 - flap * 0.55);
      c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(-10, -18, -26, -12); c.quadraticCurveTo(-20, -4, -24, 4); c.quadraticCurveTo(-8, 8, 4, 6); c.closePath();
      K.fill(c, K.lg(c, 0, -16, 0, 6, ['#cfdbea', '#8aa0bd']), 1.5);
      c.beginPath(); c.moveTo(-8, -4); c.lineTo(-20, -2); c.moveTo(-6, 1); c.lineTo(-18, 4); K.stroke(c, 'rgba(40,60,90,.45)', 1);
      c.restore();
      // dopis v zobáku při schopnosti / jiskřičky
      if (act) {
        c.save(); c.translate(31, -15); c.rotate(0.2);
        c.beginPath(); c.rect(-1, -4, 11, 8); K.fill(c, '#f6ecd2', 1.1);
        c.beginPath(); c.moveTo(-1, -4); c.lineTo(4.5, 1); c.lineTo(10, -4); K.stroke(c, '#8a6a3a', 0.9);
        c.beginPath(); c.arc(4.5, 1.5, 1.6, 0, TAU); c.fillStyle = '#d6453c'; c.fill(); c.restore();
        for (let i = 0; i < 5; i++) { const a = t * 2 + i * 1.3; K.sparkle(c, Math.cos(a) * 28, -6 + Math.sin(a) * 20, 2.6, '#ffe28a'); }
      }
      c.restore();
    };
  }

  const Sireni = {
    code: null,
    /* ---------- odkazy ---------- */
    async myCode() {
      if (this.code) return this.code;
      const c = ls.get('cw-mycode'); if (c) return (this.code = c);
      try { this.code = await Ucet.refCode(); ls.set('cw-mycode', this.code); } catch (e) { this.code = null; }
      return this.code;
    },
    async inviteUrl() { const c = await this.myCode(); return SITE + (c ? '?ref=' + c : ''); },
    async challengeUrl(App) {
      const s = App.save, c = await this.myCode();
      const o = { v: 1, n: (s.name || 'Velitel').slice(0, 16), f: s.faction, cs: (s.skins && s.skins.castle) || 'kralovsky',
        cl: Math.max(1, Math.min(14, G.calc.castleLevel(s))), tr: s.trophies || 0, w: (s.stats && s.stats.wins) || 0, r: c || '' };
      return SITE + '?vyzva=' + b64e(o) + (c ? '&ref=' + c : '');
    },

    /* ---------- sdílení (Web Share → schránka → stažení) ---------- */
    async share(App, { title, text, url, file }) {
      const full = text + (url ? '\n' + url : '');
      try {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ title, text: full, files: [file] }); return; }
        if (navigator.share) { await navigator.share({ title, text, url }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      let copied = false;
      try { await navigator.clipboard.writeText(full); copied = true; } catch (e) { /* nic */ }
      if (file) { try { const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { /* nic */ } }
      App.toast(copied ? L('Odkaz je zkopírovaný – vlož ho kamarádům.', 'Link copied – paste it to your friends.') : full);
    },

    /* obrázek s výsledkem bitvy (1080 × 1350, formát pro Instagram/TikTok) */
    async battleCard(App, cfg, res) {
      const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const c = cv.getContext('2d');
      const src = document.getElementById('bCanvas');
      c.fillStyle = '#0d121c'; c.fillRect(0, 0, W, H);
      if (src && src.width) {   // výřez bojiště přes celou výšku
        const sh = src.height, sw = Math.min(src.width, sh * W / H * 1.0);
        const sx = Math.max(0, (src.width - sw) / 2);
        try { c.drawImage(src, sx, 0, sw, sh, 0, 0, W, H * 0.78); } catch (e) { /* nic */ }
      }
      let g = c.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, 'rgba(13,18,28,0)'); g.addColorStop(0.35, 'rgba(13,18,28,.92)'); g.addColorStop(1, '#0d121c');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      g = c.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, 'rgba(13,18,28,.85)'); g.addColorStop(1, 'rgba(13,18,28,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 220);
      c.textAlign = 'center';
      c.fillStyle = '#f2c94c'; c.font = '800 64px Cinzel, Georgia, serif'; c.fillText('CASTLE WARS', W / 2, 96);
      c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '600 30px Inter, sans-serif'; c.fillText(L('Bitva hradů', 'Battle of Castles'), W / 2, 142);
      const y0 = H * 0.66;
      c.fillStyle = res.win ? '#ffd24a' : '#ff7a6a'; c.font = '900 120px Cinzel, Georgia, serif';
      c.fillText(res.win ? L('VÍTĚZSTVÍ!', 'VICTORY!') : L('PROHRA', 'DEFEAT'), W / 2, y0);
      c.fillStyle = '#fff'; c.font = '700 44px Inter, sans-serif';
      const hp = Math.round((res.playerHp || 0) * 100);
      c.fillText(L(`${fmt(res.kills)} zabitých · hrad ${hp} %`, `${fmt(res.kills)} kills · castle ${hp} %`), W / 2, y0 + 80);
      if (cfg.mode === 'vyzva' && cfg.enemyName) { c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '600 36px Inter, sans-serif'; c.fillText(L(`Porazil jsem hrad hráče ${cfg.enemyName}!`, `I beat ${cfg.enemyName}'s castle!`), W / 2, y0 + 140); }
      // výzva + odkaz
      const by = H - 230;
      c.fillStyle = 'rgba(242,201,76,.14)'; c.strokeStyle = '#f2c94c'; c.lineWidth = 4;
      const rr = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
      rr(80, by, W - 160, 170, 28); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.font = '800 46px Inter, sans-serif'; c.fillText(L('Dokážeš to líp? Hraj zdarma!', 'Can you do better? Play free!'), W / 2, by + 68);
      c.fillStyle = '#f2c94c'; c.font = '700 34px Inter, sans-serif'; c.fillText('pracovnitipy.github.io/hrad-proti-hradu', W / 2, by + 122);
      const code = await this.myCode(); if (code) { c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '600 28px Inter, sans-serif'; c.fillText(L(`Kód pozvánky: ${code} (+${REF_GEMS} drahokamů)`, `Invite code: ${code} (+${REF_GEMS} gems)`), W / 2, by + 160 + 40); }
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      return blob ? new File([blob], 'castle-wars-bitva.png', { type: 'image/png' }) : null;
    },
    canShare() { return !portal(); },
    async shareBattle(App, cfg, res) {
      if (portal()) return;
      const file = await this.battleCard(App, cfg, res).catch(() => null);
      const url = cfg.mode === 'vyzva' ? await this.challengeUrl(App) : await this.inviteUrl();
      const text = res.win
        ? L(`Vyhrál jsem bitvu v Castle WARS – ${fmt(res.kills)} zabitých! 🏰⚔️ Dokážeš to líp?`, `I won a battle in Castle WARS – ${fmt(res.kills)} kills! 🏰⚔️ Can you beat that?`)
        : L('Hraju Castle WARS – bitvu hradů. Pojď mě porazit! 🏰', 'Playing Castle WARS – battle of castles. Come beat me! 🏰');
      this.share(App, { title: 'Castle WARS', text, url, file });
    },
    async shareInvite(App) {
      this.share(App, { title: 'Castle WARS', url: await this.inviteUrl(),
        text: L(`Hraj se mnou Castle WARS – bitvu hradů! Funguje i bez internetu. Přes můj odkaz dostaneš ${REF_GEMS} drahokamů navíc. 🏰`, `Play Castle WARS with me – battle of castles! Works offline too. Use my link and get ${REF_GEMS} bonus gems. 🏰`) });
    },
    async shareChallenge(App) {
      this.share(App, { title: 'Castle WARS', url: await this.challengeUrl(App),
        text: L(`⚔️ Vyzývám tě v Castle WARS! Porazíš můj hrad? (úroveň ${G.calc.castleLevel(App.save)})`, `⚔️ I challenge you in Castle WARS! Can you beat my castle? (level ${G.calc.castleLevel(App.save)})`) });
    },

    /* ---------- výzva: bitva proti hradu kamaráda ---------- */
    startChallenge(App, o) {
      const ef = G.factions[o.f] && G.factions[o.f].roles ? o.f : 'kralovstvi';
      const pw = G.pvpHelpers && G.pvpHelpers.basePower ? G.pvpHelpers.basePower({ trophies: o.tr || 0 }) : 1;
      const diff = Math.max(0.7, Math.min(2.2, pw + Math.min(0.5, (o.cl || 1) * 0.03) + Math.min(0.3, (o.w || 0) / 400)));
      App.pickArmy(pf => App.startBattle({ playFaction: pf,
        mode: 'vyzva', title: L(`Výzva: ${o.n}`, `Challenge: ${o.n}`), difficulty: diff,
        enemyUnits: G.factionUnits(ef), enemyName: o.n, enemyFaction: ef, theme: G.factions[ef].theme,
        enemyCastleSkin: (G.castleSkins || []).some(s => s.id === o.cs) ? o.cs : 'kralovsky', enemyUnitSkin: 'zakladni',
        enemyCastleLevel: Math.max(1, Math.min(14, o.cl || 1)), challenge: o }));
    },
    challengeModal(App, o) {
      App.modal(`<div class="eyebrow">${L('Výzva', 'Challenge')}</div><h2>⚔️ ${esc(o.n)} ${L('tě vyzývá na souboj!', 'challenges you!')}</h2>
        <p>${L(`Porazíš jeho hrad úrovně ${o.cl}? Když vyhraješ, pošli mu odvetu.`, `Can you beat their level ${o.cl} castle? If you win, send them a rematch.`)}</p>
        <div class="modal-actions"><button class="btn btn-gold" id="vyGo">${L('Přijmout výzvu', 'Accept')}</button><button class="btn" data-close>${L('Později', 'Later')}</button></div>`, (c, close) => {
        c.querySelector('#vyGo').addEventListener('click', () => { close(); this.startChallenge(App, o); });
      });
    },

    /* ---------- po bitvě (volá main.js) ---------- */
    onBattleEnd(App, cfg, res) {
      const save = App.save, out = { rewards: [], note: '' };
      if (cfg.film) return out;
      if (res.win && !portal() && net()) {
        if (Ucet.logged && Ucet.logged()) Ucet.turnajWin().catch(() => {});
        if (save.refDone && !save.refWon) Ucet.refWin().then(g => {
          save.refWon = 1;
          if (g > 0) { save.gems += g; App.persist(); App.toast(L(`Dárek za pozvánku od kamaráda: +${g} drahokamů!`, `Friend invite gift: +${g} gems!`)); }
          else App.persist();
        }).catch(() => {});
      }
      if (cfg.mode === 'vyzva') out.note = res.win
        ? L(`Porazil jsi hrad hráče <b>${esc(cfg.enemyName)}</b>! Pošli mu výsledek a vyzvi ho na odvetu.`, `You beat <b>${esc(cfg.enemyName)}</b>'s castle! Send them the result and challenge them back.`)
        : L(`<b>${esc(cfg.enemyName)}</b> tě tentokrát porazil. Zkus to znovu, nebo ho vyzvi ty.`, `<b>${esc(cfg.enemyName)}</b> won this time. Try again or challenge them yourself.`);
      return out;
    },

    /* ---------- domovská obrazovka: vyzvednout odměny (jednou za spuštění) ---------- */
    _homeDone: false,
    async home(App) {
      if (this._homeDone || portal() || !net()) return; this._homeDone = true;
      const save = App.save;
      try {
        const r = await Ucet.refClaim();
        if (r) {
          const before = save.refCount || 0;
          save.refCount = r.total || 0; save.refWaiting = r.waiting || 0;
          if (r.gems > 0) { save.gems += r.gems; App.toast(L(`Tví přátelé hrají! Odměna za pozvánky: +${r.gems} drahokamů`, `Your friends are playing! Invite reward: +${r.gems} gems`)); }
          if (before < REF_PET && save.refCount >= REF_PET) setTimeout(() => App.toast(L('Odemkl jsi exkluzivního mazlíčka Posla!', 'You unlocked the exclusive pet Herald!')), 2500);
          App.persist();
        }
      } catch (e) { this._homeDone = false; return; }
      try {
        if (Ucet.logged() && !Ucet.guest()) {
          const o = await Ucet.turnajOdmena();
          if (o && o.gems) { save.gems += o.gems; App.persist();
            App.modal(`<div class="eyebrow">${L('Týdenní turnaj', 'Weekly tournament')}</div><h2>🏆 ${L(`${o.rank}. místo!`, `Place #${o.rank}!`)}</h2>
              <p>${L(`Minulý týden jsi vyhrál ${o.wins} bitev a skončil na ${o.rank}. místě.`, `Last week you won ${o.wins} battles and finished #${o.rank}.`)}</p>
              <div class="reward-row"><span class="pill">${ico('gem')} +${o.gems}</span></div>
              <div class="modal-actions"><button class="btn btn-gold" data-close>${L('Super!', 'Great!')}</button></div>`); }
        }
      } catch (e) { /* nic */ }
    },

    /* ---------- okno Přátelé ---------- */
    async openFriends(App) {
      const save = App.save, n = save.refCount || 0;
      const pet = G.pets.find(p => p.id === 'posel');
      App.modal(`<div class="eyebrow">${L('Přátelé', 'Friends')}</div><h2>${L('Hraj s přáteli', 'Play with friends')}</h2>
        ${portal() ? '' : `<section class="sh-box">
          <h3>🎁 ${L('Pozvi kamaráda', 'Invite a friend')}</h3>
          <p class="muted">${L(`Pošli kamarádovi svůj odkaz. Až vyhraje první bitvu, dostanete <b>oba ${REF_GEMS} drahokamů</b>. Za ${REF_PET} pozvaných získáš exkluzivního mazlíčka, kterého jinak mít nejde.`, `Send your link to a friend. When they win their first battle, <b>you both get ${REF_GEMS} gems</b>. Invite ${REF_PET} friends to get an exclusive pet you can't get any other way.`)}</p>
          <div class="sh-code"><span>${L('Tvůj kód', 'Your code')}</span><b id="shCode">…</b></div>
          <div class="sh-pet"><canvas id="shPet" width="120" height="120"></canvas><div>
            <b>${esc(pet ? pet.name : 'Posel')}</b><div class="bar"><i style="width:${Math.min(100, n / REF_PET * 100)}%"></i></div>
            <small>${L(`${Math.min(n, REF_PET)} / ${REF_PET} pozvaných přátel`, `${Math.min(n, REF_PET)} / ${REF_PET} invited friends`)}${save.refWaiting ? L(` · ${save.refWaiting} čeká na první výhru`, ` · ${save.refWaiting} waiting for first win`) : ''}</small></div></div>
          <div class="modal-actions"><button class="btn btn-green" id="shInv">${L('Poslat pozvánku', 'Send invite')}</button></div>
        </section>
        <section class="sh-box">
          <h3>⚔️ ${L('Vyzvi kamaráda', 'Challenge a friend')}</h3>
          <p class="muted">${L('Kamarád dostane odkaz a bude bojovat proti tvému hradu. Kdo vyhraje, pošle odvetu.', 'Your friend gets a link and fights against your castle. The winner sends a rematch.')}</p>
          <div class="modal-actions"><button class="btn btn-gold" id="shVy">${L('Poslat výzvu', 'Send challenge')}</button></div>
        </section>`}
        <section class="sh-box">
          <h3>🎬 ${L('Natoč video', 'Record a video')}</h3>
          <p class="muted">${L('Obří bitvy bez ovládání a s filmovou kamerou – ideální na TikTok a Instagram. Zapni nahrávání obrazovky a spusť bitvu. Odměny se v nich nedávají.', 'Huge battles with no UI and a cinematic camera – perfect for TikTok and Instagram. Start screen recording and launch a battle. No rewards are given in these.')}</p>
          <div class="modal-actions sh-film">
            <button class="btn" data-film="obri">${L('Obří bitva', 'Giant battle')} 1500 × 1500</button>
            <button class="btn" data-film="narody">${L('Národ proti národu', 'Nation vs nation')} 600 × 600</button>
            <button class="btn" data-film="obrana">${L('Hrad proti hordě', 'Castle vs horde')}</button>
          </div>
          <p class="muted sh-tip">${L('Tip: v každé bitvě zapneš filmový režim v pauze tlačítkem „Režim natáčení“.', 'Tip: in any battle, turn on cinematic mode in the pause menu with "Recording mode".')}</p>
        </section>
        <div class="modal-actions"><button class="btn" data-close>${L('Zavřít', 'Close')}</button></div>`, (c, close) => {
        const pc = c.querySelector('#shPet');
        if (pc && G.drawPet) { const x = pc.getContext('2d'); x.translate(60, 66); x.scale(1.5, 1.5); try { G.drawPet(x, 'posel', 0.6, false); } catch (e) { /* nic */ } }
        const cd = c.querySelector('#shCode'); if (cd) this.myCode().then(v => { cd.textContent = v || L('bez internetu', 'offline'); });
        const inv = c.querySelector('#shInv'); if (inv) inv.addEventListener('click', () => this.shareInvite(App));
        const vy = c.querySelector('#shVy'); if (vy) vy.addEventListener('click', () => this.shareChallenge(App));
        c.querySelectorAll('[data-film]').forEach(b => b.addEventListener('click', () => { close(); this.filmBattle(App, b.dataset.film); }));
      });
    },

    /* ---------- okno Turnaj ---------- */
    async openTurnaj(App) {
      const reg = Ucet.logged() && !Ucet.guest();
      App.modal(`<div class="eyebrow">${L('Týdenní turnaj', 'Weekly tournament')}</div><h2>🏆 ${L('Turnaj týdne', 'Tournament of the week')}</h2>
        <p class="muted">${L('Každé vítězství v bitvě = 1 bod. V neděli o půlnoci turnaj skončí a nejlepší dostanou drahokamy.', 'Every battle victory = 1 point. The tournament ends Sunday at midnight and the best get gems.')}</p>
        <div class="tj-prizes"><span>🥇 1000</span><span>🥈🥉 500</span><span>4–10: 200</span><span>11–50: 50</span></div>
        <div id="tjBody" class="tj-body"><p class="muted">${L('Načítám…', 'Loading…')}</p></div>
        ${reg ? '' : `<div class="notice"><div>${L('Odměny a místo v žebříčku mají jen registrovaní hráči. Registrace je zdarma a dostaneš za ni drahokamy.', 'Only registered players get rewards and a leaderboard spot. Registration is free and gives you gems.')}</div></div>`}
        <div class="modal-actions">${reg ? '' : `<button class="btn btn-green" id="tjReg">${t('acc_set')}</button>`}<button class="btn" data-close>${L('Zavřít', 'Close')}</button></div>`, async (c, close) => {
        const rb = c.querySelector('#tjReg'); if (rb) rb.addEventListener('click', () => { close(); UcetUI.open(App, 'register'); });
        const body = c.querySelector('#tjBody');
        try {
          const b = await Ucet.turnajBoard();
          const left = Math.max(0, new Date(b.ends) - Date.now()), d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24;
          const me = b.me;
          body.innerHTML = `<p class="tj-left">⏳ ${L(`Do konce zbývá ${d} d ${h} h`, `${d}d ${h}h left`)}</p>
            ${me ? `<p class="tj-me">${L('Ty', 'You')}: <b>${me.wins}</b> ${L('výher', 'wins')}${reg ? ` · <b>${me.rank}.</b> ${L('místo', 'place')}` : ''}</p>` : `<p class="tj-me">${L('Vyhraj bitvu a jsi v turnaji!', 'Win a battle to join!')}</p>`}
            <ol class="tj-list">${(b.top || []).slice(0, 20).map((r, i) => `<li class="${i < 3 ? 'top' : ''}"><span>${i + 1}.</span><b>${esc(r.name)}</b><i>${r.wins}</i></li>`).join('') || `<li class="muted">${L('Zatím nikdo – buď první!', 'Nobody yet – be the first!')}</li>`}</ol>`;
        } catch (e) { body.innerHTML = `<p class="muted">${L('Turnaj se načte, až budeš online.', 'The tournament loads when you are online.')}</p>`; }
      });
    },

    /* ---------- režim natáčení ---------- */
    film(on) {
      const b = window.App && App.battle; if (!b) return;
      b.film = !!on;
      document.getElementById('battle').classList.toggle('film', !!on);
      setTimeout(() => { try { b.resize(); } catch (e) { /* nic */ } }, 60);
      let x = document.getElementById('filmExit');
      if (!x) {
        x = document.createElement('button'); x.id = 'filmExit'; x.className = 'film-exit'; x.textContent = '✕';
        x.setAttribute('aria-label', L('Ukončit režim natáčení', 'Exit recording mode'));
        x.addEventListener('click', () => this.film(false));
        document.getElementById('battle').appendChild(x);
      }
    },
    filmBattle(App, kind) {
      const fs = G.factionOrder.filter(f => G.factions[f] && G.factions[f].roles && f !== 'spojenectvi');
      const pf = G.campaignHelpers.factionUnlocked(App.save, App.save.faction) ? App.save.faction : fs[0];
      const ef = kind === 'narody' ? (fs.find(f => f !== pf) || pf) : fs[Math.floor(Math.random() * fs.length)];
      App.startBattle({ playFaction: pf, mode: 'training', film: true, title: 'Castle WARS', difficulty: 0.8,
        enemyUnits: G.factionUnits(ef), enemyFaction: ef, theme: G.factions[ef].theme, enemyName: G.factions[ef].name,
        enemyCastleSkin: 'kralovsky', enemyUnitSkin: 'zakladni', enemyCastleLevel: 6 });
      const N = kind === 'obri' ? 1500 : kind === 'narody' ? 600 : 0;
      setTimeout(() => {
        const b = App.battle; if (!b) return;
        this.film(true);
        const C = G.battleConfig, P = G.factionUnits(pf).filter(id => !(G.units[id].hero)), E = G.factionUnits(ef).filter(id => !(G.units[id].hero));
        try {
          if (kind === 'obrana') {   // tvůj hrad brání malá posádka proti hordě
            for (let i = 0; i < 60; i++) b.spawn('player', P[i % P.length], true);
            let k = 0; const wave = () => { if (!App.battle || App.battle !== b || k++ > 14) return; for (let i = 0; i < 70; i++) b.spawn('enemy', E[i % E.length], true); setTimeout(wave, 2600); }; wave();
          } else {
            for (let i = 0; i < N; i++) { b.spawn('player', P[i % P.length], true); b.spawn('enemy', E[i % E.length], true); }
            b.units.forEach(u => { u.x = u.team === 'player' ? C.worldW * 0.24 + Math.random() * C.worldW * 0.2 : C.worldW * 0.56 + Math.random() * C.worldW * 0.2; });
          }
        } catch (e) { /* nic */ }
      }, 500);
    },

    /* ---------- upozornění (jen Android aplikace s pluginem) ---------- */
    _ln() { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.LocalNotifications; },
    async notifyAsk(App) {
      const LN = this._ln(); if (!LN || App.save.notifAsked) return;
      App.save.notifAsked = 1; App.persist();
      try { await LN.requestPermissions(); } catch (e) { /* nic */ }
    },
    async notifySchedule(App) {
      const LN = this._ln(); if (!LN) return;
      try {
        const p = await LN.checkPermissions(); if (!p || p.display !== 'granted') return;
        await LN.cancel({ notifications: [{ id: 101 }, { id: 102 }, { id: 103 }] }).catch(() => {});
        const at = (days, hour) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d; };
        await LN.schedule({ notifications: [
          { id: 101, title: L('🎁 Denní odměna čeká!', '🎁 Daily reward is ready!'), body: L('Vyzvedni si zlato a drahokamy, než propadnou.', 'Collect your gold and gems.'), schedule: { at: at(1, 18) } },
          { id: 102, title: L('⚔️ Tvůj hrad tě potřebuje!', '⚔️ Your castle needs you!'), body: L('Nepřítel shromažďuje armádu u tvých hradeb.', 'The enemy is gathering an army at your walls.'), schedule: { at: at(3, 18) } },
          { id: 103, title: L('🏆 Turnaj týdne finišuje', '🏆 Weekly tournament ends soon'), body: L('Každá výhra je bod navíc. Ještě můžeš postoupit!', 'Every win is another point. You can still climb!'), schedule: { at: at(6, 17) } }
        ] });
      } catch (e) { /* nic */ }
    },

    /* ---------- start ---------- */
    boot(App) {
      const q = new URLSearchParams(location.search);
      const ref = (q.get('ref') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      if (ref) ls.set('cw-ref', ref);
      const vy = q.get('vyzva') ? b64d(q.get('vyzva')) : null;
      if (ref || vy) { try { const u = new URL(location.href); u.searchParams.delete('ref'); u.searchParams.delete('vyzva'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) { /* nic */ } }
      // pozvánka: zapsat jednou (až je účet)
      const tryRef = async () => {
        const r = ls.get('cw-ref'); if (!r || App.save.refDone || portal()) return;
        try { await Ucet.refSet(r); App.save.refDone = 1; App.persist(); } catch (e) { setTimeout(tryRef, 30000); }
      };
      setTimeout(tryRef, 3000);
      if (vy && vy.n && !portal()) {
        const go = () => { if (App.battle || !App.save.lang || (window.Tutorial && Tutorial.active) || !document.getElementById('modal').hidden) return setTimeout(go, 1500); this.challengeModal(App, vy); };
        setTimeout(go, 2500);
      }
      // tlačítko v pauze bitvy
      const pm = document.querySelector('#bPauseMenu .modal-actions:last-child');
      if (pm && !document.getElementById('bFilm')) {
        const b = document.createElement('button'); b.className = 'btn'; b.id = 'bFilm'; b.textContent = L('🎬 Režim natáčení', '🎬 Recording mode');
        b.addEventListener('click', () => { const r = document.getElementById('bResume'); if (r) r.click(); this.film(true); });
        pm.appendChild(b);
      }
      document.addEventListener('visibilitychange', () => { if (document.hidden) this.notifySchedule(App); });
    }
  };

  /* filmová kamera: plynulé sledování fronty s pomalým „průletem“ */
  if (window.Battle) {
    const orig = Battle.prototype._camera;
    Battle.prototype._camera = function (dt) {
      if (!this.film) return orig.call(this, dt);
      let fx = null, ex = null;
      for (const u of this.units) { if (u.dead) continue; if (u.team === 'player') fx = fx == null ? u.x : Math.max(fx, u.x); else ex = ex == null ? u.x : Math.min(ex, u.x); }
      const focus = fx != null && ex != null ? (fx + ex) / 2 : (fx != null ? fx : (ex != null ? ex : this.W / 2));
      const want = this._clampCam(focus - this.cam.viewW * 0.5 + Math.sin(this.time * 0.11) * this.cam.viewW * 0.22);
      this.cam.x += (want - this.cam.x) * Math.min(1, dt * 0.35);
    };
  }

  window.Sireni = Sireni;
  window.addEventListener('load', () => { if (window.App) Sireni.boot(window.App); });
})();
