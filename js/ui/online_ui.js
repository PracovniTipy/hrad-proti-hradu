/* =========================================================================
   OBRAZOVKA ONLINE – vytvoření místnosti, připojení kódem a lobby
   ========================================================================= */
(function () {
  Object.assign(I18N.D, {
    onl_title: ['Online s přáteli', 'Online with friends'],
    onl_sub: ['Hraj proti kamarádům nebo s nimi – stačí si poslat kód místnosti.', 'Play against or together with friends – just share the room code.'],
    onl_1v1: ['Souboj 1 v 1', 'Duel 1 v 1'],
    onl_1v1_d: ['Ty proti kamarádovi. Každý ovládá svůj hrad a armádu.', 'You against a friend. Each controls their own castle and army.'],
    onl_2v2: ['Bitva 2 v 2', 'Battle 2 v 2'],
    onl_2v2_d: ['Dva týmy po dvou. Spoluhráči sdílejí hrad, každý má vlastní mince a vojáky.', 'Two teams of two. Teammates share a castle, each has their own coins and troops.'],
    onl_coop: ['Příběh ve dvou', 'Story co-op'],
    onl_coop_d: ['Spolu proti armádě z příběhu. Nepřítel je silnější, odměna platí pro oba.', 'Together against a story army. The enemy is stronger, both get the reward.'],
    onl_create: ['Vytvořit místnost', 'Create room'],
    onl_join: ['Připojit se ke kamarádovi', 'Join a friend'],
    onl_code_ph: ['KÓD', 'CODE'],
    onl_join_btn: ['Připojit', 'Join'],
    onl_joining: ['Připojuji se k místnosti {c}…', 'Joining room {c}…'],
    onl_room: ['Místnost', 'Room'],
    onl_share: ['Pošli tento kód kamarádovi. Zadá ho v Souboj → Online s přáteli → Připojit.', 'Send this code to your friend. They enter it in Duel → Online with friends → Join.'],
    onl_copy: ['Kopírovat kód', 'Copy code'],
    onl_copied: ['Kód zkopírován', 'Code copied'],
    onl_team_a: ['Tým modrý', 'Blue team'],
    onl_team_b: ['Tým červený', 'Red team'],
    onl_together: ['Spolu proti příběhové armádě', 'Together against the story army'],
    onl_empty: ['Volné místo…', 'Free slot…'],
    onl_host: ['hostitel', 'host'],
    onl_you: ['ty', 'you'],
    onl_army: ['Tvoje armáda', 'Your army'],
    onl_switch: ['Přejít do druhého týmu', 'Switch team'],
    onl_level: ['Úroveň příběhu', 'Story level'],
    onl_start: ['Spustit bitvu', 'Start battle'],
    onl_wait_players: ['Čeká se na hráče ({n}/{m})', 'Waiting for players ({n}/{m})'],
    onl_wait_teams: ['Týmy musí mít stejně hráčů', 'Teams must be equal'],
    onl_wait_host: ['Bitvu spustí hostitel', 'The host starts the battle'],
    onl_leave: ['Opustit místnost', 'Leave room'],
    onl_mode: ['Režim', 'Mode'],
    onl_not_found: ['Místnost nenalezena. Zkontroluj kód a jestli má kamarád hru otevřenou.', 'Room not found. Check the code and that your friend has the game open.'],
    onl_full: ['Místnost je plná.', 'The room is full.'],
    onl_host_left: ['Hostitel místnost opustil.', 'The host left the room.'],
    onl_kicked: ['Už nejsi v místnosti.', 'You are no longer in the room.'],
    onl_no_conn: ['Nepodařilo se připojit k serveru. Zkontroluj internet.', 'Could not connect to the server. Check your internet.'],
    onl_conn_lost: ['Spojení s hostitelem se přerušilo. Trofeje se nemění.', 'Connection to the host was lost. Trophies unchanged.'],
    onl_foe_left: ['Soupeř odešel z bitvy – vítězství!', 'Your opponent left the battle – victory!'],
    onl_you_quit: ['Vzdal ses.', 'You surrendered.'],
    onl_coop_locked: ['Tuhle úroveň ještě nemáš ve svém příběhu odemčenou – dostáváš zlato, postup se ti započítá, až se k ní dostaneš.', 'You have not unlocked this level in your own story yet – you get gold, progress counts once you reach it.'],
    onl_waiting: ['Čekám na hostitele…', 'Waiting for the host…'],
    onl_rules: ['Online: vítězství 1 v 1 = +30 trofejí, 2 v 2 = +20. Prohra ubere 15 / 10. Každý bojuje se svým hradem – vylepšeními, obránci na hradbách, vroucím olejem i výbavou.', 'Online: a 1 v 1 win = +30 trophies, 2 v 2 = +20. A loss costs 15 / 10. Everyone fights with their own castle – upgrades, wall defenders, boiling oil and gear.'],
    onl_btn: ['Online s přáteli', 'Online with friends'],
    onl_btn_d: ['1 v 1, 2 v 2 nebo příběh ve dvou', '1 v 1, 2 v 2 or story co-op']
  });

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CAP = { '1v1': 2, '2v2': 4, coop: 2 };

  function screenOnline(App) {
    const el = App.screenEl, O = window.Online, r = O.room, save = App.save, G = GameData;
    const modeCard = (m, icon) => `
      <article class="panel onl-card">
        <div class="onl-ic">${ico(icon)}</div>
        <div><h3>${t('onl_' + m)}</h3><p class="muted">${t('onl_' + m + '_d')}</p></div>
        <button class="btn btn-gold" data-create="${m}">${t('onl_create')}</button>
      </article>`;

    if (!r) {
      el.innerHTML = `
        <div class="scr">
          <div class="sec-head"><h1>${t('onl_title')}</h1><button class="btn btn-sm" data-go="pvp">${t('back')}</button></div>
          <p class="muted">${t('onl_sub')}</p>
          <div class="onl-modes">${modeCard('1v1', 'swords')}${modeCard('2v2', 'shield')}${modeCard('coop', 'crown')}</div>
          <article class="panel onl-join">
            <h3>${t('onl_join')}</h3>
            <div class="onl-join-row"><input id="onlCode" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${t('onl_code_ph')}"><button class="btn btn-green" id="onlJoin">${t('onl_join_btn')}</button></div>
          </article>
          <p class="muted onl-rules">${t('onl_rules')}</p>
        </div>`;
      el.querySelectorAll('[data-create]').forEach(b => b.addEventListener('click', () => {
        const m = b.dataset.create;
        if (m === 'coop' && !O.coopLevels().length) return App.toast(t('t_prev_first'));
        O.create(m);
      }));
      const inp = el.querySelector('#onlCode');
      inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      const doJoin = () => { if (!O.join(inp.value)) App.toast(t('onl_not_found')); };
      el.querySelector('#onlJoin').addEventListener('click', doJoin);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') doJoin(); });
      return;
    }

    if (r.joining) {
      el.innerHTML = `<div class="scr"><div class="panel onl-wait"><div class="spin"></div><h3>${t('onl_joining', { c: esc(r.code) })}</h3><button class="btn" id="onlLeave">${t('back')}</button></div></div>`;
      el.querySelector('#onlLeave').addEventListener('click', () => O.leave());
      return;
    }

    const me = r.players.find(p => p.pid === O.pid) || {};
    const myFac = me.fac || save.faction;
    const H = G.campaignHelpers;
    const pcard = p => {
      const F = G.factions[p.fac] || G.factions.kralovstvi;
      return `<div class="onl-p ${p.pid === O.pid ? 'me' : ''}" style="--c:${F.color}">
        <canvas data-pf="${p.fac}"></canvas>
        <div><b>${esc(p.name)}</b>${p.host ? ` <small class="tag">${t('onl_host')}</small>` : ''}${p.pid === O.pid ? ` <small class="tag tag-you">${t('onl_you')}</small>` : ''}
        <small>${esc(F.name)} · ${ico('trophy')} ${p.tro | 0}</small></div></div>`;
    };
    const per = r.mode === '2v2' ? 2 : r.mode === '1v1' ? 1 : 2;
    const col = (team, label) => {
      const ps = r.players.filter(p => p.team === team);
      const empty = Math.max(0, per - ps.length);
      return `<div class="onl-team team-${team}"><div class="eyebrow">${label}</div>${ps.map(pcard).join('')}${Array.from({ length: empty }, () => `<div class="onl-p empty">${t('onl_empty')}</div>`).join('')}</div>`;
    };
    const lv = r.level ? H.find(r.level) : null;
    const ready = r.host && O.ready();
    let why = '';
    if (!O.full()) why = t('onl_wait_players', { n: r.players.length, m: CAP[r.mode] });
    else if (!O.ready()) why = t('onl_wait_teams');
    el.innerHTML = `
      <div class="scr onl-lobby">
        <div class="onl-code-box">
          <div><div class="eyebrow">${t('onl_room')} · ${t('onl_' + r.mode)}</div><div class="onl-code">${esc(r.code)}</div></div>
          <p class="muted">${t('onl_share')}</p>
          <button class="btn btn-sm" id="onlCopy">${t('onl_copy')}</button>
        </div>
        ${r.host ? `<div class="onl-mode-row"><span class="eyebrow">${t('onl_mode')}</span>${['1v1', '2v2', 'coop'].map(m => `<button class="chip ${r.mode === m ? 'on' : ''}" data-mode="${m}" ${r.players.length > CAP[m] ? 'disabled' : ''}>${t('onl_' + m)}</button>`).join('')}</div>` : ''}
        <div class="onl-teams ${r.mode === 'coop' ? 'coop' : ''}">
          ${r.mode === 'coop' ? col('A', t('onl_together')) : col('A', t('onl_team_a')) + '<div class="onl-vs">VS</div>' + col('B', t('onl_team_b'))}
        </div>
        ${r.mode === 'coop' ? `<div class="panel onl-level"><div class="eyebrow">${t('onl_level')}</div>
          ${r.host ? `<select id="onlLevel">${O.coopLevels().map(l => `<option value="${l.id}" ${l.id === r.level ? 'selected' : ''}>${esc(l.label)} ${esc(l.name)}${save.campaign.cleared[l.id] ? ' ✓' : ''}</option>`).join('')}</select>` : `<b>${lv ? esc(lv.label + ' ' + lv.name) : '—'}</b>`}
          ${lv ? `<small class="muted">${t('difficulty')}: ×${lv.diff.toFixed(2).replace('.', ',')} · ${esc(G.factions[lv.enemy].name)}</small>` : ''}</div>` : ''}
        <div class="panel onl-army"><div class="eyebrow">${t('onl_army')}</div>
          <div class="onl-facs">${G.factionOrder.map(f => { const un = H.factionUnlocked(save, f); return `<button class="chip ${f === myFac ? 'on' : ''}" data-fac="${f}" ${un ? '' : 'disabled'} style="--c:${G.factions[f].color}">${esc(G.factions[f].name)}${un ? '' : ' 🔒'}</button>`; }).join('')}</div>
          ${r.mode !== 'coop' ? `<button class="btn btn-sm" id="onlSwitch">${t('onl_switch')}</button>` : ''}
        </div>
        <div class="onl-actions">
          ${r.host ? `<button class="btn btn-green btn-big" id="onlStart" ${ready ? '' : 'disabled'}>${t('onl_start')}</button>${why ? `<small class="muted">${why}</small>` : ''}` : `<div class="muted onl-wait-host"><div class="spin sm"></div>${why || t('onl_wait_host')}</div>`}
          <button class="btn" id="onlLeave">${t('onl_leave')}</button>
        </div>
      </div>`;
    el.querySelectorAll('canvas[data-pf]').forEach(cv => { const F = G.factions[cv.dataset.pf] || G.factions.kralovstvi; Art.renderUnitIcon(cv, F.roles.tezka, 'player', 'zakladni', { headshot: true, noShadow: true }); });
    el.querySelector('#onlCopy').addEventListener('click', () => {
      const txt = r.code;
      const ok = () => App.toast(t('onl_copied'));
      try { if (navigator.share && matchMedia('(pointer: coarse)').matches) { navigator.share({ title: 'Castle WARS', text: `Castle WARS – ${t('onl_room')} ${txt}`, url: location.origin + location.pathname }).catch(() => {}); return; } } catch (_) { /* nic */ }
      try { navigator.clipboard.writeText(txt).then(ok, ok); } catch (_) { ok(); }
    });
    el.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => O.setMode(b.dataset.mode)));
    el.querySelectorAll('[data-fac]').forEach(b => b.addEventListener('click', () => { if (!b.disabled) O.setFac(b.dataset.fac); }));
    const sw = el.querySelector('#onlSwitch'); if (sw) sw.addEventListener('click', () => O.switchTeam());
    const ls = el.querySelector('#onlLevel'); if (ls) ls.addEventListener('change', () => O.setLevel(ls.value));
    const st = el.querySelector('#onlStart'); if (st) st.addEventListener('click', () => { if (!O.start()) App.toast(why || t('onl_wait_teams')); });
    el.querySelector('#onlLeave').addEventListener('click', () => { O.leave(); });
  }

  Screens.online = screenOnline;
})();
