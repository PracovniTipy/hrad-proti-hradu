/* =========================================================================
   KOVÁRNA – PŘEKOVÁNÍ VŠECH ZBRANÍ A ZBROJÍ + DVOJNÁSOBEK NOVÝCH
   - Každá stávající zbraň dostane nový jedinečný tvar z Kovárny (kovarna_zbrane.js),
     který odpovídá jejímu jménu (halapartna zůstane halapartnou, ale nově vykovanou).
   - Ke každé stávající zbrani přibude jedna úplně nová (stejná kategorie a vzácnost).
   - Totéž pro zbroje (kovarna_zbroj.js).
   - Vlastnictví hráčů se nemění (id zůstávají), božské, sezónní a věžové sady se nemění.
   Generování je deterministické (seed podle id), takže každý skin vypadá pokaždé stejně.
   ========================================================================= */
(function () {
  const G = GameData, F = window.Forge, AF = window.ArmorForge;
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;   // překlad: js/i18n_l.js
  function rngOf(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } let a = h >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v * (1 + k)))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const RANK = r => (G.rarityRank ? G.rarityRank(r) : 0);
  const WB = [{ dmg: 0.03 }, { dmg: 0.05 }, { dmg: 0.07 }, { dmg: 0.1, hp: 0.1 }, { dmg: 0.2, hp: 0.2 }];
  const AB = [{ hp: 0.03 }, { hp: 0.05 }, { hp: 0.07 }, { hp: 0.1, dmg: 0.1 }, { hp: 0.2, dmg: 0.2 }];
  const PRICE = [{ gold: 1800 }, { gold: 4200 }, { gems: 220 }, { gems: 540 }, {}];
  const keep = x => /(^|_)vz_/.test(x.id) || x.codeOnly || x.season || x.tower || x.rarity === 'Božský' || x.id === 'w_zakladni' || x.id === 'zakladni';

  /* ---------------- TÉMATA (barvy + jméno) ---------------- */
  const THEMES = [
    { k: 'plamen', cs: 'plamene', en: 'of Flame', blade: '#ffe0c0', dark: '#a8401a', edge: '#fff4d0', guard: '#d8a03a', grip: '#4a1a0a', glow: '#ff7a2a', gem: '#ff4a1a', wood: '#5a2a14', deco: ['flames', 'magma'] },
    { k: 'led', cs: 'ledu', en: 'of Ice', blade: '#e8f6ff', dark: '#6a9ac8', edge: '#ffffff', guard: '#bfe6ff', grip: '#1a3a5a', glow: '#8fdcff', gem: '#bfe8ff', wood: '#3a5a7a', deco: ['frost'] },
    { k: 'boure', cs: 'bouře', en: 'of the Storm', blade: '#eef2ff', dark: '#4a5a8a', edge: '#ffffff', guard: '#ffe14a', grip: '#1a284f', glow: '#fff36a', gem: '#fff36a', wood: '#2a3a5a', deco: ['lightning'] },
    { k: 'stin', cs: 'stínů', en: 'of Shadows', blade: '#4a4252', dark: '#14101a', edge: '#b08aff', guard: '#3a2a4a', grip: '#0e0a12', glow: '#9a5aff', gem: '#b25cff', wood: '#1a141f', deco: ['starfield', 'chain'] },
    { k: 'krev', cs: 'krve', en: 'of Blood', blade: '#e8d0d0', dark: '#7a1414', edge: '#ffd0c8', guard: '#5a0a0a', grip: '#2a0606', glow: '#ff3a3a', gem: '#d6243a', wood: '#3a0a0a', deco: ['rivets', 'chain'] },
    { k: 'slunce', cs: 'slunce', en: 'of the Sun', blade: '#fff6d8', dark: '#c99a2a', edge: '#ffffff', guard: '#ffd24a', grip: '#7a4a0a', glow: '#ffe28a', gem: '#ff9a1a', wood: '#8a5a1a', deco: ['filigree', 'gems'] },
    { k: 'mesic', cs: 'měsíce', en: 'of the Moon', blade: '#eef0ff', dark: '#7a84a8', edge: '#ffffff', guard: '#cfd8ff', grip: '#2a2f5a', glow: '#cfd8ff', gem: '#cfd8ff', wood: '#2a2f5a', deco: ['starfield', 'filigree'] },
    { k: 'jed', cs: 'jedu', en: 'of Venom', blade: '#e0ffd0', dark: '#3a7a2a', edge: '#f4ffe0', guard: '#5a8a3a', grip: '#1a3a14', glow: '#8aff5a', gem: '#7be04a', wood: '#2a4a1a', deco: ['vines'] },
    { k: 'lava', cs: 'lávy', en: 'of Lava', blade: '#3a2a2a', dark: '#1a0a0a', edge: '#ffb347', guard: '#5a2a1a', grip: '#1a0806', glow: '#ff6a1a', gem: '#ff6a1a', wood: '#2a1008', deco: ['magma'] },
    { k: 'more', cs: 'moří', en: 'of the Seas', blade: '#e0f6ff', dark: '#2a7a9a', edge: '#ffffff', guard: '#3ac8c8', grip: '#0a3a4a', glow: '#5af0ff', gem: '#3ac8ff', wood: '#1a4a5a', deco: ['filigree'] },
    { k: 'les', cs: 'hvozdu', en: 'of the Wildwood', blade: '#e8f0d8', dark: '#5a7a3a', edge: '#ffffff', guard: '#8a6a3a', grip: '#3a2a14', glow: null, gem: '#7be04a', wood: '#5a3a1e', deco: ['vines'] },
    { k: 'poust', cs: 'pouště', en: 'of the Dunes', blade: '#fff0d8', dark: '#b08a4a', edge: '#ffffff', guard: '#c9962a', grip: '#6a4a1a', glow: null, gem: '#2ab8c8', wood: '#8a6a3a', deco: ['filigree', 'gems'] },
    { k: 'krystal', cs: 'krystalu', en: 'of Crystal', blade: '#f0e8ff', dark: '#8a6ac8', edge: '#ffffff', guard: '#c8b8ff', grip: '#3a2a5a', glow: '#d8c8ff', gem: '#ff8ae0', wood: '#4a3a6a', deco: ['frost', 'gems'] },
    { k: 'kost', cs: 'kostí', en: 'of Bones', blade: '#efe6cf', dark: '#9a8a68', edge: '#ffffff', guard: '#c9b48a', grip: '#3a2a1a', glow: null, gem: '#7a2a2a', wood: '#6a5a40', deco: ['rivets'] },
    { k: 'drak', cs: 'draka', en: 'of the Dragon', blade: '#ffe0d0', dark: '#9a3a20', edge: '#ffd27a', guard: '#ffd24a', grip: '#5a0a14', glow: '#ff6a2a', gem: '#d6243a', wood: '#5a1a10', deco: ['flames', 'gems'] },
    { k: 'vlk', cs: 'vlka', en: 'of the Wolf', blade: '#e8ecf2', dark: '#6a7280', edge: '#ffffff', guard: '#9aa0aa', grip: '#3a3028', glow: null, gem: '#9fd4ff', wood: '#4a3a2a', deco: ['runes', 'rivets'] },
    { k: 'havran', cs: 'havrana', en: 'of the Raven', blade: '#d8dce8', dark: '#2a2a3a', edge: '#ffffff', guard: '#1a1a2a', grip: '#0e0e14', glow: null, gem: '#5a8aff', wood: '#1a1a24', deco: ['chain'] },
    { k: 'jitro', cs: 'jitra', en: 'of Dawn', blade: '#fff0f4', dark: '#c88aa0', edge: '#ffffff', guard: '#ffb8c8', grip: '#5a2a3a', glow: '#ffc8e0', gem: '#ff8ab0', wood: '#6a3a4a', deco: ['filigree', 'vines'] },
    { k: 'runa', cs: 'run', en: 'of Runes', blade: '#e8eef8', dark: '#5a6a8a', edge: '#ffffff', guard: '#8a9ab8', grip: '#2a2a3a', glow: '#7fc8ff', gem: '#7fc8ff', wood: '#3a3a4a', deco: ['runes', 'fuller'] },
    { k: 'zlato', cs: 'zlata', en: 'of Gold', blade: '#fff4c8', dark: '#b08a2a', edge: '#ffffff', guard: '#ffd24a', grip: '#6a1a1a', glow: '#ffe28a', gem: '#d6243a', wood: '#7a5a1a', deco: ['filigree', 'gems'] }
  ];
  const themeFor = (name, r) => {
    const n = (name || '').toLowerCase();
    const M = [[/plamen|ohn|pekel|horou/, 'plamen'], [/led|mraz|mráz|zim/, 'led'], [/hrom|bou|blesk/, 'boure'], [/stín|stin|temn|noč|půlno/, 'stin'], [/krv/, 'krev'], [/slun/, 'slunce'], [/měsí|mesic/, 'mesic'], [/jed|had/, 'jed'], [/láv|lav|sopk/, 'lava'], [/moř|mor/, 'more'], [/les|elf|strom|trn/, 'les'], [/pouš|pous|šavl/, 'poust'], [/krystal/, 'krystal'], [/kost|leb/, 'kost'], [/drak|drač/, 'drak'], [/vlk|vlč/, 'vlk'], [/havran/, 'havran'], [/sakur|jitr/, 'jitro'], [/run/, 'runa'], [/zlat|král|kral/, 'zlato'], [/hvězd|hvezd/, 'mesic']];
    for (const [re, k] of M) if (re.test(n)) return THEMES.find(t => t.k === k);
    return null;
  };

  /* ---------------- TVAR PODLE JMÉNA ---------------- */
  const SHAPE_HINTS = {
    melee: [[/halapart/, null], [/katana|tači|tachi|nodači/, { blade: 'katana' }], [/šavl|savl/, { blade: 'scimitar' }], [/tesák|tesak|falch/, { blade: 'falchion' }], [/gladius/, { blade: 'leaf' }],
      [/claymore|obouruč|flamber/, { blade: 'great' }], [/sekera|sekyr/, { head: 'beard' }], [/obousek/, { head: 'double' }], [/palcát|palcat|šestipér/, { head: 'flanged' }], [/kladiv/, { head: 'warhammer' }],
      [/řemdih|remdih|cep/, { head: 'morning' }], [/čakan|cakan/, { head: 'pick' }], [/sax|nůž/, { blade: 'cleaver' }], [/run/, { blade: 'runic' }], [/plamen|ohn/, { blade: 'flame' }], [/krystal|led/, { blade: 'crystal' }],
      [/stín|stin/, { blade: 'hollow' }], [/hvězd|hvezd/, { blade: 'tapered' }], [/král|kral|zlat/, { blade: 'broad' }], [/kost/, { blade: 'tooth' }], [/drak|drač/, { blade: 'serrated' }], [/měsí|mesic/, { blade: 'crescent' }]],
    pole: [[/halapart/, 'halberd'], [/glef/, 'glaive'], [/naginat/, 'naginata'], [/trojzub/, 'trident'], [/partyz/, 'partisan'], [/bardi/, 'bardiche'], [/kosa/, 'scythe'], [/pík|pik/, 'lance'], [/sudlic/, 'hook'], [/okřídl|okridl/, 'winged'], [/křížov|krizov|jumonji/, 'fork'], [/drak|drač/, 'wavy'], [/hvězd|hvezd/, 'drill'], [/ómi|omi/, 'leaf'], [/měsí|mesic/, 'moon'], [/krystal|led/, 'crystal']],
    bow: [[/kompozit/, 'horn'], [/reflex/, 'recurve'], [/elf|les/, 'vines'], [/kost/, 'skulls'], [/drak|drač/, 'dragon'], [/měsí|mesic/, 'moon'], [/trn/, 'spikes'], [/run/, 'runes'], [/sakur/, 'feathers'], [/zlat/, 'gems'], [/led/, 'shards'], [/ohn|plamen/, 'flame'], [/hvězd|hvezd/, 'wings']],
    staff: [[/koule|dub/, 'orbcage'], [/strom/, 'tree'], [/krystal/, 'cluster'], [/had/, 'serpent'], [/lebk|nekrom/, 'skull'], [/slun/, 'star'], [/měsí|mesic/, 'crescent'], [/plamen/, 'flamebowl'], [/oko/, 'eye'], [/run/, 'runering']]
  };
  const SAM_BLADES = ['katana', 'scimitar', 'tapered', 'broad', 'leaf', 'runic', 'crystal', 'flame', 'great', 'serrated', 'hollow', 'rapier', 'tooth'];
  const SAM_POLE = ['leaf', 'partisan', 'winged', 'naginata', 'lance', 'glaive', 'crystal', 'wavy', 'moon', 'trident'];

  /* ---------------- ČESKÁ JMÉNA TVARŮ (pro nové zbraně) ---------------- */
  const NOUN = {
    blade: { broad: ['Meč', 'Sword'], leaf: ['Listová čepel', 'Leaf Blade'], falchion: ['Tesák', 'Falchion'], scimitar: ['Šavle', 'Scimitar'], katana: ['Katana', 'Katana'], flame: ['Plamenná čepel', 'Flame Blade'], serrated: ['Pilová čepel', 'Saw Blade'], tapered: ['Kord', 'Estoc'], broken: ['Rozbitá čepel', 'Shattered Blade'], crescent: ['Chopeš', 'Khopesh'], cleaver: ['Sekáč', 'Cleaver'], rapier: ['Rapír', 'Rapier'], forked: ['Rozeklaný meč', 'Forked Sword'], hollow: ['Prolamovaný meč', 'Pierced Sword'], runic: ['Runová čepel', 'Rune Blade'], crystal: ['Krystalový meč', 'Crystal Sword'], tooth: ['Zub', 'Fang'], great: ['Obouruční meč', 'Greatsword'] },
    head: { beard: ['Bradatice', 'Bearded Axe'], double: ['Obousekera', 'Double Axe'], moon: ['Měsíční sekera', 'Moon Axe'], fan: ['Vějířová sekera', 'Fan Axe'], tomahawk: ['Tomahavk', 'Tomahawk'], executioner: ['Katovská sekera', 'Headsman’s Axe'], dragon: ['Dračí sekera', 'Dragon Axe'], pick: ['Čakan', 'War Pick'], flanged: ['Palcát', 'Flanged Mace'], morning: ['Řemdih', 'Morning Star'], warhammer: ['Válečné kladivo', 'Warhammer'], maul: ['Palice', 'Maul'], star: ['Hvězdice', 'Star Mace'], skullmace: ['Lebkový palcát', 'Skull Mace'] },
    pole: { leaf: ['Kopí', 'Spear'], partisan: ['Partyzána', 'Partisan'], winged: ['Okřídlené kopí', 'Winged Spear'], halberd: ['Halapartna', 'Halberd'], glaive: ['Glefa', 'Glaive'], bardiche: ['Bardiš', 'Bardiche'], trident: ['Trojzubec', 'Trident'], fork: ['Vidlice', 'War Fork'], naginata: ['Naginata', 'Naginata'], lance: ['Píka', 'Lance'], scythe: ['Válečná kosa', 'War Scythe'], hook: ['Sudlice', 'Hook Spear'], moon: ['Měsíční kopí', 'Moon Spear'], drill: ['Vrtné kopí', 'Spiral Lance'], crystal: ['Krystalové kopí', 'Crystal Spear'], wavy: ['Vlnité kopí', 'Wave Spear'] },
    bow: { recurve: ['Reflexní luk', 'Recurve Bow'], horn: ['Rohový luk', 'Horn Bow'], feathers: ['Opeřený luk', 'Feathered Bow'], spikes: ['Ostnatý luk', 'Spiked Bow'], runes: ['Runový luk', 'Rune Bow'], vines: ['Popínavý luk', 'Vine Bow'], chains: ['Řetězový luk', 'Chain Bow'], gems: ['Klenotnický luk', 'Jeweled Bow'], skulls: ['Lebkový luk', 'Skull Bow'], flame: ['Plamenný luk', 'Flame Bow'], shards: ['Střepový luk', 'Shard Bow'], dragon: ['Dračí luk', 'Dragon Bow'], wings: ['Křídlový luk', 'Winged Bow'], moon: ['Srpkový luk', 'Crescent Bow'] },
    staff: { orbcage: ['Hůl s klecí', 'Caged Orb Staff'], crescent: ['Srpková hůl', 'Crescent Staff'], tree: ['Hůl živého dřeva', 'Living Wood Staff'], cluster: ['Krystalová hůl', 'Crystal Staff'], skull: ['Lebková hůl', 'Skull Staff'], eye: ['Hůl vševidoucí', 'All-Seeing Staff'], flamebowl: ['Hůl s ohněm', 'Brazier Staff'], hourglass: ['Hůl času', 'Hourglass Staff'], star: ['Hvězdná hůl', 'Star Staff'], serpent: ['Hadí hůl', 'Serpent Staff'], bell: ['Zvonková hůl', 'Bell Staff'], lantern: ['Lucerna', 'Lantern Staff'], runering: ['Runová hůl', 'Rune Ring Staff'], totem: ['Totem', 'Totem Staff'], horned: ['Rohatá hůl', 'Horned Staff'], galaxy: ['Hůl galaxie', 'Galaxy Staff'] }
  };
  const PART_CS = { cross: 'křížová záštita', curl: 'stočená záštita', wings: 'záštita z křídel', skull: 'lebka v záštitě', tsuba: 'kulatá cuba', ring: 'košíková záštita', bat: 'netopýří křídla', claw: 'dravčí spáry', crescent: 'srpek měsíce', spiked: 'ostnatá záštita', royal: 'královská záštita', none: 'bez záštity' };
  const PART_EN = { cross: 'a cross guard', curl: 'curled quillons', wings: 'a winged guard', skull: 'a skull guard', tsuba: 'a round tsuba', ring: 'a knuckle bow', bat: 'bat wings', claw: 'raptor claws', crescent: 'a crescent guard', spiked: 'a spiked guard', royal: 'a royal guard', none: 'no guard' };
  const DECO_CS = { runes: 'zářící runy', gems: 'vsazené drahokamy', chain: 'omotaný řetěz', flames: 'šlehající plameny', frost: 'mrazivé praskliny', vines: 'popínavé šlahouny', rivets: 'nýty', fuller: 'zářící žlábek', filigree: 'filigrán', starfield: 'hvězdné nebe v oceli', lightning: 'blesky', magma: 'žhnoucí magma' };
  const DECO_EN = { runes: 'glowing runes', gems: 'inlaid gems', chain: 'a wrapped chain', flames: 'licking flames', frost: 'frost cracks', vines: 'climbing vines', rivets: 'rivets', fuller: 'a glowing fuller', filigree: 'filigree', starfield: 'a starfield in the steel', lightning: 'lightning', magma: 'glowing magma' };

  /* ---------------- VÝBĚR DÍLŮ ---------------- */
  const used = new Set(), NAMES = new Set();
  function design(cat, r, rank, theme, hint, sam) {
    const Lz = F.lists;
    const lvl = rank;   // 0 základní … 3 legendární
    const decoN = lvl >= 3 ? 2 : lvl >= 2 ? 1 : (r() < 0.4 ? 1 : 0);
    const decos = () => { const pool = (theme && theme.deco) ? theme.deco.concat(Lz.decos) : Lz.decos; const out = []; for (let i = 0; i < decoN; i++) { const d = i === 0 && theme && theme.deco ? pick(r, theme.deco) : pick(r, pool); if (!out.includes(d)) out.push(d); } return out.length ? out : null; };
    for (let tries = 0; tries < 30; tries++) {
      let parts, key;
      if (cat === 'melee') {
        const h = hint || {};
        const useHead = !sam && (h.head || (!h.blade && r() < 0.28));
        if (useHead) { parts = { head: h.head || pick(r, Lz.heads), pommel: pick(r, Lz.pommels), deco: decos(), grip: r() < 0.5 ? 'long' : undefined }; key = 'm|' + parts.head + '|' + parts.pommel + '|' + (parts.deco || []).join(); }
        else {
          const blade = h.blade && (!sam || SAM_BLADES.includes(h.blade)) ? h.blade : pick(r, sam ? SAM_BLADES : Lz.blades);
          const guard = sam ? pick(r, ['tsuba', 'tsuba', 'crescent', 'ring', 'none']) : pick(r, Lz.guards.filter(g => g !== 'none' || lvl < 2));
          parts = { blade, guard, pommel: pick(r, Lz.pommels), deco: decos(), wrap: sam || blade === 'katana' ? 'ito' : undefined, grip: ['great', 'katana'].includes(blade) ? 'long' : undefined };
          key = 'm|' + blade + '|' + guard + '|' + parts.pommel + '|' + (parts.deco || []).join();
        }
      } else if (cat === 'pole') { const head = hint && (!sam || SAM_POLE.includes(hint)) ? hint : pick(r, sam ? SAM_POLE : Lz.poleHeads); parts = { head, collar: pick(r, Lz.collars) }; key = 'p|' + head + '|' + parts.collar; }
      else if (cat === 'bow') { parts = { style: hint || pick(r, Lz.bowStyles) }; key = 'b|' + parts.style + '|' + tries; }
      else { parts = { head: hint || pick(r, Lz.staffHeads) }; key = 's|' + parts.head + '|' + tries; }
      if (!used.has(key) || tries > 25 || cat === 'bow' || cat === 'staff') { used.add(key); return parts; }
      hint = null;
    }
  }
  function register(id, cat, parts) {
    if (cat === 'melee') F.melee(id, parts);
    else if (cat === 'pole') F.pole(id, parts);
    else if (cat === 'bow') F.bow(id, parts);
    else F.staff(id, parts);
    // samurajové: meče (čepel) a kopí kopiníků
    if (G.SAM_OK && cat === 'melee' && parts.blade && SAM_BLADES.includes(parts.blade)) G.SAM_OK.melee.push(id);
    if (G.SAM_OK && cat === 'pole' && SAM_POLE.includes(parts.head)) G.SAM_OK.pole.push(id);
  }
  const colorsOf = (theme, base) => {
    const T = theme || {};
    return { blade: T.blade || base.blade, dark: T.dark || base.dark, edge: T.edge || base.edge, guard: T.guard || base.guard, grip: T.grip || base.grip, pommel: T.guard || base.pommel, gem: T.gem || base.gem, wood: T.wood || base.wood, string: base.string || '#f2ead8', arrow: base.arrow, tip: base.tip };
  };
  const descOf = (cat, parts, theme) => {
    const dec = (parts.deco || []).map(d => [DECO_CS[d], DECO_EN[d]]).filter(x => x[0]);
    const cs = [], en = [];
    if (cat === 'melee' && parts.guard) { cs.push(PART_CS[parts.guard] || ''); en.push(PART_EN[parts.guard] || ''); }
    dec.forEach(d => { cs.push(d[0]); en.push(d[1]); });
    const n = cat === 'melee' ? (parts.blade ? NOUN.blade[parts.blade] : NOUN.head[parts.head]) : cat === 'pole' ? NOUN.pole[parts.head] : cat === 'bow' ? NOUN.bow[parts.style] : NOUN.staff[parts.head];
    const csT = (n ? n[0] : 'Zbraň') + (cs.length ? ': ' + cs.filter(Boolean).join(', ') : '') + '.';
    const enT = (n ? n[1] : 'Weapon') + (en.length ? ' with ' + en.filter(Boolean).join(', ') : '') + '.';
    return [csT, enT];
  };

  /* ---------------- ZBRANĚ ---------------- */
  function forgeWeapons() {
    if (!F) return;
    const isSam = w => G.SAM_OK && w.model && G.SAM_OK[w.cat] && G.SAM_OK[w.cat].includes(w.model.id);
    const list = G.weaponSkins.filter(w => w.model && !keep(w) && ['melee', 'pole', 'bow', 'staff'].includes(w.cat));
    const added = [];
    list.forEach(w => {
      const r = rngOf('W' + w.id), rank = RANK(w.rarity);
      const nm = (w.name || '').toLowerCase();
      const theme = themeFor(nm, r);
      const hints = SHAPE_HINTS[w.cat] || [];
      const hh = hints.find(([re]) => re.test(nm));
      const hint = hh ? hh[1] : null;
      const sam = isSam(w);
      // 1) PŘEKOVÁNÍ stávající zbraně: nový tvar, jméno a barvy zůstávají
      const parts = design(w.cat, r, rank, theme, hint, sam);
      const id = 'kv_' + w.id;
      register(id, w.cat, parts);
      const glow = w.model.glow || (rank >= 3 && theme && theme.glow) || null;
      w.model = Object.assign({}, w.model, { id, cat: w.cat }, glow ? { glow } : {});
      // 2) NOVÁ zbraň stejné kategorie a vzácnosti, s jiným tématem
      const r2 = rngOf('N' + w.id);
      const p2 = design(w.cat, r2, rank, null, null, sam);
      const noun0 = w.cat === 'melee' ? (p2.blade ? NOUN.blade[p2.blade] : NOUN.head[p2.head]) : w.cat === 'pole' ? NOUN.pole[p2.head] : w.cat === 'bow' ? NOUN.bow[p2.style] : NOUN.staff[p2.head];
      let ti = Math.floor(r2() * THEMES.length), th2;
      for (let k = 0; k < THEMES.length; k++) { th2 = THEMES[(ti + k) % THEMES.length]; if (!NAMES.has((noun0 ? noun0[0] : '') + th2.cs)) break; }
      NAMES.add((noun0 ? noun0[0] : '') + th2.cs);
      const id2 = 'kn_' + w.id;
      register(id2, w.cat, p2);
      const noun = w.cat === 'melee' ? (p2.blade ? NOUN.blade[p2.blade] : NOUN.head[p2.head]) : w.cat === 'pole' ? NOUN.pole[p2.head] : w.cat === 'bow' ? NOUN.bow[p2.style] : NOUN.staff[p2.head];
      const col = colorsOf(th2, {});
      const model = Object.assign({ cat: w.cat, id: id2 }, col, (rank >= 2 && th2.glow && (rank >= 3 || r2() < 0.5)) ? { glow: th2.glow } : {});
      if (w.cat === 'bow') { model.arrow = col.blade; model.tip = col.guard; }
      const d = descOf(w.cat, p2, th2);
      added.push({ id: 'n_' + w.id, name: `${noun ? noun[0] : 'Zbraň'} ${th2.cs}`, rarity: w.rarity, cat: w.cat, model, desc: d[0],
        en: { name: `${noun ? noun[1] : 'Weapon'} ${th2.en}`, desc: d[1] }, bonus: Object.assign({}, WB[rank]), cost: Object.assign({}, PRICE[rank]), forged: true });
    });
    G.weaponSkins.push(...added);
    G.forgeStats = Object.assign(G.forgeStats || {}, { weaponsRestyled: list.length, weaponsAdded: added.length });
  }

  /* ---------------- ZBROJE ---------------- */
  function forgeArmor() {
    if (!AF || !AF.lists) return;
    const Lz = AF.lists;
    const list = G.unitSkins.filter(s => !keep(s) && !s.exclusive);
    const added = [];
    const armorParts = (r, rank, theme, nat) => {
      const shellPool = nat === 'samurajove' ? Lz.shells.filter(x => /kabuto|jingasa|eboshi|mask|hood|circlet|crown/.test(x)) : nat === 'vikingove' ? Lz.shells.filter(x => /spangen|vendel|bear|wolf|hood|skull|kettle|circlet|crown/.test(x)) : Lz.shells;
      const shells = shellPool.length ? shellPool : Lz.shells;
      const SAMB = ['sashi_mon', 'sashi_twin', 'horo', 'sashi_fan'];
      const backs = nat === 'samurajove' ? Lz.backs.filter(b => !['furcloak', 'shell'].includes(b)) : Lz.backs.filter(b => !SAMB.includes(b));
      const chests = nat === 'samurajove' ? Lz.chests.filter(c => !['cross', 'lionplate', 'furstraps'].includes(c)) : Lz.chests.filter(c => c !== 'shimenawa');
      const shoulders = nat === 'samurajove' ? Lz.shoulders.filter(c => c !== 'lion') : Lz.shoulders.filter(c => c !== 'sode');
      const visors = nat === 'samurajove' ? Lz.visors : Lz.visors.filter(v => v !== 'mempo' && v !== 'oni');
      const crests = (nat === 'samurajove' ? Lz.crests : Lz.crests.filter(c => c !== 'maedate' && c !== 'kuwagata')).filter(c => c !== 'halo');   // žádné zlaté kroužky nad hlavou
      const shapes = nat === 'samurajove' ? ['tate', 'tate', 'round', 'hex', 'oval', 'buckler', 'crescent'] : nat === 'vikingove' ? ['viking', 'viking', 'round', 'buckler', 'spiked', 'oval', 'kite'] : Lz.shieldShapes.filter(x => x !== 'tate');
      const helmet = { shell: pick(r, shells), crest: (rank >= 1 || r() < 0.5) ? pick(r, crests) : null, visor: (rank >= 2 || r() < 0.4) ? pick(r, visors) : null };
      const shield = { shape: pick(r, shapes), emblem: pick(r, nat === 'samurajove' ? ['mon', 'mon', 'sun', 'moon', 'flame', 'star', 'dragon', 'tree'] : Lz.emblems), pattern: (rank >= 1 && r() < 0.6) ? pick(r, Lz.patterns) : undefined };
      const af = { back: (rank >= 1 || r() < 0.5) ? pick(r, backs) : null, chest: pick(r, chests), shoulder: (rank >= 1 || r() < 0.6) ? pick(r, shoulders) : null, aura: rank >= 3 ? pick(r, Lz.auras) : (rank === 2 && r() < 0.35 ? pick(r, Lz.auras) : null) };
      if (theme && theme.glow && rank >= 2) af.glow = theme.glow;
      return { helmet, shield, af };
    };
    const natOf = s => s.only && s.only.length ? (G.units[s.only[0]] || {}).faction : null;
    list.forEach(s => {
      const r = rngOf('A' + s.id), rank = RANK(s.rarity), nat = natOf(s);
      const p = armorParts(r, rank, null, nat);
      const hid = 'kvh_' + s.id, sid = 'kvs_' + s.id;
      AF.helmet(hid, p.helmet); AF.shield(sid, p.shield);
      s.look = Object.assign({}, s.look || {}, { helmet: hid, shield: sid });
      const of = s.feat || {}, kept = {};
      ['cape', 'capeColor', 'emblemColor', 'mount'].forEach(k => { if (of[k] !== undefined) kept[k] = of[k]; });
      s.feat = Object.assign(kept, { af: p.af });
      // NOVÁ zbroj pro stejné vojáky
      const r2 = rngOf('NA' + s.id);
      const TITLE = [['Garda', 'Guard'], ['Řád', 'Order'], ['Strážce', 'Warden'], ['Hlídka', 'Watch'], ['Legie', 'Legion'], ['Bratrstvo', 'Brotherhood'], ['Rytíř', 'Knight'], ['Vládce', 'Lord']];
      let th, tt, t0 = Math.floor(r2() * THEMES.length), q0 = Math.floor(r2() * (3 + rank * 1.7));
      for (let k = 0; k < THEMES.length * TITLE.length; k++) { th = THEMES[(t0 + k) % THEMES.length]; tt = TITLE[Math.min(TITLE.length - 1, q0 + Math.floor(k / THEMES.length)) % TITLE.length]; if (!NAMES.has(tt[0] + th.cs)) break; }
      NAMES.add(tt[0] + th.cs);
      const p2 = armorParts(r2, rank, th, nat);
      const nid = 'na_' + s.id;
      AF.helmet('kvh_' + nid, p2.helmet); AF.shield('kvs_' + nid, p2.shield);
      const pal = { tunic: th.dark, tunicDark: shade(th.dark, -0.3), trim: th.guard, metal: th.blade, metalDark: th.dark, cape: th.grip, plume: th.edge, hood: th.dark, robe: th.dark, lace: th.guard, mask: th.dark, sashi: th.dark, mon: th.guard, fur: th.blade, bear: th.dark };
      added.push({ id: nid, only: s.only || null, name: `${tt[0]} ${th.cs}`, rarity: s.rarity, palette: pal, feat: { emblemColor: th.guard, af: p2.af }, look: { helmet: 'kvh_' + nid, shield: 'kvs_' + nid },
        desc: L('Nově vykovaná zbroj z Kovárny.', 'Newly forged armor from the Forge.'), en: { name: `${tt[1]} ${th.en}`, desc: 'Newly forged armor from the Forge.' },
        glow: rank >= 3 ? th.glow || undefined : undefined, mount: s.mount, bonus: Object.assign({}, AB[rank]), cost: Object.assign({}, PRICE[rank]), forged: true });
    });
    G.unitSkins.push(...added);
    G.forgeStats = Object.assign(G.forgeStats || {}, { armorRestyled: list.length, armorAdded: added.length });
  }

  try { forgeWeapons(); } catch (e) { console.error('Kovárna zbraní', e); }
  try { forgeArmor(); } catch (e) { console.error('Kovárna zbrojí', e); }
})();
