// node sweep.js lang w h  -> screenshots + accumulated misses
const { chromium } = require('playwright');
(async () => {
  const [lang, w, h] = process.argv.slice(2); const W = +w, H = +h;
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'Tester', lang:'${lang}', langAsked2:1, tut:{home:1,editor:1,battle:1,shop:1,sprava:1,pribeh:1,pvp:1,vez:1}, hintCount:9, lastDaily: new Date().toDateString(), daily:{last:new Date().toDateString()}, stats:{wins:4,losses:0,kills:5}, regNever:1, gold:50000, gems:3000 }));localStorage.setItem('cw-test-hide','1');localStorage.setItem('cw-vanoce','1');localStorage.setItem('cw-i18n-debug','1')`);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3500);
  const clean = () => p.evaluate(() => { document.querySelectorAll('.test-banner, .tb-card, [class*=tester], .inst-card, .and-card').forEach(e => e.remove()); });
  const closeModal = () => p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.hidden = true; document.querySelectorAll('.xm-ov,.kl-ov').forEach(e=>e.remove()); });
  const shot = async n => { await clean(); await p.screenshot({ path: `${__dirname}/s_${lang}_${W}_${n}.png` }); };
  const ov = [];
  await closeModal(); await shot('home');
  for (const scr of ['sprava', 'obchod', 'zebricek', 'pvp', 'vez', 'pribeh']) {
    await p.evaluate(s => App.go(s), scr); await p.waitForTimeout(900); await shot(scr);
  }
  await p.evaluate(() => App.go('hrad')); await p.waitForTimeout(900); await closeModal();
  for (const id of ['petBtn', 'hallBtn', 'friendsBtn', 'turnajBtn', 'klanBtn', 'xmBtn', 'questBtn', 'passBtn', 'dailyBtn']) {
    const ok = await p.evaluate(id => { const b = document.getElementById(id); if (!b) return false; b.click(); return true; }, id);
    if (!ok) { console.log('no', id); continue; }
    await p.waitForTimeout(1300); await shot(id);
    await p.keyboard.press('Escape'); await closeModal(); await p.evaluate(() => App.go('hrad')); await p.waitForTimeout(700);
  }
  // battle + result
  await p.evaluate(() => App._startTraining('kralovstvi')); await p.waitForTimeout(2500); await shot('battle');
  await p.evaluate(() => App.battle._end(true, 'castle')); await p.waitForTimeout(2800); await shot('result');
  // overflow check on visible elements
  const over = await p.evaluate(() => [...document.querySelectorAll('button, .daily-lbl, .nav-lbl, .btn')].filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 2).map(e => e.textContent.trim().slice(0, 40)));
  const miss = await p.evaluate(() => [...(I18N._miss || [])]);
  require('fs').writeFileSync(`${__dirname}/miss_${lang}_${W}.json`, JSON.stringify(miss, null, 1));
  console.log(lang, W, 'errs', errs, 'miss', miss.length, 'overflow', over);
  await br.close();
})();
