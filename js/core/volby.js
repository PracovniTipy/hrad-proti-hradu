/* =========================================================================
   VOLBY – další nastavení hry (ukládá se v localStorage 'cw-opts')
   ========================================================================= */
(function () {
  const KEY = 'cw-opts';
  const DEF = { shake: true, weather: true, pet: true, skillTxt: true, vibrate: true, saver: false };
  let cur = null;
  const load = () => { if (cur) return cur; try { cur = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { cur = Object.assign({}, DEF); } return cur; };
  const L = (cs, en) => (window.I18N && I18N.L ? I18N.L(cs, en) : (window.I18N && I18N.lang === 'cs' ? cs : en));
  const ITEMS = [
    ['shake', '📳', 'Otřesy obrazovky', 'Screen shake'],
    ['weather', '🌦️', 'Počasí v bitvě', 'Battle weather'],
    ['pet', '🐔', 'Mazlíček v bitvě', 'Pet in battle'],
    ['skillTxt', '🔤', 'Nápisy speciálních útoků', 'Special attack titles'],
    ['vibrate', '📱', 'Vibrace', 'Vibration'],
    ['saver', '🔋', 'Úspora baterie (nižší grafika)', 'Battery saver (lower graphics)'],
  ];
  // překlady pro další jazyky (podle anglického textu)
  const TR = {
    de: { 'Screen shake': 'Bildschirmwackeln', 'Battle weather': 'Wetter im Kampf', 'Pet in battle': 'Haustier im Kampf', 'Special attack titles': 'Titel der Spezialangriffe', 'Vibration': 'Vibration', 'Battery saver (lower graphics)': 'Akku sparen (weniger Grafik)', 'More settings': 'Weitere Einstellungen' },
    pl: { 'Screen shake': 'Wstrząsy ekranu', 'Battle weather': 'Pogoda w bitwie', 'Pet in battle': 'Zwierzak w bitwie', 'Special attack titles': 'Napisy ataków specjalnych', 'Vibration': 'Wibracje', 'Battery saver (lower graphics)': 'Oszczędzanie baterii (niższa grafika)', 'More settings': 'Więcej ustawień' },
    es: { 'Screen shake': 'Temblor de pantalla', 'Battle weather': 'Clima en batalla', 'Pet in battle': 'Mascota en batalla', 'Special attack titles': 'Títulos de ataques especiales', 'Vibration': 'Vibración', 'Battery saver (lower graphics)': 'Ahorro de batería (menos gráficos)', 'More settings': 'Más ajustes' },
    pt: { 'Screen shake': 'Tremor de tela', 'Battle weather': 'Clima na batalha', 'Pet in battle': 'Mascote na batalha', 'Special attack titles': 'Títulos de ataques especiais', 'Vibration': 'Vibração', 'Battery saver (lower graphics)': 'Economia de bateria (gráficos menores)', 'More settings': 'Mais configurações' },
  };
  try { if (window.I18N && I18N.X) for (const l in TR) { const p = I18N.X[l] || (I18N.X[l] = { D: {}, S: {} }); p.S = Object.assign(p.S || {}, TR[l]); } } catch (e) {}

  const V = window.Volby = {
    on(k) { return !!load()[k]; },
    set(k, v) { load()[k] = !!v; try { localStorage.setItem(KEY, JSON.stringify(cur)); } catch (e) {} },
    html() {
      const o = load();
      return `<div class="volby"><small class="muted">${L('Další nastavení', 'More settings')}</small>${ITEMS.map(([k, ic, cs, en]) =>
        `<button class="btn volba ${o[k] ? 'on' : ''}" data-volba="${k}" aria-pressed="${o[k]}"><span>${ic} ${L(cs, en)}</span><b>${o[k] ? t('snd_on') : t('snd_off')}</b></button>`).join('')}</div>`;
    },
    bind(el) {
      el.querySelectorAll('[data-volba]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.volba, v = !V.on(k); V.set(k, v);
        b.classList.toggle('on', v); b.setAttribute('aria-pressed', v); b.querySelector('b').textContent = v ? t('snd_on') : t('snd_off');
      }));
    },
  };
  function t(k) { return window.I18N && I18N.t ? I18N.t(k) : k; }
})();
