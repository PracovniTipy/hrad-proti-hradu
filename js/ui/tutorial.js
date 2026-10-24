/* =========================================================================
   VÝBĚR JAZYKA A TUTORIÁLY
   Tutorial.run(kroky) – zvýrazní prvek obrazovky a ukáže bublinu s textem.
   Klepnutí kamkoli přejde na další krok, po posledním tutoriál skončí.
   ========================================================================= */
(function () {
  const Tutorial = {
    active: false,

    /* steps: [{ sel, key }] – sel = CSS selektor prvku (nebo null = střed) */
    run(steps, onDone) {
      if (this.active) return;
      this.active = true;
      const ov = document.createElement('div');
      ov.className = 'tut';
      ov.innerHTML = `<div class="tut-hole"></div><div class="tut-bubble" role="dialog" aria-live="polite"><p></p><div class="tut-foot"><span class="tut-dots"></span><small></small></div></div><button class="tut-skip"></button>`;
      document.body.appendChild(ov);
      const hole = ov.querySelector('.tut-hole'), bub = ov.querySelector('.tut-bubble');
      const skip = ov.querySelector('.tut-skip');
      skip.textContent = t('tut_skip');
      let i = 0;
      const finish = () => {
        ov.classList.add('out');
        setTimeout(() => ov.remove(), 250);
        this.active = false;
        window.removeEventListener('resize', place);
        if (onDone) onDone();
      };
      const place = () => {
        const st = steps[i];
        const el = st.sel ? document.querySelector(st.sel) : null;
        const vw = window.innerWidth, vh = window.innerHeight;
        bub.querySelector('p').textContent = t(st.key);
        bub.querySelector('small').textContent = i === steps.length - 1 ? t('tut_end') : t('tut_tap');
        bub.querySelector('.tut-dots').innerHTML = steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
        if (el) {
          const r = el.getBoundingClientRect();
          const pad = 8;
          const x = Math.max(4, r.left - pad), y = Math.max(4, r.top - pad);
          const w = Math.min(vw - x - 4, r.width + pad * 2), h = Math.min(vh - y - 4, r.height + pad * 2);
          Object.assign(hole.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', opacity: 1 });
          // bublina pod nebo nad zvýrazněným prvkem
          const bw = Math.min(380, vw - 24);
          bub.style.width = bw + 'px';
          const bh = bub.offsetHeight || 120;
          let by = y + h + 12;
          if (by + bh > vh - 8) by = Math.max(8, y - bh - 12);
          if (by < 8 || (by + bh > vh - 8)) by = Math.max(8, (vh - bh) / 2);
          let bx = Math.min(vw - bw - 12, Math.max(12, x + w / 2 - bw / 2));
          Object.assign(bub.style, { left: bx + 'px', top: by + 'px' });
        } else {
          Object.assign(hole.style, { left: vw / 2 + 'px', top: vh / 2 + 'px', width: '0px', height: '0px', opacity: 0 });
          const bw = Math.min(420, vw - 24);
          bub.style.width = bw + 'px';
          Object.assign(bub.style, { left: (vw - bw) / 2 + 'px', top: Math.max(12, (vh - (bub.offsetHeight || 140)) / 2) + 'px' });
        }
        bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
      };
      const show = () => {
        const st = steps[i];
        const el = st.sel ? document.querySelector(st.sel) : null;
        if (el && el.scrollIntoView) {
          const r = el.getBoundingClientRect();
          if (r.top < 60 || r.bottom > window.innerHeight - 70) el.scrollIntoView({ block: 'center', behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
        }
        requestAnimationFrame(() => requestAnimationFrame(place));
      };
      ov.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        if (e.target === skip) { finish(); return; }
        i++;
        if (i >= steps.length) finish(); else show();
      });
      window.addEventListener('resize', place);
      show();
    },

    /* Úvodní výběr jazyka */
    pickLanguage(onPick) {
      const ov = document.createElement('div');
      ov.className = 'lang-pick';
      const guess = (navigator.language || 'en').slice(0, 2).toLowerCase();
      ov.innerHTML = `
        <div class="lang-card">
          <canvas class="lang-crest"></canvas>
          <h1>Hrad proti hradu</h1>
          <p class="lang-title">${I18N.D.choose_lang.filter((_, k) => [0, 1, 2, 4, 6, 9].includes(k)).join(' · ')}</p>
          <div class="lang-grid">
            ${I18N.LANGS.map(l => `<button class="lang-btn ${l.id === guess ? 'guess' : ''}" data-lang="${l.id}" lang="${l.id}"><b>${l.name}</b><small>${l.en}</small></button>`).join('')}
          </div>
        </div>`;
      document.body.appendChild(ov);
      const cv = ov.querySelector('.lang-crest');
      requestAnimationFrame(() => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = cv.clientWidth, h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.save(); const k = h / 120;
        [['rytir', 'kralovstvi', 0.22], ['samuraj', 'samurajove', 0.5], ['berserk', 'vikingove', 0.78]].forEach(([id, f, fx], n) => {
          ctx.save(); ctx.translate(w * fx, h - 4); ctx.scale(k, k);
          Art.drawUnit(ctx, GameData.units[id], Art.unitPalette('player', 'zakladni', f), { x: 0, y: 0, facing: n === 2 ? -1 : 1, t: 0 });
          ctx.restore();
        });
        ctx.restore();
      });
      ov.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
        ov.classList.add('out');
        setTimeout(() => ov.remove(), 250);
        onPick(b.dataset.lang);
      }));
    }
  };

  /* Kroky tutoriálů */
  Tutorial.HOME = [
    { sel: '.hero-live', key: 'tut_home_1' },
    { sel: '.act-main', key: 'tut_home_2' },
    { sel: '.saga-strip', key: 'tut_home_3' },
    { sel: '#nav [data-go="obchod"]', key: 'tut_home_4' }
  ];
  Tutorial.BATTLE = [
    { sel: '#bCoins', key: 'tut_b_1' },
    { sel: '#bUnits', key: 'tut_b_2' },
    { sel: '#bForm', key: 'tut_b_3' },
    { sel: '#bAbil', key: 'tut_b_4' },
    { sel: '#bStage', key: 'tut_b_5' },
    { sel: null, key: 'tut_b_6' }
  ];
  Tutorial.EDITOR = [
    { sel: '.hero-live', key: 'tut_s_1' },
    { sel: '.build-grid .opt:nth-child(1)', key: 'tut_s_2' },
    { sel: '.build-grid .opt:nth-child(2)', key: 'tut_s_3' },
    { sel: '.build-grid .opt:nth-child(3)', key: 'tut_s_4' },
    { sel: '.build-grid .opt:nth-child(4)', key: 'tut_s_5' },
    { sel: '.build-grid .opt:nth-child(5)', key: 'tut_s_6' }
  ];

  window.Tutorial = Tutorial;
})();
