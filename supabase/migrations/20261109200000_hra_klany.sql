-- =========================================================================
-- KLANY (Clans) – Castle WARS
--   * jen registrovaní hráči (ne hosté), 1 klan na hráče, max 30 členů
--   * role: leader (vůdce) / officer (důstojník) / member (člen)
--   * otevřený klan = vstup hned, uzavřený = žádost, kterou schválí vůdce/důstojník
--   * klanový turnaj: skóre = součet výher členů za týden OD VSTUPU do klanu
--     (počítá se v hra_turnaj_win, stejné limity jako osobní turnaj)
--   * týdenní truhly 50 / 150 / 300 výher – pro každého, kdo přispěl ≥ 1 výhrou
--     (každá truhla max 1× za týden na hráče, i když klan změní → žádné „přeskakování“)
--   * odměny za umístění klanu se vyzvedávají příští týden (1. 500, 2–3 300, 4–10 150, 11–50 50 drahokamů)
--     – jen pro hráče, kteří do klanu ten týden přispěli (u více klanů rozhoduje ten s nejvíc výhrami)
--   * pokladna: dary zlata (max 5000/den/hráč) → úroveň klanu 1–6 → +2 % zlata za úroveň (max +10 %)
--   * chat: jen předpřipravené zprávy a emoce (kódy, žádný volný text) – bezpečné pro děti,
--     bez nutnosti moderace; limit 1 zpráva / 3 s a 15 / 5 min; zobrazuje se posledních 50
--   * žádné mazání řádků: odchod = klan_id null, žádost = active false, zaniklý klan = disbanded_at
--     (uvolní jméno i zkratku); vůdce bez účtu se nahradí líně (hra._klan_fix)
-- Tabulky v hra.* s RLS bez politik, přístup jen přes public.hra_klan_* (SECURITY DEFINER).
-- =========================================================================

create table if not exists hra.klany (
  id bigint generated always as identity primary key,
  name text not null,
  name_lc text unique,
  tag text not null,
  tag_lc text unique,
  emblem text not null,
  color text not null,
  descr text not null default '',
  open boolean not null default true,
  treasury bigint not null default 0,
  created_by uuid references hra.accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  disbanded_at timestamptz
);

create table if not exists hra.klan_clenove (
  account_id uuid primary key references hra.accounts(id) on delete cascade,
  klan_id bigint references hra.klany(id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'officer', 'member')),
  joined_at timestamptz not null default now(),
  donated bigint not null default 0,
  don_day date,
  don_today int not null default 0
);
create index if not exists klan_clenove_klan on hra.klan_clenove(klan_id);

create table if not exists hra.klan_zadosti (
  klan_id bigint not null references hra.klany(id) on delete cascade,
  account_id uuid not null references hra.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  active boolean not null default true,
  primary key (klan_id, account_id)
);
create index if not exists klan_zadosti_acc on hra.klan_zadosti(account_id);

create table if not exists hra.klan_zpravy (
  id bigint generated always as identity primary key,
  klan_id bigint not null references hra.klany(id) on delete cascade,
  account_id uuid references hra.accounts(id) on delete set null,
  kind text not null check (kind in ('q', 'sys')),
  code text not null,
  arg text,
  created_at timestamptz not null default now()
);
create index if not exists klan_zpravy_klan on hra.klan_zpravy(klan_id, id desc);
create index if not exists klan_zpravy_acc on hra.klan_zpravy(account_id, created_at desc);

create table if not exists hra.klan_prispevky (
  klan_id bigint not null references hra.klany(id) on delete cascade,
  week date not null,
  account_id uuid not null references hra.accounts(id) on delete cascade,
  wins int not null default 0,
  last_at timestamptz not null default now(),
  primary key (klan_id, week, account_id)
);
create index if not exists klan_prispevky_week on hra.klan_prispevky(week, klan_id);
create index if not exists klan_prispevky_acc on hra.klan_prispevky(account_id, week);

create table if not exists hra.klan_odmeny (
  account_id uuid not null references hra.accounts(id) on delete cascade,
  week date not null,
  chests int not null default 0,
  rank_done boolean not null default false,
  primary key (account_id, week)
);

create table if not exists hra.klan_odchody (
  account_id uuid primary key references hra.accounts(id) on delete cascade,
  left_at timestamptz not null default now()
);

alter table hra.klany enable row level security;
alter table hra.klan_clenove enable row level security;
alter table hra.klan_zadosti enable row level security;
alter table hra.klan_zpravy enable row level security;
alter table hra.klan_prispevky enable row level security;
alter table hra.klan_odmeny enable row level security;
alter table hra.klan_odchody enable row level security;

-- ---------- pomocné ----------
create or replace function hra._klan_emblems() returns text[] language sql immutable set search_path to '' as
$$ select array['lilie','lev','orel','kriz','slunce','hvezda','havran','sekery','lebka','koruna','mec','vez'] $$;
create or replace function hra._klan_colors() returns text[] language sql immutable set search_path to '' as
$$ select array['#c0392b','#2f62b8','#2e7d4a','#c9962a','#6a3fb5','#1f8a8a','#d35400','#2a2a33','#8a1e3c','#3d4a5c','#b03a8a','#5a3a1e'] $$;
create or replace function hra._klan_codes() returns text[] language sql immutable set search_path to '' as
$$ select array['hi','gg','gl','thx','gj','attack','push','chest','welcome','gn','wow','haha','help','ready','donate','sorry',
  'e_sword','e_shield','e_fire','e_crown','e_trophy','e_muscle','e_party','e_laugh','e_heart','e_thumb','e_castle','e_skull'] $$;
create or replace function hra._klan_lvl(t bigint) returns int language sql immutable set search_path to '' as
$$ select case when t >= 300000 then 6 when t >= 150000 then 5 when t >= 75000 then 4 when t >= 30000 then 3 when t >= 10000 then 2 else 1 end $$;
create or replace function hra._klan_today() returns date language sql stable set search_path to '' as
$$ select (now() at time zone 'Europe/Prague')::date $$;

-- základní filtr sprostých slov (CZ/EN). Normalizace: diakritika, leetspeak, bez mezer.
create or replace function hra._klan_bad(p text) returns boolean language plpgsql immutable set search_path to '' as $$
declare
  w text; s text;
  stems text[] := array['kurv','prdel','zmrd','debil','kokot','mrd','curak','hovn','srack','buzn','buzer','negr','nigg','fuck','shit','bitch',
    'whore','fagg','nazi','hitler','retard','porn','penis','vagin','kunda','jebat','ojeb','zasran','kreten','hajzl','cigan','cikan','picov',
    'picus','pyco','chcip','sperm','teplous','pussy','slut','kkk','holocaust','dildo','motherf'];
  words text[] := array['pic','pica','picka','picu','pice','ass','sex','cock','kys','fag','cum','tit','tits','kkt','ss','prc','idiot','fu','fuk','wtf','stfu','nsfw',
    'cunt','rape','dick','anus','heil','sieg','nigga'];
  x text;
begin
  w := lower(coalesce(p, ''));
  w := translate(w, 'áäčďéěëíňóöřšťúůüýžľĺŕ', 'aacdeeeinoorstuuuyzllr');
  w := translate(w, '013457@$!|', 'oieastasii');
  s := regexp_replace(w, '[^a-z]', '', 'g');
  s := regexp_replace(s, '(.)\1+', '\1', 'g');          -- fuuuck → fuck
  foreach x in array stems loop
    if position(x in s) > 0 or position(x in regexp_replace(w, '[^a-z]', '', 'g')) > 0 then return true; end if;
  end loop;
  w := ' ' || regexp_replace(w, '[^a-z]+', ' ', 'g') || ' ';
  foreach x in array words loop
    if position(' ' || x || ' ' in w) > 0 then return true; end if;
  end loop;
  return false;
end $$;

create or replace function hra._klan_sys(p_klan bigint, p_acc uuid, p_code text, p_arg text) returns void
language sql security definer set search_path to '' as
$$ insert into hra.klan_zpravy(klan_id, account_id, kind, code, arg) values (p_klan, p_acc, 'sys', p_code, p_arg) $$;

create or replace function hra._klan_name(p_acc uuid) returns text language sql stable security definer set search_path to '' as
$$ select username from hra.accounts where id = p_acc $$;

create or replace function hra._klan_reg(p_acc uuid) returns void language plpgsql stable security definer set search_path to '' as $$
begin
  if coalesce((select is_guest from hra.accounts where id = p_acc), true) then raise exception 'klan_guest'; end if;
end $$;

create or replace function hra._klan_score(p_klan bigint, p_week date) returns int language sql stable security definer set search_path to '' as
$$ select coalesce(sum(wins), 0)::int from hra.klan_prispevky where klan_id = p_klan and week = p_week $$;

create or replace function hra._klan_rank(p_klan bigint, p_week date) returns int language sql stable security definer set search_path to '' as $$
  with s as (select klan_id, sum(wins)::int sc, max(last_at) la from hra.klan_prispevky where week = p_week group by klan_id),
       me as (select sc, la from s where klan_id = p_klan and sc > 0)
  select (select count(*) + 1 from s where s.sc > me.sc or (s.sc = me.sc and s.la < me.la))::int from me
$$;

-- klan bez vůdce dostane nového (nejstarší důstojník, jinak nejstarší člen); prázdný klan zanikne (uvolní jméno)
create or replace function hra._klan_fix(p_klan bigint) returns void language plpgsql security definer set search_path to '' as $$
declare nl uuid;
begin
  if not exists (select 1 from hra.klany where id = p_klan and disbanded_at is null) then return; end if;
  if not exists (select 1 from hra.klan_clenove where klan_id = p_klan) then
    update hra.klany set disbanded_at = now(), name_lc = null, tag_lc = null where id = p_klan;
    update hra.klan_zadosti set active = false where klan_id = p_klan;
    return;
  end if;
  if not exists (select 1 from hra.klan_clenove where klan_id = p_klan and role = 'leader') then
    select account_id into nl from hra.klan_clenove where klan_id = p_klan
      order by (role = 'officer') desc, joined_at limit 1;
    update hra.klan_clenove set role = 'leader' where account_id = nl;
    perform hra._klan_sys(p_klan, nl, 'leader', hra._klan_name(nl));
  end if;
end $$;

-- výhra v turnaji → příspěvek klanu (volá hra_turnaj_win; chyba klanů nikdy nerozbije turnaj)
create or replace function hra._klan_win(p_acc uuid, p_week date) returns void language plpgsql security definer set search_path to '' as $$
declare k bigint; before int; i int; tiers int[] := array[50, 150, 300];
begin
  select klan_id into k from hra.klan_clenove where account_id = p_acc;
  if k is null then return; end if;
  before := hra._klan_score(k, p_week);
  insert into hra.klan_prispevky(klan_id, week, account_id, wins, last_at) values (k, p_week, p_acc, 1, now())
  on conflict (klan_id, week, account_id) do update set wins = hra.klan_prispevky.wins + 1, last_at = now();
  for i in 1..3 loop
    if before < tiers[i] and before + 1 >= tiers[i] then perform hra._klan_sys(k, null, 'chest', i::text); end if;
  end loop;
exception when others then null;
end $$;

-- čekající odměny (p_apply = vyzvednout)
create or replace function hra._klan_odmeny(p_acc uuid, p_apply boolean) returns jsonb language plpgsql security definer set search_path to '' as $$
declare
  cur date := hra._week(); wk date; k bigint; sc int; got int; reached int; rk int; rg int; i int; rdone boolean;
  tiers int[] := array[50, 150, 300]; tg int[] := array[1000, 2000, 4000]; tm int[] := array[20, 40, 80];
  gold int := 0; gems int := 0; items jsonb := '[]'::jsonb;
begin
  foreach wk in array array[cur - 7, cur] loop
    k := null;
    select p.klan_id into k from hra.klan_prispevky p where p.account_id = p_acc and p.week = wk and p.wins > 0
      order by p.wins desc, p.last_at desc limit 1;
    continue when k is null;
    sc := hra._klan_score(k, wk);
    select o.chests, o.rank_done into got, rdone from hra.klan_odmeny o where o.account_id = p_acc and o.week = wk;
    got := coalesce(got, 0); rdone := coalesce(rdone, false); reached := 0;
    for i in 1..3 loop
      if sc >= tiers[i] then
        reached := reached | (1 << (i - 1));
        if got & (1 << (i - 1)) = 0 then
          gold := gold + tg[i]; gems := gems + tm[i];
          items := items || jsonb_build_object('kind', 'chest', 'tier', i, 'week', wk, 'gold', tg[i], 'gems', tm[i]);
        end if;
      end if;
    end loop;
    if wk < cur and not rdone then
      rk := hra._klan_rank(k, wk);
      rg := case when rk is null then 0 when rk = 1 then 500 when rk <= 3 then 300 when rk <= 10 then 150 when rk <= 50 then 50 else 0 end;
      if rg > 0 then gems := gems + rg; items := items || jsonb_build_object('kind', 'rank', 'rank', rk, 'week', wk, 'gems', rg, 'score', sc); end if;
    end if;
    if p_apply and ((reached & ~got) <> 0 or (wk < cur and not rdone)) then
      insert into hra.klan_odmeny(account_id, week, chests, rank_done) values (p_acc, wk, got | reached, wk < cur)
      on conflict (account_id, week) do update set chests = hra.klan_odmeny.chests | excluded.chests, rank_done = hra.klan_odmeny.rank_done or excluded.rank_done;
    end if;
  end loop;
  return jsonb_build_object('gold', gold, 'gems', gems, 'items', items);
end $$;

create or replace function hra._klan_put(p_acc uuid, p_klan bigint, p_role text) returns void language sql security definer set search_path to '' as $$
  insert into hra.klan_clenove(account_id, klan_id, role) values (p_acc, p_klan, p_role)
  on conflict (account_id) do update set klan_id = excluded.klan_id, role = excluded.role, joined_at = now(), donated = 0;
  update hra.klan_zadosti set active = false where account_id = p_acc;
$$;

-- karta klanu (pro hledání a žebříček)
create or replace function hra._klan_card(p_klan bigint) returns jsonb language sql stable security definer set search_path to '' as $$
  select jsonb_build_object('id', k.id, 'name', k.name, 'tag', k.tag, 'emblem', k.emblem, 'color', k.color, 'descr', k.descr, 'open', k.open,
    'members', (select count(*) from hra.klan_clenove c where c.klan_id = k.id), 'level', hra._klan_lvl(k.treasury),
    'score', hra._klan_score(k.id, hra._week()))
  from hra.klany k where k.id = p_klan
$$;

-- ---------- veřejné RPC ----------

-- přehled: můj klan, členové, chat, žádosti, odměny
create or replace function public.hra_klan_info(p_token text) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); g boolean; me hra.klan_clenove; k hra.klany; w date := hra._week(); cd timestamptz; res jsonb;
begin
  select is_guest into g from hra.accounts where id = acc;
  select left_at + interval '30 minutes' into cd from hra.klan_odchody where account_id = acc;
  select * into me from hra.klan_clenove where account_id = acc;
  if me.klan_id is not null then perform hra._klan_fix(me.klan_id); select * into me from hra.klan_clenove where account_id = acc; end if;
  res := jsonb_build_object('guest', g, 'reward', hra._klan_odmeny(acc, false),
    'cooldown', case when cd > now() then cd else null end,
    'requested', coalesce((select jsonb_agg(klan_id) from hra.klan_zadosti where account_id = acc and active), '[]'::jsonb));
  if me.klan_id is null then return res || jsonb_build_object('klan', null); end if;
  select * into k from hra.klany where id = me.klan_id;
  return res || jsonb_build_object('klan', jsonb_build_object(
    'id', k.id, 'name', k.name, 'tag', k.tag, 'emblem', k.emblem, 'color', k.color, 'descr', k.descr, 'open', k.open,
    'treasury', k.treasury, 'level', hra._klan_lvl(k.treasury), 'role', me.role, 'me', acc,
    'don_left', 5000 - case when me.don_day = hra._klan_today() then me.don_today else 0 end,
    'week', jsonb_build_object('score', hra._klan_score(k.id, w), 'rank', hra._klan_rank(k.id, w), 'ends', (w + 7)::timestamp at time zone 'Europe/Prague'),
    'members', (select jsonb_agg(jsonb_build_object('id', c.account_id, 'name', a.username, 'role', c.role, 'donated', c.donated,
        'wins', coalesce((select p.wins from hra.klan_prispevky p where p.klan_id = k.id and p.week = w and p.account_id = c.account_id), 0),
        'seen', (select max(s.last_used) from hra.sessions s where s.account_id = c.account_id))
        order by coalesce((select p.wins from hra.klan_prispevky p where p.klan_id = k.id and p.week = w and p.account_id = c.account_id), 0) desc, c.joined_at)
      from hra.klan_clenove c join hra.accounts a on a.id = c.account_id where c.klan_id = k.id),
    'chat', coalesce((select jsonb_agg(x order by x->>'id') from (
        select jsonb_build_object('id', lpad(z.id::text, 12, '0'), 'name', a.username, 'mine', z.account_id = acc, 'kind', z.kind, 'code', z.code, 'arg', z.arg, 'at', z.created_at) x
        from hra.klan_zpravy z left join hra.accounts a on a.id = z.account_id where z.klan_id = k.id order by z.id desc limit 50) q), '[]'::jsonb),
    'requests', case when me.role in ('leader', 'officer') then coalesce((select jsonb_agg(jsonb_build_object('id', r.account_id, 'name', a.username, 'at', r.created_at,
        'wins', coalesce((select t.wins from hra.turnaj t where t.account_id = r.account_id and t.week = w), 0)) order by r.created_at)
      from hra.klan_zadosti r join hra.accounts a on a.id = r.account_id where r.klan_id = k.id and r.active), '[]'::jsonb) else '[]'::jsonb end
  ));
end $$;

create or replace function public.hra_klan_create(p_token text, p_name text, p_tag text, p_emblem text, p_color text, p_descr text, p_open boolean)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); n text; tg text; d text; kid bigint;
begin
  perform hra._klan_reg(acc);
  if exists (select 1 from hra.klan_clenove where account_id = acc and klan_id is not null) then raise exception 'klan_already'; end if;
  n := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
  tg := upper(btrim(coalesce(p_tag, '')));
  d := regexp_replace(btrim(coalesce(p_descr, '')), '\s+', ' ', 'g');
  if char_length(n) < 3 or char_length(n) > 20 or n !~ '^[[:alnum:]][[:alnum:] _.''-]*$' then raise exception 'klan_name_invalid'; end if;
  if tg !~ '^[[:alnum:]]{2,4}$' then raise exception 'klan_tag_invalid'; end if;
  if char_length(d) > 120 then raise exception 'klan_descr_invalid'; end if;
  if hra._klan_bad(n) or hra._klan_bad(tg) then raise exception 'klan_name_bad'; end if;
  if hra._klan_bad(d) then raise exception 'klan_descr_bad'; end if;
  if not (p_emblem = any(hra._klan_emblems())) or not (p_color = any(hra._klan_colors())) then raise exception 'klan_emblem_invalid'; end if;
  -- jméno/zkratku drží klan, jehož poslední člen smazal účet → uvolnit
  perform hra._klan_fix(z.id) from hra.klany z where (z.name_lc = lower(n) or z.tag_lc = lower(tg)) and z.disbanded_at is null
    and not exists (select 1 from hra.klan_clenove c where c.klan_id = z.id);
  if exists (select 1 from hra.klany where name_lc = lower(n)) then raise exception 'klan_name_taken'; end if;
  if exists (select 1 from hra.klany where tag_lc = lower(tg)) then raise exception 'klan_tag_taken'; end if;
  if exists (select 1 from hra.klany where created_by = acc and created_at > now() - interval '12 hours') then raise exception 'klan_slow'; end if;
  insert into hra.klany(name, name_lc, tag, tag_lc, emblem, color, descr, open, created_by)
    values (n, lower(n), tg, lower(tg), p_emblem, p_color, d, coalesce(p_open, true), acc) returning id into kid;
  perform hra._klan_put(acc, kid, 'leader');
  perform hra._klan_sys(kid, acc, 'created', hra._klan_name(acc));
  return hra._klan_card(kid);
exception when unique_violation then raise exception 'klan_name_taken';
end $$;

create or replace function public.hra_klan_edit(p_token text, p_emblem text, p_color text, p_descr text, p_open boolean)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); me hra.klan_clenove; d text := regexp_replace(btrim(coalesce(p_descr, '')), '\s+', ' ', 'g');
begin
  select * into me from hra.klan_clenove where account_id = acc;
  if me.klan_id is null then raise exception 'klan_none'; end if;
  if me.role <> 'leader' then raise exception 'klan_rights'; end if;
  if char_length(d) > 120 then raise exception 'klan_descr_invalid'; end if;
  if hra._klan_bad(d) then raise exception 'klan_descr_bad'; end if;
  if not (p_emblem = any(hra._klan_emblems())) or not (p_color = any(hra._klan_colors())) then raise exception 'klan_emblem_invalid'; end if;
  update hra.klany set emblem = p_emblem, color = p_color, descr = d, open = coalesce(p_open, open) where id = me.klan_id;
  return hra._klan_card(me.klan_id);
end $$;

create or replace function public.hra_klan_search(p_token text, p_q text) returns jsonb language plpgsql security definer set search_path to '' as $$
declare q text := lower(btrim(coalesce(p_q, ''))); w date := hra._week();
begin
  q := replace(replace(replace(q, '\', ''), '%', ''), '_', '');
  return coalesce((select jsonb_agg(hra._klan_card(x.id) order by x.ord desc, x.sc desc, x.mem desc) from (
    select k.id, hra._klan_score(k.id, w) sc, m.mem,
      case when q <> '' and (k.tag_lc = q or k.name_lc = q) then 2 when k.open then 1 else 0 end ord
    from hra.klany k cross join lateral (select count(*) mem from hra.klan_clenove c where c.klan_id = k.id) m
    where k.disbanded_at is null and m.mem > 0 and ((q = '' and m.mem < 30)
       or (q <> '' and (k.name_lc like '%' || q || '%' or k.tag_lc like q || '%')))
    order by ord desc, sc desc, mem desc limit 30) x), '[]'::jsonb);
end $$;

create or replace function public.hra_klan_join(p_token text, p_klan bigint) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); k hra.klany; n int;
begin
  perform hra._klan_reg(acc);
  if exists (select 1 from hra.klan_clenove where account_id = acc and klan_id is not null) then raise exception 'klan_already'; end if;
  if exists (select 1 from hra.klan_odchody where account_id = acc and left_at > now() - interval '30 minutes') then raise exception 'klan_cooldown'; end if;
  select * into k from hra.klany where id = p_klan and disbanded_at is null for update;
  if k.id is null then raise exception 'klan_none'; end if;
  select count(*) into n from hra.klan_clenove where klan_id = k.id;
  if n = 0 then perform hra._klan_fix(k.id); return jsonb_build_object('gone', true); end if;   -- poslední člen smazal účet
  if n >= 30 then raise exception 'klan_full'; end if;
  if not k.open then
    if (select count(*) from hra.klan_zadosti where account_id = acc and active and klan_id <> k.id) >= 5 then raise exception 'klan_requests'; end if;
    insert into hra.klan_zadosti(klan_id, account_id) values (k.id, acc) on conflict (klan_id, account_id) do update set active = true, created_at = now();
    return jsonb_build_object('requested', true);
  end if;
  perform hra._klan_put(acc, k.id, 'member');
  perform hra._klan_sys(k.id, acc, 'join', hra._klan_name(acc));
  return jsonb_build_object('joined', true, 'klan', hra._klan_card(k.id));
end $$;

create or replace function public.hra_klan_cancel(p_token text, p_klan bigint) returns void language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token);
begin
  update hra.klan_zadosti set active = false where account_id = acc and klan_id = p_klan;
end $$;

create or replace function public.hra_klan_leave(p_token text) returns void language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); k bigint;
begin
  select klan_id into k from hra.klan_clenove where account_id = acc;
  if k is null then return; end if;
  perform hra._klan_sys(k, acc, 'leave', hra._klan_name(acc));
  update hra.klan_clenove set klan_id = null, role = 'member' where account_id = acc;
  perform hra._klan_fix(k);   -- nový vůdce / zánik prázdného klanu
  insert into hra.klan_odchody(account_id, left_at) values (acc, now()) on conflict (account_id) do update set left_at = now();
end $$;

create or replace function public.hra_klan_kick(p_token text, p_acc uuid) returns void language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); me hra.klan_clenove; tg hra.klan_clenove;
begin
  select * into me from hra.klan_clenove where account_id = acc;
  select * into tg from hra.klan_clenove where account_id = p_acc;
  if me.klan_id is null or tg.klan_id is null or tg.klan_id <> me.klan_id or p_acc = acc then raise exception 'klan_none'; end if;
  if not (me.role = 'leader' or (me.role = 'officer' and tg.role = 'member')) then raise exception 'klan_rights'; end if;
  update hra.klan_clenove set klan_id = null, role = 'member' where account_id = p_acc;
  perform hra._klan_sys(me.klan_id, p_acc, 'kick', hra._klan_name(p_acc));
end $$;

-- role: leader může jmenovat důstojníka / sesadit na člena / předat vedení
create or replace function public.hra_klan_role(p_token text, p_acc uuid, p_role text) returns void language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); me hra.klan_clenove; tg hra.klan_clenove;
begin
  select * into me from hra.klan_clenove where account_id = acc;
  select * into tg from hra.klan_clenove where account_id = p_acc;
  if me.klan_id is null or tg.klan_id is null or tg.klan_id <> me.klan_id or p_acc = acc then raise exception 'klan_none'; end if;
  if me.role <> 'leader' then raise exception 'klan_rights'; end if;
  if p_role = 'leader' then
    update hra.klan_clenove set role = 'officer' where account_id = acc;
    update hra.klan_clenove set role = 'leader' where account_id = p_acc;
    perform hra._klan_sys(me.klan_id, p_acc, 'leader', hra._klan_name(p_acc));
  elsif p_role = 'officer' then
    if (select count(*) from hra.klan_clenove where klan_id = me.klan_id and role = 'officer') >= 6 then raise exception 'klan_officers'; end if;
    update hra.klan_clenove set role = 'officer' where account_id = p_acc;
    perform hra._klan_sys(me.klan_id, p_acc, 'officer', hra._klan_name(p_acc));
  elsif p_role = 'member' then
    update hra.klan_clenove set role = 'member' where account_id = p_acc;
  else raise exception 'klan_rights';
  end if;
end $$;

create or replace function public.hra_klan_answer(p_token text, p_acc uuid, p_accept boolean) returns void language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); me hra.klan_clenove;
begin
  select * into me from hra.klan_clenove where account_id = acc;
  if me.klan_id is null then raise exception 'klan_none'; end if;
  if me.role not in ('leader', 'officer') then raise exception 'klan_rights'; end if;
  perform 1 from hra.klany where id = me.klan_id for update;
  if not exists (select 1 from hra.klan_zadosti where klan_id = me.klan_id and account_id = p_acc and active) then raise exception 'klan_none'; end if;
  if not p_accept then update hra.klan_zadosti set active = false where klan_id = me.klan_id and account_id = p_acc; return; end if;
  if exists (select 1 from hra.klan_clenove where account_id = p_acc and klan_id is not null) then
    update hra.klan_zadosti set active = false where account_id = p_acc; return;
  end if;
  if (select count(*) from hra.klan_clenove where klan_id = me.klan_id) >= 30 then raise exception 'klan_full'; end if;
  perform hra._klan_put(p_acc, me.klan_id, 'member');
  perform hra._klan_sys(me.klan_id, p_acc, 'join', hra._klan_name(p_acc));
end $$;

-- rychlý chat: jen kódy z pevného seznamu
create or replace function public.hra_klan_send(p_token text, p_code text) returns void language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); k bigint;
begin
  select klan_id into k from hra.klan_clenove where account_id = acc;
  if k is null then raise exception 'klan_none'; end if;
  if not (p_code = any(hra._klan_codes())) then raise exception 'klan_rights'; end if;
  if exists (select 1 from hra.klan_zpravy where account_id = acc and kind = 'q' and created_at > now() - interval '3 seconds')
     or (select count(*) from hra.klan_zpravy where account_id = acc and kind = 'q' and created_at > now() - interval '5 minutes') >= 15
  then raise exception 'klan_slow'; end if;
  insert into hra.klan_zpravy(klan_id, account_id, kind, code) values (k, acc, 'q', p_code);
end $$;

-- dar zlata do pokladny (zlato odečte klient až po úspěchu)
create or replace function public.hra_klan_donate(p_token text, p_amount int) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); me hra.klan_clenove; today date := hra._klan_today(); used int; t0 bigint; t1 bigint;
begin
  select * into me from hra.klan_clenove where account_id = acc for update;
  if me.klan_id is null then raise exception 'klan_none'; end if;
  if p_amount is null or p_amount < 100 or p_amount > 5000 then raise exception 'klan_amount'; end if;
  used := case when me.don_day = today then me.don_today else 0 end;
  if used + p_amount > 5000 then raise exception 'klan_cap'; end if;
  update hra.klan_clenove set don_day = today, don_today = used + p_amount, donated = donated + p_amount where account_id = acc;
  update hra.klany set treasury = treasury + p_amount where id = me.klan_id returning treasury - p_amount, treasury into t0, t1;
  perform hra._klan_sys(me.klan_id, acc, 'donate', p_amount::text);
  if hra._klan_lvl(t1) > hra._klan_lvl(t0) then perform hra._klan_sys(me.klan_id, null, 'level', hra._klan_lvl(t1)::text); end if;
  return jsonb_build_object('treasury', t1, 'level', hra._klan_lvl(t1), 'don_left', 5000 - used - p_amount);
end $$;

create or replace function public.hra_klan_board(p_token text) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid; w date := hra._week(); k bigint;
begin
  if p_token is not null and p_token <> '' then begin acc := hra._acc(p_token); exception when others then acc := null; end; end if;
  if acc is not null then select klan_id into k from hra.klan_clenove where account_id = acc; end if;
  return jsonb_build_object('week', w, 'ends', (w + 7)::timestamp at time zone 'Europe/Prague',
    'me', case when k is null then null else jsonb_build_object('id', k, 'rank', hra._klan_rank(k, w), 'score', hra._klan_score(k, w)) end,
    'top', coalesce((select jsonb_agg(hra._klan_card(s.klan_id) || jsonb_build_object('score', s.sc) order by s.sc desc, s.la)
       from (select klan_id, sum(wins)::int sc, max(last_at) la from hra.klan_prispevky p where p.week = w
               and exists (select 1 from hra.klany kk where kk.id = p.klan_id and kk.disbanded_at is null)
             group by klan_id having sum(wins) > 0 order by sc desc, la limit 50) s), '[]'::jsonb));
end $$;

create or replace function public.hra_klan_claim(p_token text) returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token);
begin
  perform pg_advisory_xact_lock(hashtext('klan_claim:' || acc::text));
  return hra._klan_odmeny(acc, true);
end $$;

-- osobní turnaj: beze změny chování + příspěvek do klanu
create or replace function public.hra_turnaj_win(p_token text) returns integer language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); w date := hra._week(); r hra.turnaj;
begin
  select * into r from hra.turnaj where account_id = acc and week = w;
  if not found then insert into hra.turnaj(account_id, week, wins, last_at) values (acc, w, 1, now()); perform hra._klan_win(acc, w); return 1; end if;
  -- ochrana: nejvýš 1 výhra za 25 s a 300 za týden
  if r.last_at > now() - interval '25 seconds' or r.wins >= 300 then return r.wins; end if;
  update hra.turnaj set wins = wins + 1, last_at = now() where account_id = acc and week = w;
  perform hra._klan_win(acc, w);
  return r.wins + 1;
end $$;

grant execute on function public.hra_klan_info(text), public.hra_klan_create(text, text, text, text, text, text, boolean),
  public.hra_klan_edit(text, text, text, text, boolean), public.hra_klan_search(text, text), public.hra_klan_join(text, bigint),
  public.hra_klan_cancel(text, bigint), public.hra_klan_leave(text), public.hra_klan_kick(text, uuid), public.hra_klan_role(text, uuid, text),
  public.hra_klan_answer(text, uuid, boolean), public.hra_klan_send(text, text), public.hra_klan_donate(text, int),
  public.hra_klan_board(text), public.hra_klan_claim(text) to anon, authenticated;
