const { chromium } = require('playwright');
(async () => {
  const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'T', lang:'pl', langAsked2:1, tut:{home:1,editor:1,battle:1}, hintCount:9, regNever:1 }));localStorage.setItem('cw-test-hide','1')`);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  const r = [];
  for (const l of ['de', 'cs', 'en', 'es', 'pl']) { await p.evaluate(l => App.setLang(l), l); await p.waitForTimeout(500); r.push(await p.evaluate(() => I18N.lang + ':' + GameData.units.pesak.name + '/' + GameData.factions.vikingove.name + '/' + document.querySelector('.nav-lbl').textContent)); }
  await p.evaluate(() => App.go('profil')); await p.waitForTimeout(800);
  const opts = await p.evaluate(() => { const s = document.getElementById('langSel'); return s ? [...s.options].map(o => o.textContent).filter(t => /Polski|Deutsch/.test(t)) : 'no select'; });
  console.log(r, opts, errs); await br.close();
})();
