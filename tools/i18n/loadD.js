const fs=require('fs'),vm=require('vm');
const R='/home/claude/hradova-hra/';
const ctx={window:{},document:{documentElement:{}},console};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['js/i18n.js','js/i18n_obsah.js']) vm.runInContext(fs.readFileSync(R+f,'utf8'),ctx);
module.exports=ctx;
if(require.main===module){
const D=ctx.I18N.D,o=ctx.I18N.order;const keys=Object.keys(D);
let len={};keys.forEach(k=>{len[D[k].length]=(len[D[k].length]||0)+1});
console.log('keys',keys.length,len);
for(const l of ['de','es','pt','fr','ru']){const i=o.indexOf(l);let miss=0,same=0;keys.forEach(k=>{const r=D[k];if(!r[i])miss++;else if(r[i]===r[1]&&r[1].length>3)same++;});console.log(l,'missing',miss,'sameAsEn',same);}
}
