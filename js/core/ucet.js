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
    login_locked: 'acc_e_locked', rescue_failed: 'acc_e_rescue', session_invalid: 'acc_e_session', network: 'acc_e_net',
    code_invalid: 'code_e_invalid', code_used: 'code_e_used', code_spent: 'code_e_spent', code_busy: 'code_e_busy'
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
    guest() { return !!(this.s && this.s.guest); },
    /* Každý hráč má od začátku automatický účet (host), takže se postup sám
       ukládá na server. Jméno, e-mail a heslo si nastaví, až bude chtít hrát
       i na jiném zařízení. */
    async ensure() {
      if (this.logged() || this._ensuring) return;
      try { if (localStorage.getItem(SKEY + '-bez-serveru')) return; } catch (e) { /* nic */ }
      this._ensuring = true;
      try {
        const r = await rpc('hra_guest', {});
        this.s = { token: r.token, guest: true, username: null, email: null, savedAt: null };
        this.store();
        await this.upload();
      } catch (e) { /* bez internetu – zkusí se příště */ }
      this._ensuring = false;
    },
    errText(e) { return t(ERR[e && e.code] || 'acc_e_net'); },

    async register(username, email, password) {
      const r = this.guest()
        ? await rpc('hra_claim', { p_token: this.s.token, p_username: username, p_email: email, p_password: password })
        : await rpc('hra_register', { p_username: username, p_email: email, p_password: password });
      this.s = { token: r.token, username: r.username, email: r.email, savedAt: null };
      this.store();
      try { localStorage.removeItem(SKEY + '-bez-serveru'); } catch (e) { /* nic */ }
      await this.upload();
      return r;
    },
    /* Přihlášení vrátí i postup uložený na serveru (může být null) */
    async login(login, password) {
      const r = await rpc('hra_login', { p_login: login, p_password: password });
      this.s = { token: r.token, username: r.username, email: r.email, savedAt: r.updated_at || null };
      this.store();
      try { localStorage.removeItem(SKEY + '-bez-serveru'); } catch (e) { /* nic */ }
      return r;
    },
    async logout() {
      const tok = this.s && this.s.token;
      this.s = null; this.store();
      if (tok) try { await rpc('hra_logout', { p_token: tok }); } catch (e) { /* nic */ }
      this.ensure();
    },
    async deleteAccount() {
      await rpc('hra_delete_account', { p_token: this.s.token });
      this.s = null; this.store();
      // po smazání účtu už se nic samo na server neposílá (dokud se hráč znovu nepřihlásí)
      try { localStorage.setItem(SKEY + '-bez-serveru', '1'); } catch (e) { /* nic */ }
    },
    /* záchranný kód: nový (staré přestanou platit) a nastavení nového hesla pomocí kódu */
    async rescueNew() { return rpc('hra_rescue_new', { p_token: this.s.token }); },
    async rescueReset(login, code, pass) {
      const r = await rpc('hra_rescue_reset', { p_login: login, p_code: code, p_new: pass });
      this.s = { token: r.token, username: r.username, email: r.email, savedAt: r.updated_at || null };
      this.store();
      try { localStorage.removeItem(SKEY + '-bez-serveru'); } catch (e) { /* nic */ }
      return r;
    },
    async changePassword(oldP, newP) { await rpc('hra_change_password', { p_token: this.s.token, p_old: oldP, p_new: newP }); },
    async feedback(text) {
      const info = { v: 50, ua: navigator.userAgent.slice(0, 160), w: innerWidth, h: innerHeight, lang: window.I18N && I18N.lang, act: window.App && App.current };
      await rpc('hra_feedback', { p_token: (this.s && this.s.token) || '', p_text: text, p_info: info });
    },
    async leaderboard() { return rpc('hra_leaderboard', { p_limit: 50 }); },
    /* uplatnění kódu: odměnu vrací server (každý kód jednou na účet) */
    /* platby: nová platba (cena je z katalogu na serveru) a vyzvednutí zaplacených nákupů */
    async payStart(product) { await this.ensure(); if (!this.s || !this.s.token) throw { code: 'acc_e_net' }; return rpc('hra_platba_start', { p_token: this.s.token, p_product: product }); },
    async payClaim() { if (!this.s || !this.s.token) return []; return rpc('hra_platby_vyzvednout', { p_token: this.s.token }); },
    apiKey: KEY,
    async redeem(code) { await this.ensure(); if (!this.s || !this.s.token) throw { code: 'acc_e_net' }; return rpc('hra_redeem', { p_token: this.s.token, p_code: code }); },

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
        if (e.code === 'session_invalid') { this.s = null; this.store(); this.ensure(); }
      }
    }
  };
  Ucet.load();
  // automatický účet hned po spuštění (a znovu, když se vrátí internet)
  setTimeout(() => Ucet.ensure(), 1500);
  window.addEventListener('online', () => Ucet.ensure());
  const flush = () => { if (Ucet.logged() && Ucet._t) Ucet.upload(true); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  window.Ucet = Ucet;
})();
