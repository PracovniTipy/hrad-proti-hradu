"""Zkopíruje hru do složky www/ (tu Capacitor balí do aplikace pro Android a iOS)."""
import shutil, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
www = root / 'www'
shutil.rmtree(www, ignore_errors=True)
www.mkdir()
for item in ['index.html', 'soukromi.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons']:
    src = root / item
    (shutil.copytree if src.is_dir() else shutil.copy2)(src, www / item)
print('Hotovo:', www)
