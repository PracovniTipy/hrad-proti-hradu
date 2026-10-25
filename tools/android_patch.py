"""Upraví vygenerovaný Android projekt: jen na šířku, celá obrazovka,
číslo verze a podepsání aplikace. Spouští se v GitHub Actions."""
import os, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'android'
run = int(os.environ.get('BUILD_NUMBER', '1'))

# 1) jen na šířku
man = root / 'app/src/main/AndroidManifest.xml'
m = man.read_text()
if 'screenOrientation' not in m:
    m = m.replace('<activity', '<activity android:screenOrientation="sensorLandscape"', 1)
man.write_text(m)

# 2) celá obrazovka bez lišt (immersive)
act = next(root.glob('app/src/main/java/**/MainActivity.java'))
pkg = re.search(r'package ([\w.]+);', act.read_text()).group(1)
act.write_text(f'''package {pkg};

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {{
    @Override
    public void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideBars();
    }}

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {{
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }}

    private void hideBars() {{
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }}
}}
''')

# 3) verze a podpis
g = root / 'app/build.gradle'
b = g.read_text()
b = re.sub(r'versionCode \d+', f'versionCode {run}', b)
b = re.sub(r'versionName "[^"]*"', f'versionName "1.0.{run}"', b)
ks = os.environ.get('KS_PATH'); pw = os.environ.get('KS_PASS'); alias = os.environ.get('KS_ALIAS', 'hrad')
if ks and 'signingConfigs' not in b:
    sign = f'''    signingConfigs {{
        release {{
            storeFile file("{ks}")
            storePassword "{pw}"
            keyAlias "{alias}"
            keyPassword "{pw}"
        }}
    }}
    buildTypes {{'''
    b = b.replace('    buildTypes {', sign, 1)
    b = re.sub(r'(release \{\s*\n\s*minifyEnabled false)', r'\1\n            signingConfig signingConfigs.release', b, count=1)
g.write_text(b)
print('Android projekt upraven, verze', run)
