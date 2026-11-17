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
inj = '<script>window.CW_PORTAL="crazygames";</script>'
html = html.replace('<head>', '<head>' + inj, 1)
os.makedirs(os.path.join(ROOT, 'cg'), exist_ok=True)
open(os.path.join(ROOT, 'cg', 'index.html'), 'w', encoding='utf-8').write(html)
print('cg/index.html', round(len(html) / 1e6, 1), 'MB,', len(zv), 'zvuků')
