# Hrad proti hradu – hratelný prototyp

2D mobilní strategie „hrad proti hradu“ ve fantasy středověkém stylu. Prototyp je napsaný v čistém HTML, CSS a JavaScriptu bez knihoven a bez sestavování. Běží v každém moderním prohlížeči na telefonu (Android i iPhone), tabletu i počítači.

Všechna grafika je kreslená vektorově přímo v kódu (canvas). Postavy, hrady, pozadí a mapa jsou proto ostré na každém displeji a nepoužívají se žádné obrázky.

## Spuštění

**Nejjednodušší způsob:** otevři soubor `index.html` dvojklikem v prohlížeči (Chrome, Edge, Safari, Firefox).

**Na telefonu přes místní síť (doporučeno pro testování dotyku):**

1. Na počítači otevři terminál ve složce projektu.
2. Spusť jednoduchý server: `python3 -m http.server 8080`
3. Na telefonu (ve stejné Wi-Fi) otevři `http://IP-ADRESA-POČÍTAČE:8080`
4. V prohlížeči telefonu můžeš zvolit „Přidat na plochu“ – hra se pak otevírá jako aplikace.

**Jeden soubor:** `dist/hrad-proti-hradu.html` obsahuje celou hru v jediném souboru (vytvoří ho `python3 tools/build_single.py`).

Písma (Cinzel, Alegreya Sans) se načítají z Google Fonts. Bez internetu hra funguje dál, jen se použije systémové písmo.

## Ovládání

| Akce | Dotyk | Klávesnice |
|---|---|---|
| Vyslat vojáka | Tlačítko jednotky dole | 1 – 4 |
| Ohnivý déšť | Oranžové tlačítko | Q |
| Štít víry | Modré tlačítko | W |
| Posun bojiště | Tažení prstem po bojišti nebo klepnutí do minimapy (na výšku) | – |
| Formace: Útok / Formace / Ústup | Tlačítka vlevo nahoře na bojišti | A / S / D |
| Přesun praporu formace | Klepnutí na bojiště | – |
| Převzít ovládání vojáka (hrdina) | Klepnutí na svého vojáka | – |
| Hrdina: pohyb / útok / blok | Šipky vlevo dole, tlačítka Útok a Blok vpravo dole | Šipky, X, C |
| Pustit hrdinu | Tlačítko Pustit | Esc |
| Pauza | Tlačítko pauzy | Mezerník |
| Rychlost ×1 / ×2 | Tlačítko ×1 | – |

Na telefonu je nejlepší hrát **na šířku**, protože pak je vidět celé bojiště. Na výšku se zobrazí větší tlačítka a minimapa a bojiště sleduje frontu.

## Co je v první verzi hotové

- **16 jazyků**: při prvním spuštění si hráč vybere jazyk (čeština, angličtina, čínština, hindština, španělština, francouzština, arabština, bengálština, portugalština, ruština, urdština, indonéština, němčina, japonština, turečtina, korejština). Rozhraní a tutoriály jsou přeložené do všech; příběhy a popisy jednotek jsou česky a anglicky (ostatní jazyky používají angličtinu). Arabština a urdština se zobrazují zprava doleva. Jazyk jde změnit v Profilu.
- **Tutoriály**: při první návštěvě hlavní stránky, v první bitvě a v úpravě hradu. Zvýrazní ovládací prvek a vysvětlí ho; klepnutím kamkoli se přejde dál, po posledním kroku tutoriál skončí (jde i přeskočit). V Profilu je lze spustit znovu.
- **Úprava hradu**: barva praporů a vlajek, znak (9 erbů), barva střech, vzhled hradu a dekorace (pochodně, prapory, erbovní štíty, zahrada, zlacení). Změny se projeví v náhledu i v bitvách.
- **Obchod** má záložky Nabídky, Zbrojnice, Vojáci (skiny), Hrady, Dekorace a Drahokamy:
  - *Balíčky za 29 Kč* (startovní, měšec zlata, hrst drahokamů, kovář, zbrojíř, lučištník, hraničáři, hradní…) a dražší balíček hrdiny a královský balíček. Některé jdou koupit jen jednou.
  - *Denní truhla* (29 Kč, 1× denně) a *týdenní truhla* (99 Kč, 1× týdně) s náhodným zlatem, drahokamy a zbraněmi či brněním. Šance jsou ve hře zveřejněné; předmět, který už hráč má, se změní na zlato.
  - *Zbrojnice*: 4 zbraně a 4 brnění pro každou roli (pěchota, střelci, kopiníci, těžká jednotka) – za zlato, drahokamy nebo Kč. Výbava přidává útok, životy, zbroj a kritické zásahy, platí pro danou roli u všech národů a vojáci ji mají vidět i na bojišti (zářící zbraně, rohatá nebo zlatá zbroj s korunou a pláštěm).
  - *Skiny vojáků* přidávají malé bonusy; dva prémiové skiny jsou za Kč.
  - **Platby za skutečné peníze nejsou zapojené.** Hra má připravené rozhraní `window.HraPlatby` (js/core/platby.js) pro Google Play Billing, App Store nebo platby herních portálů. Do té doby jde nákup jen vyzkoušet zdarma v jasně označeném testovacím režimu.
- **Detailní grafika**: postavy mají oči, obočí, nos, uši, vlasy, ruce s prsty, boty s podrážkou a plastické stínování. Bojiště má hloubku (vzdálená krajina se posouvá pomaleji) a plující mraky; evropská krajina má stromy, ploty, kaluže, kytky, vesnici, mlýn a vzdálený hrad. Snímky postav se ukládají do mezipaměti, aby hra běžela plynule i se stovkou vojáků.
- **Živá hlavní stránka**: animovaná scéna hradu v krajině národa se strážemi a hlídkou, rychlé dlaždice Příběh / Trénink / Souboj / Obchod.
- **Tři národy**: na obrazovce Hrad (sekce Národ) nebo v Příběhu si vybereš, za koho hraješ. Každý národ má vlastní vojáky, hrad, bojiště, mapu, příběh a organizaci armády:
  - **Království** (rytíři Lví koruny): pěšák, lučištník, kopiník, rytíř. Kamenný hrad, evropské údolí.
  - **Samurajové** (klan Kazehana): ašigaru, jumi-ašigaru (nejdelší dostřel), jari-ašigaru (kopí, proti těžkým), samuraj (první úder iaidó je dvojnásobný). Japonský hrad tenšu na kamenné podnoži, bojiště při západu slunce se sakurami, bambusem, torii a padajícími lístky. Všichni nosí na zádech praporky sašimono.
  - **Vikingové** (jarlové Bouřného fjordu): válečník se sekerou a štítem, lovec, štítonoš (kopí a štít, zbroj 25 %), berserk (medvědí kůže, dánská sekera, pod polovinou životů zuřivost +60 %). Dřevěná palisáda s dlouhým domem, zasněžený fjord s polární září, loděmi a padajícím sněhem.
- **Jedna sága ve čtyřech aktech (55 úrovní)**, které jdou za sebou. Další akt se odemkne až po dokončení předchozího:
  - *Akt I – Lví koruna* (hraješ za rytíře): vikingští nájezdníci, Stínová legie zrádného vévody Morvana, obležené hlavní město a první démoni.
  - *Akt II – Klan Kazehana* (hraješ za samuraje): klan Akabane, hory Kurama, regent Kurogane s maskou démona óni.
  - *Akt III – Bouřný fjord* (hraješ za vikingy): jarl Hrafn Krutý, Ledová pustina a Ragnarök proti Mrazivé koruně.
  - *Akt IV – Spojenectví* (všechny tři národy): Brána pekel a Ohnivá hora. Finále na Trůnu Pekelného generála.
  - Mezi akty jsou **příběhové scény** s portréty postav (král Aldrik, daimjó Rjú, jarlka Sigrun, Pekelný generál Azgaroth). Po bossovi každé kapitoly se zobrazí, jak příběh pokračuje. Scény jde přehrát znovu v Příběhu.
  - Národ se odemkne pro Hrad, Trénink a Souboj, až k němu v příběhu dojdeš.
- **Démoni**: běs, ohnivý chrlič (metá ohnivé koule), rohatý strážce s trojzubcem, zatracený rytíř s plamenným mečem. Mají obsidiánovou pevnost, pekelné bojiště s lávou a sopkou a vlastní mapu.
- **Bitvy spojenectví (Akt IV)**: posíláš vojáky **všech tří národů najednou**. Tlačítka jsou rozdělená po národech a **každý národ má vlastní přepínač AUTO**. Když je zapnutý, hra za tebe vysílá vojáky toho národa (vybírá je podle toho, co posílá nepřítel). Zapnuté národy se v utrácení mincí střídají. AUTO funguje i v běžných bitvách a hra si ho pamatuje.
- **Pekelný generál (boss)**: ve finále vstoupí po 18 sekundách na bojiště, má vlastní ukazatel životů a jeho meč zasáhne až pět vojáků. Když padne, jeho pevnost přijde o 30 % životů.
- **Organizace armády**: každý národ má strom velení. Království: král → maršál (ty) → rytíři → seržanti → pěšáci a kopiníci, lučištníci. Samurajové: šógun → daimjó (ty) → karó → samurajové → ašigaru-gašira → ašigaru. Vikingové: thing → jarl (ty) → hirð (berserkové, štítonoši) → karlové (válečníci, lovci) → thrallové. U jednotek jsou vidět jejich statistiky.
- **Ovládání hrdiny**: klepni na kteréhokoli svého vojáka a převezmeš nad ním kontrolu. Objeví se panel se šipkami (pohyb dopředu, dozadu a do hloubky bojiště) a tlačítky **Útok** (držením útočíš opakovaně) a **Blok** (zvedneš štít a dostáváš jen 20 % zranění, ale nemůžeš útočit ani se hýbat). Hrdina má o 25 % silnější útok a mečem zasáhne až tři nepřátele najednou. Lučištník střílí tam, kam se dívá. Když hrdina padne, můžeš si vybrat dalšího.
- **Formace (rozkazy armádě)**:
  - *Útok*: všichni postupují na nepřátelský hrad.
  - *Formace*: vojáci se seřadí u praporu do šiku. Rytíři stojí vpředu, za nimi pěšáci a kopiníci, lučištníci vzadu. Šik drží linii. Klepnutím na bojiště prapor přesuneš.
  - *Ústup*: armáda se stáhne k vlastnímu hradu (pod ochranu věže) a tam se seřadí.
  - Soupeř útočí ve vlnách: shromáždí vojáky u svého praporu a zaútočí, až jich má dost, nebo když se přiblížíš.
- **Delší bitvy**: bojiště je delší (2 600 místo 1 600) a časový limit je 5 minut. Kamera sleduje frontu a pod bojištěm je minimapa (klepnutím na ni se přesuneš).
- **Bojová obrazovka**: můj hrad vlevo, nepřátelský vpravo, ukazatele životů obou hradů, časovač 5:00, pauza, rychlost ×2.
- **Mince**: průběžný příjem, limit, odměna za každého zabitého nepřítele, ceny na tlačítkách, prodleva mezi vysláním stejné jednotky.
- **Jednotky**: pěšák, lučištník a rytíř od začátku, kopiník se odemkne po úrovni 1-3. Každá má jiné životy, útok, dosah, rychlost, zbroj a cenu. Mají animaci chůze, útoku (seknutí, natažení luku, bodnutí kopím) a pádu. Kopiník dává rytířům dvojnásobné zranění.
- **Schopnosti**: Ohnivý déšť (plošné zranění) a Štít víry (polovina zranění na 6 s).
- **Počítačový soupeř**: posílá jednotky podle toho, co posíláš ty (proti lučištníkům rytíře, proti rytířům kopiníky). Na vyšší obtížnost používá i Ohnivý déšť a jeho hrad má střílející věž.
- **Vítězství a prohra**: pád hradu, nebo po vypršení času rozhodne, kdo má hrad méně poškozený.
- **Správa hradu**: 5 budov s úrovněmi (Hradby, Pokladnice, Kasárna, Strážní věž, Zbrojnice). Platí se zlatem a hrad se s úrovní vizuálně mění.
- **Úvodní obrazovka**: po spuštění jen hrad přes celou obrazovku. Profil vlevo nahoře (profilový obrázek si hráč vybere z 16 portrétů lidí i mýtických bytostí) a peníze vpravo, bez lišt. Menu je ze samostatných znaků nad scénou.
- **Denní odměny zdarma**: 14 dní v kuse; 14. den exkluzivní skin „Věrný strážce“, který se jinak nedá získat – hráč si vybere postavu, která ho dostane. Vynechaný den = začíná se znovu.
- **Obrana hradu** (Vylepšení): až 5 míst na hradbách (1 místo za každé 2 úrovně Strážní věže). Na každé místo lučištník, kušiník (probije 2 nepřátele) nebo od 6. úrovně věže katapult – ohnivý (hoření), ledový (zpomalení), bleskový (přeskočí na další), vodní (odhodí zpět) nebo jedovatý (jedovatý mrak). Obránci jsou vidět na hradě v bitvě i na úvodní obrazovce.
- **Písmo**: kované dekorativní nadpisy (Cinzel Decorative) a pohádkové písmo rozhraní (Metamorphous), vložené do hry (licence SIL OFL, css/FONTS-LICENSE-OFL.txt).
- **Spodní menu**: pět ilustrovaných dlaždic přes celou šířku obrazovky (hrad, mapa se svitkem, meče se štítem, stupně vítězů s pohárem, tržní stánek).
- **Aplikace a offline**: hru jde nainstalovat jako PWA (funguje bez internetu) a je připravená pro Capacitor (Android a iOS). Postup do Google Play, App Store a dalších obchodů je v `STORE_NAVOD.md`.
- **PvP obrazovka**: 5 soupeřů na sezónu a na každého **maximálně 3 útoky**. Obtížnost roste (×1,0 → ×1,3 → ×1,65) a stejně tak odměna (+30 / +45 / +70 trofejí). U každého soupeře je jasně vidět počet zbývajících útoků, obtížnost a odměna.
- **Žebříček TOP 10** podle trofejí. Ostatní hráči jsou **označená ukázková data**, tvoje pozice je skutečná.
- **Profil hráče**: jméno, portrét, statistiky a smazání postupu.
- **Skiny**: 5 skinů vojáků (Týmová zbroj, Lesní hraničáři, Stínová legie, Zlatý paladin, Ledová stráž) a 4 skiny hradů. Kupují se za drahokamy (prémiové za Kč) a kromě vzhledu přidávají malý bonus.
- **Ukládání postupu** do prohlížeče (localStorage).
- **České rozhraní** a ovládání prsty (velká tlačítka, responzivní rozvržení na šířku i na výšku).

## Co je jen prototyp a co ještě chybí

| Funkce | Stav |
|---|---|
| Online PvP proti skutečným lidem | **Není hotové.** Soupeři v PvP jsou vymyšlení a hraje za ně počítač (v boji označeno štítkem „BOT“). |
| Účty, přihlášení, synchronizace mezi zařízeními | **Není hotové.** Postup se ukládá jen v jednom prohlížeči. |
| Skutečný globální žebříček, přátelé | **Není hotové.** Záložky „Přátelé“ a „Svět“ jsou vypnuté. |
| Obnova útoků (např. denně) | V prototypu jde ručně přes tlačítko „Nová sezóna“. Na serveru by se řídila časem. |
| Zvuky a hudba | Zatím chybí. |
| Doba stavby budov, nákupy za skutečné peníze | Zatím chybí. Vylepšení je okamžité a drahokamy se získávají v kampani. |
| Aplikace v Google Play / App Store | Zatím chybí. Postup je popsaný níže. |
| Vyvážení obtížnosti | Je hrubé a bude potřebovat testování s hráči. |

Návrh online architektury je v souboru **`ONLINE_ARCHITEKTURA.md`**.

## Struktura souborů

```
index.html                 – kostra aplikace (obrazovky, HUD boje)
css/style.css              – vzhled, rozvržení pro telefon na šířku i na výšku
js/data/units.js           – jednotky Království, schopnosti, nastavení bojiště
js/data/narody.js          – národy, samurajské a vikingské jednotky, organizace armád
js/data/skins.js           – týmové barvy, skiny vojáků a hradů
js/data/castle.js          – budovy, ceny vylepšení, výpočty statistik
js/data/campaign.js        – sága ve 4 aktech, kapitoly, úrovně, postavy a příběhové scény
js/data/demoni.js          – démoni a Pekelný generál
js/data/pvp.js             – pravidla PvP a ukázkoví hráči
js/core/save.js            – profil hráče a ukládání
js/core/art.js             – vektorová grafika (postavy, hrady, pozadí, mapa)
js/core/art_narody.js      – grafika samurajů a vikingů (helmy, zbroje, zbraně, hrady, bojiště, mapy)
js/core/battle.js          – bojový engine (logika, AI, efekty, kamera)
js/ui/icons.js             – SVG ikony rozhraní
js/i18n.js                 – jazyky a překlady rozhraní (16 jazyků)
js/i18n_obsah.js           – anglický obsah hry (příběhy, jednotky…) a přepínání obsahu
js/data/obchod.js          – dekorace, barvy, znaky, nabídky drahokamů, nové skiny
js/core/art_svet.js        – detailní krajina, vrstvy bojiště, mraky, erby, dekorace hradu
js/ui/tutorial.js          – výběr jazyka a tutoriály
js/ui/scene.js             – příběhové scény mezi akty
js/core/art_peklo.js       – grafika démonů, pekelné pevnosti, bojiště a mapy
js/ui/screens.js           – obrazovky Hrad, Příběh, Souboj, Žebříček, Skiny, Profil
js/main.js                 – navigace, spuštění bitev, odměny
tools/build_single.py      – sloučí hru do jednoho HTML souboru
dist/hrad-proti-hradu.html – hra v jednom souboru
manifest.webmanifest, sw.js, icons/ – instalace jako aplikace (PWA) a offline režim
capacitor.config.json, package.json, tools/build_www.py – balení pro Android a iOS
store/                     – ikona 1024×1024 a grafika 1024×500 pro obchody
STORE_NAVOD.md             – jak hru vydat v Google Play, App Store a jinde
```

## Jak přidat novou jednotku

1. V `js/data/units.js` přidej záznam do `GameData.units`, například `jezdec`, se statistikami a polem `look`. Vzhled se skládá z existujících dílů: `helmet` (kettle / hood / nasal / great), `weapon` (sword / longsword / bow / spear), `shield` (round / kite / null), `armor` (mail / leather / plate), `cape`, `scale`.
2. Přidej její id do `GameData.unitOrder`.
3. Volitelně nastav `unlock: { campaign: '2-1', text: '…' }`.

Nic dalšího se měnit nemusí. Tlačítka, karty, skiny i AI si jednotku převezmou samy. Zcela nový typ zbraně nebo kůň znamená přidat jednu kreslicí funkci do `js/core/art.js`.

## Jak přidat nový národ

1. Do `js/data/narody.js` přidej 4 jednotky (role `pech`, `strelec`, `kopi`, `tezka`) a záznam do `GameData.factions` s barvami, tématem, stylem hradu, prologem a organizací.
2. Do `GameData.factionOrder` přidej jeho id.
3. Do `js/data/campaign.js` přidej jeho akt do `GameData.saga` a kapitoly do `GameData.campaigns.<id>`.
4. Pokud má mít vlastní vzhled bojiště nebo hradu, přidej je do `js/core/art_narody.js` (`ArtThemes.battle`, `ArtThemes.castle`, `ArtThemes.map`).

## Jak přidat nový skin

Do `GameData.unitSkins` nebo `GameData.castleSkins` v `js/data/skins.js` přidej záznam s barvami (`palette`), cenou a vzácností. Volitelně přidej ozdobu helmy `ornament: 'horns' | 'crown' | 'crystal'` a záři zbraně `glow`. Skin automaticky funguje u všech jednotek.

## Převod na mobilní aplikaci

Projekt je připravený pro **Capacitor** (`npm install`, `npx cap add android`, `npm run android`). Celý postup včetně podpisu, poplatků, testování a dalších obchodů (itch.io, CrazyGames, Poki, Microsoft Store, Steam) je v **`STORE_NAVOD.md`**.

Dlouhodobě se dá hra přepsat do **Godot 4**: data jednotek, skinů a kampaně jsou oddělená a logika boje (`battle.js`, metoda `update`) je oddělená od kreslení.

## Novinky (verze 21)
- **Postup se nikdy nesmaže**: uložení se při aktualizaci jen doplní, navíc se drží automatická záloha.
- **Mince v bitvě bez stropu** (Zbrojnice teď dává víc mincí na začátku boje).
- **Zásobník vojáků**: na vojáka jde klepnout až 50×, pošlou se postupně, jakmile na ně jsou mince. Podržením se zásobník vyprázdní.
- **26 speciálních útoků** (Obchod → Útoky): oheň, led, blesk, jed, šípová salva, vlna, bouře, zemětřesení, meteor, léčení, válečný roh, kletba, mráz, posily, zedníci, ohnivá zeď, vichřice, svaté světlo, dračí dech… Do bitvy si hráč vybere 3.
- **Skutečné modely zbraní** (js/core/art_zbrane.js): meče se záštitou, flamberk, katana, šavle, sekery, kladivo, palcát, trojzubce, halapartna, glefa, partyzána, reflexní a dlouhé luky…
- **Skiny mění tvar**: pláště (královský, hermelín, roztrhaný, kožešina), límce, znaky na hrudi, nárameníky, chocholy, rohy kuwagata, křídla, aury. Zbroj krále bez koruny.
- **Obchod ukazuje všechny tři národy.**
- **Příběh**: Akt I–III jsou lidé proti lidem (rytíř se stává králem, pak samurajové a vikingové), Akt IV spojenectví proti Pekelnému generálovi, **Akt V Démonská říše** – obří mapa s 50 bitvami, každá 10. generál (Skarnath, Vargul, Belzar, Hrimgar), na konci Démonický král Malakor. Některé bitvy mají rukojmí v klecích.
- Tajný testovací režim: 7× rychle klepnout na zlato = neomezené zlato a drahokamy.
