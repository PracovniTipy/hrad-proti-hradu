const ts=require(require('child_process').execSync('npm root -g').toString().trim()+'/typescript');
const fs=require('fs'),path=require('path');
const R='/home/claude/hradova-hra/js';
const files=[];(function w(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())w(p);else if(f.endsWith('.js')&&!/i18n/.test(f))files.push(p);}})(R);
const out=new Map();
const czech=/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/;
function strOf(n,sf){
  if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))return {s:n.text};
  if(ts.isTemplateExpression(n)){let s=n.head.text,i=0;for(const sp of n.templateSpans){s+='{'+(i++)+'}'+sp.literal.text;}return {s,tpl:true,n:i};}
  if(ts.isParenthesizedExpression(n))return strOf(n.expression,sf);
  return null;
}
function add(cs,en,file,kind){
  if(!en||!en.s)return; const k=en.s; if(!/[A-Za-z]{2}/.test(k))return;
  if(cs&&cs.s===k)return;
  if(!out.has(k))out.set(k,{en:k,cs:cs?cs.s:null,tpl:!!en.tpl,files:new Set(),kind});
  out.get(k).files.add(path.relative(R,file));
}
for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const hasL=/const L = \(|L = \(c, e\)/.test(src);
  (function visit(n){
    if(ts.isCallExpression(n)&&n.arguments.length>=2){
      const c=n.expression.getText(sf);
      if((c==='L'&&hasL)||c==='I18N.L'||c==='I18N.Lf'){add(strOf(n.arguments[0],sf),strOf(n.arguments[1],sf),f,'L');}
    }
    if(ts.isObjectLiteralExpression(n)){
      const pr={};n.properties.forEach(p=>{if(ts.isPropertyAssignment(p)){const nm=p.name.getText(sf);pr[nm]=p.initializer;}});
      if(pr.cs&&pr.en){const a=strOf(pr.cs,sf),b=strOf(pr.en,sf);if(a&&b)add(a,b,f,'obj');}
      // fx: ['cs','en']
    }
    if(ts.isArrayLiteralExpression(n)&&n.elements.length===2&&hasL){
      const a=strOf(n.elements[0],sf),b=strOf(n.elements[1],sf);
      if(a&&b&&czech.test(a.s)&&!czech.test(b.s))add(a,b,f,'arr');
    }
    if(ts.isConditionalExpression(n)&&/lang/.test(n.condition.getText(sf))){
      const a=strOf(n.whenTrue,sf),b=strOf(n.whenFalse,sf);
      if(a&&b){ if(/!==/.test(n.condition.getText(sf))||/=== 'en'/.test(n.condition.getText(sf)))add(b,a,f,'tern');else add(a,b,f,'tern');}
    }
    ts.forEachChild(n,visit);
  })(sf);
}
const arr=[...out.values()].map(x=>({...x,files:[...x.files]}));
fs.writeFileSync(__dirname+'/lstrings.json',JSON.stringify(arr,null,1));
const by={};arr.forEach(x=>x.files.forEach(f=>by[f]=(by[f]||0)+1));
console.log(arr.length,'tpl',arr.filter(x=>x.tpl).length,'chars',arr.reduce((a,x)=>a+x.en.length,0));console.log(by);
const kinds={};arr.forEach(x=>kinds[x.kind]=(kinds[x.kind]||0)+1);console.log(kinds);
