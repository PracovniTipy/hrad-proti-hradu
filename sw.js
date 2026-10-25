/* Service worker: hra funguje i bez internetu (PWA). Při změně souborů zvyš VERZE. */
const VERZE = 'hrad-v59';
const SOUBORY = ['./', './index.html', './css/fonts.css', './css/style.css', './css/ui-pro.css', './manifest.webmanifest',
  './js/i18n.js', './js/data/units.js', './js/data/skins.js', './js/data/narody.js', './js/data/jednotky_plus.js', './js/data/demoni.js', './js/data/castle.js',
  './js/data/campaign.js', './js/data/pvp.js', './js/data/obchod.js', './js/data/vybava.js', './js/data/skiny_plus.js', './js/data/skills.js', './js/i18n_obsah.js', './js/core/save.js', './js/core/ucet.js', './js/core/zvuk.js', './js/core/art.js',
  './js/core/art_narody.js', './js/core/art_svet.js', './js/core/art_peklo.js', './js/core/art_zbrane.js', './js/core/obrana.js', './js/core/vfx.js', './js/core/battle.js', './js/core/platby.js', './js/core/online.js', './js/ui/online_ui.js', './js/ui/shop.js', './js/ui/ucet_ui.js', './js/ui/ukoly.js', './js/ui/instalace.js', './js/ui/denni.js', './js/ui/icons.js',
  './js/ui/screens.js', './js/ui/tutorial.js', './js/ui/scene.js', './js/main.js', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERZE).then(c => c.addAll(SOUBORY))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERZE).map(x => caches.delete(x))))); self.clients.claim(); });
/* Nejdřív síť (aby se nová verze ukázala hned), bez sítě uložená kopie */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // vlastní soubory hry vždy ověřit u serveru (ne ze staré mezipaměti prohlížeče)
  const own = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(fetch(own ? new Request(e.request, { cache: 'no-cache' }) : e.request).then(r => {
    if (r.ok && (r.type === 'basic' || /fonts\.(googleapis|gstatic)/.test(e.request.url))) { const cp = r.clone(); caches.open(VERZE).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
});
