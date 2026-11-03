/* =========================================================================
   ŽÁDOST O HODNOCENÍ – po 3. vyhrané bitvě (a když hráč dá „Později“,
   znovu po dalších 10 výhrách). Nejvýš 2×, nikdy během bitvy.
   Microsoft Store: otevře oficiální okno hodnocení ve Storu.
   Jinde: stránka hry na itch.io.
   ========================================================================= */
(function () {
  const MS_ID = '9PNWTZCM0MLW';
  const ITCH = 'https://battlecastle.itch.io/castle-wars';
  const L = (c, e) => (window.I18N && I18N.lang === 'cs') ? c : e;
  let pending = false;

  const Hodnoceni = {
    state(save) { save.rate = save.rate || { done: false, asked: 0, nextWin: 3 }; return save.rate; },
    url() { return window.Platby && Platby.msStore ? 'ms-windows-store://review/?ProductId=' + MS_ID : ITCH; },
    check(App) {
      if (window.CW_PORTAL) return;
      const s = this.state(App.save);
      if (!s.done && s.asked < 2 && App.save.stats.wins >= s.nextWin) pending = true;
    },
    show(App) {
      pending = false;
      const s = this.state(App.save);
      s.asked++; s.nextWin = App.save.stats.wins + 10;
      Save.save();
      App.modal(`<div class="eyebrow">Castle WARS</div>
        <h2>${L('Baví tě Castle WARS?', 'Enjoying Castle WARS?')}</h2>
        <p>${L('Ohodnoť hru, zabere to 10 vteřin. Hodně nám to pomůže, aby hru našli další hráči.', 'Rate the game, it takes 10 seconds. It really helps other players find it.')}</p>
        <p style="font-size:30px;letter-spacing:6px;margin:6px 0 2px;color:#f5c64a">★★★★★</p>
        <div class="modal-actions">
          <button class="btn btn-gold" data-rate>${L('Ohodnotit', 'Rate now')}</button>
          <button class="btn" data-close>${L('Později', 'Later')}</button>
        </div>`, (c, close) => {
        c.querySelector('[data-rate]').addEventListener('click', () => {
          s.done = true; Save.save();
          if (window.Stat) try { Stat.ev('rate', {}); } catch (e) {}
          window.open(this.url(), '_blank', 'noopener');
          close();
        });
      });
    }
  };

  function hook() {
    const App = window.App;
    if (!App || App._rateHooked) return;
    App._rateHooked = true;
    const end = App._battleEnd, go = App.go;
    App._battleEnd = function (cfg, res) {
      const r = end.apply(this, arguments);
      try { if (res && res.win && !cfg.coop && !(this.battle && this.battle.net)) Hodnoceni.check(this); } catch (e) {}
      return r;
    };
    App.go = function (name) {
      const r = go.apply(this, arguments);
      if (pending && !this.battle && name !== 'bitva') setTimeout(() => { if (pending && !App.battle) try { Hodnoceni.show(App); } catch (e) {} }, 700);
      return r;
    };
  }
  window.Hodnoceni = Hodnoceni;
  if (window.App) hook(); else window.addEventListener('load', hook);
})();
