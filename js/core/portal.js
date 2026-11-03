/* =========================================================================
   HERNÍ PORTÁLY (CrazyGames, Poki, GameDistribution, Y8, Newgrounds…)
   Pravidla portálů nedovolují odkazy na obchody s aplikacemi ani placení
   mimo portál. Na portálu proto: žádné nákupy za skutečné peníze,
   žádné tlačítko „Nainstalovat“ a žádná žádost o hodnocení na itch.io.
   Verze pro portál nastaví window.CW_PORTAL už v index.html.
   ========================================================================= */
(function () {
  if (window.CW_PORTAL) return;
  let p = '';
  try {
    const q = location.search.match(/[?&]portal=([a-z0-9_-]+)/i);
    const where = (location.hostname + ' ' + (document.referrer || '')).toLowerCase();
    const m = where.match(/crazygames|poki|gamedistribution|y8\.com|newgrounds|armorgames/);
    p = q ? q[1].toLowerCase() : (m ? m[0].replace(/\..*/, '') : '');
  } catch (e) {}
  window.CW_PORTAL = p;
})();
