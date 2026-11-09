const { chromium } = require('playwright');
(async () => {
  const [lang, w, h] = process.argv.slice(2); const W = +w, H = +h;
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'Tester', lang:'${lang}', langAsked2:1, tut:{home:1,editor:1,battle:1,shop:1,sprava:1,pribeh:1,pvp:1,vez:1}, hintCount:9, lastDaily: new Date().toDateString(), daily:{last:new Date().toDateString()}, regNever:1, gold:50000, gems:3000 }));localStorage.setItem('cw-test-hide','1');localStorage.setItem('cw-vanoce','1')`);
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3000);
  const check = name => p.evaluate(name => [...document.querySelectorAll('body *')].filter(e => {
      if (!e.offsetParent || !e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis' && cs.overflowX === 'visible') return false;
      return e.scrollWidth > e.clientWidth + 1;
    }).map(e => name + ': ' + (e.className || e.tagName) + ' | ' + e.textContent.trim().slice(0, 50)), name);
  let out = [];
  await p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.hidden = true; });
  out = out.concat(await check('home'));
  for (const s of ['sprava', 'obchod', 'zebricek', 'pvp', 'vez', 'pribeh']) { await p.evaluate(s => App.go(s), s); await p.waitForTimeout(700); out = out.concat(await check(s)); }
  await p.evaluate(() => App.go('obchod')); await p.waitForTimeout(500);
  for (const t of ['pas', 'vojaci', 'utoky', 'hrady', 'dekorace', 'drahokamy', 'kody']) { await p.evaluate(t => { const b = document.querySelector(`[data-tab="${t}"]`); b && b.click(); }, t); await p.waitForTimeout(600); out = out.concat(await check('shop_' + t)); }
  console.log(lang, W, out.length); console.log(out.join('\n'));
  await br.close();
})();
