// usage: node shot.js lang w h name [jsToRunAfterLoad]
const { chromium } = require('playwright');
(async () => {
  const [lang, w, h, name, js] = process.argv.slice(2);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: +w, height: +h } });
  await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'Tester', lang:'${lang}', langAsked2:1, tut:{home:1,editor:1,battle:1,shop:1,sprava:1,pribeh:1,pvp:1}, hintCount:9, lastDaily: new Date().toDateString(), daily:{last:new Date().toDateString()}, stats:{wins:4,losses:0,kills:5}, regNever:1, gold:50000, gems:3000 }));localStorage.setItem('cw-test-hide','1');localStorage.setItem('cw-vanoce','1');localStorage.setItem('cw-i18n-debug','1')`);
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3500);
  await p.evaluate(() => { const m=document.getElementById('modal'); if(m) m.hidden = true; document.querySelectorAll('.test-banner, .tb-card, [class*=tester]').forEach(e => e.remove()); });
  if (js) { await p.evaluate(js); await p.waitForTimeout(1500); }
  await p.screenshot({ path: __dirname + `/${name}.png` });
  const miss = await p.evaluate(() => I18N._miss ? [...I18N._miss] : []);
  require('fs').writeFileSync(__dirname+`/${name}.miss.json`, JSON.stringify(miss,null,1));
  console.log(name,'errs',errs,'miss',miss.length);
  await br.close();
})();
