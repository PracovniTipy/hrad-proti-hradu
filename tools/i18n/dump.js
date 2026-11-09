const { chromium } = require('playwright');
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(`localStorage.setItem('hrad-proti-hradu-save-v1', JSON.stringify({ name:'Tester', lang:'en', langAsked2:1, tut:{home:1,editor:1,battle:1}, hintCount:9, regNever:1 }));localStorage.setItem('cw-test-hide','1')`);
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    const G=GameData; const en={};
    en.D=I18N.D;
    en.EN=window.I18N_EN;
    en.campaigns={}; Object.keys(G.campaigns).forEach(f=>G.campaigns[f].forEach(ch=>{en.campaigns[f+':'+ch.id]={en:ch.en||null,levels:ch.levels.map(l=>[l.id,l.en||null])}}));
    en.scenesEn=G.scenesEn||null;
    en.unitSkinsEn=G.unitSkins.filter(s=>s.en).map(s=>[s.id,s.en]);
    en.weaponSkinsEn=(G.weaponSkins||[]).filter(s=>s.en).map(s=>[s.id,s.en]);
    en.castleSkinsEn=G.castleSkins.filter(s=>s.en).map(s=>[s.id,s.en]);
    return en;
  });
  require('fs').writeFileSync(__dirname+'/dump.json', JSON.stringify(r,null,1));
  console.log('errs',errs);
  await br.close();
})();
