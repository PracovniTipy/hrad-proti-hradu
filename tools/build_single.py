"""Sloučí hru do jednoho HTML souboru (dist/hrad-proti-hradu.html).
Spuštění ze složky projektu:  python3 tools/build_single.py
Volba --fragment vytvoří verzi bez <html>/<head>/<body> (pro publikování jako artifact)."""
import re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')

css = (root / 'css/style.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')

def inline(m):
    src = m.group(1)
    code = (root / src).read_text(encoding='utf-8')
    return '<script>\n/* ' + src + ' */\n' + code + '\n</script>'
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline, html)
# jednosouborová verze: ikony vložené jako data, bez manifestu a service workeru
import base64
ico = base64.b64encode((root / 'icons/icon-192.png').read_bytes()).decode()
html = re.sub(r'<link rel="manifest"[^>]*>\s*', '', html)
html = re.sub(r'<link rel="(icon|apple-touch-icon)"[^>]*>', '<link rel="icon" type="image/png" href="data:image/png;base64,' + ico + '">', html, count=1)
html = re.sub(r'<link rel="apple-touch-icon"[^>]*>\s*', '', html)
html = re.sub(r'<script>\s*// Offline režim.*?</script>', '', html, flags=re.S)

out = root / 'dist'
out.mkdir(exist_ok=True)
(out / 'hrad-proti-hradu.html').write_text(html, encoding='utf-8')

if '--fragment' in sys.argv:
    head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
    body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
    head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
    (out / 'artifact.html').write_text(head.strip() + '\n' + body.strip() + '\n', encoding='utf-8')
print('Hotovo:', out)
