const ts=require(require('child_process').execSync('npm root -g').toString().trim()+'/typescript');
const fs=require('fs'),path=require('path');const R='/home/claude/hradova-hra/js';
const files=[];(function w(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())w(p);else if(f.endsWith('.js')&&!/i18n/.test(f))files.push(p);}})(R);
const flat=(n,sf)=>{let i=0;const go=n=>{if(ts.isParenthesizedExpression(n))return go(n.expression);if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.PlusToken)return go(n.left)+go(n.right);if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))return n.text;if(ts.isTemplateExpression(n)){let s=n.head.text;for(const sp of n.templateSpans)s+='{'+(i++)+'}'+sp.literal.text;return s;}return '{'+(i++)+'}';};return go(n);};
const out=new Set();
for(const f of files){const src=fs.readFileSync(f,'utf8');const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 (function v(n){if(ts.isCallExpression(n)&&n.arguments.length>=2&&/^(L|I18N\.L)$/.test(n.expression.getText(sf))){const a=n.arguments[1];if(ts.isBinaryExpression(a)){const s=flat(a,sf);if(/[a-z]{3}/.test(s))out.add(path.relative(R,f)+' | '+s);}}ts.forEachChild(n,v);})(sf);}
console.log([...out].join('\n'));
