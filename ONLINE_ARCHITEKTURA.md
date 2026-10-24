# Návrh online architektury

V prototypu nic z tohoto ještě **neběží**. Je to plán, co je potřeba postavit, aby PvP, žebříček a účty fungovaly doopravdy.

## Doporučený model PvP: asynchronní útok na „obranu“ soupeře

Hry typu hrad proti hradu obvykle neřeší PvP v reálném čase. Hráč útočí na **uložený hrad a obrannou sestavu** soupeře, kterou ovládá AI. Je to levnější a funguje to i při slabém mobilním signálu. Soupeř navíc nemusí být online.

1. Hráč si vyžádá seznam soupeřů → **matchmaking** vybere hráče s podobným počtem trofejí.
2. Server vrátí „snapshot“ soupeře: úrovně budov, skiny, obranné nastavení AI a seed bitvy.
3. Klient odehraje bitvu a odešle **záznam vstupů** (čas a typ vyslané jednotky nebo schopnosti), ne výsledek.
4. Server bitvu **znovu přehraje** stejnou deterministickou simulací (`battle.update` s pevným krokem a seedem) a výsledek sám vyhodnotí. Tím se zabrání podvádění.
5. Server zapíše trofeje, odměny a počet použitých útoků (max. 3 na soupeře za období).

Pro tento krok je potřeba v `battle.js` nahradit `Math.random` za generátor se seedem a jet s pevným krokem 1/60 s. Logika je už oddělená od vykreslování.

## Komponenty

| Část | Úloha | Možná technologie |
|---|---|---|
| Účty | Registrace, přihlášení (e-mail, Google, Apple), anonymní účet | Supabase Auth / Firebase Auth |
| Databáze | Profily, budovy, skiny, postup kampaně, historie útoků | PostgreSQL (Supabase) |
| Herní API | Nákupy, vylepšení, start a vyhodnocení bitvy, odměny | Edge Functions / Node.js server |
| Matchmaking | Výběr soupeřů podle trofejí | SQL dotaz + cache |
| Simulace | Přehrání bitvy a ověření výsledku | Stejný JS engine na serveru (Node) |
| Žebříček | TOP 10, okolí hráče, přátelé, sezóny | Materializovaný pohled nebo Redis sorted set |
| Obnova útoků | Denní nebo sezónní reset počtu útoků | Plánovaná úloha (cron) |
| Platby | Drahokamy za skutečné peníze | Google Play Billing, Apple IAP + ověření účtenek na serveru |

## Základní tabulky

- `players` (id, jméno, trofeje, zlato, drahokamy, avatar, vytvořeno)
- `buildings` (player_id, building_id, level)
- `owned_skins` (player_id, skin_id, typ)
- `equipped_skins` (player_id, unit_id, skin_id)
- `campaign_progress` (player_id, level_id, splněno_kdy)
- `pvp_attacks` (attacker_id, defender_id, perioda, pořadí 1–3, výsledek, trofeje, záznam vstupů)
- `seasons` (id, začátek, konec)

Hodnoty jako zlato a trofeje musí měnit **jen server**. Klient je smí jen zobrazovat.

## Co z prototypu zůstane

- Datové moduly (`js/data/*`) se stanou sdílenou konfigurací pro klienta i server.
- `save.js` se nahradí voláním API a místní uložení zůstane jako offline cache.
- Obrazovky PvP a žebříčku jsou připravené. Stačí místo `GameData.demoPlayers` načítat data ze serveru.
