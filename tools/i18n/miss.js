const { chromium } = require('playwright');
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'Tester', lang:'de', langAsked2:1, tut:{home:1,editor:1,battle:1}, hintCount:9, regNever:1 }));localStorage.setItem('cw-test-hide','1');localStorage.setItem('cw-i18n-debug','1')`);
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => ({miss:[...I18N._miss], D:Object.fromEntries(Object.entries(I18N.D))}));
  require('fs').writeFileSync(__dirname+'/miss.json', JSON.stringify(r.miss,null,1));
  require('fs').writeFileSync(__dirname+'/Dfull.json', JSON.stringify(r.D));
  console.log('errs',errs,'miss',r.miss.length, r.miss.reduce((a,x)=>a+x.length,0));
  await br.close();
})();
