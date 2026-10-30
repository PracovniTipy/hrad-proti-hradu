/* =========================================================================
   SPECIÁLNÍ ÚTOKY (schopnosti)
   Hráč je kupuje v obchodě (záložka Útoky) a do bitvy si vybere 3.
   V bitvě se platí mincemi z boje a mají dobu obnovení.
   kind – jak útok funguje (zpracovává Battle.useAbility):
     meteors   ohnivé koule na skupinu nepřátel
     shield    menší zranění vlastních vojáků
     element   zásah oblasti (ohen/led/blesk/voda/jed) jako katapult
     volley    salva šípů na oblast
     storm     několik blesků za sebou
     heal      léčení vlastních vojáků
     buff      posílení vlastních vojáků (útok, rychlost)
     curse     nepřátelé dostávají víc zranění
     stun      omráčení / zmrazení nepřátel v oblasti
     quake     zemětřesení: zranění a omráčení všech nepřátel na zemi
     summon    přivolání vojáků zdarma
     repair    oprava vlastního hradu
     gold      mince navíc
     firearrows ohnivé šípy pro střelce
     barrage   palba katapultů
     wall      ohnivá zeď – hoří na místě
     tornado   vichřice odhazuje nepřátele
     holy      svaté světlo: zraní nepřátele a vyléčí své
     breath    dračí dech: kužel ohně před hradem
   ========================================================================= */
window.GameData = window.GameData || {};

GameData.skills = [
  { id: 'ohen', kind: 'meteors', name: 'Ohnivý déšť', desc: 'Na nejbližší skupinu nepřátel dopadne 7 ohnivých koulí.', cost: 150, cooldown: 14, power: 120, radius: 130, icon: 'fire', color: '#e2531c', price: { gold: 0 }, rarity: 0 },
  { id: 'stit', kind: 'shield', name: 'Štít víry', desc: 'Tvoji vojáci dostávají 6 s o polovinu menší zranění.', cost: 200, cooldown: 24, duration: 6, power: 0.5, icon: 'shield', color: '#2f6fc0', price: { gold: 0 }, rarity: 0 },
  { id: 'salva', kind: 'volley', name: 'Šípová salva', desc: 'Lučištníci na hradbách vystřelí 24 šípů na nepřátele blízko hradu.', cost: 120, cooldown: 12, power: 34, radius: 160, range: 1600, icon: 'arrows', color: '#8a5a32', price: { gold: 1800 }, rarity: 0 },
  { id: 'led', kind: 'element', el: 'led', name: 'Ledová bouře', desc: 'Led zasáhne skupinu nepřátel a na 4 s je zpomalí na polovinu.', cost: 160, cooldown: 15, power: 90, radius: 140, slow: 4, icon: 'ice', color: '#4aa8e8', price: { gold: 2600 }, rarity: 1 },
  { id: 'blesk', kind: 'element', el: 'blesk', name: 'Řetězový blesk', desc: 'Blesk zasáhne nepřítele a přeskočí na další 4.', cost: 170, cooldown: 15, power: 150, icon: 'bolt', color: '#e8c21a', price: { gems: 120 }, rarity: 1 },
  { id: 'jed', kind: 'element', el: 'jed', name: 'Jedovatý mrak', desc: 'Jedovatý mrak na 5 s zraňuje každého nepřítele, který v něm stojí.', cost: 150, cooldown: 16, power: 110, icon: 'poison', color: '#5ab83a', price: { gold: 2400 }, rarity: 1 },
  { id: 'vlna', kind: 'element', el: 'voda', name: 'Přílivová vlna', desc: 'Vlna zraní nepřátele a odhodí je daleko zpět.', cost: 180, cooldown: 18, power: 90, icon: 'wave', color: '#2f7fe0', price: { gold: 3200 }, rarity: 1 },
  { id: 'bourka', kind: 'storm', name: 'Bouře bohů', desc: '6 blesků během 3 s udeří do nejsilnějších nepřátel.', cost: 260, cooldown: 26, power: 130, icon: 'storm', color: '#6a5ad0', price: { gems: 220 }, rarity: 2 },
  { id: 'leceni', kind: 'heal', name: 'Léčivé světlo', desc: 'Všichni tvoji vojáci se vyléčí o 40 % životů.', cost: 180, cooldown: 22, power: 0.4, icon: 'heart', color: '#e0507a', price: { gold: 2800 }, rarity: 1 },
  { id: 'roh', kind: 'buff', name: 'Válečný roh', desc: 'Na 8 s mají tvoji vojáci +40 % útok a jsou o 30 % rychlejší.', cost: 200, cooldown: 26, duration: 8, power: 0.4, icon: 'horn', color: '#c98a2a', price: { gold: 3500 }, rarity: 1 },
  { id: 'kletba', kind: 'curse', name: 'Kletba slabosti', desc: 'Na 8 s dostávají všichni nepřátelé o 50 % větší zranění.', cost: 210, cooldown: 26, duration: 8, power: 0.5, icon: 'skull', color: '#7a2a8a', price: { gems: 180 }, rarity: 2 },
  { id: 'mraz', kind: 'stun', name: 'Věčný mráz', desc: 'Nepřátelé v oblasti zamrznou na 3 s a nemohou se hnout.', cost: 220, cooldown: 24, power: 60, radius: 150, duration: 3, icon: 'snow', color: '#9fe0ff', price: { gems: 160 }, rarity: 2 },
  { id: 'zeme', kind: 'quake', name: 'Zemětřesení', desc: 'Země se otřese: zraní všechny nepřátele na bojišti a na 1,5 s je omráčí.', cost: 300, cooldown: 32, power: 80, duration: 1.5, icon: 'quake', color: '#8a6a3a', price: { gems: 260 }, rarity: 3 },
  { id: 'meteor', kind: 'meteor', name: 'Obří meteor', desc: 'Z nebe spadne obří balvan v plamenech a rozdrtí vše v širokém okolí.', cost: 320, cooldown: 34, power: 420, radius: 220, icon: 'meteor', color: '#c2361c', price: { gems: 300 }, rarity: 3 },
  { id: 'posily', kind: 'summon', name: 'Posily z vesnice', desc: 'Z brány zdarma vyběhnou 3 pěšáci.', cost: 160, cooldown: 24, count: 3, role: 'pech', icon: 'banner', color: '#3a7a3a', price: { gold: 3000 }, rarity: 1 },
  { id: 'hrdina', kind: 'summon', name: 'Hrdinův příjezd', desc: 'Zdarma přijede tvoje těžká jednotka s plnou silou.', cost: 220, cooldown: 30, count: 1, role: 'tezka', icon: 'helm', color: '#4a5a7a', price: { gems: 200 }, rarity: 2 },
  { id: 'oprava', kind: 'repair', name: 'Zedníci', desc: 'Zedníci opraví 20 % životů tvého hradu.', cost: 200, cooldown: 40, power: 0.2, icon: 'hammer', color: '#7a7a7a', price: { gold: 4000 }, rarity: 1 },
  { id: 'zlato', kind: 'gold', name: 'Zlatý déšť', desc: 'Pokladník přinese 300 mincí do boje.', cost: 0, cooldown: 45, power: 300, icon: 'coins', color: '#e0a83a', price: { gems: 150 }, rarity: 2 },
  { id: 'ohnivesipy', kind: 'firearrows', name: 'Ohnivé šípy', desc: 'Na 10 s zapalují tvoji střelci nepřátele.', cost: 150, cooldown: 22, duration: 10, icon: 'firearrow', color: '#ff7a2a', price: { gold: 3200 }, rarity: 1 },
  { id: 'palba', kind: 'barrage', name: 'Palba katapultů', desc: 'Katapulty na hradbách vystřelí 5 kamenných koulí na nejbližší nepřátele.', cost: 240, cooldown: 26, power: 95, range: 2000, icon: 'catapult', color: '#6a4a2a', price: { gold: 4500 }, rarity: 2 },
  { id: 'zed', kind: 'wall', name: 'Ohnivá zeď', desc: 'Před tvými vojáky vyšlehne na 6 s ohnivá zeď. Kdo jí projde, hoří.', cost: 200, cooldown: 24, duration: 6, power: 60, icon: 'flames', color: '#ff5a1a', price: { gems: 170 }, rarity: 2 },
  { id: 'vir', kind: 'tornado', name: 'Vichřice', desc: 'Vichřice vyrazí z brány, žene se dopředu, zraňuje a odhazuje nepřátele.', cost: 230, cooldown: 26, power: 50, duration: 4, range: 1400, icon: 'tornado', color: '#8ab0c8', price: { gems: 190 }, rarity: 2 },
  { id: 'svetlo', kind: 'holy', name: 'Svaté světlo', desc: 'Paprsek z nebe zraní nepřátele v oblasti a vyléčí tvoje vojáky.', cost: 240, cooldown: 26, power: 140, radius: 170, icon: 'sun', color: '#ffd84a', price: { gems: 240 }, rarity: 3 },
  { id: 'drak', kind: 'breath', name: 'Dračí dech', desc: 'Drak na hradbách chrlí oheň těsně před hrad: spálí všechny nepřátele, kteří se přiblížili, a zapálí je.', cost: 360, cooldown: 40, power: 260, range: 1000, icon: 'dragon', color: '#b0201a', price: { czk: 59 }, rarity: 3 },
  { id: 'jedsipy', kind: 'volley', poison: true, name: 'Jedovatá salva', desc: 'Lučištníci na hradbách vystřelí 24 otrávených šípů, každý zásah otráví nepřítele na 4 s.', cost: 170, cooldown: 16, power: 26, radius: 170, range: 1600, icon: 'poisonarrow', color: '#4a9a2a', price: { gems: 140 }, rarity: 2 },
  { id: 'ledkopi', kind: 'stun', name: 'Ledová kopí', desc: 'Ze země vyrostou ledová kopí: zraní a na 2 s zastaví nepřátele.', cost: 200, cooldown: 20, power: 120, radius: 130, duration: 2, icon: 'icespike', color: '#6ac0f0', price: { gold: 5000 }, rarity: 2 }
];
/* Jasný popis síly a dosahu útoku (obchod i bitva).
   1 jednotka světa = 10 cm, bojiště má 700 m. */
GameData.skillInfo = k => {
  const cs = !window.I18N || I18N.lang === 'cs', L = (c, e) => cs ? c : e;
  const m = v => Math.round(v / 10) + ' m', W = (GameData.battleConfig || {}).worldW || 7000;
  const P = k.power, R = k.radius, dmgW = L('zranění', 'damage');
  const I = { zone: 'cil', zoneName: '', range: '', dmg: '', from: 0, to: 0 };
  const castle = (txt) => { I.zone = 'hrad'; I.zoneName = L('Obrana hradu – na blízko', 'Castle defence – close range'); I.range = txt || L('do ' + m(k.range) + ' před hradem', 'up to ' + m(k.range) + ' in front of the castle'); I.from = 0; I.to = k.range / W; };
  const target = (w) => { I.zone = 'cil'; I.zoneName = L('Kdekoli na bojišti', 'Anywhere on the field'); I.range = L('nejbližší nepřátelé, oblast ' + m(w) + ' široká', 'nearest enemies, area ' + m(w) + ' wide'); I.spot = w / W; };
  const field = (txt) => { I.zone = 'pole'; I.zoneName = L('Celé bojiště', 'Whole battlefield'); I.range = txt; I.from = 0; I.to = 1; };
  const own = (zn, txt) => { I.zone = 'vlastni'; I.zoneName = zn; I.range = txt; };
  const allMine = L('všichni tvoji vojáci', 'all your soldiers'), mineZ = L('Tvoji vojáci', 'Your soldiers');
  switch (k.kind) {
    case 'meteors': target(R * 1.6); I.dmg = L('7 koulí', '7 balls') + ' × ' + Math.round(P / 2.6) + ' ' + dmgW + L(' + hoření', ' + burning'); break;
    case 'meteor': target(R * 2); I.dmg = P + ' ' + dmgW + L(' každému v oblasti', ' to everyone in the area'); break;
    case 'element':
      if (k.el === 'led') { target(280); I.dmg = Math.round(P * 0.8) + ' ' + dmgW + L(' + zpomalení ', ' + slow ') + k.slow + ' s'; }
      else if (k.el === 'blesk') { target(340); I.dmg = P + ' ' + dmgW + L(', pak 4 další × ', ', then 4 more × ') + Math.round(P * 0.75); I.range = L('nejbližší nepřítel + 4 další v okolí', 'nearest enemy + 4 more nearby'); }
      else if (k.el === 'jed') { target(210); I.dmg = Math.round(P * 0.5) + ' ' + dmgW + L(' + jed ', ' + poison ') + Math.round(P * 0.3) + L('/s po 5 s', '/s for 5 s'); }
      else if (k.el === 'voda') { target(230); I.dmg = Math.round(P * 0.7) + ' ' + dmgW + L(' + odhození o 7 m', ' + knockback 7 m'); }
      else { target(190); I.dmg = P + ' ' + dmgW + L(' + hoření', ' + burning'); }
      break;
    case 'volley': castle(); I.dmg = L('24 šípů', '24 arrows') + ' × ' + P + ' ' + dmgW + (k.poison ? L(' + jed 4 s', ' + poison 4 s') : ''); break;
    case 'barrage': castle(); I.dmg = L('5 koulí', '5 balls') + ' × ' + P + ' ' + dmgW; break;
    case 'breath': castle(); I.dmg = P + ' ' + dmgW + L(' každému + hoření 3 s', ' to each + burning 3 s'); break;
    case 'tornado': castle(L('jede od brány ' + m(k.range) + ' dopředu', 'travels ' + m(k.range) + ' forward from the gate')); I.zoneName = L('Od hradu dopředu', 'Forward from the castle'); I.dmg = P + ' ' + dmgW + L('/s + odhazuje nepřátele', '/s + throws enemies back'); break;
    case 'storm': field(L('6 blesků do nejsilnějších nepřátel', '6 bolts at the strongest enemies')); I.dmg = '6 × ' + P + ' ' + dmgW; break;
    case 'quake': field(L('všichni nepřátelé na zemi', 'all enemies on the ground')); I.dmg = P + ' ' + dmgW + L(' + omráčení ', ' + stun ') + String(k.duration).replace('.', cs ? ',' : '.') + ' s'; break;
    case 'curse': field(L('všichni nepřátelé', 'all enemies')); I.dmg = '+' + Math.round(P * 100) + L(' % zranění na ', '% damage taken for ') + k.duration + ' s'; break;
    case 'stun': target(R * 2); I.dmg = P + ' ' + dmgW + L(' + zastavení ', ' + stop ') + k.duration + ' s'; break;
    case 'holy': target(R * 2); I.dmg = P + ' ' + dmgW + L(', tvoje vojáky léčí 30 %', ', heals your soldiers 30%'); break;
    case 'wall': I.zone = 'cil'; I.zoneName = L('Před tvými vojáky', 'In front of your soldiers'); I.range = L('zeď 9 m široká na ', 'wall 9 m wide for ') + k.duration + ' s'; I.spot = 92 / W; I.dmg = Math.round(P) + ' ' + dmgW + L('/s + hoření', '/s + burning'); break;
    case 'heal': own(mineZ, allMine); I.dmg = '+' + Math.round(P * 100) + L(' % životů', '% health'); break;
    case 'buff': own(mineZ, allMine); I.dmg = '+' + Math.round(P * 100) + L(' % útok, +30 % rychlost na ', '% attack, +30% speed for ') + k.duration + ' s'; break;
    case 'shield': own(mineZ, allMine); I.dmg = '−' + Math.round(P * 100) + L(' % zranění na ', '% damage taken for ') + k.duration + ' s'; break;
    case 'firearrows': own(L('Tvoji střelci', 'Your archers'), L('všichni tvoji střelci', 'all your archers')); I.dmg = L('šípy zapalují na ', 'arrows set enemies on fire for ') + k.duration + ' s'; break;
    case 'summon': I.zone = 'brana'; I.zoneName = L('U tvé brány', 'At your gate'); I.range = L('vyběhnou z brány', 'run out of the gate'); I.dmg = k.count + '× ' + (k.role === 'tezka' ? L('těžká jednotka', 'heavy unit') : L('pěšák', 'infantryman')) + L(' zdarma', ' for free'); break;
    case 'repair': I.zone = 'brana'; I.zoneName = L('Tvůj hrad', 'Your castle'); I.range = L('hradby', 'walls'); I.dmg = '+' + Math.round(P * 100) + L(' % životů hradu', '% castle health'); break;
    case 'gold': I.zone = 'brana'; I.zoneName = L('Pokladna', 'Treasury'); I.range = '—'; I.dmg = '+' + P + L(' mincí', ' coins'); break;
  }
  return I;
};
/* Mapka dosahu: tvůj hrad vlevo, nepřátelský vpravo, zvýrazněná zasažená část */
GameData.skillRangeBar = k => {
  const I = GameData.skillInfo(k);
  let zone = '';
  if (I.zone === 'hrad' || I.zone === 'pole') zone = `<i class="rz ${I.zone}" style="left:${(I.from * 100).toFixed(1)}%;width:${Math.max(3, (I.to - I.from) * 100).toFixed(1)}%"></i>`;
  else if (I.zone === 'cil') zone = `<i class="rz cil" style="width:${Math.max(4, I.spot * 100 * 3).toFixed(1)}%"></i>`;
  else zone = `<i class="rz vlastni"></i>`;
  return `<div class="rbar z-${I.zone}"><b class="rc me"></b><span class="rf">${zone}</span><b class="rc foe"></b></div>`;
};
GameData.skillById = id => GameData.skills.find(s => s.id === id);
/* CENY: útoky za herní měnu jsou o 20 % dražší (zlato zaokrouhleno na 50, drahokamy na 10) */
GameData.skills.forEach(s => { const p = s.price || {}; if (p.gold) p.gold = Math.round(p.gold * 1.2 / 50) * 50; if (p.gems) p.gems = Math.round(p.gems * 1.2 / 10) * 10; });
/* VYVÁŽENÍ: zraňující speciální útoky jsou o 10 % slabší */
(function () {
  const DMG = { meteors: 1, meteor: 1, element: 1, volley: 1, storm: 1, stun: 1, quake: 1, holy: 1, barrage: 1, wall: 1, tornado: 1, breath: 1 };
  GameData.skills.forEach(s => { if (DMG[s.kind] && typeof s.power === 'number' && s.power > 1) s.power = Math.round(s.power * 0.9); });
})();
/* zpětná kompatibilita: staré GameData.abilities */
GameData.abilities = {};
GameData.skills.forEach(s => (GameData.abilities[s.id] = Object.assign({}, s, { damage: s.power, reduction: s.kind === 'shield' ? s.power : undefined })));
GameData.skillsOf = save => {
  const S = save.skills || (save.skills = {});
  S.owned = S.owned || ['ohen', 'stit'];
  S.eq = (S.eq && S.eq.length ? S.eq : ['ohen', 'stit']).filter(id => S.owned.includes(id) && GameData.skillById(id)).slice(0, 3);
  return S;
};

/* Ikony útoků: zlatem lemovaný medailon s bílým symbolem */
(function () {
  const G = {
    fire: '<path d="M16 5c2 4 7 6 7 12a7 7 0 0 1-14 0c0-3 2-5 3-6 0 2 1 3 2 3-1-3 0-6 2-9z" fill="#fff"/><path d="M16 15c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1 1-2 1-3 .5 1 1 1 1.5 1-.3-1 0-2 .5-3z" fill="#ffb347"/>',
    shield: '<path d="M16 5l9 3v6c0 6-4 10-9 12-5-2-9-6-9-12V8z" fill="#fff"/><path d="M16 9v14M11 14h10" stroke="#2f6fc0" stroke-width="2.4"/>',
    arrows: '<path d="M7 25L22 10M11 26L25 12M6 21L19 8" stroke="#fff" stroke-width="2.2"/><path d="M22 10l3-4 1 1-4 3zM25 12l3-3v2zM19 8l3-3 0 2z" fill="#fff"/><path d="M19 7l4-1-1 4zM22 9l4-1-1 4zM16 6l4-1-1 4z" fill="#fff"/>',
    ice: '<path d="M16 4v24M6 10l20 12M26 10L6 22" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M13 6l3 3 3-3M13 26l3-3 3 3" stroke="#fff" stroke-width="1.8" fill="none"/>',
    bolt: '<path d="M18 3L8 18h7l-3 11 12-16h-7z" fill="#fff"/>',
    poison: '<path d="M16 5c3 5 8 9 8 14a8 8 0 0 1-16 0c0-5 5-9 8-14z" fill="#fff"/><circle cx="13" cy="19" r="1.8" fill="#5ab83a"/><circle cx="18" cy="22" r="1.4" fill="#5ab83a"/><circle cx="18" cy="16" r="1.1" fill="#5ab83a"/>',
    wave: '<path d="M4 20c4-6 8-6 10-2s6 4 7-2c3 2 6 4 7 8H4z" fill="#fff"/><path d="M14 12c2-4 6-5 9-3-3 0-5 2-5 5" stroke="#fff" stroke-width="2.2" fill="none"/>',
    storm: '<path d="M8 15a5 5 0 0 1 4-7 6 6 0 0 1 11 2 4 4 0 0 1 0 8H9a3 3 0 0 1-1-3z" fill="#fff"/><path d="M15 18l-3 6h3l-2 5 6-7h-3l2-4z" fill="#ffe14a"/>',
    heart: '<path d="M16 26S5 19 5 12a5 5 0 0 1 11-2 5 5 0 0 1 11 2c0 7-11 14-11 14z" fill="#fff"/><path d="M14 13h4v3h3v4h-3v3h-4v-3h-3v-4h3z" fill="#e0507a"/>',
    horn: '<path d="M5 12c6 0 12-2 18-7l3 2-2 15c-3-1-5-1-8 0-3-4-7-6-11-6z" fill="#fff"/><path d="M5 12v4" stroke="#fff" stroke-width="3"/>',
    skull: '<path d="M16 5a9 9 0 0 0-9 9c0 3 1 5 3 6v4h12v-4c2-1 3-3 3-6a9 9 0 0 0-9-9z" fill="#fff"/><circle cx="12.5" cy="14" r="2.4" fill="#7a2a8a"/><circle cx="19.5" cy="14" r="2.4" fill="#7a2a8a"/><path d="M14 22v2M16 22v2M18 22v2" stroke="#7a2a8a" stroke-width="1.4"/>',
    snow: '<g stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M16 4v24M5.6 10l20.8 12M26.4 10L5.6 22"/><path d="M12 7l4 3 4-3M12 25l4-3 4 3M6 15l4 1-1-4M26 17l-4-1 1 4"/></g>',
    quake: '<path d="M3 22h26" stroke="#fff" stroke-width="2.6"/><path d="M8 22l3-5 3 4 3-8 3 6 2-3 3 6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linejoin="round"/><path d="M9 26l2-4M18 27l1-5M24 26l-1-4" stroke="#fff" stroke-width="1.6"/>',
    meteor: '<circle cx="20" cy="19" r="7" fill="#fff"/><path d="M14 14L4 4M16 12L9 3M13 17L3 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="17" r="1.6" fill="#c2361c"/><circle cx="22" cy="21" r="1.2" fill="#c2361c"/>',
    banner: '<path d="M9 4v24" stroke="#fff" stroke-width="2.6"/><path d="M10 6h14l-4 5 4 5H10z" fill="#fff"/>',
    helm: '<path d="M8 22v-8a8 8 0 0 1 16 0v8l-3 2v-6h-10v6z" fill="#fff"/><path d="M16 6v-3M12 16h8" stroke="#fff" stroke-width="2"/><path d="M11 16h10" stroke="#4a5a7a" stroke-width="2.2"/>',
    hammer: '<path d="M10 6h12v6H10z" fill="#fff"/><path d="M15 12h2v15h-2z" fill="#fff"/><path d="M5 26h6M21 26h6" stroke="#fff" stroke-width="2"/>',
    coins: '<ellipse cx="13" cy="21" rx="7" ry="3" fill="#fff"/><ellipse cx="13" cy="17" rx="7" ry="3" fill="#fff" stroke="#e0a83a"/><ellipse cx="19" cy="12" rx="7" ry="3" fill="#fff" stroke="#e0a83a"/><path d="M19 4v4M23 6l-2 2M15 6l2 2" stroke="#fff" stroke-width="1.6"/>',
    firearrow: '<path d="M6 26L24 8" stroke="#fff" stroke-width="2.4"/><path d="M24 8l2-4 2 2-4 2z" fill="#fff"/><path d="M22 4c3 1 5 4 4 7-1-2-2-3-4-3 1-1 1-3 0-4z" fill="#ffd27a"/><path d="M8 24l-3 1 1-3" stroke="#fff" stroke-width="1.6" fill="none"/>',
    catapult: '<path d="M5 24h22" stroke="#fff" stroke-width="2.6"/><circle cx="9" cy="25" r="2.4" fill="#fff"/><circle cx="23" cy="25" r="2.4" fill="#fff"/><path d="M14 23L24 9" stroke="#fff" stroke-width="2.6"/><circle cx="25" cy="7" r="3" fill="#fff"/>',
    flames: '<path d="M5 26c0-6 4-8 4-13 2 3 2 5 2 7 1-3 3-5 3-10 3 4 4 8 4 12 1-2 2-3 2-6 3 4 3 7 3 10z" fill="#fff"/>',
    tornado: '<path d="M5 7h22M8 12h17M11 17h12M13 22h8M15 27h4" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
    sun: '<circle cx="16" cy="16" r="6" fill="#fff"/><g stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/></g>',
    dragon: '<path d="M5 20c3-1 5-4 6-8 2 2 4 2 6 1l3-5 1 4 4-1-2 4c2 1 3 3 3 5-3-1-5 0-7 2-4-2-9-1-14-2z" fill="#fff"/><circle cx="21" cy="12" r="1" fill="#b0201a"/><path d="M27 18c2 0 3 1 4 2M27 21c2 1 3 2 3 4" stroke="#ffb347" stroke-width="2" stroke-linecap="round"/>',
    poisonarrow: '<path d="M6 26L24 8" stroke="#fff" stroke-width="2.4"/><path d="M24 8l2-4 2 2-4 2z" fill="#fff"/><circle cx="10" cy="12" r="3.5" fill="#c8ff9a"/><circle cx="20" cy="22" r="2.5" fill="#c8ff9a"/>',
    icespike: '<path d="M6 27l3-12 3 12zM13 27l3-20 3 20zM20 27l3-14 3 14z" fill="#fff"/><path d="M4 27h24" stroke="#fff" stroke-width="2"/>'
  };
  GameData.skillIcon = (sk, size) => {
    const c = sk.color, id = 'g' + sk.id;
    return `<svg class="skill-ico" viewBox="0 0 32 32" width="${size || 44}" height="${size || 44}" aria-hidden="true"><defs><radialGradient id="${id}" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="#0b0907"/></radialGradient></defs>
      <circle cx="16" cy="16" r="15" fill="url(#${id})" stroke="#e8b84a" stroke-width="1.6"/><circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,.18)"/>
      <g transform="translate(3.2 3.2) scale(.8)" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,.6))">${G[sk.icon] || G.fire}</g></svg>`;
  };
})();
