#!/usr/bin/env python3
"""Build pro Playgama: dist/CastleWARS-Playgama.zip = playgama-bridge-config.json + index.html
(zvuky vložené jako data: URL, Playgama Bridge v2, CW_PORTAL=playgama) + ikony.
V portálu: Update Game → nahrát ZIP → Continue → vybrat build → Update in Sandbox."""
import base64, json, os, subprocess, sys, zipfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'build_single.py')], check=True, stdout=subprocess.DEVNULL)
html = open(os.path.join(ROOT, 'dist', 'castle-wars.html'), encoding='utf-8').read()
zd = os.path.join(ROOT, 'zvuky')
zv = {f: 'data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(zd, f), 'rb').read()).decode() for f in sorted(os.listdir(zd)) if f.endswith('.mp3')}
inj = '<script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script><script>window.CW_PORTAL="playgama";window.CW_ZVUKY=' + json.dumps(zv) + ';</script>'
html = html.replace('<head>', '<head>' + inj, 1)
out = os.path.join(ROOT, 'dist', 'CastleWARS-Playgama.zip')
cfg = {"platforms": {"playgama": {"options": {}}}, "advertisement": {"interstitial": {"minimumDelay": 180}}}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('playgama-bridge-config.json', json.dumps(cfg, indent=2))
    z.writestr('index.html', html)
    for f in ['maskable-512.png', 'pozvi-art.jpg', 'icon-192.png', 'apple-touch-icon.png', 'icon-512.png']:
        p = os.path.join(ROOT, 'icons', f)
        if os.path.exists(p): z.write(p, 'icons/' + f)
print(out, round(os.path.getsize(out) / 1e6, 1), 'MB,', len(zv), 'zvuků')
