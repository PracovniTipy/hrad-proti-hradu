#!/usr/bin/env python3
"""Build pro GameDistribution: dist/CastleWARS-GD.zip = index.html (zvuky vložené jako data: URL,
CW_PORTAL=gamedistribution, CW_GD_ID = gameId z GD Developer panelu) + ikony.
Použití: python3 tools/build_gd.py <GD_GAME_ID>
SDK (html5.api.gamedistribution.com/main.min.js) načítá js/core/reklamy_web.js."""
import base64, json, os, subprocess, sys, zipfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
gid = sys.argv[1] if len(sys.argv) > 1 else ''
subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_single.py')], check=True, stdout=subprocess.DEVNULL)
html = open(os.path.join(ROOT, 'dist', 'castle-wars.html'), encoding='utf-8').read()
zd = os.path.join(ROOT, 'zvuky')
zv = {f: 'data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(zd, f), 'rb').read()).decode() for f in sorted(os.listdir(zd)) if f.endswith('.mp3')}
inj = ('<script>window.CW_PORTAL="gamedistribution";window.CW_GD_ID=' + json.dumps(gid) + ';window.CW_ZVUKY=' + json.dumps(zv) + ';</script>')
html = html.replace('<head>', '<head>' + inj, 1)
out = os.path.join(ROOT, 'dist', 'CastleWARS-GD.zip')
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('index.html', html)
    for f in ['icon-192.png', 'icon-512.png']:
        p = os.path.join(ROOT, 'icons', f)
        if os.path.exists(p): z.write(p, 'icons/' + f)
print(out, round(os.path.getsize(out) / 1e6, 1), 'MB, gameId =', gid or '(chybí!)')
