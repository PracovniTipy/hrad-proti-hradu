/* =========================================================================
   ÚČET HRÁČE: registrace (e-mail, uživatelské jméno, heslo), přihlášení
   a ukládání postupu na server (Supabase). Postup se ukládá i v prohlížeči,
   takže hra funguje i bez internetu – server je záloha, ze které se dá
   přihlásit na jiném zařízení.
   ========================================================================= */
(function () {
  const URL = 'https://smjplqxwqyraphfeqsyk.supabase.co/rest/v1/rpc/';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtanBscXh3cXlyYXBoZmVxc3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MjA3NzMsImV4cCI6MjEwODQ5Njc3M30.X6VUO5NSdJFG4E00aAALSDkW39JqANjQmk0dees_Q78';
  const SKEY = 'hrad-proti-hradu-ucet';
  const ERR = {
    username_invalid: 'acc_e_user', email_invalid: 'acc_e_email', password_short: 'acc_e_pass',
    username_taken: 'acc_e_user_taken', email_taken: 'acc_e_email_taken', login_failed: 'acc_e_login',
    login_locked: 'acc_e_locked', session_invalid: 'acc_e_session', network: 'acc_e_net'
  };

  async function rpc(fn, args, opts) {
    let res;
    try {
      res = await fetch(URL + fn, { method: 'POST', keepalive: !!(opts && opts.keepalive),
        headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
        body: JSON.stringify(args) });
    } catch (e) { const er = new Error('network'); er.code = 'network'; throw er; }
    const txt = await res.text();
    let body = null; try { body = txt ? JSON.parse(txt) : null; } catch (e) { body = txt; }
    if (!res.ok) {
      const m = (body && body.message) || 'network';
      const code = Object.keys(ERR).find(k => m.includes(k)) || 'network';
      const er = new Error(code); er.code = code; throw er;
    }
    return body;
  }

  const Ucet = {
    s: null,
    load() { try { this.s = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { this.s = null; } return this.s; },
    store() { try { if (this.s) localStorage.setItem(SKEY, JSON.stringify(this.s)); else localStorage.removeItem(SKEY); } catch (e) { /* nic */ } },
    logged() { return !!(this.s && this.s.token); },
    errText(e) { return t(ERR[e && e.code] || 'acc_e_net'); },

    async register(username, email, password) {
      const r = await rpc('hra_register', { p_username: username, p_email: email, p_password: password });
      this.s = { token: r.token, username: r.username, email: r.email, savedAt: null };
      this.store();
      await this.upload();
      return r;
    },
    /* Přihlášení vrátí i postup uložený na serveru (může být null) */
    async login(login, password) {
      const r = await rpc('hra_login', { p_login: login, p_password: password });
      this.s = { token: r.token, username: r.username, email: r.email, savedAt: r.updated_at || null };
      this.store();
      return r;
    },
    async logout() {
      const tok = this.s && this.s.token;
      this.s = null; this.store();
      if (tok) try { await rpc('hra_logout', { p_token: tok }); } catch (e) { /* nic */ }
    },
    async changePassword(oldP, newP) { await rpc('hra_change_password', { p_token: this.s.token, p_old: oldP, p_new: newP }); },
    async leaderboard() { return rpc('hra_leaderboard', { p_limit: 50 }); },

    /* Nahrání postupu: po každé změně s malým zpožděním, při zavření hned */
    queue() {
      if (!this.logged()) return;
      clearTimeout(this._t);
      this._t = setTimeout(() => this.upload(), 8000);
    },
    async upload(keepalive) {
      if (!this.logged() || !window.Save || !Save.data) return;
      clearTimeout(this._t);
      try {
        const ts = await rpc('hra_save', { p_token: this.s.token, p_data: Save.data }, { keepalive });
        this.s.savedAt = ts; this.store(); this.err = null;
      } catch (e) {
        this.err = e.code;
        if (e.code === 'session_invalid') { this.s = null; this.store(); }
      }
    }
  };
  Ucet.load();
  const flush = () => { if (Ucet.logged() && Ucet._t) Ucet.upload(true); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  window.Ucet = Ucet;
})();
