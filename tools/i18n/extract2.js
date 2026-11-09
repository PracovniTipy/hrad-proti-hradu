const ts=require(require('child_process').execSync('npm root -g').toString().trim()+'/typescript');
const fs=require('fs'),path=require('path');const R='/home/claude/hradova-hra/js';
const known=new Set(Object.keys(JSON.parse(fs.readFileSync('/dev/stdin','utf8'))));
const files=[];(function w(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())w(p);else if(f.endsWith('.js')&&!/i18n/.test(f))files.push(p);}})(R);
const cz=/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/;const out=new Map();
for(const f of files){const src=fs.readFileSync(f,'utf8');const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 (function v(n){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){const s=n.text;
   if(!cz.test(s)&&/^[A-Z“"'(🎄⚔️🏆🎁]?[A-Za-z]/.test(s)&&/[a-z]{2,} [a-z]{2,}/.test(s)&&!/[<>{}=;\/\\]|\.js|\.png|function|px|rgba/.test(s)&&!known.has(s)){
     // sibling czech? check parent has a czech literal
     const par=n.parent; const txt=par?par.getText(sf):''; if(cz.test(txt)) out.set(s,path.relative(R,f));}}
  ts.forEachChild(n,v);})(sf);}
const arr=[...out].map(([s,f])=>f+' | '+s);fs.writeFileSync('extra.txt',arr.join('\n'));console.log(arr.length);
