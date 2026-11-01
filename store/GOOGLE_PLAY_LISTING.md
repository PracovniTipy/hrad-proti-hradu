# Castle WARS: podklady pro Google Play (stačí zkopírovat)

## Co je potřeba udělat ty
1. Založit vývojářský účet Google Play (25 USD, jednorázově): https://play.google.com/console/signup
2. Vytvořit vlastní podpisový klíč a uložit ho do GitHub Secrets (`ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`).
   Bez něj se `.aab` podepisuje testovacím klíčem a Google Play ho nepřijme.
3. U nového osobního účtu: uzavřený test s **12 testery po dobu 14 dní**. Teprve potom jde hra do produkce.

## ⚠️ Blokující věc: platby
Google Play **nedovolí** prodávat drahokamy, balíčky ani skiny přes itch.io. Digitální věci se v aplikaci z Google Play musí platit přes Google Play Billing.
Tahle část hry je hotová jen pro Microsoft Store. Pro Google Play ji musím doplnit, než se hra odešle ke kontrole (balíčky se zakládají v Play Console, takže na to je potřeba už existující účet).
Bez toho Google aplikaci zamítne.

## Údaje o aplikaci
- **Název (max 30 znaků):** `Castle WARS: Castle Battle`
- **Krátký popis (max 80):** `Lead knights, samurai or vikings and destroy the enemy castle. Plays offline.`
- **Kategorie:** Hry → Strategie
- **Štítky:** Strategy, Tower defense, Medieval, Offline
- **Kontaktní e-mail:** broswars@chatnelo.com
- **Web:** https://broswarsstudio.chatnelo.com
- **Zásady ochrany soukromí:** https://pracovnitipy.github.io/hrad-proti-hradu/soukromi.html

## Dlouhý popis (EN)
Your castle. Their army. No limits.

Castle WARS is a castle-versus-castle strategy battle. Deploy your troops, upgrade your walls, unleash special attacks and break the enemy castle before yours falls.

PLAY WITHOUT WI-FI, OR ONLINE
The whole game works offline: the story, battles, castle upgrades and the shop. Go online whenever you want for 1v1 and 2v2 battles, co-op story with a friend and cloud saves.

THREE NATIONS
⚔️ Knights of the Lion Crown
🗡️ Samurai of the Kazehana Clan
🪓 Vikings of the Stormfjord
Each nation has its own troops, castle and battlefield.

FEATURES
📜 A five-act story, from human wars to the Demon Realm and the rise of King Malakor
🏰 Upgrade your castle: walls, barracks, watchtowers, catapults and boiling oil
✨ 26 special attacks: Giant Meteor, Dragon's Breath, Storm of the Gods, Earthquake and more
🛡️ Equipment and skins your soldiers actually wear
🏆 Daily quests, level stars and a world leaderboard
🌐 Online multiplayer: 1v1, 2v2 and co-op
☁️ Cloud saves: continue on another device

Made by BrosWars Studio.

## Grafika (vše je v repozitáři)
| Položka | Soubor |
|---|---|
| Ikona 512×512 | `icons/icon-512.png` |
| Grafika 1024×500 | `store/feature-graphic-1024x500.png` |
| Snímky obrazovky (na šířku, 1920×1080) | `media/castlewars_1.png` až `media/castlewars_6.png` |
| Video (volitelné, YouTube) | trailer `castle-wars-trailer.mp4`: nahrát na YouTube a vložit odkaz |

## Hodnocení obsahu (dotazník IARC)
- Kategorie: Hra
- Násilí: **ano, fantasy násilí** (kreslení vojáci bojují, bez krve a bez realistických lidí)
- Krev: ne · Sex/nahota: ne · Vulgární výrazy: ne · Drogy/alkohol/tabák: ne · Hazard: ne
- Interakce uživatelů: **ano** (online souboje, uživatelská jména v žebříčku), chat: **ne**
- Nákupy v aplikaci: **ano**
- Očekávané hodnocení: PEGI 7

## Zabezpečení dat (Data safety)
- Sbírá data: **ano**
  - **Osobní údaje → e-mail** (volitelné, jen když si hráč vytvoří účet): funkčnost aplikace, správa účtu
  - **Osobní údaje → uživatelské jméno** (volitelné): funkčnost aplikace (žebříček)
  - **Aktivita v aplikaci → herní postup**: funkčnost aplikace (cloudové uložení)
  - **Nákupy → historie nákupů**: funkčnost aplikace
- Sdílí data s třetími stranami: **ne**
- Data jsou šifrovaná při přenosu: **ano** (HTTPS)
- Hráč může smazat svá data: **ano**, přímo ve hře (Profil → Smazat můj účet)
- Reklamy: **ne** · Poloha: **ne** · Reklamní ID: **ne**

## Cílová skupina
- Věk: 13+ (hra má účty a online souboje, takže ji nedávej do kategorie pro děti; to by přineslo přísnější pravidla)
