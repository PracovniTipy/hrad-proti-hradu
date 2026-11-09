/* =========================================================================
   ŠÍŘENÍ HRY
   - Pozvi kamaráda je v js/ui/pozvi.js (?pozvanka=). Tady zůstal jen exkluzivní
     mazlíček Posel (5 odměněných pozvánek) a dobíhání starých pozvánek ?ref=
     (v138): už zapsaným pozvánkám se dovyplatí odměny, nové se nezapisují.
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
  const REF_PET = 5;
  const portal = () => !!window.CW_PORTAL;
  const net = () => window.Ucet && navigator.onLine !== false;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* nic */ } } };

  // [cs, en, zh, hi, es, fr, ar, bn, pt, ru, ur, id, de, ja, tr, ko] – Vyzvi kamaráda na úroveň (v141)
  if (window.I18N) Object.assign(I18N.D, {
    vy_title: ["Vyzvi kamaráda", "Challenge a friend", "挑战好友", "दोस्त को चुनौती दें", "Reta a un amigo", "Défie un ami", "تحدَّ صديقًا", "বন্ধুকে চ্যালেঞ্জ করো", "Desafie um amigo", "Брось вызов другу", "دوست کو چیلنج کریں", "Tantang teman", "Fordere einen Freund heraus", "友達に挑戦状", "Arkadaşına meydan oku", "친구에게 도전장"],
    vy_lead: ["Porazil jsi úroveň {lv}. Zvládne ji tvůj kamarád taky?", "You beat level {lv}. Can your friend do it too?", "你通关了 {lv}。你的好友也能做到吗？", "आपने स्तर {lv} जीत लिया। क्या आपका दोस्त भी कर पाएगा?", "Has superado el nivel {lv}. ¿Podrá tu amigo también?", "Tu as battu le niveau {lv}. Ton ami y arrivera-t-il aussi ?", "لقد تغلبت على المرحلة {lv}. هل يستطيع صديقك فعلها أيضًا؟", "তুমি স্তর {lv} জিতেছ। তোমার বন্ধুও কি পারবে?", "Você venceu o nível {lv}. Seu amigo consegue também?", "Ты прошёл уровень {lv}. А твой друг сможет?", "آپ نے درجہ {lv} جیت لیا۔ کیا آپ کا دوست بھی کر پائے گا؟", "Kamu menaklukkan level {lv}. Apakah temanmu juga bisa?", "Du hast Level {lv} geschafft. Schafft es dein Freund auch?", "レベル {lv} をクリアしました。友達もクリアできるかな？", "{lv} seviyesini geçtin. Arkadaşın da başarabilir mi?", "{lv} 레벨을 깼어요. 친구도 할 수 있을까요?"],
    vy_lead_home: ["Pošli kamarádovi výzvu na úroveň {lv}, kterou jsi porazil. Zvládne ji taky?", "Send a friend a challenge for level {lv}, which you beat. Can they do it too?", "把你通关的 {lv} 发给好友挑战。他也能通关吗？", "दोस्त को स्तर {lv} की चुनौती भेजें, जिसे आपने जीता है। क्या वह भी कर पाएगा?", "Envía a un amigo un reto del nivel {lv}, que ya superaste. ¿Podrá él también?", "Envoie à un ami un défi sur le niveau {lv}, que tu as battu. Y arrivera-t-il aussi ?", "أرسل لصديقك تحديًا في المرحلة {lv} التي تغلبت عليها. هل يستطيع فعلها أيضًا؟", "বন্ধুকে স্তর {lv}-এর চ্যালেঞ্জ পাঠাও, যেটা তুমি জিতেছ। সে-ও কি পারবে?", "Envie a um amigo um desafio do nível {lv}, que você venceu. Ele consegue também?", "Отправь другу вызов на уровень {lv}, который ты прошёл. Сможет ли он?", "دوست کو درجہ {lv} کا چیلنج بھیجیں جو آپ جیت چکے ہیں۔ کیا وہ بھی کر پائے گا؟", "Kirim tantangan level {lv} yang sudah kamu taklukkan ke teman. Bisakah dia juga?", "Schick einem Freund eine Herausforderung für Level {lv}, das du geschafft hast. Schafft er es auch?", "クリアしたレベル {lv} の挑戦状を友達に送ろう。友達もクリアできるかな？", "Geçtiğin {lv} seviyesi için arkadaşına meydan okuma gönder. O da başarabilir mi?", "깬 {lv} 레벨 도전장을 친구에게 보내 보세요. 친구도 할 수 있을까요?"],
    vy_send: ["Poslat výzvu", "Send challenge", "发送挑战", "चुनौती भेजें", "Enviar reto", "Envoyer le défi", "أرسل التحدي", "চ্যালেঞ্জ পাঠাও", "Enviar desafio", "Отправить вызов", "چیلنج بھیجیں", "Kirim tantangan", "Herausforderung senden", "挑戦状を送る", "Meydan okuma gönder", "도전장 보내기"],
    vy_share_text: ["⚔️ Porazil jsem úroveň {lv} v Castle WARS{s}! Zvládneš to taky?", "⚔️ I beat level {lv} in Castle WARS{s}! Can you do it too?", "⚔️ 我在 Castle WARS 中通关了 {lv}{s}！你也能做到吗？", "⚔️ मैंने Castle WARS में स्तर {lv} जीता{s}! क्या आप भी कर पाएँगे?", "⚔️ ¡He superado el nivel {lv} en Castle WARS{s}! ¿Puedes tú también?", "⚔️ J’ai battu le niveau {lv} dans Castle WARS{s} ! Tu peux en faire autant ?", "⚔️ تغلبت على المرحلة {lv} في Castle WARS{s}! هل تستطيع أنت أيضًا؟", "⚔️ আমি Castle WARS-এ স্তর {lv} জিতেছি{s}! তুমিও পারবে?", "⚔️ Venci o nível {lv} no Castle WARS{s}! Você consegue também?", "⚔️ Я прошёл уровень {lv} в Castle WARS{s}! А ты сможешь?", "⚔️ میں نے Castle WARS میں درجہ {lv} جیتا{s}! کیا آپ بھی کر سکتے ہیں؟", "⚔️ Aku menaklukkan level {lv} di Castle WARS{s}! Kamu bisa juga?", "⚔️ Ich habe Level {lv} in Castle WARS geschafft{s}! Schaffst du das auch?", "⚔️ Castle WARSでレベル {lv} をクリアしたよ{s}！君もできる？", "⚔️ Castle WARS'ta {lv} seviyesini geçtim{s}! Sen de yapabilir misin?", "⚔️ Castle WARS에서 {lv} 레벨을 깼어{s}! 너도 할 수 있어?"],
    vy_gift_text: ["Přes můj odkaz dostaneš dárek na začátek: {g}.", "Use my link to get a starter gift: {g}.", "通过我的链接可获得新手礼物：{g}。", "मेरे लिंक से शुरुआती उपहार पाएँ: {g}।", "Con mi enlace recibes un regalo inicial: {g}.", "Avec mon lien, tu reçois un cadeau de départ : {g}.", "عبر رابطي تحصل على هدية بداية: {g}.", "আমার লিংকে শুরুর উপহার পাবে: {g}।", "Pelo meu link você ganha um presente inicial: {g}.", "По моей ссылке получишь стартовый подарок: {g}.", "میرے لنک سے شروعاتی تحفہ پائیں: {g}۔", "Lewat tautanku kamu dapat hadiah awal: {g}.", "Über meinen Link bekommst du ein Startgeschenk: {g}.", "私のリンクからスタートギフトがもらえるよ：{g}。", "Bağlantımla başlangıç hediyesi alırsın: {g}.", "내 링크로 시작 선물을 받아: {g}."],
    vy_recv: ["{name} tě vyzývá!", "{name} challenges you!", "{name} 向你发起挑战！", "{name} ने आपको चुनौती दी है!", "¡{name} te reta!", "{name} te défie !", "{name} يتحداك!", "{name} তোমাকে চ্যালেঞ্জ করেছে!", "{name} desafiou você!", "{name} бросает тебе вызов!", "{name} نے آپ کو چیلنج کیا ہے!", "{name} menantangmu!", "{name} fordert dich heraus!", "{name}から挑戦状が届きました！", "{name} sana meydan okuyor!", "{name}님이 도전장을 보냈어요!"],
    vy_recv_lv: ["{name} porazil úroveň {lv}{s}. Zvládneš ji taky?", "{name} beat level {lv}{s}. Can you do it too?", "{name} 通关了 {lv}{s}。你也能做到吗？", "{name} ने स्तर {lv}{s} जीता। क्या आप भी कर पाएँगे?", "{name} superó el nivel {lv}{s}. ¿Puedes tú también?", "{name} a battu le niveau {lv}{s}. Tu peux en faire autant ?", "تغلب {name} على المرحلة {lv}{s}. هل تستطيع أنت أيضًا؟", "{name} স্তর {lv}{s} জিতেছে। তুমিও পারবে?", "{name} venceu o nível {lv}{s}. Você consegue também?", "{name} прошёл уровень {lv}{s}. А ты сможешь?", "{name} نے درجہ {lv}{s} جیتا۔ کیا آپ بھی کر سکتے ہیں؟", "{name} menaklukkan level {lv}{s}. Kamu bisa juga?", "{name} hat Level {lv}{s} geschafft. Schaffst du das auch?", "{name}はレベル {lv}{s} をクリアしました。君もできる？", "{name}, {lv}{s} seviyesini geçti. Sen de yapabilir misin?", "{name}님이 {lv}{s} 레벨을 깼어요. 당신도 할 수 있나요?"],
    vy_accept: ["Přijmout výzvu", "Accept challenge", "接受挑战", "चुनौती स्वीकारें", "Aceptar reto", "Relever le défi", "اقبل التحدي", "চ্যালেঞ্জ গ্রহণ করো", "Aceitar desafio", "Принять вызов", "چیلنج قبول کریں", "Terima tantangan", "Herausforderung annehmen", "挑戦を受ける", "Meydan okumayı kabul et", "도전 수락"],
    vy_later: ["Později", "Later", "稍后", "बाद में", "Más tarde", "Plus tard", "لاحقًا", "পরে", "Depois", "Позже", "بعد میں", "Nanti", "Später", "あとで", "Sonra", "나중에"],
    vy_won: ["Zvládl jsi úroveň {lv} z výzvy od {name}! Pošli mu odvetu.", "You beat level {lv} from {name}'s challenge! Send them a rematch.", "你完成了 {name} 发来的 {lv} 挑战！给他发一个回敬吧。", "आपने {name} की चुनौती वाला स्तर {lv} जीत लिया! उन्हें जवाबी चुनौती भेजें।", "¡Superaste el nivel {lv} del reto de {name}! Envíale la revancha.", "Tu as battu le niveau {lv} du défi de {name} ! Envoie-lui une revanche.", "تغلبت على المرحلة {lv} من تحدي {name}! أرسل له ردًّا.", "তুমি {name}-এর চ্যালেঞ্জের স্তর {lv} জিতেছ! তাকে পাল্টা চ্যালেঞ্জ পাঠাও।", "Você venceu o nível {lv} do desafio de {name}! Mande uma revanche.", "Ты прошёл уровень {lv} из вызова {name}! Отправь ответный вызов.", "آپ نے {name} کے چیلنج کا درجہ {lv} جیت لیا! انہیں جوابی چیلنج بھیجیں۔", "Kamu menaklukkan level {lv} dari tantangan {name}! Kirim tantangan balik.", "Du hast Level {lv} aus der Herausforderung von {name} geschafft! Schick eine Revanche.", "{name}からの挑戦、レベル {lv} をクリア！リベンジを送ろう。", "{name} kişisinin meydan okumasındaki {lv} seviyesini geçtin! Ona rövanş gönder.", "{name}님의 도전 {lv} 레벨을 깼어요! 리매치를 보내 보세요."],
    vy_lost: ["Úroveň {lv} tě tentokrát porazila. Zkus to znovu!", "Level {lv} beat you this time. Try again!", "这次 {lv} 难住了你。再试一次！", "इस बार स्तर {lv} ने आपको हरा दिया। फिर कोशिश करें!", "Esta vez el nivel {lv} pudo contigo. ¡Inténtalo de nuevo!", "Le niveau {lv} t’a battu cette fois. Réessaie !", "هزمتك المرحلة {lv} هذه المرة. حاول مجددًا!", "এবার স্তর {lv} তোমাকে হারিয়েছে। আবার চেষ্টা করো!", "Desta vez o nível {lv} venceu você. Tente de novo!", "На этот раз уровень {lv} оказался сильнее. Попробуй ещё!", "اس بار درجہ {lv} نے آپ کو ہرا دیا۔ دوبارہ کوشش کریں!", "Kali ini level {lv} mengalahkanmu. Coba lagi!", "Level {lv} war diesmal stärker. Versuch es noch mal!", "今回はレベル {lv} に負けました。もう一度挑戦！", "{lv} seviyesi bu sefer seni yendi. Tekrar dene!", "이번엔 {lv} 레벨에 졌어요. 다시 도전해 보세요!"]
  });

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
    /* staré pozvánky (v138) + odměnění kamarádi z nové pozvánky (pozvi.js); jednou odemčený zůstává */
    G.petProgress = (s, p) => (G.petNeed(p).k === 'refs'
      ? ((s.petsOwned || []).includes(p.id) ? p.need.n : (s.refCount || 0) + (s.pozviRewarded || 0)) : oldProg(s, p));
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
    /* ---------- odkazy ---------- */
    /* kód pozvánky z nového systému (js/ui/pozvi.js), jen když ho server už dal */
    _pozvCode() { const P = window.Pozvi; return P && P.available && P.available() && P.info && P.info.code ? P.info.code : ''; },
    async gameUrl() {
      if (window.Pozvi && Pozvi.available()) { try { await Pozvi.load(); } catch (e) { /* nic */ } }
      const c = this._pozvCode(); return SITE + (c ? '?pozvanka=' + encodeURIComponent(c) : '');
    },
    async challengeUrl(App, extra) {
      const s = App.save;
      await this.gameUrl();
      const c = this._pozvCode();
      const o = { v: 1, n: (s.name || 'Velitel').slice(0, 16), f: s.faction, cs: (s.skins && s.skins.castle) || 'kralovsky',
        cl: Math.max(1, Math.min(14, G.calc.castleLevel(s))), tr: s.trophies || 0, w: (s.stats && s.stats.wins) || 0 };
      if (extra) Object.assign(o, extra);   // výzva na úroveň příběhu: { lv: id úrovně, st: hvězdy }
      return SITE + '?vyzva=' + b64e(o) + (c ? '&pozvanka=' + encodeURIComponent(c) : '');
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
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      return blob ? new File([blob], 'castle-wars-bitva.png', { type: 'image/png' }) : null;
    },
    canShare() { return !portal(); },
    async shareBattle(App, cfg, res) {
      if (portal()) return;
      const file = await this.battleCard(App, cfg, res).catch(() => null);
      const lvx = cfg.mode === 'vyzva' && cfg.level ? { lv: cfg.level.id, st: res.win ? (res.playerHp >= 0.8 ? 3 : res.playerHp >= 0.5 ? 2 : 1) : 0 } : null;
      const url = cfg.mode === 'vyzva' ? await this.challengeUrl(App, lvx) : await this.gameUrl();
      const text = res.win
        ? L(`Vyhrál jsem bitvu v Castle WARS – ${fmt(res.kills)} zabitých! 🏰⚔️ Dokážeš to líp?`, `I won a battle in Castle WARS – ${fmt(res.kills)} kills! 🏰⚔️ Can you beat that?`)
        : L('Hraju Castle WARS – bitvu hradů. Pojď mě porazit! 🏰', 'Playing Castle WARS – battle of castles. Come beat me! 🏰');
      this.share(App, { title: 'Castle WARS', text, url, file });
    },
    async shareChallenge(App) {
      this.share(App, { title: 'Castle WARS', url: await this.challengeUrl(App),
        text: L(`⚔️ Vyzývám tě v Castle WARS! Porazíš můj hrad? (úroveň ${G.calc.castleLevel(App.save)})`, `⚔️ I challenge you in Castle WARS! Can you beat my castle? (level ${G.calc.castleLevel(App.save)})`) });
    },

    /* ---------- karta „Vyzvi kamaráda“ (po vítězství v příběhu a občas na domovské obrazovce) ----------
       Odkaz ?vyzva= nese úroveň, kterou hráč porazil, a kód pozvánky (?pozvanka=) – kamarád
       tak dostane i dárek na začátek (pravidla v js/ui/pozvi.js). Na portálech se nezobrazuje. */
    _today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
    _gift() {
      const P = window.Pozvi, g = (P && P.info && P.info.gift) || { gold: 1000, gems: 50 };
      return { gold: g.gold | 0, gems: g.gems | 0 };
    },
    vyCardHtml(lv, stars, where) {
      const g = this._gift();
      return `<section class="vy-card" data-vy-card data-vy-where="${where}">
        <div class="vy-badge" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M10 8l26 26-5 5L5 13V8z" fill="#dfe6f2" stroke="#1a0e06" stroke-width="3" stroke-linejoin="round"/><path d="M54 8L28 34l5 5 26-26V8z" fill="#dfe6f2" stroke="#1a0e06" stroke-width="3" stroke-linejoin="round"/><path d="M16 40l8 8-6 6-8-8zM48 40l-8 8 6 6 8-8z" fill="#c99a2a" stroke="#1a0e06" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="44" r="7" fill="#ffd24a" stroke="#1a0e06" stroke-width="3"/></svg></div>
        <div class="vy-body">
          <h3>${t('vy_title')}</h3>
          <p class="vy-lead">${t(where === 'home' ? 'vy_lead_home' : 'vy_lead', { lv: '<b>' + esc(this._lvName(lv)) + '</b>' + (stars ? ' <span class="vy-stars">' + '★'.repeat(Math.min(3, stars)) + '</span>' : '') })}</p>
          <p class="vy-gift" data-vy-gift hidden>🎁 ${t('inv_friend_gets')}: <span>${ico('coin')} ${fmt(g.gold)}</span><span>${ico('gem')} ${fmt(g.gems)}</span></p>
          <div class="vy-row">
            <button class="btn btn-gold vy-share" data-vy-share>${t('vy_send')}</button>
            <button class="btn vy-copy" data-vy-copy>${t('inv_copy')}</button>
          </div>
          <input class="vy-url" readonly data-vy-url value="${esc(SITE)}" aria-label="${t('vy_title')}">
        </div>
      </section>`;
    },
    bindVyCard(App, root, lv, stars) {
      const card = root.querySelector('[data-vy-card]'); if (!card) return;
      const where = card.dataset.vyWhere || 'win';
      const inp = card.querySelector('[data-vy-url]'), gift = card.querySelector('[data-vy-gift]');
      let url = null;
      const text = () => {
        const g = this._gift();
        return t('vy_share_text', { lv: this._lvName(lv), s: this._starsTxt(stars) }) + (url && url.includes('pozvanka=') ? ' ' + t('vy_gift_text', { g: `${fmt(g.gold)} 🪙 + ${fmt(g.gems)} 💎` }) : '');
      };
      // odkaz se připraví hned (kód pozvánky ze serveru), ať sdílení proběhne v rámci kliknutí
      const ready = this.challengeUrl(App, { lv: lv.id, st: stars | 0 }).then(u => {
        url = u; if (inp) inp.value = u;
        if (gift) gift.hidden = !u.includes('pozvanka=');
        return u;
      }).catch(() => null);
      const copy = async () => {
        const u = url || await ready || SITE;
        let ok = false;
        try { await navigator.clipboard.writeText(text() + '\n' + u); ok = true; } catch (e) {
          if (inp) { inp.value = u; inp.select(); try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } }
        }
        App.toast(ok ? t('inv_copied') : u);
        if (window.Stat) try { Stat.ev('vyzva_copy', { p: where }); } catch (e) { /* nic */ }
      };
      card.querySelector('[data-vy-copy]').addEventListener('click', copy);
      if (inp) inp.addEventListener('focus', () => inp.select());
      card.querySelector('[data-vy-share]').addEventListener('click', async () => {
        const u = url || await ready || SITE;
        if (navigator.share) {
          try { await navigator.share({ title: 'Castle WARS', text: text(), url: u }); if (window.Stat) try { Stat.ev('vyzva_share', { p: where }); } catch (e) { /* nic */ } return; }
          catch (e) { if (e && e.name === 'AbortError') return; }
        }
        copy();
      });
    },
    /* do okna s výsledkem bitvy (main.js): jen vítězství v příběhu, ne online, ne na portálu */
    victoryCardHtml(App, cfg, res, stars) {
      if (portal() || !res || !res.win || cfg.mode !== 'campaign' || cfg.net || cfg.coop || !cfg.level || cfg.film) return '';
      App.save.vyDay = this._today();   // ten den už se karta na domovské obrazovce neukáže
      return this.vyCardHtml(cfg.level, stars, 'win');
    },
    bindVictoryCard(App, root, cfg, stars) {
      if (!cfg || !cfg.level || !root.querySelector('[data-vy-card]')) return;
      App.persist();
      this.bindVyCard(App, root, cfg.level, stars);
      if (window.Stat) try { Stat.ev('vyzva_card', { p: 'win' }); } catch (e) { /* nic */ }
    },
    /* domovská obrazovka: nejvýš jednou denně, jen hráčům, kteří už pár úrovní porazili */
    homeChallenge(App) {
      const s = App.save;
      if (portal() || this._homeVyAt || !s || s.vyDay === this._today()) return;
      const H = G.campaignHelpers, cleared = s.campaign && s.campaign.cleared ? s.campaign.cleared : {};
      if (Object.keys(cleared).filter(k => cleared[k]).length < 2 || ((s.stats && s.stats.wins) || 0) < 3) return;
      const all = H.allLevels().filter(l => cleared[l.id] && !l.alliance);
      const lv = (s.vyLast && cleared[s.vyLast] && H.find(s.vyLast)) || all[all.length - 1];
      if (!lv) return;
      this._homeVyAt = Date.now();
      let tries = 0, free = true;
      const show = () => {
        if (App.current !== 'hrad' || App.battle || s.vyDay === this._today()) { this._homeVyAt = 0; return; }   // jindy znovu
        // jiné okno (denní odměna, registrace…) nebo tutoriál: počkat, až hráč skončí
        const busy = !s.lang || (window.Tutorial && Tutorial.active) || !document.getElementById('modal').hidden;
        if (busy || !free) { free = !busy; if (++tries < 60) setTimeout(show, 2000); else this._homeVyAt = 0; return; }
        s.vyDay = this._today(); App.persist();
        const st = (s.campaign.stars && s.campaign.stars[lv.id]) || 0;
        App.modal(`${this.vyCardHtml(lv, st, 'home')}<div class="modal-actions"><button class="btn" data-close>${t('vy_later')}</button></div>`, c => this.bindVyCard(App, c, lv, st));
        if (window.Stat) try { Stat.ev('vyzva_card', { p: 'home' }); } catch (e) { /* nic */ }
      };
      setTimeout(show, 6000);
    },

    /* ---------- výzva: bitva proti hradu kamaráda ---------- */
    /* úroveň příběhu z výzvy (kamarád ji porazil a posílá ji dál) */
    _lvOf(o) { const H = G.campaignHelpers; return o && typeof o.lv === 'string' && H && H.find ? H.find(o.lv) : null; },
    _lvName(lv) { return `${lv.label} ${lv.name}`; },
    _starsTxt(n) { n = n | 0; return n > 0 ? ' ' + '★'.repeat(Math.min(3, n)) : ''; },
    startChallenge(App, o) {
      const lv = this._lvOf(o);
      if (lv) {   // stejná nepřátelská armáda jako v úrovni příběhu; postup v příběhu se nemění
        const EF = G.factions[lv.enemy] || G.factions.kralovstvi;
        return App.pickArmy(pf => App.startBattle({ playFaction: pf,
          mode: 'vyzva', title: `${t('vy_title')}: ${this._lvName(lv)}`, difficulty: lv.diff, enemyUnits: lv.enemyUnits,
          enemyFaction: lv.enemy, theme: lv.theme || EF.theme, enemyName: lv.name,
          enemyCastleSkin: lv.castleSkin, enemyUnitSkin: lv.unitSkin, enemyCastleLevel: Math.round(lv.diff * 4),
          boss: typeof lv.boss === 'string' ? lv.boss : null,
          ...(lv.megaCastle ? { enemyCastleStyle: 'peklo3', enemyCastleHpMult: 1.5, world: { worldW: G.battleConfig.worldW + 640 } } : {}),
          level: lv, challenge: o }));
      }
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
      const lv = this._lvOf(o);
      if (lv) {
        App.modal(`<div class="eyebrow">${t('vy_title')}</div><h2>⚔️ ${t('vy_recv', { name: esc(o.n) })}</h2>
          <p>${t('vy_recv_lv', { name: '<b>' + esc(o.n) + '</b>', lv: '<b>' + esc(this._lvName(lv)) + '</b>', s: this._starsTxt(o.st) })}</p>
          <div class="modal-actions"><button class="btn btn-gold" id="vyGo">${t('vy_accept')}</button><button class="btn" data-close>${t('vy_later')}</button></div>`, (c, close) => {
          c.querySelector('#vyGo').addEventListener('click', () => { close(); this.startChallenge(App, o); });
        });
        return;
      }
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
        // stará pozvánka (v138), zapsaná už dřív: pozvaný ji dokončí první výhrou
        if (save.refDone && !save.refWon) Ucet.refWin().then(g => {
          save.refWon = 1;
          if (g > 0) { save.gems += g; App.persist(); App.toast(L(`Dárek za pozvánku od kamaráda: +${g} drahokamů!`, `Friend invite gift: +${g} gems!`)); }
          else App.persist();
        }).catch(() => {});
      }
      if (cfg.mode === 'vyzva' && cfg.level && cfg.challenge) out.note = res.win
        ? t('vy_won', { lv: '<b>' + esc(this._lvName(cfg.level)) + '</b>', name: '<b>' + esc(cfg.challenge.n) + '</b>' })
        : t('vy_lost', { lv: '<b>' + esc(this._lvName(cfg.level)) + '</b>' });
      else if (cfg.mode === 'vyzva') out.note = res.win
        ? L(`Porazil jsi hrad hráče <b>${esc(cfg.enemyName)}</b>! Pošli mu výsledek a vyzvi ho na odvetu.`, `You beat <b>${esc(cfg.enemyName)}</b>'s castle! Send them the result and challenge them back.`)
        : L(`<b>${esc(cfg.enemyName)}</b> tě tentokrát porazil. Zkus to znovu, nebo ho vyzvi ty.`, `<b>${esc(cfg.enemyName)}</b> won this time. Try again or challenge them yourself.`);
      return out;
    },

    /* ---------- domovská obrazovka: vyzvednout odměny (jednou za spuštění) ---------- */
    _homeDone: false,
    async home(App) {
      if (this._homeDone || portal() || !net()) return; this._homeDone = true;
      const save = App.save;
      /* dobíhání starých pozvánek (v138): jen hráč, který si tehdy vytvořil kód, nebo ještě na někoho čeká */
      if (ls.get('cw-mycode') || save.refCount || save.refWaiting) {
        try {
          const r = await Ucet.refClaim();
          if (r) {
            save.refCount = r.total || 0; save.refWaiting = r.waiting || 0;
            if (r.gems > 0) { save.gems += r.gems; App.toast(L(`Tví přátelé hrají! Odměna za pozvánky: +${r.gems} drahokamů`, `Your friends are playing! Invite reward: +${r.gems} gems`)); }
            this.checkPet(App);
            App.persist();
          }
        } catch (e) { this._homeDone = false; return; }
      }
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

    /* ---------- exkluzivní mazlíček Posel: odemknout natrvalo při 5 odměněných pozvánkách ---------- */
    checkPet(App) {
      const save = App && App.save, P = G && G.pets && G.pets.find(p => p.id === 'posel');
      if (!save || !P || (save.petsOwned || []).includes('posel')) return false;
      if ((save.refCount || 0) + (save.pozviRewarded || 0) < REF_PET) return false;
      save.petsOwned = (save.petsOwned || []).concat('posel');
      App.persist();
      setTimeout(() => App.toast(window.t ? t('inv_pet_got', { pet: P.name }) : P.name), 2500);
      return true;
    },

    /* ---------- okno Přátelé (výzva + natáčení; pozvánka je v js/ui/pozvi.js) ---------- */
    async openFriends(App) {
      App.modal(`<div class="eyebrow">${L('Přátelé', 'Friends')}</div><h2>${L('Hraj s přáteli', 'Play with friends')}</h2>
        ${portal() ? '' : `<section class="sh-box">
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
      /* starý odkaz ?ref= (v138) se jen tiše odstraní – nové staré pozvánky se nezapisují */
      const ref = q.get('ref');
      const vy = q.get('vyzva') ? b64d(q.get('vyzva')) : null;
      if (ref != null || vy) { try { const u = new URL(location.href); u.searchParams.delete('ref'); u.searchParams.delete('vyzva'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) { /* nic */ } }
      try { localStorage.removeItem('cw-ref'); } catch (e) { /* nic */ }
      setTimeout(() => this.checkPet(App), 3000);
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
