const { chromium } = require('playwright');
(async () => {
  const [lang, w, h] = process.argv.slice(2); const W = +w, H = +h;
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'Tester', lang:'${lang}', langAsked2:1, tut:{home:1,editor:1,battle:1,shop:1,sprava:1,pribeh:1,pvp:1,vez:1}, hintCount:9, lastDaily: new Date().toDateString(), daily:{last:new Date().toDateString()}, stats:{wins:4,losses:0,kills:5}, regNever:1, gold:50000, gems:3000 }));localStorage.setItem('cw-test-hide','1');localStorage.setItem('cw-vanoce','1');localStorage.setItem('cw-i18n-debug','1')`);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3500);
  const shot = async n => { await p.evaluate(() => document.querySelectorAll('.test-banner, .tb-card, [class*=tester]').forEach(e => e.remove())); await p.screenshot({ path: `${__dirname}/t_${lang}_${W}_${n}.png` }); };
  await p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.hidden = true; App.go('obchod'); }); await p.waitForTimeout(800);
  for (const tab of ['pas', 'vojaci', 'utoky', 'hrady', 'dekorace', 'drahokamy', 'kody']) {
    await p.evaluate(t => { const b = document.querySelector(`[data-tab="${t}"]`); b && b.click(); }, tab); await p.waitForTimeout(800); await shot('shop_' + tab);
    await p.mouse.wheel(0, 600); await p.waitForTimeout(300);
  }
  await p.evaluate(() => App.go('pribeh')); await p.waitForTimeout(800);
  await p.evaluate(() => { const b = document.querySelector('[data-lvl]'); b && b.click(); }); await p.waitForTimeout(1000); await shot('level');
  await p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.hidden = true; App.go('vez'); }); await p.waitForTimeout(900);
  await p.evaluate(() => { const b = document.querySelector('.vz-floor, [data-floor]'); b && b.click(); }); await p.waitForTimeout(900); await shot('vez2');
  await p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.hidden = true; App.go('pvp'); }); await p.waitForTimeout(900); await shot('pvp');
  // settings/profile
  await p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.hidden = true; App.go('profil'); }); await p.waitForTimeout(900); await shot('profil');
  const miss = await p.evaluate(() => [...(I18N._miss || [])]);
  require('fs').writeFileSync(`${__dirname}/miss2_${lang}_${W}.json`, JSON.stringify(miss, null, 1));
  console.log(lang, W, 'errs', errs, 'miss', miss.length, miss.slice(0, 60));
  await br.close();
})();
