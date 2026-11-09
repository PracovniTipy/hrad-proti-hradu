-- =========================================================================
-- „Pozvi kamaráda“ – jedna úroveň, odměny jen herní věci (nikdy peníze).
-- Pravda je na serveru: kód hráče, přijetí pozvánky, počítání bitev pozvaného
-- a výdej odměn. Klient jen zobrazuje a odměny připíše (stejně jako hra_redeem).
--   * pozvaný: dárek na začátek jednou (jen nový účet ≤ 3 dny, jen jednou na zařízení)
--   * zvoucí: odměna až když pozvaný odehraje 3 bitvy (bitvy nejdřív po 30 s),
--     nejvýš 10 odměněných pozvánek na hráče
--   * žádné pozvání sebe sama: stejný účet ani stejné zařízení jako zvoucí
--   * nejvýš 5 přijatých pozvánek z jedné IP adresy za 24 h (uložen jen hash)
-- Vlastní tabulky hra.pozvi*, nezávislé na hra.pozvanky / hra_ref_* (migrace sireni_pozvanky_turnaj).
-- =========================================================================

create table if not exists hra.pozvi_kody (
  account_id uuid primary key references hra.accounts(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists hra.pozvi_zarizeni (
  account_id uuid not null references hra.accounts(id) on delete cascade,
  device text not null,
  seen_at timestamptz not null default now(),
  primary key (account_id, device)
);
create index if not exists pozvi_zarizeni_device on hra.pozvi_zarizeni(device);

create table if not exists hra.pozvi (
  id bigint generated always as identity primary key,
  inviter uuid not null references hra.accounts(id) on delete cascade,
  invitee uuid unique references hra.accounts(id) on delete set null,
  device text not null unique,
  ip_hash text,
  battles int not null default 0,
  last_battle timestamptz,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists pozvi_inviter on hra.pozvi(inviter);
create index if not exists pozvi_ip on hra.pozvi(ip_hash, created_at);

alter table hra.pozvi_kody enable row level security;
alter table hra.pozvi_zarizeni enable row level security;
alter table hra.pozvi enable row level security;

-- odměny (drobné, ať nerozbijí ekonomiku: denní odměna je 300 zlata + 25 drahokamů)
create or replace function hra._pozv_gift() returns jsonb language sql immutable set search_path to '' as
$$ select '{"gold":1000,"gems":50}'::jsonb $$;
create or replace function hra._pozv_reward() returns jsonb language sql immutable set search_path to '' as
$$ select '{"gold":1500,"gems":60}'::jsonb $$;

create or replace function hra._pozv_dev(p text) returns text language sql immutable set search_path to '' as
$$ select case when p ~ '^[a-z0-9]{16,40}$' then p else null end $$;

create or replace function hra._pozv_ip() returns text language plpgsql stable set search_path to '' as $$
declare h text;
begin
  h := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  if h = '' then return null; end if;
  return encode(extensions.digest('cw-pozvanka:' || trim(h), 'sha256'), 'hex');
exception when others then return null;
end $$;

-- můj kód + stav pozvánek (kód se vytvoří při prvním dotazu)
create or replace function public.hra_pozvanka_info(p_token text, p_device text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); dev text := hra._pozv_dev(p_device); c text; i int;
  abc text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; me hra.pozvi%rowtype;
begin
  if dev is not null then
    insert into hra.pozvi_zarizeni(account_id, device) values (acc, dev)
    on conflict (account_id, device) do update set seen_at = now();
  end if;
  select code into c from hra.pozvi_kody where account_id = acc;
  if c is null then
    for n in 1..20 loop
      c := '';
      for i in 1..6 loop c := c || substr(abc, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % 32), 1); end loop;
      begin
        insert into hra.pozvi_kody(account_id, code) values (acc, c);
        exit;
      exception when unique_violation then c := null;
      end;
    end loop;
    if c is null then raise exception 'invite_busy'; end if;
  end if;
  select * into me from hra.pozvi where invitee = acc;
  return jsonb_build_object(
    'code', c,
    'limit', 10,
    'need', 3,
    'joined', (select count(*) from hra.pozvi where inviter = acc),
    'rewarded', (select count(*) from hra.pozvi where inviter = acc and rewarded_at is not null),
    'ready', least(
      (select count(*) from hra.pozvi where inviter = acc and qualified_at is not null and rewarded_at is null),
      greatest(0, 10 - (select count(*) from hra.pozvi where inviter = acc and rewarded_at is not null))),
    'reward', hra._pozv_reward(),
    'gift', hra._pozv_gift(),
    'invited', me.id is not null,
    'battles', coalesce(me.battles, 0));
end $$;

-- pozvaný přijme pozvánku (jen nový účet, jen jednou na zařízení) → dárek
create or replace function public.hra_pozvanka_prijmout(p_token text, p_code text, p_device text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); dev text := hra._pozv_dev(p_device);
  c text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  inv uuid; ip text := hra._pozv_ip();
begin
  if dev is null then raise exception 'invite_invalid'; end if;
  select account_id into inv from hra.pozvi_kody where code = c;
  if inv is null then raise exception 'invite_invalid'; end if;
  if inv = acc or exists (select 1 from hra.pozvi_zarizeni where account_id = inv and device = dev) then raise exception 'invite_self'; end if;
  if exists (select 1 from hra.pozvi where invitee = acc or device = dev) then raise exception 'invite_done'; end if;
  if (select created_at from hra.accounts where id = acc) < now() - interval '3 days' then raise exception 'invite_old'; end if;
  if ip is not null and (select count(*) from hra.pozvi where ip_hash = ip and created_at > now() - interval '24 hours') >= 5 then raise exception 'invite_busy'; end if;
  insert into hra.pozvi_zarizeni(account_id, device) values (acc, dev) on conflict (account_id, device) do update set seen_at = now();
  insert into hra.pozvi(inviter, invitee, device, ip_hash) values (inv, acc, dev, ip);
  return jsonb_build_object('gift', hra._pozv_gift(), 'need', 3);
end $$;

-- pozvaný dohrál bitvu (počítá se nejdřív po 30 s od minulé, do 3)
create or replace function public.hra_pozvanka_bitva(p_token text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); r hra.pozvi%rowtype;
begin
  select * into r from hra.pozvi where invitee = acc for update;
  if not found then return jsonb_build_object('invited', false); end if;
  if r.qualified_at is null and (r.last_battle is null or r.last_battle < now() - interval '30 seconds') then
    update hra.pozvi set battles = battles + 1, last_battle = now(),
      qualified_at = case when battles + 1 >= 3 then now() else null end
    where id = r.id returning * into r;
  end if;
  return jsonb_build_object('invited', true, 'battles', r.battles, 'done', r.qualified_at is not null);
end $$;

-- zvoucí si vyzvedne odměny za kamarády, kteří opravdu hrají (max 10 celkem)
create or replace function public.hra_pozvanka_odmeny(p_token text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare acc uuid := hra._acc(p_token); done int; n int; rw jsonb := hra._pozv_reward();
begin
  perform 1 from hra.pozvi_kody where account_id = acc for update;
  select count(*) into done from hra.pozvi where inviter = acc and rewarded_at is not null;
  with x as (
    select id from hra.pozvi where inviter = acc and qualified_at is not null and rewarded_at is null
    order by qualified_at limit greatest(0, 10 - done) for update
  ) update hra.pozvi p set rewarded_at = now() from x where p.id = x.id;
  get diagnostics n = row_count;
  if n = 0 then return jsonb_build_object('n', 0); end if;
  return jsonb_build_object('n', n, 'reward', jsonb_build_object(
    'gold', (rw->>'gold')::int * n, 'gems', (rw->>'gems')::int * n));
end $$;

revoke all on function public.hra_pozvanka_info(text, text) from public;
revoke all on function public.hra_pozvanka_prijmout(text, text, text) from public;
revoke all on function public.hra_pozvanka_bitva(text) from public;
revoke all on function public.hra_pozvanka_odmeny(text) from public;
grant execute on function public.hra_pozvanka_info(text, text) to anon, authenticated, service_role;
grant execute on function public.hra_pozvanka_prijmout(text, text, text) to anon, authenticated, service_role;
grant execute on function public.hra_pozvanka_bitva(text) to anon, authenticated, service_role;
grant execute on function public.hra_pozvanka_odmeny(text) to anon, authenticated, service_role;

-- itch: cena produktu v USD pro záznam provize BrosWars Partner (edge funkce itch)
create or replace function public.hra_itch_produkty() returns jsonb language sql security definer set search_path to '' as
$$ select coalesce(jsonb_agg(jsonb_build_object('product', product, 'game_id', game_id, 'slug', slug, 'usd', usd)), '[]'::jsonb) from hra.itch_produkty $$;
revoke all on function public.hra_itch_produkty() from public, anon, authenticated;
grant execute on function public.hra_itch_produkty() to service_role;
