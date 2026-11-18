#!/usr/bin/env python3
"""Build pro GamePix: dist/CastleWARS-GamePix.zip = index.html (zvuky vložené jako data: URL,
GamePix SDK v3 v <head> před hrou, manuální lifecycle, CW_PORTAL=gamepix) + ikony.
V portálu my.gamepix.com: Games → Castle WARS → Build → nahrát ZIP."""
import base64, json, os, subprocess, sys, zipfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_single.py')], check=True, stdout=subprocess.DEVNULL)
html = open(os.path.join(ROOT, 'dist', 'castle-wars.html'), encoding='utf-8').read()
zd = os.path.join(ROOT, 'zvuky')
zv = {f: 'data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(zd, f), 'rb').read()).decode() for f in sorted(os.listdir(zd)) if f.endswith('.mp3')}
inj = ('<script>window.GamePixConfig={lifecycle:"manual"};window.CW_PORTAL="gamepix";window.CW_ZVUKY=' + json.dumps(zv) + ';</script>'
       '<script src="https://integration.gamepix.com/sdk/v3/gamepix.sdk.js"></script>')
html = html.replace('<head>', '<head>' + inj, 1)
out = os.path.join(ROOT, 'dist', 'CastleWARS-GamePix.zip')
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('index.html', html)
    for f in ['icon-192.png', 'icon-512.png']:
        p = os.path.join(ROOT, 'icons', f)
        if os.path.exists(p): z.write(p, 'icons/' + f)
print(out, round(os.path.getsize(out) / 1e6, 1), 'MB,', len(zv), 'zvuků')
