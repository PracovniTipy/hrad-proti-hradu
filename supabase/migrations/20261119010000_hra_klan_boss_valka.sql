-- =========================================================================
-- KLANY 2: KLANOVÝ BOSS + VÁLKA O ŘÍŠI – Castle WARS
--   * Klanový boss (každý týden jiná bestie, 4 v rotaci):
--       - společné životy celého klanu: 20 000 + 4 000 × počet členů
--       - každá výhra člena v turnaji = 150 zranění (hra._klan_win)
--       - Nájezd na bosse (speciální bitva): zranění z bitvy, max 3 nájezdy denně,
--         max 12 000 za nájezd, mezi nájezdy aspoň 60 s
--       - fáze 25 / 50 / 75 / 100 % → odměny pro každého, kdo do bosse přispěl
--   * Válka o říši: 9 provincií. Vůdce / důstojník určí cíl klanu, každá výhra
--     člena = 1 bod vlivu v cílové provincii. Kdo má v neděli nejvíc vlivu, provincii drží;
--     členové, kteří ten týden přispěli, dostanou 40 drahokamů za každou drženou provincii
--     (vyzvedává se příští týden).
--   * nic se nemaže; tabulky v hra.* s RLS bez politik, přístup jen přes public.hra_klan_*.
-- =========================================================================

create table if not exists hra.klan_boss_dmg (
  klan_id bigint not null references hra.klany(id) on delete cascade,
  week date not null,
  account_id uuid not null references hra.accounts(id) on delete cascade,
  dmg bigint not null default 0,
  raids int not null default 0,
  raid_day date,
  raids_today int not null default 0,
  last_raid timestamptz,
  best int not null default 0,
  primary key (klan_id, week, account_id)
);
create index if not exists klan_boss_dmg_acc on hra.klan_boss_dmg(account_id, week);

create table if not exists hra.klan_boss_odmeny (
  account_id uuid not null references hra.accounts(id) on delete cascade,
  week date not null,
  got int not null default 0,
  valka_done boolean not null default false,
  primary key (account_id, week)
);

create table if not exists hra.klan_uzemi_cil (
  klan_id bigint primary key references hra.klany(id) on delete cascade,
  provincie int not null check (provincie between 1 and 9),
  set_at timestamptz not null default now()
);

create table if not exists hra.klan_uzemi (
  week date not null,
  provincie int not null check (provincie between 1 and 9),
  klan_id bigint not null references hra.klany(id) on delete cascade,
  body int not null default 0,
  last_at timestamptz not null default now(),
  primary key (week, provincie, klan_id)
);
create index if not exists klan_uzemi_klan on hra.klan_uzemi(klan_id, week);

alter table hra.klan_boss_dmg enable row level security;
alter table hra.klan_boss_odmeny enable row level security;
alter table hra.klan_uzemi_cil enable row level security;
alter table hra.klan_uzemi enable row level security;

-- ---------- pomocné ----------
create or replace function hra._klan_boss_hp(p_klan bigint) returns bigint language sql stable security definer set search_path to '' as
$$ select 20000 + 4000 * greatest(1, (select count(*) from hra.klan_clenove where klan_id = p_klan))::bigint $$;

create or replace function hra._klan_boss_total(p_klan bigint, p_week date) returns bigint language sql stable security definer set search_path to '' as
$$ select coalesce(sum(dmg), 0)::bigint from hra.klan_boss_dmg where klan_id = p_klan and week = p_week $$;

-- index bosse týdne (0–3), stejný pro všechny klany
create or replace function hra._klan_boss_idx(p_week date) returns int language sql immutable set search_path to '' as
$$ select (((p_week - date '2026-01-05') / 7) % 4 + 4) % 4 $$;

-- přidá zranění bossovi; ohlásí do chatu překročené fáze (25/50/75/100 %)
create or replace function hra._klan_boss_add(p_klan bigint, p_acc uuid, p_week date, p_dmg int) returns void language plpgsql security definer set search_path to '' as $$
declare hp bigint := hra._klan_boss_hp(p_klan); before bigint; after bigint; i int;
begin
  if p_dmg <= 0 then return; end if;
  before := hra._klan_boss_total(p_klan, p_week);
  insert into hra.klan_boss_dmg(klan_id, week, account_id, dmg) values (p_klan, p_week, p_acc, p_dmg)
  on conflict (klan_id, week, account_id) do update set dmg = hra.klan_boss_dmg.dmg + p_dmg;
  after := before + p_dmg;
  for i in 1..4 loop
    if before < hp * i / 4 and after >= hp * i / 4 then perform hra._klan_sys(p_klan, null, 'boss', i::text); end if;
  end loop;
end $$;

-- výhra člena: příspěvek klanu (beze změny) + boss + vliv v cílové provincii
create or replace function hra._klan_win(p_acc uuid, p_week date) returns void language plpgsql security definer set search_path to '' as $$
declare k bigint; before int; i int; tiers int[] := array[50, 150, 300]; prov int;
begin
  select klan_id into k from hra.klan_clenove where account_id = p_acc;
  if k is null then return; end if;
  before := hra._klan_score(k, p_week);
  insert into hra.klan_prispevky(klan_id, week, account_id, wins, last_at) values (k, p_week, p_acc, 1, now())
  on conflict (klan_id, week, account_id) do update set wins = hra.klan_prispevky.wins + 1, last_at = now();
  for i in 1..3 loop
    if before < tiers[i] and before + 1 >= tiers[i] then perform hra._klan_sys(k, null, 'chest', i::text); end if;
  end loop;
  begin
    perform hra._klan_boss_add(k, p_acc, p_week, 150);
  exception when others then null;
  end;
  begin
    select provincie into prov from hra.klan_uzemi_cil where klan_id = k;
    prov := coalesce(prov, (k % 9)::int + 1);
    insert into hra.klan_uzemi(week, provincie, klan_id, body, last_at) values (p_week, prov, k, 1, now())
    on conflict (week, provincie, klan_id) do update set body = hra.klan_uzemi.body + 1, last_at = now();
  exception when others then null;
  end;
exception when others then null;
end $$;

-- držitel provincie v daném týdnu
create or replace function hra._klan_drzitel(p_week date, p_prov int) returns bigint language sql stable security definer set search_path to '' as $$
  select u.klan_id from hra.klan_uzemi u join hra.klany k on k.id = u.klan_id and k.disbanded_at is null
  where u.week = p_week and u.provincie = p_prov and u.body > 0 order by u.body desc, u.last_at limit 1
$$;

-- čekající odměny z bosse (tento i minulý týden) a z války (minulý týden); p_apply = vyzvednout
create or replace function hra._klan_boss_odm(p_acc uuid, p_apply boolean) returns jsonb language plpgsql security definer set search_path to '' as $$
declare
  cur date := hra._week(); wk date; k bigint; hp bigint; tot bigint; got int; reached int; i int; vdone boolean; held int; p int;
  pg int[] := array[1500, 2500, 4000, 6000]; pm int[] := array[20, 30, 50, 120];
  gold int := 0; gems int := 0; items jsonb := '[]'::jsonb; contributed boolean;
begin
  foreach wk in array array[cur - 7, cur] loop
    select o.got, o.valka_done into got, vdone from hra.klan_boss_odmeny o where o.account_id = p_acc and o.week = wk;
    got := coalesce(got, 0); vdone := coalesce(vdone, false); reached := 0;
    -- boss: klan, kterému hráč ten týden nejvíc ublížil bossovi
    k := null;
    select d.klan_id into k from hra.klan_boss_dmg d where d.account_id = p_acc and d.week = wk and d.dmg > 0 order by d.dmg desc limit 1;
    if k is not null then
      hp := hra._klan_boss_hp(k); tot := hra._klan_boss_total(k, wk);
      for i in 1..4 loop
        if tot >= hp * i / 4 then
          reached := reached | (1 << (i - 1));
          if got & (1 << (i - 1)) = 0 then
            gold := gold + pg[i]; gems := gems + pm[i];
            items := items || jsonb_build_object('kind', 'boss', 'phase', i, 'week', wk, 'gold', pg[i], 'gems', pm[i], 'boss', hra._klan_boss_idx(wk));
          end if;
        end if;
      end loop;
    end if;
    -- válka o říši: za každou drženou provincii 40 drahokamů (jen minulý týden, jen kdo do klanu přispěl)
    held := 0;
    if wk < cur and not vdone then
      k := null;
      select p2.klan_id into k from hra.klan_prispevky p2 where p2.account_id = p_acc and p2.week = wk and p2.wins > 0
        order by p2.wins desc, p2.last_at desc limit 1;
      contributed := k is not null;
      if contributed then
        for p in 1..9 loop if hra._klan_drzitel(wk, p) = k then held := held + 1; end if; end loop;
        if held > 0 then gems := gems + held * 40; items := items || jsonb_build_object('kind', 'valka', 'held', held, 'week', wk, 'gems', held * 40); end if;
      end if;
    end if;
    if p_apply and ((reached & ~got) <> 0 or (wk < cur and not vdone)) then
      insert into hra.klan_boss_odmeny(account_id, week, got, valka_done) values (p_acc, wk, got | reached, wk < cur)
      on conflict (account_id, week) do update set got = hra.klan_boss_odmeny.got | excluded.got, valka_done = hra.klan_boss_odmeny.valka_done or excluded.valka_done;
    end if;
  end loop;
  return jsonb_build_object('gold', gold, 'gems', gems, 'items', items);
end $$;

-- ---------- veřejné RPC ----------

-- stav bosse mého klanu
create or replace function public.hra_klan_boss(p_token text) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); k bigint; w date := hra._week(); hp bigint; tot bigint; me hra.klan_boss_dmg; today date := hra._klan_today();
begin
  select klan_id into k from hra.klan_clenove where account_id = acc;
  if k is null then return jsonb_build_object('klan', null, 'reward', hra._klan_boss_odm(acc, false)); end if;
  hp := hra._klan_boss_hp(k); tot := hra._klan_boss_total(k, w);
  select * into me from hra.klan_boss_dmg where klan_id = k and week = w and account_id = acc;
  return jsonb_build_object('klan', k, 'week', w, 'boss', hra._klan_boss_idx(w), 'hp', hp, 'dmg', tot,
    'ends', (w + 7)::timestamp at time zone 'Europe/Prague',
    'mine', coalesce(me.dmg, 0), 'best', coalesce(me.best, 0),
    'raids_left', 3 - case when me.raid_day = today then me.raids_today else 0 end,
    'next_raid', case when me.last_raid > now() - interval '60 seconds' then me.last_raid + interval '60 seconds' else null end,
    'top', coalesce((select jsonb_agg(jsonb_build_object('name', a.username, 'dmg', d.dmg, 'raids', d.raids, 'mine', d.account_id = acc) order by d.dmg desc)
      from (select * from hra.klan_boss_dmg where klan_id = k and week = w and dmg > 0 order by dmg desc limit 30) d
      join hra.accounts a on a.id = d.account_id), '[]'::jsonb),
    'reward', hra._klan_boss_odm(acc, false));
end $$;

-- nájezd na bosse: zranění z bitvy (server ořízne)
create or replace function public.hra_klan_boss_raid(p_token text, p_dmg int) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); k bigint; w date := hra._week(); today date := hra._klan_today(); me hra.klan_boss_dmg; used int; d int;
begin
  select klan_id into k from hra.klan_clenove where account_id = acc;
  if k is null then raise exception 'klan_none'; end if;
  perform pg_advisory_xact_lock(hashtext('klan_boss:' || acc::text));
  select * into me from hra.klan_boss_dmg where klan_id = k and week = w and account_id = acc;
  used := case when me.raid_day = today then me.raids_today else 0 end;
  if used >= 3 then raise exception 'klan_boss_raids'; end if;
  if me.last_raid > now() - interval '60 seconds' then raise exception 'klan_slow'; end if;
  d := greatest(0, least(coalesce(p_dmg, 0), 12000));
  insert into hra.klan_boss_dmg(klan_id, week, account_id, dmg, raids, raid_day, raids_today, last_raid, best)
    values (k, w, acc, 0, 1, today, 1, now(), d)
  on conflict (klan_id, week, account_id) do update set raids = hra.klan_boss_dmg.raids + 1, raid_day = today,
    raids_today = used + 1, last_raid = now(), best = greatest(hra.klan_boss_dmg.best, d);
  perform hra._klan_boss_add(k, acc, w, d);
  if d >= 6000 then perform hra._klan_sys(k, acc, 'raid', d::text); end if;
  return public.hra_klan_boss(p_token);
end $$;

create or replace function public.hra_klan_boss_claim(p_token text) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token);
begin
  perform pg_advisory_xact_lock(hashtext('klan_boss_claim:' || acc::text));
  return hra._klan_boss_odm(acc, true);
end $$;

-- mapa války o říši
create or replace function public.hra_klan_valka(p_token text) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid; k bigint; w date := hra._week(); cil int; rl text;
begin
  if p_token is not null and p_token <> '' then begin acc := hra._acc(p_token); exception when others then acc := null; end; end if;
  if acc is not null then select c.klan_id, c.role into k, rl from hra.klan_clenove c where account_id = acc; end if;
  if k is not null then select provincie into cil from hra.klan_uzemi_cil where klan_id = k; cil := coalesce(cil, (k % 9)::int + 1); end if;
  return jsonb_build_object('week', w, 'ends', (w + 7)::timestamp at time zone 'Europe/Prague', 'klan', k, 'cil', cil, 'role', rl,
    'provincie', (select jsonb_agg(jsonb_build_object('id', p,
        'top', coalesce((select jsonb_agg(hra._klan_card(u.klan_id) || jsonb_build_object('body', u.body) order by u.body desc, u.last_at)
          from (select uu.* from hra.klan_uzemi uu join hra.klany kk on kk.id = uu.klan_id and kk.disbanded_at is null
                where uu.week = w and uu.provincie = p and uu.body > 0 order by uu.body desc, uu.last_at limit 3) u), '[]'::jsonb),
        'mine', case when k is null then 0 else coalesce((select body from hra.klan_uzemi where week = w and provincie = p and klan_id = k), 0) end,
        'last', (select jsonb_build_object('name', kk.name, 'tag', kk.tag, 'emblem', kk.emblem, 'color', kk.color)
                 from hra.klany kk where kk.id = hra._klan_drzitel(w - 7, p))
      ) order by p) from generate_series(1, 9) p));
end $$;

-- cíl klanu ve válce (vůdce / důstojník)
create or replace function public.hra_klan_cil(p_token text, p_prov int) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); me hra.klan_clenove;
begin
  select * into me from hra.klan_clenove where account_id = acc;
  if me.klan_id is null then raise exception 'klan_none'; end if;
  if me.role not in ('leader', 'officer') then raise exception 'klan_rights'; end if;
  if p_prov is null or p_prov < 1 or p_prov > 9 then raise exception 'klan_rights'; end if;
  insert into hra.klan_uzemi_cil(klan_id, provincie, set_at) values (me.klan_id, p_prov, now())
  on conflict (klan_id) do update set provincie = excluded.provincie, set_at = now();
  perform hra._klan_sys(me.klan_id, acc, 'cil', p_prov::text);
  return public.hra_klan_valka(p_token);
end $$;

grant execute on function public.hra_klan_boss(text), public.hra_klan_boss_raid(text, int), public.hra_klan_boss_claim(text),
  public.hra_klan_valka(text), public.hra_klan_cil(text, int) to anon, authenticated;
