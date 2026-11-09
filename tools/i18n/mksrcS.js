const fs=require('fs');
const L=require('./lstrings.json'), M=require('./miss.json');
// general lines
const g=fs.readFileSync('/home/claude/hradova-hra/js/core/general.js','utf8');
const gl=[];const re=/en: \[([^\]]*)\]/g;let m;while((m=re.exec(g))){for(const s of m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g))gl.push(s[1].replace(/\\'/g,"'"));}
const seen=new Set(),out=[];
const add=(s,tag)=>{if(seen.has(s))return;if(!/[A-Za-z]{2}/.test(s))return;seen.add(s);out.push({s,tag});};
const files=[...new Set(L.flatMap(x=>x.files))];
L.forEach(x=>add(x.en,x.files[0]));
M.forEach(s=>add(s,'content'));
gl.forEach(s=>add(s,'general-lines'));
fs.writeFileSync('srcS.json',JSON.stringify(out));
let cur='';const lines=[];out.forEach((x,i)=>{if(x.tag!==cur){lines.push('## '+x.tag);cur=x.tag;}lines.push(i+'='+x.s.replace(/\n/g,'\\n'));});
fs.writeFileSync('srcS.txt',lines.join('\n'));
console.log(out.length, out.reduce((a,x)=>a+x.s.length,0), 'nl',out.filter(x=>x.s.includes('\n')).length);
