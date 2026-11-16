/* =========================================================================
   ULOŽ SI POSTUP – po 3. vyhrané bitvě (a jednou znovu po dalších 12 výhrách)
   nabídne hráči, ať si postup uloží do účtu, aby o něj nepřišel.
   • Web / Microsoft Store / Android: vlastní účet Castle WARS
     (hostovský účet se jen „přejmenuje“, postup zůstane) + 100 drahokamů
     za registraci (odměna v js/ui/ucet_ui.js, jednou na postup).
   • CrazyGames: jejich vlastní přihlášení (SDK user.showAuthPrompt) –
     postup se pak drží v cloudu CrazyGames (Data Module v reklamy_web.js).
     Bez odměny a bez odkazů ven (pravidla portálu).
   • Ostatní portály: nic.
   Nikdy během bitvy, nejvýš 2×.
   ========================================================================= */
(function () {
  const L = (c, e) => (window.I18N && I18N.L) ? I18N.L(c, e) : e;
  const FIRST = 3, AGAIN = 12, MAX = 2, BONUS = 100;
  let pending = false;

  const cg = () => { const S = window.CrazyGames && CrazyGames.SDK; return S && S.user ? S : null; };
  const ev = (n, p) => { if (window.Stat) try { Stat.ev(n, { p }); } catch (e) { /* nic */ } };

  const Ulozit = {
    state(save) { save.ulozit = save.ulozit || { asked: 0, nextWin: FIRST }; return save.ulozit; },
    /* komu má smysl nabízet */
    async wanted(App) {
      const p = window.CW_PORTAL;
      if (p === 'crazygames') {
        const S = cg(); if (!S) return null;
        try {
          if (S.user.isUserAccountAvailable === false) return null;
          const u = await S.user.getUser();
          return u ? null : 'crazygames';
        } catch (e) { return null; }
      }
      // web / Store / Android: výzvu k registraci už dělá UcetUI.nudge (po každé 3. bitvě) – nezdvojovat
      return null;
    },
    check(App) {
      const s = this.state(App.save);
      if (s.asked < MAX && (App.save.stats.wins || 0) >= s.nextWin) pending = true;
    },
    async show(App) {
      pending = false;
      const kind = await this.wanted(App);
      if (!kind || App.battle) return;
      const s = this.state(App.save);
      s.asked++; s.nextWin = (App.save.stats.wins || 0) + AGAIN;
      Save.save();
      const bonus = kind === 'web' && !App.save.regBonus;
      ev('ulozit_ukaz', kind);
      App.modal(`<div class="eyebrow">Castle WARS</div>
        <h2>🏰 ${L('Neztrať svůj postup!', "Don't lose your progress!")}</h2>
        <p>${kind === 'crazygames'
          ? L('Přihlas se do účtu CrazyGames a tvůj hrad, vojáci i výhry se uloží. Budeš pokračovat i na jiném zařízení.',
              'Log in to your CrazyGames account and your castle, troops and wins are saved. Continue on any device.')
          : L('Vytvoř si účet (zabere to 20 vteřin) a tvůj hrad, vojáci i výhry se uloží. Budeš pokračovat i na jiném zařízení.',
              'Create an account (takes 20 seconds) and your castle, troops and wins are saved. Continue on any device.')}</p>
        ${bonus ? `<p style="font-size:20px;margin:6px 0 2px"><b>💎 +${BONUS} ${L('drahokamů za registraci', 'gems for registering')}</b></p>` : ''}
        <div class="modal-actions">
          <button class="btn btn-gold" data-ulozit>${kind === 'crazygames' ? L('Přihlásit se', 'Log in') : L('Uložit postup', 'Save progress')}</button>
          <button class="btn" data-close>${L('Později', 'Later')}</button>
        </div>`, (c, close) => {
        c.querySelector('[data-ulozit]').addEventListener('click', async () => {
          ev('ulozit_klik', kind);
          close();
          if (kind === 'crazygames') {
            try { const u = await cg().user.showAuthPrompt(); if (u) { ev('ulozit_ok', kind); App.toast(L('Hotovo – postup se ukládá do účtu CrazyGames.', 'Done – progress is saved to your CrazyGames account.')); } } catch (e) { /* hráč zavřel okno */ }
          } else {
            UcetUI.open(App, 'register');
          }
        });
      });
    }
  };

  function hook() {
    const App = window.App;
    if (!App || App._ulozitHooked || !App._battleEnd) return;
    App._ulozitHooked = true;
    const end = App._battleEnd, go = App.go;
    App._battleEnd = function (cfg, res) {
      const r = end.apply(this, arguments);
      try { if (res && res.win && !cfg.film && !(this.battle && this.battle.net)) Ulozit.check(this); } catch (e) { /* nic */ }
      return r;
    };
    App.go = function (name) {
      const r = go.apply(this, arguments);
      // přednost má žádost o hodnocení (když čeká, tahle počká na další návrat)
      if (pending && !this.battle && name !== 'bitva') setTimeout(() => {
        if (pending && !App.battle && (document.getElementById('modal') || {}).hidden !== false && !document.querySelector('.tut:not(.out)')) try { Ulozit.show(App); } catch (e) { /* nic */ }
      }, 1400);
      return r;
    };
  }
  window.Ulozit = Ulozit;
  if (window.App) hook(); else window.addEventListener('load', hook);
})();
