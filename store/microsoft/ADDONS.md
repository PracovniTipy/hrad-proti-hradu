# Castle WARS: doplňky (add-ons) pro Microsoft Store

Hra platí v Microsoft verzi **jen přes Microsoft** (Digital Goods API + Payment Request API, metoda `https://store.microsoft.com/billing`), přesně podle dokumentace Microsoftu. Placené věci se ve hře ukážou až ve chvíli, kdy jsou tyto doplňky v Partner Center zveřejněné.

## Jak je založit (Partner Center)

1. Apps and games → **Castle WARS** → **Add-ons** → **Create a new add-on**.
2. Typ produktu: **Developer-managed consumable** (u všech; hra si sama hlídá, co se dá koupit jen jednou, a nákup po doručení potvrdí přes `consume`).
3. **Product ID** napiš přesně podle tabulky (malá písmena, bez mezer). Podle něj hra doplněk najde.
4. **Pricing and availability** → cena podle tabulky (cenová úroveň v USD, ostatní měny Microsoft dopočítá sám) → Markets: všechny.
5. **Properties** → Content type: *Game content* → bez data expirace.
6. **Store listings** → English: Title a Description z tabulky (jde přidat i čeština).
7. **Submit to the Store.** Doplňky se schvalují spolu s aktualizací hry (zhruba 1–3 dny).

Po schválení se placené věci ve hře z Microsoft Storu objeví samy, nic dalšího se nastavovat nemusí.

## Seznam doplňků (33)

| Product ID | Název (EN) | Cena | Popis (EN) |
|---|---|---|---|
| `cwgemsg1` | 450 gems | $1.49 | 450 gems |
| `cwgemsg2` | 2000 gems | $3.99 | 2000 gems |
| `cwgemsg3` | 5500 gems | $9.99 | 5500 gems |
| `cwgemsg4` | 13000 gems | $19.99 | 13000 gems |
| `cwgemsg5` | 30000 gems | $39.99 | 30000 gems |
| `cwstart` | Starter Pack | $1.49 | The best start: 15,000 gold, 1,500 gems, epic armor for heavy units and the Forest Rangers skin with a hunting knife for infantry of every nation. |
| `cwmesec` | Bag of Gold | $1.49 | 20,000 gold for castle upgrades. |
| `cwhrst` | Handful of Gems | $1.49 | 800 gems for skins and attacks – almost twice as many as the regular pack. |
| `cwkovar` | Smith’s Pack | $1.49 | Two epic or legendary weapon skins you do not own yet, plus 6,000 gold and 300 gems. |
| `cwzbrojir` | Armorer’s Pack | $1.49 | Epic armor for heavy units and infantry of every nation and 8,000 gold. |
| `cwlucist` | Archer’s Pack | $1.49 | Dragon bow and epic armor for all archers and 600 gems. |
| `cwvalecny` | War Pack | $1.49 | 15,000 gold and 700 gems for the campaign. |
| `cwhraniceri` | Rangers’ Pack | $1.49 | Three infantry skins: Forest Rangers, Midnight Watch and Shadow Legion + 500 gems. |
| `cwhradni` | Castle Pack | $1.49 | Torches, great banners and heraldic shields for your castle and 12,000 gold. |
| `cwkopinik` | Spearmen’s Pack | $1.49 | Epic armor and dragon spear for spearmen and 6,000 gold. |
| `cwhrdina` | Hero’s Pack | $2.49 | Legendary Star Blade and legendary armor for heavy units, 20,000 gold and 1,500 gems. |
| `cwdrak` | Dragon Lord | $3.99 | The three most devastating attacks – Dragon Breath, Giant Meteor and Wall of Fire – plus 25,000 gold and 2,500 gems. |
| `cwpevnost` | Great Fortress | $5.99 | Big castle (up to 10 defenders on the walls, +25% castle health), Stone Guardians and Wall Fires, 30,000 gold and 3,000 gems. |
| `cwkral` | Royal Pack | $5.99 | Legendary armor and the King’s Sword for heavy units, legendary infantry armor and the Star Bow, 50,000 gold and 5,000 gems. |
| `cwkniha` | Book of All Attacks | $5.99 | Unlocks every special attack in the game at once and adds 3,000 gems. |
| `cwlegie` | Legendary Legion | $7.99 | Legendary armor for every soldier of every nation – 21 units at once! Plus 40,000 gold and 4,000 gems. |
| `cwarzenal` | Arsenal of Legends | $7.99 | A legendary weapon for every soldier of every nation and 5,000 gems. |
| `cwcisar` | Imperial Treasure | $19.99 | Absolutely everything: the Great Fortress, all castle decorations, all attacks, legendary armor and weapons for all 21 soldiers, 150,000 gold and 20,000 gems. |
| `cwsetandel` | Divine Fallen Angel set | $99.99 | Divine skin set: the Fallen Angel look for your army. |
| `cwsetkral` | Divine God King set | $99.99 | Divine skin set: the God King look for your army. |
| `cwskilldrak` | Dragon’s Breath | $2.49 | A dragon on the walls breathes fire right in front of the castle: burns every enemy that came close. Comes with a dragon head for your castle. |
| `cwpass` | Battle Pass · Wolf Winter | $3.99 | Premium Battle Pass for the Wolf Winter season: the full epic Wolf set for infantry right away, the Wolf set for archers and spearmen on levels 5–20, plus extra gold and gems. |
| `cwsadatezka` | Wolf set: Heavy units | $1.49 | Epic Wolf Winter armor and weapon for the heavy units of all three nations. |
| `cwsadajizda` | Wolf set: Cavalry | $1.49 | Epic Wolf Winter armor and weapon for the cavalry of all three nations. |
| `cwsadamag` | Wolf set: Mages | $1.49 | Epic Wolf Winter armor and weapon for the mages of all three nations. |
| `cwsadavelitel` | Wolf set: Commanders | $1.49 | Epic Wolf Winter armor and weapon for the commanders of all three nations. |
| `cwskine` | Epic skin | $0.99 | One epic armor or weapon skin of your choice for one soldier. |
| `cwskinl` | Legendary skin | $1.49 | One legendary armor or weapon skin of your choice for one soldier. |

Stejná tabulka je i jako `addons.csv` (dá se otevřít v Excelu).
