#!/usr/bin/env python3
"""Build pro CrazyGames: jeden soubor cg/index.html se zvuky vloženými jako data: URL
(CrazyGames nahrává jen to, co se nahraje do portálu – složka zvuky/ by chyběla)."""
import base64, json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_single.py')], check=True, stdout=subprocess.DEVNULL)
html = open(os.path.join(ROOT, 'dist', 'castle-wars.html'), encoding='utf-8').read()
zv = {}
for f in sorted(os.listdir(os.path.join(ROOT, 'zvuky'))):
    if f.endswith('.mp3'):
        zv[f] = 'data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(ROOT, 'zvuky', f), 'rb').read()).decode()
# zvuky jako samostatné soubory ve složce cg/zvuky (rychlejší první načtení: HTML bez 3 MB base64)
import shutil
zdst = os.path.join(ROOT, 'cg', 'zvuky'); os.makedirs(zdst, exist_ok=True)
for f in zv: shutil.copyfile(os.path.join(ROOT, 'zvuky', f), os.path.join(zdst, f))
# zvuky se nahrávají do portálu jako ploché soubory vedle index.html (nahrání složky přes prohlížeč cestu zvuky/ ztrácí)
inj = '<script>window.CW_PORTAL="crazygames";</script>'
inj_flat = '<script>window.CW_PORTAL="crazygames";window.CW_ZVUKY=' + json.dumps({f: f for f in zv}) + ';</script>'
fdst = os.path.join(ROOT, 'cg', 'plochy'); os.makedirs(fdst, exist_ok=True)
for f in zv: shutil.copyfile(os.path.join(ROOT, 'zvuky', f), os.path.join(fdst, f))
html0 = html
html = html0.replace('<head>', '<head>' + inj, 1)
os.makedirs(os.path.join(ROOT, 'cg'), exist_ok=True)
open(os.path.join(ROOT, 'cg', 'index.html'), 'w', encoding='utf-8').write(html)
flat = html0.replace('<head>', '<head>' + inj_flat, 1)
# RYCHLEJŠÍ START NA MOBILU (plochá sada má víc souborů, HTML je menší):
# 1) písma jako samostatné .woff2 (font-display:swap → hra se ukáže hned, písmo doskočí)
import re as _re
_fi = [0]
def _font(m):
    _fi[0] += 1; fn = 'pismo%d.woff2' % _fi[0]
    open(os.path.join(fdst, fn), 'wb').write(base64.b64decode(m.group(1)))
    return 'url(' + fn + ')'
flat = _re.sub(r"url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\)", _font, flat)
# 2) překlady de/pl/es/pt jen když je hráč potřebuje (jinak se 700 kB textu vůbec nenačítá)
LAZY = ['de', 'pl', 'es', 'pt']
for l in LAZY:
    m = _re.search(r'<script>\n/\* js/i18n_%s\.js \*/\n(.*?)\n</script>' % l, flat, _re.S)
    if not m: continue
    open(os.path.join(fdst, 'i18n_%s.js' % l), 'w', encoding='utf-8').write(m.group(1))
    flat = flat[:m.start()] + flat[m.end():]
loader = ("<script>(function(){var need={},L=%s;try{var s=JSON.parse(localStorage.getItem('hrad-proti-hradu-save-v1')||'{}');if(s&&s.lang)need[s.lang]=1;}catch(e){}"
          "need[String(navigator.language||'').slice(0,2).toLowerCase()]=1;window.CW_LAZYLANG={};"
          "L.forEach(function(l){if(need[l])document.write('<script src=\"i18n_'+l+'.js\"><\\/script>');else window.CW_LAZYLANG[l]=1;});})();</script>") % json.dumps(LAZY)
ml = _re.search(r'<script>\n/\* js/i18n_l\.js \*/\n.*?\n</script>', flat, _re.S)
flat = flat[:ml.end()] + loader + flat[ml.end():]   # až po i18n_l.js (definuje I18N.addLang)
# když si hráč později přepne na nenačtený jazyk, nejdřív se dotáhne jeho soubor
hook = ("<script>(function(){var A=window.App;if(!A||!A.setLang)return;var o=A.setLang;A.setLang=function(l){var t=this,a=arguments,z=window.CW_LAZYLANG||{};"
        "if(z[l]){var sc=document.createElement('script');sc.src='i18n_'+l+'.js';sc.onload=sc.onerror=function(){z[l]=0;o.apply(t,a);};document.head.appendChild(sc);return;}return o.apply(t,a);};})();</script>")
mm = _re.search(r'<script>\n/\* js/main\.js \*/\n.*?\n</script>', flat, _re.S)
flat = flat[:mm.end()] + hook + flat[mm.end():]
open(os.path.join(fdst, 'index.html'), 'w', encoding='utf-8').write(flat)
print('cg/plochy/index.html', round(len(flat) / 1e6, 2), 'MB,', _fi[0], 'písem')
print('cg/index.html', round(len(html) / 1e6, 1), 'MB,', len(zv), 'zvuků')
