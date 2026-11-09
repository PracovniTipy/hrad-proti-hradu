const { chromium } = require('playwright');
(async () => {
  const br = await chromium.launch(); const res = {};
  for (const lang of ['cs', 'en', 'zh', 'ar', 'pl', 'de', 'es', 'pt', 'fr', 'ru']) {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'T', lang:'${lang}', langAsked2:1, tut:{home:1,editor:1,battle:1}, hintCount:9, regNever:1 }));localStorage.setItem('cw-test-hide','1')`);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
    res[lang] = await p.evaluate(() => ({ dir: document.documentElement.dir, lang: I18N.lang, nav: I18N.t('nav_obchod'), pet: I18N.L('Mazlíček', 'Pet'), unit: GameData.units.pesak.name, fac: GameData.factions.samurajove.name, ab: GameData.abilities.ohen.name, floor: (GameData.tower && GameData.tower.floor ? GameData.tower.floor(7).name : '?'), rar: I18N.t('rar_4'), langs: I18N.LANGS.map(l => l.id).join(','), forged: (GameData.weaponSkins.find(w => w.forged) || {}).name, forgedD: (GameData.weaponSkins.find(w => w.forged) || {}).desc }));
    res[lang].errs = errs.length; await ctx.close();
  }
  // auto-detect pl
  const ctx = await br.newContext({ locale: 'pl-PL' }); const p = await ctx.newPage(); await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  res.autodetect = await p.evaluate(() => I18N.lang);
  console.log(JSON.stringify(res, null, 1)); await br.close();
})();
