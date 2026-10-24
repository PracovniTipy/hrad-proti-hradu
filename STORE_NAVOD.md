# Jak dostat hru do obchodů (Google Play, App Store a další)

Hra je napsaná v HTML5 (HTML + CSS + JavaScript bez serveru). Do obchodů se proto dává
**zabalená do nativní aplikace**. Projekt je na to už připravený:

| Soubor | K čemu je |
|---|---|
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA: hru jde nainstalovat z webu a běží i bez internetu |
| `capacitor.config.json`, `package.json` | Capacitor: zabalí hru do aplikace pro Android a iOS |
| `tools/build_www.py` | zkopíruje hru do složky `www/`, kterou Capacitor balí |
| `store/icon-1024.png`, `store/feature-graphic-1024x500.png` | grafika pro stránku v obchodě |

---

## 1. Google Play (Android)

**Co budeš potřebovat:** počítač (Windows, Mac nebo Linux), [Node.js](https://nodejs.org),
[Android Studio](https://developer.android.com/studio) a vývojářský účet Google Play
(jednorázový poplatek 25 USD).

1. Ve složce projektu nainstaluj Capacitor:
   ```
   npm install
   npx cap add android
   ```
2. Sestav a otevři projekt v Android Studiu:
   ```
   npm run android
   ```
   **Jen na šířku:** v `android/app/src/main/AndroidManifest.xml` přidej k `<activity>`
   atribut `android:screenOrientation="sensorLandscape"`. (Na iOS v Xcode → General →
   Device Orientation nech zaškrtnuté jen *Landscape Left* a *Landscape Right*.)
3. V Android Studiu: **Build → Generate Signed App Bundle** → vytvoř si klíč (soubor `.jks`)
   a **dobře si ho schovej** – bez něj už aplikaci nikdy neaktualizuješ.
   Výsledkem je soubor `.aab`.
4. V [Google Play Console](https://play.google.com/console) založ aplikaci a vyplň:
   - název, krátký a dlouhý popis, ikonu 512×512 (`icons/icon-512.png`),
     grafiku 1024×500 (`store/feature-graphic-1024x500.png`), aspoň 2 snímky obrazovky,
   - **hodnocení obsahu** (dotazník – fantasy násilí bez krve),
   - **zabezpečení dat** (hra nesbírá žádná osobní data, ukládá jen postup v zařízení),
   - **zásady ochrany soukromí** – stačí jednoduchá webová stránka s textem
     „Hra neshromažďuje osobní údaje.“
5. **Nové osobní účty** musí nejdřív udělat **uzavřený test: nejméně 12 testerů po dobu 14 dní**
   v kuse. Teprve potom jde požádat o vydání. (Účty firem tuto podmínku nemají.)
6. Nahraj `.aab` do produkce a odešli ke kontrole. Schválení trvá obvykle pár dní.

## 2. App Store (iPhone, iPad)

**Co budeš potřebovat:** **Mac** s aktuálním Xcode (iOS aplikaci jinak sestavit nejde),
účet Apple Developer Program (99 USD za rok).

1. Na Macu ve složce projektu:
   ```
   npm install
   npx cap add ios
   npm run ios
   ```
2. V Xcode nastav svůj tým (Signing & Capabilities), ikonu aplikace (1024×1024 ze
   `store/icon-1024.png`) a verzi.
3. **Product → Archive → Distribute App → App Store Connect**.
4. V [App Store Connect](https://appstoreconnect.apple.com) vyplň popis, snímky obrazovky
   (pro iPhone 6,7"/6,9" a pro iPad), věkové hodnocení a zásady ochrany soukromí.
5. Nejdřív ji vyzkoušej přes **TestFlight**, pak odešli ke kontrole.

Apple odmítá aplikace, které jsou „jen zabalený web“. Tahle hra má vlastní grafiku, offline
režim a ovládání pro dotyk, takže je na tom dobře. Pomůže i přidat zvuky a vibrace
(Capacitor plugin `@capacitor/haptics`).

## 3. Jiná místa, kam se dávají hry

| Kde | Jak | Cena |
|---|---|---|
| **Vlastní web jako PWA** | Nahraj složku hry na libovolný hosting s HTTPS (GitHub Pages, Netlify, Cloudflare Pages). Na telefonu pak „Přidat na plochu“ → hra se chová jako aplikace a funguje offline. | zdarma |
| **itch.io** | Zabal hru do ZIPu (`index.html` v kořeni) a nahraj ji jako HTML5 hru. | zdarma |
| **CrazyGames, Poki, GameDistribution** | Webové herní portály. Hru pošleš ke schválení, příjem jde z reklam. Každý portál má vlastní SDK. | zdarma, podíl z reklam |
| **Microsoft Store** | Přes [PWABuilder](https://www.pwabuilder.com) z PWA vytvoříš balíček pro Windows. | jednorázový účet |
| **Google Play bez Android Studia** | PWABuilder umí z PWA vyrobit i Android balíček (TWA). | 25 USD |
| **Steam** (počítače) | Zabalit přes Electron nebo Tauri, poplatek za každou hru. | 100 USD za hru |

## 4. Než hru vydáš

- **Online souboje**: zatím jsou to ukázkoví soupeři (bot). Skutečné PvP potřebuje server –
  plán je v `ONLINE_ARCHITEKTURA.md`.
- **Nákupy za skutečné peníze** jsou v obchodě vypnuté. V Google Play a App Store se musí
  dělat přes jejich platební systém (Google Play Billing / Apple In-App Purchase).
- Před každou novou verzí zvyš `VERZE` v `sw.js` a `version` v `package.json`.
