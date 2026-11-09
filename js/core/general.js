/* =========================================================================
   NEPŘÁTELSKÝ GENERÁL – UMĚLÁ INTELIGENCE
   Nahrazuje původní jednoduchou mysl počítače (Battle._ai) ve všech režimech.

   ARCHITEKTURA
   - Osobnost (PERSONAS): povahové rysy 0–1 (agrese, trpělivost, lstivost,
     opatrnost, učenlivost, kázeň, hrdinství, kouzla) + oblíbené plány
     a složení armády. Každý generál má vlastní styl i hlášky.
   - Dovednost (skill 0–1): rychlost reakce, přesnost odhadu, počet tahů
     dopředu, chyby, kontrování složení armády, ovládání generála.
   - VNÍMÁNÍ – vidí jen to, co je na bojišti vidět (vojáky, hrady, použité
     útoky). Nečte mince ani balíček hráče, nemá zdroje navíc (stejný příjem).
   - PLÁNY – každý plán je malý stavový automat (sbírat → udeřit, léčka,
     držení středu, obléhání, nájezd, čekání na kouzlo, obrana…). Mozek je
     hodnotí podle osobnosti, situace a PAMĚTI hráče a drží se jich
     (žádné cukání sem a tam), ale umí je změnit, když selhávají.
   - PAMĚŤ – po každé bitvě si (postupně, klouzavým průměrem) zapamatuje,
     jak hráč hraje: agresivita, brzké útoky, ústupy, oblíbená kouzla,
     složení armády, ovládání hrdiny. Příště na to reaguje.
   - CHYBY – podle kázně a dovednosti občas zaváhá, přežene útok nebo
     vybere horší jednotku, aby nepůsobil jako stroj.
   - GENERÁL NA BOJIŠTI (věž, souboje): sedí ve věži hradu, sleduje bitvu
     a komentuje ji; v rozhodující chvíli vyjde ven a bojuje sám – vybírá
     cíle, uhýbá šípům, kryje se štítem, vyráží do výpadů, ustupuje
     za hradby se vyléčit a vrací se.
   ========================================================================= */
(function () {
  if (!window.Battle) return;
  const P = Battle.prototype;
  const C = () => GameData.battleConfig;
  const US = () => C().unitScale || 1;
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const MEM_KEY = 'cw-ai-mem-v1';

  /* ---------------- OSOBNOSTI ---------------- */
  const PERSONAS = {
    berserk:  { cs: 'Zuřivec', en: 'Berserker', aggr: 0.95, pat: 0.15, cun: 0.2, caut: 0.1, adapt: 0.3, disc: 0.45, hero: 0.95, magic: 0.3,
      plans: { rush: 3, mass: 1.5, center: 1 }, roles: { pech: 2, tezka: 2, jizda: 1.5 }, skills: ['roh', 'ohen', 'kletba'] },
    strateg:  { cs: 'Stratég', en: 'Strategist', aggr: 0.55, pat: 0.6, cun: 0.6, caut: 0.5, adapt: 0.8, disc: 0.85, hero: 0.5, magic: 0.6,
      plans: { mass: 2, center: 2, skillbait: 1.5, ambush: 1 }, roles: { strelec: 1, kopi: 1 }, skills: ['ohen', 'stit', 'led'] },
    liska:    { cs: 'Liška', en: 'The Fox', aggr: 0.5, pat: 0.65, cun: 0.95, caut: 0.55, adapt: 0.7, disc: 0.75, hero: 0.45, magic: 0.5,
      plans: { ambush: 3, raid: 2, skillbait: 1.5 }, roles: { jizda: 2, strelec: 1 }, skills: ['mraz', 'jed', 'salva'] },
    zed:      { cs: 'Kamenná zeď', en: 'Stone Wall', aggr: 0.3, pat: 0.9, cun: 0.5, caut: 0.75, adapt: 0.6, disc: 0.9, hero: 0.35, magic: 0.55,
      plans: { defend: 3, ambush: 1.5, siege: 1 }, roles: { kopi: 2, tezka: 1.5, strelec: 1 }, skills: ['stit', 'salva', 'oprava'] },
    lovec:    { cs: 'Lovec slabin', en: 'Weakness Hunter', aggr: 0.6, pat: 0.5, cun: 0.7, caut: 0.4, adapt: 1, disc: 0.8, hero: 0.6, magic: 0.5,
      plans: { mass: 1.5, raid: 1.5, skillbait: 2 }, roles: {}, skills: ['blesk', 'led', 'ohen'], counter: 1.6 },
    bourlivak:{ cs: 'Bouřlivák', en: 'Stormcaller', aggr: 0.55, pat: 0.55, cun: 0.5, caut: 0.45, adapt: 0.6, disc: 0.7, hero: 0.4, magic: 1,
      plans: { siege: 2, mass: 1.5, center: 1 }, roles: { mag: 2.5, strelec: 1.5 }, skills: ['bourka', 'blesk', 'meteor', 'vir'] },
    baron:    { cs: 'Jezdecký baron', en: 'Cavalry Baron', aggr: 0.8, pat: 0.35, cun: 0.6, caut: 0.3, adapt: 0.5, disc: 0.65, hero: 0.85, magic: 0.35,
      plans: { raid: 3, rush: 1.5, mass: 1 }, roles: { jizda: 3.5, tezka: 1 }, skills: ['roh', 'ohen'] },
    ostrel:   { cs: 'Ostřelovač', en: 'Marksman', aggr: 0.4, pat: 0.75, cun: 0.55, caut: 0.6, adapt: 0.6, disc: 0.85, hero: 0.3, magic: 0.55,
      plans: { siege: 3, defend: 1.5, center: 1 }, roles: { strelec: 3, kopi: 1.2 }, skills: ['ohnivesipy', 'salva', 'palba'] }
  };
  const PERSONA_IDS = Object.keys(PERSONAS);

  /* hlášky generála (osobnost mění tón) */
  const LINES = {
    intro: { cs: ['Tohle patro neopustíš.', 'Čekal jsem na tebe.', 'Ukaž, co umíš.', 'Moje hradby padly jen jednou. Nikdy znovu.'], en: ['You will not leave this floor.', 'I have been waiting for you.', 'Show me what you can do.', 'My walls fell only once. Never again.'] },
    sortie: { cs: ['Dost čekání – jdu si pro tebe!', 'Ustupte, tohle je můj boj!', 'Teď uvidíš skutečného velitele!', 'Za mnou, vojáci!'], en: ['Enough waiting – I am coming for you!', 'Stand aside, this fight is mine!', 'Now you will see a real commander!', 'Follow me, soldiers!'] },
    low: { cs: ['Ještě se uvidíme…', 'Ustupuji – ale vrátím se!', 'Zatím vyhráváš jen bitvu.'], en: ['We will meet again…', 'I fall back – but I will return!', 'For now you only win a battle.'] },
    back: { cs: ['Vracím se do boje!', 'Rány zahojeny. Pokračujeme.', 'Myslel sis, že jsem utekl?'], en: ['Back into the fight!', 'Wounds healed. We continue.', 'Did you think I ran away?'] },
    skill: { cs: ['To je všechno, co máš?', 'Kouzla ti nepomůžou.', 'Hezký ohňostroj. Teď je řada na mně.'], en: ['Is that all you have?', 'Magic will not save you.', 'Nice fireworks. My turn now.'] },
    retreat: { cs: ['Utíkáš? Za ním!', 'Couváš? Dobře, pronásledujte je!'], en: ['Running? After them!', 'Backing off? Chase them!'] },
    hero: { cs: ['Konečně se ukážeš osobně!', 'Souboj velitelů? Rád.', 'Ty sám? Odvážné.'], en: ['Finally you show yourself!', 'A duel of commanders? Gladly.', 'You, alone? Brave.'] },
    kill: { cs: ['Další!', 'Slabé.', 'Kdo je další?'], en: ['Next!', 'Weak.', 'Who is next?'] },
    ambush: { cs: ['Vlezl jsi do pasti!', 'Teď! Udeřte ze všech stran!'], en: ['You walked into my trap!', 'Now! Strike from all sides!'] },
    strike: { cs: ['Útok! Bez slitování!', 'Vpřed, rozdrťte je!', 'Dnes padne jejich hrad!'], en: ['Attack! No mercy!', 'Forward, crush them!', 'Today their castle falls!'] },
    castle: { cs: ['Hradby padají, ale já stojím!', 'Bráňte bránu!'], en: ['The walls crumble, but I stand!', 'Defend the gate!'] },
    down: { cs: ['Nemožné… porazil jsi mě…', 'Patro je tvoje… zatím.'], en: ['Impossible… you defeated me…', 'The floor is yours… for now.'] },
    again: { cs: ['Zase ty? Minule jsi prohrál.', 'Vrátil ses? Pamatuju si tvoje chyby.'], en: ['You again? You lost last time.', 'Back again? I remember your mistakes.'] }
  };

  /* ---------------- PAMĚŤ HRÁČE ---------------- */
  const Mem = {
    load() { try { return Object.assign(this.blank(), JSON.parse(localStorage.getItem(MEM_KEY) || '{}')); } catch (e) { return this.blank(); } },
    blank() { return { n: 0, aggr: 0.5, early: 0.3, retreat: 0.2, hero: 0.1, skillRate: 0.3, skills: {}, roles: {}, winRate: 0.5 }; },
    save(m) { try { localStorage.setItem(MEM_KEY, JSON.stringify(m)); } catch (e) { /* nic */ } }
  };
  window.GeneralMemory = Mem;

  /* ---------------- MOZEK ---------------- */
  function initBrain(B) {
    const o = B.o, G0 = o.general || {};
    const mem = Mem.load();
    let pid = G0.persona;
    if (!PERSONAS[pid]) {
      // bez zadané osobnosti: náhodná, ale ne stejná jako minule; učenlivější proti zkušenému hráči
      let last = null; try { last = localStorage.getItem('cw-ai-persona'); } catch (e) { /* nic */ }
      const pool = PERSONA_IDS.filter(x => x !== last);
      pid = pool[Math.floor(Math.random() * pool.length)];
      try { localStorage.setItem('cw-ai-persona', pid); } catch (e) { /* nic */ }
    }
    const per = PERSONAS[pid];
    const skill = clamp(G0.skill != null ? G0.skill : 0.25 + 0.35 * clamp(((o.difficulty || 1) - 0.6) / 1.2, 0, 1), 0.05, 1);
    const allowedSkills = (G0.skills || per.skills).filter(id => GameData.abilities[id]);
    const nSk = Math.max(1, Math.round(1 + skill * 2));
    const brain = {
      pid, per, skill, mem, name: G0.name || null,
      skills: o.noSkills ? [] : allowedSkills.slice(0, nSk),
      plan: null, planAt: 0, planData: {}, history: [],
      react: 1.6 - skill * 1.0,            // jak často přemýšlí (s)
      mistake: (1 - per.disc) * (1 - skill * 0.7) * 0.35,
      waveN: Math.round(4 + skill * 4 + per.pat * 3 - per.aggr * 2),
      obs: { utokT: 0, totT: 0, early: false, retreats: 0, skills: {}, hero: false, lastSkillAt: -999, lastForm: 'utok' },
      lastAttack: 0, lastSay: -99, lastTaunt: {}, sayQ: null,
      // ÚVODNÍ FÁZE: nejdřív staví armádu a zaujímá pozice, útočí až potom
      openUntil: 45 + per.pat * 40 - per.aggr * 10 + Math.random() * 15
    };
    B.brain = brain;
    B.ai.decide = 0;
    return brain;
  }

  /* vnímání: jen viditelné věci na bojišti */
  function perceive(B) {
    const cfg = C(), E = B.side.enemy, front = E.castle.front;
    const foes = [], mine = [];
    for (const u of B.units) { if (u.dead) continue; (u.team === 'player' ? foes : mine).push(u); }
    const val = u => (u.hp / u.maxHp) * (u.def.cost || 50) * (u.gen ? 2.5 : 1);
    const myP = mine.reduce((a, u) => a + val(u), 0), foeP = foes.reduce((a, u) => a + val(u), 0);
    const roles = {}; foes.forEach(u => { roles[u.def.roleKey] = (roles[u.def.roleKey] || 0) + 1; });
    const foeFront = foes.length ? Math.max(...foes.map(u => u.x)) : cfg.playerFront;
    return {
      foes, mine, nMine: mine.filter(u => !u.gen).length, myP, foeP,
      ratio: foeP > 0 ? myP / foeP : 99,
      roles, foeFront,
      atGate: foes.filter(u => front - u.x < 900).length,
      underTowers: foes.filter(u => front - u.x < 420).length,
      foesPastMid: foes.filter(u => u.x > B.cp.x).length,
      myHp: E.castle.hp / E.castle.maxHp,
      foeHp: B.side.player.castle.hp / B.side.player.castle.maxHp,
      playerForm: B.side.player.formation,
      cpOwner: B.cp.owner
    };
  }

  /* skóre plánů – osobnost + situace + paměť hráče */
  function scorePlans(B, br, S) {
    const per = br.per, m = br.mem, ad = per.adapt * Math.min(1, m.n / 4);
    const w = Object.assign({ mass: 1, rush: 0.6, center: 0.8, ambush: 0.5, siege: 0.6, raid: 0.5, skillbait: 0.5, defend: 0.5 }, {});
    for (const k in per.plans) w[k] = (w[k] || 0) + per.plans[k];
    // paměť: agresivní hráč → léčky a obrana; pasivní → obléhání a velké vlny
    w.ambush += ad * (m.aggr - 0.5) * 3 + ad * m.early * 1.5;
    w.defend += ad * (m.aggr - 0.5) * 2;
    w.siege += ad * (0.5 - m.aggr) * 3;
    w.mass += ad * (0.5 - m.aggr) * 2;
    w.rush += ad * m.retreat * 2.5;          // často couvá → tlačit
    w.skillbait += ad * m.skillRate * 3;     // spoléhá na kouzla → počkat, až je použije
    w.raid += ad * (m.aggr - 0.4) * 2;       // hráč chodí daleko → nájezd na prázdný hrad
    // situace
    if (S.myHp < 0.5) { w.defend += 1.5; w.ambush += 1; }
    if (S.foeHp < 0.4) { w.rush += 2; w.mass += 1; }
    if (S.ratio > 1.4) { w.rush += 1.5; w.mass += 1; }
    if (S.ratio < 0.7) { w.defend += 1; w.ambush += 1; }
    if (!br.skills.length) w.skillbait = 0;
    if (B.time < 20) w.rush *= per.aggr > 0.7 ? 1.4 : 0.6;
    // neopakovat stejný plán pořád dokola
    const last = br.history[br.history.length - 1];
    if (last && w[last]) w[last] *= 0.55;
    for (const k in w) w[k] = Math.max(0.05, w[k]);
    return w;
  }
  function pickWeighted(w, temp) {
    const ks = Object.keys(w);
    const ex = ks.map(k => Math.pow(w[k], 1 / Math.max(0.2, temp)));
    let r = Math.random() * ex.reduce((a, b) => a + b, 0);
    for (let i = 0; i < ks.length; i++) { if ((r -= ex[i]) <= 0) return ks[i]; }
    return ks[0];
  }

  /* ---------------- HLAVNÍ SMYČKA NEPŘÍTELE ---------------- */
  P._ai = function (dt) {
    const B = this, E = B.side.enemy, ai = B.ai;
    const br = B.brain || initBrain(B);
    ai.think -= dt;
    // sledování hráče (každý snímek levně)
    const ob = br.obs, pf = B.side.player.formation;
    ob.totT += dt; if (pf === 'utok') ob.utokT += dt;
    if (pf === 'ustup' && ob.lastForm !== 'ustup') { ob.retreats++; if (B.genU) say(B, 'retreat'); }
    ob.lastForm = pf;
    if (B.hero && !ob.hero) { ob.hero = true; if (B.genU) say(B, 'hero'); }
    if (ai.think > 0) return;
    ai.think = 0.4;
    // nábor vojáků
    recruit(B, br);
    // obléhání: čím déle bitva trvá, tím víc mincí (stejné jako dřív, žádné zdroje navíc)
    E.income = E.baseIncome * Math.min(2.5, 1 + B.time / 300);
    ai.decide = (ai.decide || 0) - 0.4;
    if (ai.decide > 0) return;
    ai.decide = br.react + (Math.random() < br.mistake ? 1.5 + Math.random() * 2 : 0);   // občas zaváhá
    const S = perceive(B);
    if (!ob.early && B.time < 40 && S.foesPastMid >= 3) ob.early = true;
    decide(B, br, S);
    useSkills(B, br, S);
    if (B.genPlan) B.genPlan(S);
  };

  function recruit(B, br) {
    const ai = B.ai;
    const allowed = (B.o.enemyUnits && B.o.enemyUnits.length) ? B.o.enemyUnits : ['pesak'];
    if (!ai.next || !allowed.includes(ai.next)) ai.next = pickUnit(B, br, allowed);
    // šetří mince na kouzlo, když ho chce brzy použít
    const reserve = br.saving && br.saving > B.time ? (GameData.abilities[br.saveFor] || {}).cost || 0 : 0;
    if (B.side.enemy.coins - GameData.units[ai.next].cost >= reserve && B.canSpawn('enemy', ai.next).ok) {
      B.spawn('enemy', ai.next); ai.next = null;
    }
  }
  /* výběr jednotky: kontruje složení hráčovy armády (podle dovednosti), osobnost přidává oblíbené */
  function pickUnit(B, br, allowed) {
    const foes = B.units.filter(u => u.team === 'player' && !u.dead);
    const role = r => foes.filter(u => u.def.roleKey === r).length;
    const w = { pech: 3, strelec: 2.5, kopi: 2, tezka: 1.6, jizda: 1.5, mag: 1.2, velitel: 0.6 };
    const k = br.skill * (br.per.counter || 1);
    if (role('strelec') + role('mag') >= 3) { w.jizda += 3 * k; w.tezka += 2 * k; }
    if (role('tezka') + role('jizda') >= 2 || foes.some(u => u.def.boss)) w.kopi += 4 * k;
    if (role('pech') >= 4) { w.strelec += 3 * k; w.mag += 1.5 * k; }
    if (role('kopi') >= 3) { w.strelec += 2 * k; w.pech += 1.5 * k; }
    // paměť: hráč má rád jízdu → víc kopiníků atd. (postupně)
    const mr = br.mem.roles || {}, ad = br.per.adapt * Math.min(1, br.mem.n / 4);
    if ((mr.jizda || 0) > 0.18) w.kopi += 2 * ad;
    if ((mr.strelec || 0) > 0.3) w.jizda += 2 * ad;
    for (const r in br.per.roles) w[r] = (w[r] || 1) + br.per.roles[r];
    const plan = br.plan;
    if (plan === 'raid') w.jizda = (w.jizda || 1) + 3;
    if (plan === 'siege') w.strelec += 2;
    if (plan === 'rush') w.pech += 2;
    const pool = allowed.map(id => [id, Math.max(0.2, w[(GameData.units[id] || {}).roleKey] || 1)]);
    if (Math.random() < br.mistake) return allowed[Math.floor(Math.random() * allowed.length)];   // chyba: horší volba
    const sum = pool.reduce((a, [, x]) => a + x, 0);
    let r = Math.random() * sum;
    for (const [id, x] of pool) { if ((r -= x) <= 0) return id; }
    return allowed[0];
  }

  /* rozhodování: plán → postoj armády
     Armáda má HLAVNÍ SÍLU (drží pozici podle plánu: shromaždiště, hradby, střed,
     posouvající se fronta) a ÚTOČNÉ VLNY (oddíl, který jde na hráče a po ztrátách
     se vrátí). Plný útok všemi silami jen při převaze nebo na dorážku hradu,
     a vždy jen na omezenou dobu – pak se armáda přeskupí. */
  function decide(B, br, S) {
    const cfg = C(), E = B.side.enemy, front = E.castle.front, per = br.per;
    br.opening = B.time < br.openUntil;
    br.allowEarly = S.underTowers >= 2;          // když mu hráč vleze pod hradby, brání se i v úvodu
    if (br.opening) br.lastAttack = B.time;
    const since = B.time - br.planAt;
    const D = br.planData;
    const mineU = () => B.units.filter(u => u.team === 'enemy' && !u.dead && !u.gen);
    const news = (key, cs, en) => announce(B, br, key, L(cs, en));
    const setPlan = p => {
      br.plan = p; br.planAt = B.time; br.history.push(p); if (br.history.length > 6) br.history.shift();
      br.planData = {}; endWave(B, br);
      if (p === 'center') news('center', 'Nepřítel obsazuje střed bojiště', 'The enemy moves to take the center');
      else if (p === 'defend') news('defend', 'Nepřítel se opevňuje u hradeb', 'The enemy digs in at its walls');
      else if (p === 'siege') news('siege', 'Nepřítel postupuje krok za krokem', 'The enemy advances step by step');
      else if (p === 'mass') news('mass', 'Nepřítel shromažďuje armádu', 'The enemy is massing its army');
    };
    const replan = () => setPlan(pickWeighted(scorePlans(B, br, S), 0.7 + (1 - br.skill)));
    if (!br.plan) replan();
    const plan = br.plan;
    // vyhodnocení běžící vlny / plného útoku (konec podle ztrát a času – NE podle toho, že hráč zaútočil)
    if (br.wave) {
      const W = br.wave, alive = W.ids.filter(id => B.units.some(u => u.id === id && !u.dead)).length;
      const lost = 1 - alive / Math.max(1, W.ids.length);
      const dur = B.time - W.at;
      const pcHp = B.side.player.castle.hp / B.side.player.castle.maxHp;
      const winning = pcHp < W.pcHp - 0.08 || S.ratio > 1.4;
      if (lost > 0.65 || alive <= 1 || (dur > W.max && !winning) || dur > W.max * 2) {
        endWave(B, br);
        br.lastAttack = B.time;
        br.regroupUntil = B.time + 6 + per.pat * 8;
        news('regroup', 'Nepřítel se stahuje a přeskupuje', 'The enemy pulls back to regroup');
      }
    }
    const waveReady = n => !br.wave && S.nMine >= Math.max(4, n) && B.time > (br.regroupUntil || 0) && (!br.opening || br.allowEarly);
    let hold = 'gather';   // kde stojí hlavní síla: gather | center | walls | creep
    switch (plan) {
      case 'rush':          // časté menší vlny, hlavní síla drží střed
        hold = 'center';
        if (waveReady(3)) launchWave(B, br, 0.75, 22 + per.aggr * 10);
        if (since > 90) replan();
        break;
      case 'mass':          // velká vlna, která roste
        hold = S.atGate ? 'walls' : 'gather';
        if (waveReady(br.waveN)) { launchWave(B, br, 1, 35 + per.aggr * 15); br.waveN = Math.min(18, br.waveN + 2); }
        if (since > 120 && !br.wave) replan();
        break;
      case 'center':        // drží střed, vlny pouští jen když střed drží
        hold = S.nMine >= 2 ? 'center' : (S.atGate ? 'walls' : 'gather');
        if (S.cpOwner === 'enemy' && waveReady(6) && S.ratio > 1.05) launchWave(B, br, 0.6, 30);
        if (since > 100 && !br.wave) replan();
        break;
      case 'ambush': {      // návnada vyláká hráče pod věže, pak protiúder
        hold = 'walls';
        if (!D.bait && !br.wave && S.nMine >= 4 && !br.opening) {
          const cheap = mineU().sort((a, b) => a.def.cost - b.def.cost).slice(0, 2 + Math.round(br.skill));
          cheap.forEach(u => (u.esq = true)); B.esquad = { mode: 'utok', flagX: 0 }; D.bait = B.time;
        }
        if (D.bait && !D.sprung && B.esquad && B.time - D.bait > 12) B.esquad = { mode: 'formace', flagX: front - 300 };   // návnada couvá a táhne hráče za sebou
        if (!D.sprung && (S.underTowers >= 2 || (S.atGate >= 4 && S.ratio > 0.8))) { D.sprung = true; endWave(B, br); say(B, 'ambush'); news('ambush', 'Léčka! Nepřítel udeřil ze zálohy', 'Ambush! The enemy strikes from cover'); launchWave(B, br, 1, 25, true); }
        if (!D.sprung && since > 60) { D.sprung = true; endWave(B, br); launchWave(B, br, 1, 30); }   // na léčku hráč neskočil → útok stejně
        if (D.sprung && !br.wave) replan();
        break;
      }
      case 'siege':         // fronta se pomalu posouvá, na konci útok
        hold = S.nMine >= 3 ? 'creep' : (S.atGate ? 'walls' : 'gather');
        D.creep = D.creep == null ? front - 420 : D.creep;
        if (hold === 'creep' && !br.wave) D.creep -= S.ratio >= 0.8 ? 45 : S.ratio < 0.5 ? -40 : 10;
        D.creep = clamp(D.creep, cfg.playerFront + 420, front - 300);
        if (D.creep < cfg.playerFront + 800 && waveReady(4)) launchWave(B, br, 1, 40, true);
        if (D.sprungAt == null && br.wave) D.sprungAt = B.time;
        if (D.sprungAt != null && !br.wave) replan();
        break;
      case 'raid': {        // jízda na hráčův hrad, když jeho armáda odešla
        hold = S.atGate ? 'walls' : 'center';
        const fast = mineU().filter(u => u.def.roleKey === 'jizda' || u.def.speed > 80);
        if (!br.wave && fast.length >= 2 && (S.foesPastMid >= 3 || since > 35) && B.time > (br.regroupUntil || 0)) launchWave(B, br, 0, 30, false, fast);
        if (since > 90 && !br.wave) replan();
        break;
      }
      case 'skillbait':     // čeká, až hráč použije kouzlo – pak má okno 2,5 min
        hold = S.atGate ? 'walls' : 'center';
        if (!D.probe && !br.wave && since > 30 && S.nMine >= 4) { D.probe = true; launchWave(B, br, 0.3, 18); }
        if (B.time - br.obs.lastSkillAt < 50 && waveReady(5)) { say(B, 'strike'); launchWave(B, br, 1, 35, true); D.go = true; }
        if ((D.go && !br.wave) || since > 110) replan();
        break;
      case 'defend':
      default:              // brání hradby pod věžemi, protiúder když se hráč zakousne
        hold = 'walls';
        if (S.underTowers >= 3 && S.ratio > 0.85 && waveReady(4)) { news('counter', 'Nepřítel vyráží do protiútoku', 'The enemy launches a counterattack'); launchWave(B, br, 1, 25, true); }
        if (since > 80 && !br.wave) replan();
    }
    // dorážka: hráčův hrad je skoro zničený a mám převahu → všechno do útoku
    if (!br.wave && S.foeHp < 0.3 && S.ratio > 1.2 && S.nMine >= 4) launchWave(B, br, 1, 40, true);
    // ústup jen v krajní nouzi (drtivá přesila u brány), nejvýš jednou za 90 s, a brzy zpátky
    let retreat = false;
    if (per.caut > 0.45 && S.ratio < 0.25 && S.atGate >= 5 && S.nMine >= 3 && B.time - (br.retreatAt || -999) > 90) { br.retreatAt = B.time; endWave(B, br); if (window.Zvuk) Zvuk.play('horn', 0.6); }
    if (br.retreatAt && B.time - br.retreatAt < 8) retreat = true;
    // dlouho nic? (trpělivost) → aspoň útočná vlna, ať bitva nestojí
    const waitMax = 70 + per.pat * 50;
    if (!br.wave && !retreat && S.nMine >= 4 && B.time - br.lastAttack > waitMax && B.time > (br.regroupUntil || 0)) launchWave(B, br, 0.8, 30);
    // chyba: občas pošle vlnu předčasně
    if (!br.wave && Math.random() < br.mistake * 0.08 && S.nMine >= 3) launchWave(B, br, 0.5, 15);
    // v úvodu stojí armáda u svého hradu (nejvýš drží střed, když je ho majitelem)
    if (br.opening && !br.wave) hold = S.atGate ? 'walls' : 'gather';
    // provedení: hlavní síla drží pozici, vlna (oddíl) útočí
    br.stance = br.wave ? (br.wave.full ? 'strike' : 'wave') : retreat ? 'retreat' : hold;
    if (retreat) { E.formation = 'ustup'; B.esquad = null; }
    else if (br.wave && br.wave.full) E.formation = 'utok';
    else {
      E.formation = 'formace';
      E.flagX = hold === 'center' ? Math.max(cfg.playerFront + 400, B.cp.x + 60)
        : hold === 'walls' ? front - 260
        : hold === 'creep' ? (D.creep || front - 420) : front - 420;
    }
  }
  /* vypustí útočnou vlnu: podíl armády (0–1) nebo zadané jednotky; full = všichni včetně nových */
  function launchWave(B, br, share, maxDur, full, list) {
    if (br.opening && !br.allowEarly) return;
    const units = list || B.units.filter(u => u.team === 'enemy' && !u.dead && !u.gen);
    const pick = list ? units : units.slice().sort((a, b) => (b.hp / b.maxHp) - (a.hp / a.maxHp)).slice(0, Math.max(2, Math.ceil(units.length * share)));
    const all = full || share >= 1;
    B.units.forEach(u => { if (u.team === 'enemy') u.esq = false; });
    if (!all) { pick.forEach(u => (u.esq = true)); B.esquad = { mode: 'utok', flagX: 0 }; } else B.esquad = null;
    br.wave = { ids: pick.map(u => u.id), at: B.time, max: maxDur, full: all, pcHp: B.side.player.castle.hp / B.side.player.castle.maxHp };
    br.lastAttack = B.time;
    if (all) { say(B, 'strike'); announce(B, br, 'strike', L('Nepřítel útočí všemi silami!', 'The enemy attacks with everything!')); }
    else announce(B, br, 'wave', L('Útočná vlna nepřítele!', 'Enemy attack wave!'));
  }
  function endWave(B, br) {
    br.wave = null; B.esquad = null;
    B.units.forEach(u => { if (u.team === 'enemy') u.esq = false; });
  }
  /* krátké hlášení na bojišti, co nepřítel dělá (ať je jeho taktika vidět) */
  function announce(B, br, key, txt) {
    br.ann = br.ann || {};
    if (br.ann[key] && B.time - br.ann[key] < 30) return;
    if (B.time - (br.annLast || -99) < 5) return;
    br.ann[key] = B.time; br.annLast = B.time;
    B.texts.push({ x: B.cam.x + B.cam.viewW / 2, y: (B.H - B.cam.viewH) + B.cam.viewH * 0.3, txt, color: '#ff9e9e', t: 0, life: 2.2, big: true });
  }

  /* kouzla nepřítele: stejná pravidla jako hráč (mince, obnova 2,5 min) */
  function useSkills(B, br, S) {
    if (!br.skills.length || B.o.noSkills) return;
    // delší prodlevy: první kouzlo nejdřív po 60 s, mezi kouzly nepřítele aspoň 30 s
    if (B.time < 60 || B.time - (B._eSkillAt || -1e9) < 30) return;
    if (Math.random() > 0.35 + br.per.magic * 0.5) return;
    const E = B.side.enemy, cfg = C(), front = E.castle.front;
    const foes = S.foes.filter(u => !B._sheltered(u));
    const cluster = () => {
      if (!foes.length) return 0;
      const f = foes.slice().sort((a, b) => b.x - a.x)[0];   // nepřítel nejblíž mému hradu
      return foes.filter(u => Math.abs(u.x - f.x) < 170).length;
    };
    const need = Math.round(6 - br.skill * 3);
    for (const id of br.skills) {
      const a = GameData.abilities[id]; if (!a) continue;
      const st = B.abilityState('enemy', id);
      if (!st.ready) { if (st.cdLeft <= 0 && !st.affordable) { br.saving = B.time + 8; br.saveFor = id; } continue; }
      let use = false;
      switch (a.kind) {
        case 'meteors': case 'meteor': case 'element': case 'storm': case 'quake': case 'stun': case 'tornado': case 'holy': case 'wall':
          use = cluster() >= need; break;
        case 'volley': case 'barrage': case 'breath': case 'firearrows':
          use = S.underTowers >= Math.max(2, need - 2) || (a.kind === 'firearrows' && !!br.wave); break;
        case 'curse': case 'buff': use = !!br.wave && br.wave.ids.length >= 4; break;
        case 'shield': case 'heal': use = S.atGate >= 4 || B.units.filter(u => u.team === 'enemy' && !u.dead && u.hp < u.maxHp * 0.5).length >= 4; break;
        case 'repair': use = S.myHp < 0.55; break;
        case 'summon': use = S.atGate >= 3 || !!br.wave; break;
        case 'gold': use = true; break;
        default: use = cluster() >= need;
      }
      if (use && B.useAbility('enemy', id)) { br.saving = 0; B._eSkillAt = B.time; return; }
    }
  }

  /* hráč použil kouzlo – generál si to všimne (vidí to na bojišti) */
  const origUse = P.useAbility;
  P.useAbility = function (team, id) {
    const r = origUse.apply(this, arguments);
    if (r && team === 'player' && this.brain) {
      const ob = this.brain.obs; ob.lastSkillAt = this.time; ob.skills[id] = (ob.skills[id] || 0) + 1;
      if (this.genU && Math.random() < 0.6) say(this, 'skill');
    }
    return r;
  };
  /* podmínka „bez kouzel“ (patra věže) */
  const origAbState = P.abilityState;
  P.abilityState = function (team, id) {
    const s = origAbState.apply(this, arguments);
    if (this.o.noSkills) { s.ready = false; s.cdLeft = Math.max(s.cdLeft, 999); }
    return s;
  };

  /* ---------------- ODDÍL NEPŘÍTELE (návnada, nájezd) ---------------- */
  P.modeOf = function (u) {
    if (u.team === 'enemy' && u.esq && this.esquad) return this.esquad.mode;
    return u.squad && this.squad ? this.squad.mode : this.side[u.team].formation;
  };
  const origAssign = P._assignSlots;
  P._assignSlots = function (team) {
    if (team === 'enemy' && this.esquad) {
      const all = this.units.filter(u => u.team === 'enemy' && !u.dead && !u.controlled);
      this._assignList('enemy', all.filter(u => !u.esq), this.side.enemy.formation, this.side.enemy.flagX);
      this._assignList('enemy', all.filter(u => u.esq), this.esquad.mode, this.esquad.flagX || this.side.enemy.flagX);
      return;
    }
    return origAssign.call(this, team);
  };

  /* ---------------- PAMĚŤ PO BITVĚ ---------------- */
  P.aiRemember = function (res) {
    const br = this.brain; if (!br || this._remembered) return;
    this._remembered = true;
    const m = br.mem, ob = br.obs, a = 0.3;
    const ema = (old, v) => old + (v - old) * a;
    m.n = (m.n || 0) + 1;
    m.aggr = ema(m.aggr, ob.totT ? Math.min(1, ob.utokT / ob.totT) : 0.5);
    m.early = ema(m.early, ob.early ? 1 : 0);
    m.retreat = ema(m.retreat, Math.min(1, ob.retreats / 3));
    m.hero = ema(m.hero, ob.hero ? 1 : 0);
    const nSk = Object.values(ob.skills).reduce((x, y) => x + y, 0);
    m.skillRate = ema(m.skillRate, Math.min(1, nSk / Math.max(1, this.time / 150)));
    Object.keys(ob.skills).forEach(k => { m.skills[k] = ema(m.skills[k] || 0, 1); });
    const sent = (this.st && this.st.sent) || {}, tot = Object.values(sent).reduce((x, y) => x + y, 0) || 1;
    const roles = {}; Object.keys(sent).forEach(id => { const r = (GameData.units[id] || {}).roleKey; if (r) roles[r] = (roles[r] || 0) + sent[id] / tot; });
    ['pech', 'strelec', 'kopi', 'tezka', 'jizda', 'mag', 'velitel'].forEach(r => { m.roles[r] = ema(m.roles[r] || 0, roles[r] || 0); });
    m.winRate = ema(m.winRate, res && res.win ? 1 : 0);
    Mem.save(m);
  };

  /* ---------------- HLÁŠKY ---------------- */
  function say(B, key, force) {
    const br = B.brain; if (!br || !LINES[key]) return;
    if (!force && B.time - br.lastSay < 6) return;
    if (!force && br.lastTaunt[key] && B.time - br.lastTaunt[key] < 25) return;
    br.lastSay = B.time; br.lastTaunt[key] = B.time;
    const arr = LINES[key][(window.I18N && I18N.lang === 'cs') ? 'cs' : 'en'];
    const custom = B.o.general && B.o.general.lines && B.o.general.lines[key];
    const txt = custom && Math.random() < 0.7 ? custom : arr[Math.floor(Math.random() * arr.length)];
    br.sayQ = { txt, t: B.time, life: 3.2 };
  }

  /* ======================================================================
     GENERÁL NA BOJIŠTI
     ====================================================================== */
  /* volá se z mozku: kdy vyjít z věže, kdy se vrátit */
  P.genPlan = function (S) {
    const G = this.o.general; if (!G || !G.field) return;
    const br = this.brain, g = this.genState || (this.genState = { inTower: true, hpK: 1, outs: 0, introAt: null });
    if (g.dead) return;
    if (g.introAt == null) { g.introAt = this.time; say(this, G.rival ? 'again' : 'intro', true); }
    if (g.inTower) {
      g.hpK = Math.min(1, g.hpK + 0.04 * br.react);           // ve věži se léčí
      const per = br.per;
      const decisive = S.myHp < 0.62 || (br.wave && br.wave.ids.length >= 4 + Math.round((1 - per.hero) * 4)) || S.underTowers >= 4
        || (this.hero && S.atGate) || this.time > 150 - per.hero * 90 || (G.early && this.time > 8);
      if (decisive && g.hpK > 0.8 && this.time - (g.backAt || -99) > 10) this._genSortie(g.outs ? 'back' : 'sortie');
    }
  };
  P._genSortie = function (line) {
    const G = this.o.general, g = this.genState, E = this.side.enemy, cfg = C();
    const uid = G.unit && GameData.units[G.unit] ? G.unit : GameData.factions[E.faction] ? GameData.factions[E.faction].roles.velitel || 'velitel' : 'velitel';
    if (!this.spawn('enemy', uid, true)) return;
    const u = this.units[this.units.length - 1];
    const base = GameData.units[uid];
    const key = 'gen_' + (G.id || uid);
    const def = this._genDef || (this._genDef = Object.assign({}, base, { id: key, name: G.name || base.name, cost: 400, boss: false, aura: true,
      look: Object.assign({}, base.look, { scale: (base.look.scale || 1) * 1.24 }) }));
    u.def = def; u.drawDef = def;
    const k = G.power || 1;
    u.maxHp = base.hp * E.hpMult * (4 + 5 * k); u.hp = u.maxHp * g.hpK; u.dmg = base.dmg * E.dmgMult * (1.5 + k);
    u.armorBonus = 0.1 + 0.15 * k;
    u.gen = { st: 'fight', react: 0, blockT: 0, blockCd: 0, chargeCd: 4, cryCd: 8, evade: 0.15 + 0.35 * (G.skill || this.brain.skill), dodgeY: 0 };
    u.controlled = true;   // řídí ho jeho vlastní mysl, ne šik
    u.x = E.castle.front - 30; u.y = (cfg.laneTop + cfg.laneBottom) / 2;
    g.inTower = false; g.outs++;
    this.genU = u;
    this.vfx.pillar(u.x, u.y, 80, 'rgba(255,90,70,.6)', 1.1); this.vfx.rise(u.x, u.y, 'fire', 16);
    if (window.Zvuk) Zvuk.play('horn', 0.8);
    say(this, line, true);
  };
  /* uhnutí šípu – šance podle dovednosti generála */
  P._genEvade = function (u) {
    if (!u.gen || Math.random() > u.gen.evade) return false;
    u.gen.dodgeY = (Math.random() < 0.5 ? -1 : 1) * 36;
    this.texts.push({ x: u.x, y: u.y - 120 * US(), txt: L('Uhnul!', 'Dodged!'), color: '#9fd4ff', t: 0, life: 0.7 });
    return true;
  };
  P._genDown = function (u) {
    const g = this.genState; if (!g) return;
    g.dead = true; this.genU = null;
    this.st.genKilled = true;
    say(this, 'down', true);
    this.vfx.explosion(u.x, u.y - 40, 140, 'fire'); this.shake = Math.max(this.shake, 0.6);
    // morálka: armáda bez velitele slábne
    this.side.enemy.dmgMult *= 0.85; this.side.enemy.baseIncome *= 0.75;
    this.texts.push({ x: u.x, y: u.y - 150 * US(), txt: L('Generál padl!', 'The general has fallen!'), color: '#ffd77a', t: 0, life: 2.4, huge: true });
  };

  /* chování generála každý snímek – jako člověk s ovladačem */
  P._updateGeneral = function (u, dt, slowK) {
    const cfg = C(), E = this.side.enemy, g = u.gen, br = this.brain, per = br.per;
    const front = E.castle.front;
    const sp = u.def.speed * (cfg.speedScale || 1) * (slowK || 1) * 1.1;
    if (u.stunUntil > this.time) { u.moving = false; return; }
    if (u.atkTimer > 0) u.atkTimer -= dt;
    g.blockCd -= dt; g.chargeCd -= dt; g.cryCd -= dt;
    if (g.blockT > 0) { g.blockT -= dt; u.blocking = g.blockT > 0; } else u.blocking = false;
    // průběh útoku
    if (u.atk >= 0) {
      u.atk += dt / u.atkDur;
      if (!u.hitDone && u.atk >= (u.def.ranged ? 0.6 : 0.55)) { u.hitDone = true; this._genStrike(u); }
      if (u.atk >= 1) u.atk = -1;
      return;
    }
    if (u.blocking) { u.moving = false; return; }
    // reakční doba (lidská): rozhoduje se v krátkých intervalech, mezi tím pokračuje
    g.react -= dt;
    if (g.react <= 0) {
      g.react = 0.25 + (1 - br.skill) * 0.5 + Math.random() * 0.2;
      const foes = this.units.filter(e => e.team === 'player' && !e.dead && !this._sheltered(e));
      const allies = this.units.filter(e => e.team === 'enemy' && !e.dead && !e.gen && Math.abs(e.x - u.x) < 260).length;
      const near = foes.filter(e => Math.hypot(e.x - u.x, (e.y - u.y) * 1.4) < 160);
      const hpK = u.hp / u.maxHp;
      const danger = near.reduce((a, e) => a + (e.def.cost || 50), 0) / Math.max(1, (u.def.cost || 400) * (0.6 + allies * 0.25));
      // ÚSTUP: málo životů nebo obklíčení (opatrnost určuje práh), lehkomyslný zuřivec riskuje
      const lowAt = 0.22 + per.caut * 0.25;
      if (g.st !== 'retreat' && (hpK < lowAt || (danger > 2.6 - per.aggr && hpK < 0.6))) { g.st = 'retreat'; say(this, 'low'); }
      if (g.st === 'retreat') {
        g.goal = { x: front + 60, y: u.y };
        if (this._sheltered(u) || u.x > front + 20) {
          // schová se ve věži, vyléčí se a později se vrátí
          this.genState.inTower = true; this.genState.hpK = hpK; this.genState.backAt = this.time;
          u.dead = 1.19; u.hp = 0; this.genU = null; return;
        }
      } else {
        // CÍL: osobnost určuje, koho loví (lovec slabin → střelci a mágové, zuřivec → nejbližší, hrdina hráče → souboj)
        let best = null, bs = -1e9;
        for (const e of foes) {
          const d = Math.hypot(e.x - u.x, (e.y - u.y) * 1.3);
          if (d > 900) continue;
          let s = -d / 100;
          s += (1 - e.hp / e.maxHp) * 3;                                   // dorazit zraněné
          if (e.def.ranged || e.def.roleKey === 'mag') s += 2 * per.cun;    // nebezpeční střelci
          if (e === this.hero) s += 3 * per.hero;                            // souboj velitelů
          const crowd = foes.filter(f => Math.abs(f.x - e.x) < 120).length;
          s -= crowd * 0.6 * per.caut;                                       // nevrhat se do davu
          if (s > bs) { bs = s; best = e; }
        }
        g.target = best;
        if (best) {
          const reach = u.def.range * (cfg.rangeScale || 1) + 22;
          if (u.def.ranged) {
            const want = reach * 0.8;
            g.goal = { x: best.x + (u.x > best.x ? want : -want), y: best.y };
          } else g.goal = { x: best.x + (u.x > best.x ? reach * 0.7 : -reach * 0.7), y: best.y };
          // výpad (charge) na vzdálenější cíl
          const d = Math.abs(best.x - u.x);
          if (!u.def.ranged && g.chargeCd <= 0 && d > 160 && d < 420 && Math.random() < 0.4 + per.aggr * 0.5) { g.charge = 0.55; g.chargeCd = 9 - br.skill * 3; this.texts.push({ x: u.x, y: u.y - 120 * US(), txt: L('Výpad!', 'Charge!'), color: '#ffb347', t: 0, life: 0.8 }); }
          // válečný pokřik: posílí vojáky kolem
          if (g.cryCd <= 0 && allies >= 3 && near.length) {
            g.cryCd = 26; this.units.filter(e => e.team === 'enemy' && !e.dead && Math.abs(e.x - u.x) < 260).forEach(e => { e.inspired = this.time + 6; e.inspiredBy = 0.2; });
            this.vfx.fx.push({ k: 'ring', x: u.x, y: u.y, s: 200, t: 0, life: 0.6, c: '#ff7a5a', flat: true });
            say(this, 'strike');
          }
          // štít: když na něj míří víc nepřátel na blízko
          if (!u.def.ranged && near.filter(e => !e.def.ranged).length >= 3 && g.blockCd <= 0 && Math.random() < 0.3 + br.skill * 0.5) { g.blockT = 0.6 + br.skill * 0.5; g.blockCd = 4; }
        } else {
          // žádný cíl v dohledu: drží se u své armády, nebo jde na hrad hráče
          const ally = this.units.filter(e => e.team === 'enemy' && !e.dead && !e.gen).sort((a, b) => a.x - b.x)[0];
          const wv = br.wave && this.units.find(e => e.team === 'enemy' && !e.dead && br.wave.ids.includes(e.id));
          g.goal = E.formation === 'utok' || !ally ? { x: this.side.player.castle.front + 60, y: u.y } : wv && per.hero > 0.5 ? { x: wv.x + 50, y: wv.y } : { x: ally.x + 60, y: ally.y };
        }
      }
    }
    // pohyb k cíli (s uhýbáním do strany)
    const goal = g.goal || { x: u.x, y: u.y };
    if (g.dodgeY) { u.y = clamp(u.y + Math.sign(g.dodgeY) * Math.min(Math.abs(g.dodgeY), 220 * dt), cfg.laneTop, cfg.laneBottom); g.dodgeY -= Math.sign(g.dodgeY) * Math.min(Math.abs(g.dodgeY), 220 * dt); }
    const tgt = g.target && !g.target.dead ? g.target : null;
    const reach = u.def.range * (cfg.rangeScale || 1) + 22;
    if (tgt && g.st !== 'retreat' && Math.abs(tgt.x - u.x) <= reach && Math.abs(tgt.y - u.y) < (u.def.ranged ? 999 : 46)) {
      u.moving = false; u.face = Math.sign(tgt.x - u.x) || -1;
      if (u.atkTimer <= 0) { u.atk = 0; u.hitDone = false; u.atkTimer = u.def.attackInterval * (0.95 - br.skill * 0.15); }
      return;
    }
    // u hradu hráče: bourá bránu
    const pc = this.side.player.castle;
    if (g.st !== 'retreat' && u.x - pc.front <= reach && !tgt) {
      u.moving = false; u.face = -1;
      if (u.atkTimer <= 0) { u.atk = 0; u.hitDone = false; u.atkTimer = u.def.attackInterval; }
      return;
    }
    const k = g.charge > 0 ? 3 : g.st === 'retreat' ? 1.25 : 1;
    if (g.charge > 0) g.charge -= dt;
    const dx = goal.x - u.x, dy = goal.y - u.y, dist = Math.hypot(dx, dy);
    if (dist > 6) {
      const m = Math.min(1, (sp * k * dt) / dist);
      u.x = clamp(u.x + dx * m, cfg.playerFront + 10, front + 80); u.y = clamp(u.y + dy * m * 0.7, cfg.laneTop, cfg.laneBottom);
      u.moving = true; u.face = Math.abs(dx) > 2 ? Math.sign(dx) : u.face || -1; u.walk += dt * u.def.speed * 0.17 * k;
    } else u.moving = false;
  };
  /* úder generála: zasáhne až 3 nepřátele před sebou, výpad dává ránu navíc */
  P._genStrike = function (u) {
    const f = u.face || -1, cfg = C();
    const reach = u.def.range * (cfg.rangeScale || 1) + 26;
    let dmg = u.dmg * (u.gen.charge > -0.3 && u.gen.charge !== undefined && u.gen.charge > 0 ? 1.6 : 1);
    const foes = this.units.filter(e => e.team === 'player' && !e.dead)
      .map(e => ({ e, d: (e.x - u.x) * f })).filter(o => o.d > -12 && o.d <= reach && (u.def.ranged || Math.abs(o.e.y - u.y) < 50)).sort((a, b) => a.d - b.d);
    if (u.def.ranged) {
      const tg = (u.gen.target && !u.gen.target.dead) ? u.gen.target : foes[0] && foes[0].e;
      if (tg) this._shoot('enemy', u.x + f * 30 * US(), u.y - 47 * US(), tg, dmg * this._bonus(u, tg), u.def.projectileSpeed, u);
      else if (u.x - this.side.player.castle.front <= reach) this._shoot('enemy', u.x + f * 30 * US(), u.y - 47 * US(), null, dmg, u.def.projectileSpeed, u, this.side.player.castle);
      return;
    }
    if (foes.length) {
      const before = foes.filter(o => !o.e.dead).length;
      foes.slice(0, 3).forEach(o => this._damage(o.e, dmg * this._bonus(u, o.e), u));
      if (foes.slice(0, 3).some(o => o.e.dead) && before) say(this, 'kill');
    } else if (u.x - this.side.player.castle.front <= reach) this._damageCastle(this.side.player.castle, dmg, u);
  };

  /* ---------------- KRESLENÍ: generál ve věži, jméno, bubliny ---------------- */
  P._drawGenTower = function (ctx, t) {
    const G = this.o.general, g = this.genState;
    if (!G || !G.field || !g || !g.inTower || g.dead) return;
    const E = this.side.enemy, img = E.castleImg, cfg = C();
    if (!img || !img.towerTop) return;
    const x = E.castle.front + img.w - img.towerTop.x, y = cfg.groundY - img.h + img.towerTop.y + 6;
    const uid = G.unit && GameData.units[G.unit] ? G.unit : (GameData.factions[E.faction] || {}).roles ? GameData.factions[E.faction].roles.velitel : 'velitel';
    const def = GameData.units[uid];
    if (!this._genTowerPal) this._genTowerPal = Art.unitPalette('enemy', this.o.enemyUnitSkin || 'zakladni', def.faction || E.faction);
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(t * 3) * 0.1; ctx.beginPath(); ctx.ellipse(x, y, 30, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#ff5a3a'; ctx.fill(); ctx.globalAlpha = 1;
    Art.drawUnit(ctx, def, this._genTowerPal, { x, y, facing: -1, t, scaleMul: US() * 0.75, noShadow: true });
    ctx.restore();
    this._genLabel(ctx, x, y - 92 * US(), g.hpK);
  };
  P._genLabel = function (ctx, x, y, hpK) {
    const G = this.o.general, nm = G.name || '';
    ctx.save();
    ctx.font = `800 15px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'center';
    const w = Math.max(90, ctx.measureText(nm).width + 18);
    ctx.fillStyle = 'rgba(20,8,8,.82)'; ctx.fillRect(x - w / 2, y - 20, w, 26);
    ctx.strokeStyle = '#ff9a7a'; ctx.lineWidth = 1.5; ctx.strokeRect(x - w / 2, y - 20, w, 26);
    ctx.fillStyle = '#ffe0d0'; ctx.fillText(nm, x, y - 2);
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(x - w / 2, y + 8, w, 6);
    ctx.fillStyle = '#e84a3a'; ctx.fillRect(x - w / 2, y + 8, w * clamp(hpK, 0, 1), 6);
    ctx.restore();
  };
  P._drawGenUi = function (ctx, t) {
    const br = this.brain; if (!br) return;
    const u = this.genU && !this.genU.dead ? this.genU : null;
    const G = this.o.general;
    if (u) this._genLabel(ctx, u.x, u.y - 128 * US() * (u.def.look.scale || 1), u.hp / u.maxHp);
    const q = br.sayQ;
    if (!q || this.time - q.t > q.life) return;
    let x, y;
    if (u) { x = u.x; y = u.y - 165 * US() * (u.def.look.scale || 1); }
    else if (G && G.field && this.genState && this.genState.inTower) { const E = this.side.enemy, img = E.castleImg; x = E.castle.front + img.w - img.towerTop.x; y = C().groundY - img.h + img.towerTop.y - 120 * US(); }
    else return;
    x = clamp(x, this.cam.x + 160, this.cam.x + this.cam.viewW - 160);
    y = Math.max(y, (this.H - this.cam.viewH) + 150);
    const a = Math.min(1, (q.life - (this.time - q.t)) * 2);
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = `700 17px "Alegreya Sans", system-ui, sans-serif`; ctx.textAlign = 'center';
    const w = Math.min(420, ctx.measureText(q.txt).width + 28), h = 34;
    ctx.fillStyle = 'rgba(255,248,235,.96)'; ctx.strokeStyle = '#5a1a12'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h, w, h, 12) : ctx.rect(x - w / 2, y - h, w, h); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x, y + 12); ctx.lineTo(x + 8, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a0e0a'; ctx.fillText(q.txt, x, y - 11);
    ctx.restore();
  };

  GameData.generalPersonaNames = {}; PERSONA_IDS.forEach(k => (GameData.generalPersonaNames[k] = [PERSONAS[k].cs, PERSONAS[k].en]));
  /* stálá osobnost pro pojmenovaného soupeře (podle id) */
  GameData.generalPersonaFor = id => { let h = 7; String(id).split('').forEach(c => (h = (h * 31 + c.charCodeAt(0)) >>> 0)); return PERSONA_IDS[h % PERSONA_IDS.length]; };
  window.GeneralAI = { PERSONAS, PERSONA_IDS, LINES };
})();
