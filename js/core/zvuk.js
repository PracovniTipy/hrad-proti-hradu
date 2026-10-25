/* =========================================================================
   ZVUK A HUDBA – vše se syntetizuje přímo v prohlížeči (Web Audio),
   žádné zvukové soubory. Hudba má vlastní melodii pro každý národ.
   Hlasitost zvuků v bitvě závisí na vzdálenosti od kamery a je omezená,
   aby stovka vojáků neřvala najednou.
   ========================================================================= */
(function () {
  let ctx = null, master, sfxBus, musBus, noiseBuf, reverb;
  const last = {};

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 6; comp.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(comp);
    musBus = ctx.createGain(); musBus.connect(comp);
    // jednoduchý dozvuk (síň hradu)
    reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 1.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    reverb.buffer = ir;
    const rvG = ctx.createGain(); rvG.gain.value = 0.25; reverb.connect(rvG); rvG.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    Zvuk.apply();
    return ctx;
  }
  const now = () => ctx.currentTime;
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function osc(type, f, t, dur, vol, out, f2) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, 0.005, vol, dur); o.connect(g); g.connect(out || sfxBus); o.start(t); o.stop(t + dur + 0.05);
    return g;
  }
  function noise(t, dur, vol, type, f, q, out, f2) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q || 1;
    env(g, t, 0.004, vol, dur); s.connect(fl); fl.connect(g); g.connect(out || sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    return g;
  }

  /* ---------- zvukové efekty ---------- */
  const SFX = {
    click(v) { const t = now(); osc('triangle', 880, t, 0.06, 0.18 * v); osc('sine', 1320, t + 0.02, 0.05, 0.1 * v); },
    tab(v) { const t = now(); osc('triangle', 660, t, 0.05, 0.12 * v); },
    sword(v) {      // kov o kov
      const t = now(), f = 1800 + Math.random() * 1600;
      noise(t, 0.08, 0.35 * v, 'bandpass', f, 8);
      osc('square', f * 0.5, t, 0.12, 0.05 * v, null, f * 0.47);
      osc('sine', f * 1.37, t, 0.22, 0.06 * v);
    },
    hit(v) { const t = now(); noise(t, 0.09, 0.3 * v, 'lowpass', 900, 1); osc('sine', 140, t, 0.1, 0.25 * v, null, 70); },
    arrow(v) { const t = now(); noise(t, 0.22, 0.16 * v, 'bandpass', 2600, 3, null, 900); },
    bow(v) { const t = now(); osc('triangle', 220, t, 0.12, 0.12 * v, null, 110); noise(t, 0.05, 0.1 * v, 'highpass', 3000, 1); },
    catapult(v) { const t = now(); osc('sine', 90, t, 0.25, 0.4 * v, null, 45); noise(t, 0.3, 0.2 * v, 'lowpass', 500, 1); },
    boom(v) {
      const t = now(); noise(t, 0.9, 0.7 * v, 'lowpass', 1200, 0.8, null, 120); osc('sine', 80, t, 0.6, 0.6 * v, null, 30);
      const g = noise(t + 0.02, 1.0, 0.25 * v, 'lowpass', 400, 1); g.connect(reverb);
    },
    fire(v) { const t = now(); noise(t, 0.6, 0.35 * v, 'bandpass', 700, 0.7, null, 2400); for (let i = 0; i < 5; i++) noise(t + Math.random() * 0.5, 0.03, 0.2 * v, 'highpass', 4000, 1); },
    ice(v) { const t = now(); for (let i = 0; i < 6; i++) osc('sine', 1800 + Math.random() * 2400, t + i * 0.03, 0.25, 0.07 * v); noise(t, 0.3, 0.15 * v, 'highpass', 5000, 1); },
    bolt(v) { const t = now(); noise(t, 0.06, 0.6 * v, 'highpass', 2000, 1); noise(t + 0.05, 1.1, 0.5 * v, 'lowpass', 900, 0.7, null, 80); },
    magic(v) { const t = now(); osc('sine', 600, t, 0.35, 0.12 * v, null, 1600); osc('triangle', 900, t + 0.05, 0.3, 0.08 * v, null, 2200); },
    spawn(v) { const t = now(); osc('sawtooth', 196, t, 0.18, 0.06 * v); osc('sawtooth', 294, t + 0.08, 0.2, 0.05 * v); },
    horn(v) {        // válečný roh
      const t = now(); const g = osc('sawtooth', 147, t, 1.0, 0.18 * v, null, 155); g.connect(reverb); osc('sawtooth', 220, t + 0.15, 0.9, 0.1 * v);
    },
    skill(v) { const t = now(); osc('sawtooth', 220, t, 0.5, 0.1 * v, null, 880); noise(t, 0.5, 0.2 * v, 'bandpass', 600, 2, null, 3000); },
    heal(v) { const t = now(); [523, 659, 784, 1046].forEach((f, i) => osc('sine', f, t + i * 0.07, 0.4, 0.1 * v)); },
    coin(v) { const t = now(); osc('square', 1318, t, 0.06, 0.06 * v); osc('square', 1760, t + 0.06, 0.12, 0.06 * v); },
    castle(v) { const t = now(); noise(t, 0.35, 0.4 * v, 'lowpass', 600, 1); osc('sine', 70, t, 0.3, 0.35 * v, null, 40); },
    death(v) { const t = now(); osc('triangle', 300, t, 0.25, 0.06 * v, null, 120); },
    win() {
      const t = now(); [392, 523, 659, 784, 1046].forEach((f, i) => { const g = osc('triangle', f, t + i * 0.13, 0.5, 0.18); g.connect(reverb); });
      osc('sawtooth', 523, t + 0.7, 1.1, 0.07); osc('sawtooth', 659, t + 0.7, 1.1, 0.06); osc('sawtooth', 784, t + 0.7, 1.1, 0.06);
    },
    lose() { const t = now(); [392, 349, 311, 262].forEach((f, i) => { const g = osc('triangle', f, t + i * 0.28, 0.6, 0.15); g.connect(reverb); }); },
    unlock() { const t = now(); [659, 784, 988, 1318].forEach((f, i) => osc('triangle', f, t + i * 0.09, 0.35, 0.12)); }
  };
  /* ---------- skutečné nahrávky (0 A.D., CC BY-SA 3.0 – viz zvuky/LICENCE.txt) ---------- */
  const SADY = { clash: 12, swing: 5, shieldw: 5, shieldm: 5, flesh: 6, bow: 5, arrowhit: 7, spear: 5, death: 10,
    siegehit: 4, siegeshot: 1, collapse: 3, cry: 12, horse: 4, horsedeath: 2 };
  const BASE = (/^https?:$/.test(location.protocol) && !/claude|claudeusercontent|anthropic/.test(location.hostname)) ? 'zvuky/' : 'https://pracovnitipy.github.io/hrad-proti-hradu/zvuky/';
  const BUF = {}; let loading = false, crowd = null;
  function loadSamples() {
    if (loading || !ctx) return; loading = true;
    const get = (url) => fetch(url).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(a => new Promise((ok, no) => ctx.decodeAudioData(a, ok, no)));
    Object.keys(SADY).forEach(k => { BUF[k] = []; for (let i = 0; i < SADY[k]; i++) get(BASE + k + '_' + i + '.mp3').then(b => BUF[k].push(b)).catch(() => {}); });
    get(BASE + 'bitva_dav.mp3').then(b => { BUF.dav = b; }).catch(() => {});
  }
  /* přehraje náhodnou nahrávku ze sady; vrací false, když ještě není načtená */
  function sample(set, vol, rate, out) {
    const arr = BUF[set]; if (!arr || !arr.length) return false;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = arr[Math.floor(Math.random() * arr.length)];
    src.playbackRate.value = rate || (0.92 + Math.random() * 0.16);
    g.gain.value = vol; src.connect(g); g.connect(out || sfxBus); src.start();
    return true;
  }
  /* zvuky bitvy: nejdřív nahrávka, když chybí, syntéza */
  const REAL = {
    sword: v => Math.random() < 0.62 ? sample('clash', v * 0.9) : Math.random() < 0.55 ? sample(Math.random() < 0.5 ? 'shieldw' : 'shieldm', v * 0.8) : sample('flesh', v * 0.8),
    hit: v => sample(Math.random() < 0.6 ? 'arrowhit' : 'flesh', v * 0.7),
    bow: v => sample('bow', v * 0.55),
    death: v => sample('death', v * 0.75),
    catapult: v => sample('siegeshot', v),
    boom: v => sample('siegehit', v * 0.9),
    castle: v => sample(Math.random() < 0.3 ? 'collapse' : 'siegehit', v * 0.6, 0.85 + Math.random() * 0.1),
    cry: v => sample('cry', v),
    horse: v => sample('horse', v * 0.7),
    spear: v => sample('spear', v * 0.7),
    spawn: v => sample('swing', v * 0.45)
  };

  /* omezení, kolikrát za sekundu se smí stejný zvuk ozvat */
  const RATE = { cry: 0.25, horse: 0.6, spear: 0.08, sword: 0.06, hit: 0.06, arrow: 0.05, bow: 0.07, death: 0.12, coin: 0.08, spawn: 0.1, castle: 0.15, fire: 0.15, boom: 0.08, catapult: 0.15, magic: 0.1, ice: 0.12, bolt: 0.1 };

  /* ---------- hudba: krátké motivy se smyčkou, každý národ jinak ---------- */
  const SCALES = {
    kralovstvi: { root: 146.83, steps: [0, 2, 3, 5, 7, 9, 10, 12, 14], wave: 'triangle', drone: true, tempo: 92, drum: 'march' },     // D dórská – středověk
    samurajove: { root: 164.81, steps: [0, 1, 5, 7, 8, 12, 13, 17], wave: 'sine', pluck: true, tempo: 76, drum: 'taiko' },          // japonská stupnice in
    vikingove: { root: 110, steps: [0, 3, 5, 7, 10, 12, 15], wave: 'sawtooth', drone: true, tempo: 84, drum: 'deep' },               // moll pentatonika
    demoni: { root: 98, steps: [0, 1, 4, 6, 7, 10, 12, 13], wave: 'sawtooth', drone: true, tempo: 100, drum: 'deep' }                 // temná frygická
  };
  const Music = {
    on: false, kind: null, nat: 'kralovstvi', timer: null, next: 0, step: 0, phrase: null, nodes: [],
    start(nat, kind) {
      if (!init()) return;
      if (this.on && this.nat === nat && this.kind === kind) return;
      this.stop();
      this.on = true; this.nat = SCALES[nat] ? nat : 'kralovstvi'; this.kind = kind; this.step = 0; this.next = now() + 0.1;
      this.seed = 1 + Math.floor(Math.random() * 1000);
      const S = SCALES[this.nat];
      if (S.drone) {     // tichý bordun
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = S.root / 2; o2.frequency.value = S.root / 2 * 1.5 * 1.003;
        f.type = 'lowpass'; f.frequency.value = 420; g.gain.value = 0; g.gain.linearRampToValueAtTime(kind === 'battle' ? 0.05 : 0.04, now() + 2);
        o.connect(f); o2.connect(f); f.connect(g); g.connect(musBus); o.start(); o2.start();
        this.nodes.push(o, o2, g);
      }
      this.timer = setInterval(() => this.tick(), 60);
    },
    stop() {
      clearInterval(this.timer); this.timer = null; this.on = false;
      this.nodes.forEach(n => { try { if (n.gain) n.gain.linearRampToValueAtTime(0, now() + 0.5); else n.stop(now() + 0.6); } catch (e) { /* nic */ } });
      this.nodes = [];
    },
    rnd() { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; },
    tick() {
      if (!ctx || ctx.state !== 'running') return;
      const S = SCALES[this.nat], battle = this.kind === 'battle';
      const beat = 60 / (S.tempo * (battle ? 1.25 : 1)) / 2;     // osminy
      while (this.next < now() + 0.25) {
        const t = this.next, st = this.step % 32;
        // melodie: fráze o 16 osminách, opakuje se s obměnou
        if (st % 16 === 0) this.phrase = Array.from({ length: 16 }, (_, i) => (i % 2 === 0 || this.rnd() < 0.35) ? Math.floor(this.rnd() * S.steps.length) : -1);
        const n = this.phrase[st % 16];
        if (n >= 0 && (battle || st % 2 === 0)) {
          const f = S.root * Math.pow(2, S.steps[n] / 12) * (st >= 16 && this.rnd() < 0.3 ? 2 : 1);
          const g = osc(S.pluck ? 'triangle' : S.wave === 'sawtooth' ? 'square' : S.wave, f, t, S.pluck ? 0.9 : beat * 1.8, battle ? 0.05 : 0.045, musBus);
          if (S.pluck) osc('sine', f * 2, t, 0.5, 0.02, musBus);
          g.connect(reverb);
        }
        // basa na dobách
        if (st % 8 === 0) osc('triangle', S.root / 2 * (st % 32 === 16 ? Math.pow(2, S.steps[3] / 12) : 1), t, beat * 6, 0.07, musBus);
        // bubny
        if (battle || this.nat === 'samurajove') {
          if (S.drum === 'taiko') { if (st % 8 === 0 || (battle && st % 8 === 6)) { osc('sine', 70, t, 0.5, 0.22, musBus, 40); noise(t, 0.12, 0.08, 'lowpass', 400, 1, musBus); } }
          else if (S.drum === 'march') { if (st % 4 === 0) osc('sine', 90, t, 0.25, 0.18, musBus, 50); if (st % 4 === 2 || st % 8 === 7) noise(t, 0.08, 0.06, 'bandpass', 1800, 1, musBus); }
          else { if (st % 8 === 0 || st % 8 === 3) osc('sine', 60, t, 0.5, 0.25, musBus, 35); if (st % 8 === 4) noise(t, 0.15, 0.08, 'lowpass', 700, 1, musBus); }
        }
        this.step++; this.next += beat;
      }
    }
  };

  const Zvuk = {
    settings() { const s = (window.App && App.save && App.save.settings) || {}; return { sfx: s.sfx !== false, music: s.music !== false }; },
    apply() {
      if (!ctx) return;
      const st = this.settings();
      sfxBus.gain.value = st.sfx ? 0.8 : 0;
      musBus.gain.value = st.music ? 0.55 : 0;
    },
    /* první dotyk odemkne zvuk (prohlížeče jinak nedovolí) */
    unlock() { if (init()) { if (ctx.state !== 'running') ctx.resume(); loadSamples(); } },
    play(name, vol) {
      if (!ctx || ctx.state !== 'running' || !this.settings().sfx) return;
      const r = RATE[name] || 0, tt = performance.now() / 1000;
      if (r && last[name] && tt - last[name] < r) return;
      last[name] = tt;
      const v = vol == null ? 1 : Math.max(0.05, Math.min(1, vol));
      try { if (REAL[name] && REAL[name](v)) return; if (SFX[name]) SFX[name](v); } catch (e) { /* nic */ }
    },
    /* zvuk v bitvě – tišší, když se to děje mimo obrazovku */
    at(name, x, battle, vol) {
      if (!battle || !battle.cam) return this.play(name, vol);
      const c = battle.cam, mid = c.x + c.viewW / 2, d = Math.abs(x - mid) - c.viewW / 2;
      const k = d <= 0 ? 1 : Math.max(0, 1 - d / 900);
      if (k > 0.05) this.play(name, (vol == null ? 1 : vol) * k);
    },
    /* řev bitvy: hlasitost podle toho, kolik vojáků právě bojuje na obrazovce (0–1) */
    battle(level) {
      if (!ctx || !BUF.dav) return;
      if (!crowd) {
        const src = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        src.buffer = BUF.dav; src.loop = true; f.type = 'lowpass'; f.frequency.value = 2400; g.gain.value = 0;
        src.connect(f); f.connect(g); g.connect(sfxBus); src.start();
        crowd = { src, g, f };
      }
      const lv = Math.max(0, Math.min(1, level));
      crowd.g.gain.setTargetAtTime(this.settings().sfx ? lv * 0.55 : 0, ctx.currentTime, 0.6);
      crowd.f.frequency.setTargetAtTime(900 + lv * 2600, ctx.currentTime, 0.6);
    },
    battleEnd() { if (crowd) { try { crowd.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4); crowd.src.stop(ctx.currentTime + 2); } catch (e) { /* nic */ } crowd = null; } },
    music(nat, kind) { if (!this.settings().music) { Music.stop(); return; } Music.start(nat, kind); },
    stopMusic() { Music.stop(); },
    toggle(key) {
      const s = App.save.settings; s[key] = s[key] === false; App.persist(); this.apply();
      if (key === 'music') { if (s.music === false) Music.stop(); else if (Music.nat) Music.start(Music.nat, Music.kind || 'menu'); }
      return s[key] !== false;
    }
  };
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => {
    Zvuk.unlock();
    if (!Music.on && Zvuk.settings().music && window.App && App.save) Music.start(App.battle ? (App.battle.side.player.faction || App.save.faction) : App.save.faction, App.battle ? 'battle' : 'menu');
  }, { capture: true }));
  // klik na tlačítka rozhraní
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('button, .tab, [data-go]')) Zvuk.play('click', 0.7); }, true);
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });
  Zvuk._buf = BUF;
  window.Zvuk = Zvuk;
})();
