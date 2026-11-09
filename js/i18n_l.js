/* =========================================================================
   PŘEKLADY NAVÍC (de, pl, es, pt …) – načítá se hned po i18n.js
   - přidá polštinu (pl) do seznamu jazyků; pole v I18N.D zůstávají
     poziční (16 jazyků), polština čte z I18N.X.pl, jinak angličtina
   - I18N.X[lang].D = { klíč: text }      … přednost před I18N.D pro daný jazyk
   - I18N.X[lang].S = { 'English': text } … překlad podle anglického textu:
       používá I18N.L(cs, en) (všechny lokální L-helpery) i obsah hry
       (I18N.tr v localizeData). Vzory s {0}, {1}… pokryjí texty se
       vloženými čísly/jmény (pořadí v překladu může být jiné).
   - když překlad chybí, zůstává angličtina (nic se nerozbije)
   Data jazyků: js/i18n_de.js, js/i18n_pl.js, js/i18n_es.js, js/i18n_pt.js
   ========================================================================= */
(function () {
  const I = window.I18N;
  if (!I || I.L) return;
  // polština: na konec pořadí (index 16 v polích D zatím nikde není → fallback),
  // v nabídce jazyků hned za němčinu
  if (!I.order.includes('pl')) {
    I.order.push('pl');
    const de = I.LANGS.findIndex(l => l.id === 'de');
    I.LANGS.splice(de >= 0 ? de + 1 : I.LANGS.length, 0, { id: 'pl', name: 'Polski', en: 'Polish' });
  }
  I.X = I.X || {};
  const X = I.X;
  const pack = l => X[l] || (X[l] = { D: {}, S: {} });
  /* přidání překladů (volají soubory i18n_xx.js; lze volat víckrát) */
  I.addLang = function (l, data) {
    const p = pack(l);
    if (data.D) Object.assign(p.D, data.D);
    if (data.S) Object.assign(p.S, data.S);
    p._pat = null; p._memo = null;
  };

  const subst = (s, vars) => { if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]); return s; };
  const baseT = I.t;
  I.t = function (key, vars) {
    const p = X[I.lang];
    const s = p && p.D[key];
    if (s != null) return subst(s, vars);
    return baseT.call(I, key, vars);
  };

  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function patterns(p) {
    if (p._pat) return p._pat;
    const list = [];
    for (const k in p.S) {
      if (!/\{\d\}/.test(k)) continue;
      const parts = k.split(/\{(\d)\}/);   // [lit, idx, lit, idx, lit…]
      let re = '^', lit = '';
      const order = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) { re += esc(parts[i]); if (parts[i].length > lit.length) lit = parts[i]; }
        else { re += '([\\s\\S]*?)'; order.push(+parts[i]); }
      }
      if (lit.trim().length < 2) continue;      // vzor bez textu by chytal cokoli
      list.push({ re: new RegExp(re + '$'), lit, order, to: p.S[k] });
    }
    list.sort((a, b) => b.lit.length - a.lit.length);
    return (p._pat = list);
  }
  /* přeloží anglický text do aktuálního jazyka (bez překladu vrací původní) */
  I.tr = function (en, ctx) {
    if (typeof en !== 'string' || !en) return en;
    const p = X[I.lang];
    if (!p) return en;
    if (ctx && p.S[ctx + '|' + en] != null) return p.S[ctx + '|' + en];   // stejné anglické slovo v jiném významu
    const hit = p.S[en];
    if (hit != null) return hit;
    const memo = p._memo || (p._memo = new Map());
    if (memo.has(en)) return memo.get(en);
    let out = null;
    // mezery na krajích (' + stun ') a koncová tečka/dvojtečka se drží zvlášť
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(en);
    if (m && (m[1] || m[3]) && p.S[m[2]] != null) out = m[1] + p.S[m[2]] + m[3];
    if (out == null) {
      for (const P of patterns(p)) {
        if (!en.includes(P.lit)) continue;
        const r = P.re.exec(en);
        if (!r) continue;
        // vložené části, které jsou samy známým anglickým textem (i výčet „a, b, c“), se přeloží taky
        const tv = v => {
          if (p.S[v] != null) return p.S[v];
          const parts = v.split(', ');
          return parts.length > 1 && parts.every(x => p.S[x] != null) ? parts.map(x => p.S[x]).join(', ') : v;
        };
        out = P.to.replace(/\{(\d)\}/g, (_, d) => { const i = P.order.indexOf(+d); return i >= 0 ? tv(r[i + 1]) : ''; });
        break;
      }
    }
    if (out == null) { out = en; if (I._miss) I._miss.add(en); }
    if (memo.size > 4000) memo.clear();
    memo.set(en, out);
    return out;
  };
  /* L(cs, en): čeština → cs, angličtina → en, ostatní → překlad anglického textu */
  I.L = function (cs, en) {
    if (I.lang === 'cs') return cs;
    if (I.lang === 'en' || en == null) return en;
    if (Array.isArray(en)) return en.map(x => I.tr(x));
    return I.tr(en);
  };
  /* Lf(cs, en, vars): jako L, ale s {jméno} proměnnými (doplní se až po překladu) */
  I.Lf = function (cs, en, vars) { return subst(I.L(cs, en), vars); };
  try { if (localStorage.getItem('cw-i18n-debug') === '1') I._miss = new Set(); } catch (e) { /* nic */ }
})();
