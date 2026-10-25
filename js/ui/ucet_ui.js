/* =========================================================================
   ÚČET – okna pro registraci, přihlášení a volbu postupu po přihlášení
   ========================================================================= */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n || 0).toLocaleString('cs-CZ');
  const when = ts => { if (!ts) return '—'; const d = new Date(ts); return d.toLocaleDateString(I18N.lang === 'cs' ? 'cs-CZ' : undefined) + ' ' + d.toLocaleTimeString(I18N.lang === 'cs' ? 'cs-CZ' : undefined, { hour: '2-digit', minute: '2-digit' }); };
  const summary = d => {
    const cl = Object.keys((d && d.campaign && d.campaign.cleared) || {}).length;
    return `${t('acc_levels', { n: cl })} · ${ico('trophy')} ${fmt(d && d.trophies)} · ${ico('coin')} ${fmt(d && d.gold)} · ${t('castle_level', { n: GameData.calc.castleLevel(Object.assign({ buildings: {} }, d)) })}`;
  };

  const UcetUI = {
    /* Sekce v profilu */
    profileHtml() {
      const S = Ucet.s || {};
      const state = `<p class="acc-state">${ico('crown')} ${Ucet.logged() ? (Ucet.err ? `<span class="bad">${t('acc_save_err')}</span>` : `${t('acc_auto')} <b>${when(S.savedAt)}</b>`) : t('acc_auto_local')}</p>`;
      if (!Ucet.logged() || Ucet.guest()) return `<section class="panel acc-box">
          <div class="acc-head"><span class="acc-ico">${ico('shield')}</span><div><b>${t('acc_title')}</b><p class="muted">${t('acc_why2')}</p></div></div>
          ${state}
          <div class="modal-actions"><button class="btn btn-green" data-acc="register">${t('acc_set')}</button><button class="btn" data-acc="login">${t('acc_login_other')}</button></div>
        </section>`;
      return `<section class="panel acc-box on">
          <div class="acc-head"><span class="acc-ico ok">${ico('shield')}</span><div><b>${esc(S.username)}</b><p class="muted">${esc(S.email)}</p></div></div>
          ${state}
          <div class="modal-actions"><button class="btn" data-acc="pass">${t('acc_change_pass')}</button><button class="btn" data-acc="logout">${t('acc_logout')}</button></div>
        </section>`;
    },
    bind(App, el) {
      el.querySelectorAll('[data-acc]').forEach(b => b.addEventListener('click', async () => {
        const a = b.dataset.acc;
        if (a === 'register' || a === 'login') return this.open(App, a);
        if (a === 'logout') { await Ucet.upload(); await Ucet.logout(); App.toast(t('acc_logged_out')); return App.go('profil', { keepScroll: true }); }
        if (a === 'sync') { b.disabled = true; await Ucet.upload(); App.toast(Ucet.err ? t('acc_save_err') : t('acc_synced')); return App.go('profil', { keepScroll: true }); }
        if (a === 'pass') return this.passModal(App);
      }));
    },

    open(App, mode) {
      const reg = mode === 'register';
      App.modal(`
        <div class="eyebrow">${t('acc_title')}</div>
        <h2>${reg ? t('acc_set') : t('acc_login')}</h2>
        <form class="acc-form" id="accForm" novalidate>
          ${reg ? `<div class="field"><label for="accUser">${t('acc_username')}</label><input id="accUser" maxlength="20" autocomplete="username" required placeholder="${t('acc_username_ph')}"></div>
          <div class="field"><label for="accMail">${t('acc_email')}</label><input id="accMail" type="email" maxlength="120" autocomplete="email" required placeholder="jmeno@email.cz"></div>`
          : `<div class="field"><label for="accUser">${t('acc_login_id')}</label><input id="accUser" maxlength="120" autocomplete="username" required></div>`}
          <div class="field"><label for="accPass">${t('acc_password')}</label><input id="accPass" type="password" maxlength="100" autocomplete="${reg ? 'new-password' : 'current-password'}" required placeholder="${reg ? t('acc_pass_ph') : ''}"></div>
          <p class="acc-err" id="accErr" role="alert" hidden></p>
          ${reg ? `<p class="muted acc-note">${t('acc_reg_note')}</p>` : ''}
          <div class="modal-actions">
            <button class="btn btn-green" type="submit" id="accGo">${reg ? t('acc_save') : t('acc_login')}</button>
            <button class="btn" type="button" data-close>${t('back')}</button>
          </div>
          <button class="acc-switch" type="button" id="accSwitch">${reg ? t('acc_have') : t('acc_new')}</button>
        </form>`, (c, close) => {
        const err = c.querySelector('#accErr'), go = c.querySelector('#accGo');
        c.querySelector('#accSwitch').addEventListener('click', () => { close(); this.open(App, reg ? 'login' : 'register'); });
        c.querySelector('#accForm').addEventListener('submit', async ev => {
          ev.preventDefault();
          const u = c.querySelector('#accUser').value.trim(), p = c.querySelector('#accPass').value;
          const m = reg ? c.querySelector('#accMail').value.trim() : '';
          err.hidden = true;
          // kontrola ještě před odesláním, ať hráč hned ví, co opravit
          const bad = reg && (u.length < 3 ? 'acc_e_user' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m) ? 'acc_e_email' : p.length < 6 ? 'acc_e_pass' : null);
          if (bad) { err.textContent = t(bad); err.hidden = false; return; }
          go.disabled = true; go.textContent = '…';
          try {
            if (reg) {
              if (!App.save.name || App.save.name === 'Velitel') App.save.name = u.slice(0, 16);
              await Ucet.register(u, m, p);
              close(); App.persist(); App.toast(t('acc_welcome', { name: u })); App.go(App.current || 'profil', { keepScroll: true });
            } else {
              const r = await Ucet.login(u, p);
              close(); this.afterLogin(App, r);
            }
          } catch (e) {
            err.textContent = Ucet.errText(e); err.hidden = false;
            go.disabled = false; go.textContent = reg ? t('acc_save') : t('acc_login');
          }
        });
      });
    },

    /* Po přihlášení: který postup použít? Nic se nemaže – druhý zůstane jako záloha. */
    afterLogin(App, r) {
      const server = r.save, local = App.save;
      const useServer = () => { App.save = Save.replace(server, 'prihlaseni'); Ucet.s.savedAt = r.updated_at; Ucet.store(); App.toast(t('acc_loaded')); setTimeout(() => location.reload(), 600); };
      const useLocal = async () => { await Ucet.upload(); App.toast(t('acc_welcome', { name: Ucet.s.username })); App.go(App.current || 'profil', { keepScroll: true }); };
      if (!server) return useLocal();
      const ss = Save.score(server), ls = Save.score(local);
      if (ls <= 50) return useServer();                       // v tomto zařízení skoro nic → vzít z účtu
      if (JSON.stringify(server) === JSON.stringify(local)) return useLocal();
      App.modal(`
        <div class="eyebrow">${t('acc_title')}</div>
        <h2>${t('acc_which')}</h2>
        <p class="muted">${t('acc_which_note')}</p>
        <div class="acc-choice">
          <button class="acc-opt ${ss >= ls ? 'best' : ''}" id="useSrv"><b>${t('acc_from_account')}</b><small>${summary(server)}</small><small class="muted">${when(r.updated_at)}</small></button>
          <button class="acc-opt ${ls > ss ? 'best' : ''}" id="useLoc"><b>${t('acc_from_device')}</b><small>${summary(local)}</small></button>
        </div>`, (c, close) => {
        c.querySelector('#useSrv').addEventListener('click', () => { close(); useServer(); });
        c.querySelector('#useLoc').addEventListener('click', () => { close(); useLocal(); });
      });
    },

    passModal(App) {
      App.modal(`<h2>${t('acc_change_pass')}</h2>
        <form class="acc-form" id="pwForm">
          <div class="field"><label for="pwOld">${t('acc_pass_old')}</label><input id="pwOld" type="password" autocomplete="current-password"></div>
          <div class="field"><label for="pwNew">${t('acc_pass_new')}</label><input id="pwNew" type="password" autocomplete="new-password" placeholder="${t('acc_pass_ph')}"></div>
          <p class="acc-err" id="pwErr" hidden></p>
          <div class="modal-actions"><button class="btn btn-green" type="submit">${t('acc_save')}</button><button class="btn" type="button" data-close>${t('back')}</button></div>
        </form>`, (c, close) => {
        c.querySelector('#pwForm').addEventListener('submit', async ev => {
          ev.preventDefault();
          const e2 = c.querySelector('#pwErr');
          try { await Ucet.changePassword(c.querySelector('#pwOld').value, c.querySelector('#pwNew').value); close(); App.toast(t('done')); }
          catch (e) { e2.textContent = Ucet.errText(e); e2.hidden = false; }
        });
      });
    },

    /* Záloha postupu kódem – funguje i bez účtu */
    backupHtml() {
      return `<section class="panel acc-box">
          <div class="acc-head"><span class="acc-ico">${ico('crown')}</span><div><b>${t('bk_title')}</b><p class="muted">${t('bk_note')}</p></div></div>
          <div class="modal-actions"><button class="btn" data-bk="export">${t('bk_export')}</button><button class="btn" data-bk="import">${t('bk_import')}</button></div>
        </section>`;
    },
    bindBackup(App, el) {
      el.querySelectorAll('[data-bk]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.bk === 'export') {
          const code = 'HPH1:' + btoa(unescape(encodeURIComponent(JSON.stringify(App.save))));
          App.modal(`<h2>${t('bk_export')}</h2><p class="muted">${t('bk_export_note')}</p>
            <textarea class="bk-code" readonly>${esc(code)}</textarea>
            <div class="modal-actions"><button class="btn btn-green" id="bkCopy">${t('bk_copy')}</button><button class="btn" data-close>${t('back')}</button></div>`, (c) => {
            const ta = c.querySelector('textarea'); ta.focus(); ta.select();
            c.querySelector('#bkCopy').addEventListener('click', () => { try { navigator.clipboard.writeText(code).then(() => App.toast(t('bk_copied')), () => { ta.select(); document.execCommand('copy'); App.toast(t('bk_copied')); }); } catch (e) { ta.select(); document.execCommand('copy'); App.toast(t('bk_copied')); } });
          });
        } else {
          App.modal(`<h2>${t('bk_import')}</h2><p class="muted">${t('bk_import_note')}</p>
            <textarea class="bk-code" id="bkIn" placeholder="HPH1:…"></textarea><p class="acc-err" id="bkErr" hidden></p>
            <div class="modal-actions"><button class="btn btn-green" id="bkGo">${t('bk_restore')}</button><button class="btn" data-close>${t('back')}</button></div>`, (c, close) => {
            c.querySelector('#bkGo').addEventListener('click', () => {
              const v = c.querySelector('#bkIn').value.trim();
              try {
                if (!v.startsWith('HPH1:')) throw 0;
                const d = JSON.parse(decodeURIComponent(escape(atob(v.slice(5)))));
                if (!d || typeof d !== 'object' || !d.campaign) throw 0;
                close(); App.save = Save.replace(d, 'obnovou'); Ucet.upload(); App.toast(t('acc_loaded')); setTimeout(() => location.reload(), 600);
              } catch (e) { const er = c.querySelector('#bkErr'); er.textContent = t('bk_bad'); er.hidden = false; }
            });
          });
        }
      }));
    }
  };
  window.UcetUI = UcetUI;
})();
