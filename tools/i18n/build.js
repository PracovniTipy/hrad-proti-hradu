const fs=require('fs');const LANGS=['de','pl','es','pt'];
const D=require('./Dfull.json');const S=require('./srcS.json');
const out={};LANGS.forEach(l=>out[l]={D:{},S:{}});
const ph=s=>(s.match(/\{[a-z0-9_]+\}/gi)||[]).sort().join(',');
const tagc=s=>(s.match(/<[a-z\/][^>]*>/gi)||[]).length;
const warn=[];
const files=fs.readdirSync('.').sort();
for(const f of files.filter(f=>/^trD_.*\.txt$/.test(f))){
  for(const line of fs.readFileSync(f,'utf8').split('\n')){
    if(!line.trim())continue;const i=line.indexOf('=');const k=line.slice(0,i),v=line.slice(i+1);
    if(!D[k]){warn.push(f+': unknown key '+k);continue;}
    const parts=f.startsWith('trD_pl')?[null,v,null,null]:v.split(' ¦ ');
    if(parts.length!==4){warn.push(f+': bad parts '+k);continue;}
    parts.forEach((t,j)=>{if(t==null||t==='-')return;t=t.trim();const en=D[k][1];if(ph(t)!==ph(en))warn.push(`${f}: ph ${LANGS[j]} ${k}: ${t}`);out[LANGS[j]].D[k]=t;});
  }
}
for(const f of files.filter(f=>/^trS_.*\.txt$/.test(f))){
  for(const line of fs.readFileSync(f,'utf8').split('\n')){
    if(!line.trim()||line.startsWith('#'))continue;const i=line.indexOf('=');const id=+line.slice(0,i),v=line.slice(i+1);
    const src=S[id];if(!src){warn.push(f+': bad id '+id);continue;}
    const parts=v.split(' ¦ ');if(parts.length!==4){warn.push(f+': parts '+id+' '+parts.length);continue;}
    parts.forEach((t,j)=>{if(t==='-')return;
      // keep leading/trailing spaces of source
      const lead=src.s.match(/^\s*/)[0],trail=src.s.match(/\s*$/)[0];t=lead+t.trim()+trail;
      {const a=new Set((src.s.match(/\{[a-z0-9_]+\}/gi)||[])),b=(t.match(/\{[a-z0-9_]+\}/gi)||[]);if(b.some(x=>!a.has(x))||b.length<a.size&&!/\{1\}/.test(src.s))warn.push(`${f}: ph ${LANGS[j]} #${id}: ${src.s} => ${t}`);}
      if(tagc(t)!==tagc(src.s))warn.push(`${f}: tags ${LANGS[j]} #${id}`);
      out[LANGS[j]].S[src.s]=t;});
  }
}

for(const f of files.filter(f=>/^trX_.*\.txt$/.test(f))){
  for(const line of fs.readFileSync(f,'utf8').split('\n')){
    if(!line.trim())continue;const i=line.indexOf('@@');const en=line.slice(0,i),parts=line.slice(i+2).split(' ¦ ');
    if(parts.length!==4){warn.push(f+': parts '+en);continue;}
    parts.forEach((t,j)=>{if(t!=='-')out[LANGS[j]].S[en]=t.trim();});
  }
}
// generované: témata Kovárny „{0} of Flame“ a podstatná jména s tečkou („Sword.“)
const NOUNS=S.slice(34,102).map(x=>x.s).concat(['Katana','Estoc','Fang','Bearded Axe','Double Axe','Tomahawk','Maul','War Fork','Hook Spear','Lantern Staff','Totem Staff','Halberd','Glaive','Trident','Naginata','All-Seeing Staff']);
for(const l of LANGS){const T=out[l].S;
  for(let i=14;i<34;i++){const en=S[i].s;if(T[en])T['{0} '+en]='{0} '+T[en];}
  for(const n of NOUNS){if(T[n])T[n+'.']=T[n]+'.';}
}
for(const l of LANGS){
  if(l==='es'){for(const k in out.es.D)out.es.D[k]=out.es.D[k].replace(/prémium/g,'premium').replace(/Prémium/g,'Premium');for(const k in out.es.S)out.es.S[k]=out.es.S[k].replace(/prémium/g,'premium').replace(/Prémium/g,'Premium');}
  const js=`/* Překlady: ${l} – generováno ze zdrojových seznamů (viz js/i18n_l.js). D = klíče I18N.D, S = podle anglického textu. */\nI18N.addLang('${l}', ${JSON.stringify(out[l],null,0).replace(/","/g,'",\n"').replace(/^\{"D":\{/,'{"D":{\n')});\n`;
  fs.writeFileSync('/home/claude/hradova-hra/js/i18n_'+l+'.js',js);
  console.log(l,'D',Object.keys(out[l].D).length,'S',Object.keys(out[l].S).length);
}
console.log(warn.join('\n'));
