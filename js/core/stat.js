/* =========================================================================
   ANONYMNÍ STATISTIKY: jen souhrnné denní počty (kolikrát se hra spustila,
   kolik bitev se odehrálo, kolik nákupů…). Žádné jméno, e-mail, ID zařízení
   ani poloha – server si ukládá jen „událost + den + počet“.
   ========================================================================= */
(function () {
  const URL = 'https://smjplqxwqyraphfeqsyk.supabase.co/rest/v1/rpc/hra_stat';
  let q = {}, t = null;
  const flush = () => {
    t = null; const evs = q; q = {};
    if (!Object.keys(evs).length || !window.Ucet) return;
    try {
      fetch(URL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', apikey: Ucet.apiKey, Authorization: 'Bearer ' + Ucet.apiKey },
        body: JSON.stringify({ p_ev: evs }) }).catch(() => {});
    } catch (e) { /* nic */ }
  };
  window.Stat = {
    ev(name, d) {
      const k = String(name + (d && d.p ? ':' + d.p : '')).slice(0, 60);
      q[k] = (q[k] || 0) + 1;
      if (!t) t = setTimeout(flush, 5000);
    }
  };
  addEventListener('pagehide', flush);
  setTimeout(() => Stat.ev('start'), 3000);
})();
