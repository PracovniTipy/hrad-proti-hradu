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
# na šířku, ale displej na šířku není „povinná funkce“ – jinak Google Play hlásí omezenou dostupnost
if 'android.hardware.screen.landscape' not in m:
    m = m.replace('<application', '<uses-feature android:name="android.hardware.screen.landscape" android:required="false"/>\n    <uses-feature android:name="android.hardware.screen.portrait" android:required="false"/>\n    <application', 1)
# 1b) reklamy za odměnu (AdMob): bez ID aplikace v manifestu by Google Mobile Ads SDK
#     aplikaci při startu shodilo. ID se bere z js/core/reklamy.js (ADS.appId) – jedno místo pro změnu.
#     Když tam nic není, použije se veřejné testovací ID Googlu.
ADMOB_TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713'
try:
    rk = (root.parent / 'js/core/reklamy.js').read_text(encoding='utf-8')
    hit = re.search(r"appId:\s*'(ca-app-pub-\d+~\d+)'", rk)
    admob_id = hit.group(1) if hit else ADMOB_TEST_APP_ID
except OSError:
    admob_id = ADMOB_TEST_APP_ID
if 'com.google.android.gms.ads.APPLICATION_ID' not in m:
    m, n = re.subn(r'(<application\b[^>]*>)', r'\1\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="' + admob_id + '"/>', m, count=1)
    if not n:
        raise SystemExit('AndroidManifest: nenalezen <application> pro AdMob ID')
# 1d) AdMob používá inzertní ID – Google Play vyžaduje oprávnění AD_ID v manifestu (Android 13+)
if 'com.google.android.gms.permission.AD_ID' not in m:
    m = m.replace('<application', '<uses-permission android:name="com.google.android.gms.permission.AD_ID"/>\n    <application', 1)
man.write_text(m)
print('AdMob ID aplikace:', admob_id)

# 1c) jedna verze Kotlinu pro všechny pluginy (local-notifications a admob by jinak každý
#     načetl jinou verzi Kotlin Gradle pluginu, což Gradle hlásí jako nepodporované)
var = root / 'variables.gradle'
if var.exists():
    v = var.read_text()
    if 'kotlin_version' not in v:
        v = v.replace('ext {', "ext {\n    kotlin_version = '2.2.20'", 1)
        var.write_text(v)

# 2) celá obrazovka bez lišt telefonu + hra nikdy pod výřezem kamery / tlačítky Androidu
#    + písmo vždy 100 % (Samsung a další jinak hru zvětší podle velikosti písma v telefonu
#    a texty přetečou z rámečků)
act = next(root.glob('app/src/main/java/**/MainActivity.java'))
pkg = re.search(r'package ([\w.]+);', act.read_text()).group(1)
act.write_text(f'''package {pkg};

import android.os.Bundle;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {{
    private static final int BG = 0xFF0D121C;

    @Override
    public void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setBackgroundColor(BG);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WebView wv = getBridge().getWebView();
        wv.getSettings().setTextZoom(100);
        wv.setBackgroundColor(BG);
        ViewCompat.setOnApplyWindowInsetsListener(wv, (v, insets) -> {{
            Insets c = insets.getInsets(WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.systemBars());
            ViewGroup.LayoutParams lp = v.getLayoutParams();
            if (lp instanceof ViewGroup.MarginLayoutParams) {{
                ViewGroup.MarginLayoutParams m = (ViewGroup.MarginLayoutParams) lp;
                if (m.leftMargin != c.left || m.topMargin != c.top || m.rightMargin != c.right || m.bottomMargin != c.bottom) {{
                    m.setMargins(c.left, c.top, c.right, c.bottom);
                    v.setLayoutParams(m);
                }}
            }}
            return WindowInsetsCompat.CONSUMED;
        }});
        hideBars();
    }}

    @Override
    public void onResume() {{
        super.onResume();
        hideBars();
    }}

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {{
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }}

    private void hideBars() {{
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
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
