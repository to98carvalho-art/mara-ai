-- ═══════════════════════════════════════════════════════════════
--  PLATAFORMA DO EVENTO — base de dados
--  Correr este ficheiro uma vez no SQL Editor do Supabase.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. PERFIS ───────────────────────────────────────────────────
-- Uma linha por pessoa registada. Liga-se ao login do Supabase.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  role        text not null default 'participant'
              check (role in ('participant', 'staff', 'admin')),
  created_at  timestamptz not null default now()
);

-- Cria o perfil automaticamente quando alguém se regista.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atalho: "quem está a fazer o pedido é da organização?"
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- ── 2. ÁREAS DO EVENTO ──────────────────────────────────────────

create table if not exists public.areas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  color       text not null default '#6b7280',
  icon        text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ── 3. ATIVIDADES DO HORÁRIO ────────────────────────────────────
-- capacity = NULL  →  entrada livre, sem inscrição
-- capacity = 20    →  inscrição obrigatória, 20 vagas

create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  area_id     uuid not null references public.areas(id) on delete cascade,
  title       text not null,
  description text not null default '',
  host        text not null default '',
  location    text not null default '',
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  capacity    int,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint sessions_time_order check (ends_at > starts_at),
  constraint sessions_capacity_positive check (capacity is null or capacity > 0)
);

create index if not exists sessions_starts_at_idx on public.sessions (starts_at);
create index if not exists sessions_area_idx      on public.sessions (area_id);

-- ── 4. INSCRIÇÕES ───────────────────────────────────────────────

create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'confirmed'
              check (status in ('confirmed', 'waitlist')),
  created_at  timestamptz not null default now(),
  unique (session_id, user_id)
);

create index if not exists enrollments_session_idx on public.enrollments (session_id);
create index if not exists enrollments_user_idx    on public.enrollments (user_id);

-- ── 5. VAGAS (contagem pública, sem revelar quem se inscreveu) ───

create or replace view public.session_availability as
  select
    s.id as session_id,
    s.capacity,
    count(e.id) filter (where e.status = 'confirmed') as spots_taken,
    count(e.id) filter (where e.status = 'waitlist')  as waitlist_count,
    case when s.capacity is null then null
         else greatest(0, s.capacity - count(e.id) filter (where e.status = 'confirmed'))
    end as spots_left
  from public.sessions s
  left join public.enrollments e on e.session_id = s.id
  group by s.id, s.capacity;

grant select on public.session_availability to anon, authenticated;

-- ── 6. INSCREVER (com trava de concorrência) ────────────────────
-- Bloqueia a linha da atividade enquanto conta as vagas, para que
-- dois pedidos ao mesmo tempo nunca passem do limite.

create or replace function public.enroll_in_session(p_session_id uuid, p_force boolean default false)
returns public.enrollments
language plpgsql security definer set search_path = public as $$
declare
  v_session   public.sessions%rowtype;
  v_taken     int;
  v_status    text;
  v_row       public.enrollments%rowtype;
  v_conflicts int;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  select * into v_session from public.sessions where id = p_session_id for update;
  if not found then
    raise exception 'SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_session.capacity is null then
    raise exception 'NO_SIGNUP_NEEDED' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.enrollments
             where session_id = p_session_id and user_id = auth.uid()) then
    raise exception 'ALREADY_ENROLLED' using errcode = 'P0001';
  end if;

  if v_session.starts_at <= now() then
    raise exception 'ALREADY_STARTED' using errcode = 'P0001';
  end if;

  if not p_force then
    select count(*) into v_conflicts
    from public.enrollments e
    join public.sessions s on s.id = e.session_id
    where e.user_id = auth.uid()
      and e.status = 'confirmed'
      and s.id <> p_session_id
      and s.starts_at < v_session.ends_at
      and v_session.starts_at < s.ends_at;
    if v_conflicts > 0 then
      raise exception 'TIME_CONFLICT' using errcode = 'P0001';
    end if;
  end if;

  select count(*) into v_taken
  from public.enrollments
  where session_id = p_session_id and status = 'confirmed';

  v_status := case when v_taken >= v_session.capacity then 'waitlist' else 'confirmed' end;

  insert into public.enrollments (session_id, user_id, status)
  values (p_session_id, auth.uid(), v_status)
  returning * into v_row;

  return v_row;
end $$;

-- ── 7. CANCELAR (e subir o primeiro da lista de espera) ──────────

create or replace function public.cancel_enrollment(p_session_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_was_confirmed boolean;
  v_next_id uuid;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  delete from public.enrollments
  where session_id = p_session_id and user_id = auth.uid()
  returning (status = 'confirmed') into v_was_confirmed;

  if v_was_confirmed is null then
    raise exception 'NOT_ENROLLED' using errcode = 'P0001';
  end if;

  if v_was_confirmed then
    select id into v_next_id
    from public.enrollments
    where session_id = p_session_id and status = 'waitlist'
    order by created_at
    limit 1
    for update skip locked;

    if v_next_id is not null then
      update public.enrollments set status = 'confirmed' where id = v_next_id;
    end if;
  end if;
end $$;

-- ── 8. SEGURANÇA (Row Level Security) ───────────────────────────

alter table public.profiles    enable row level security;
alter table public.areas       enable row level security;
alter table public.sessions    enable row level security;
alter table public.enrollments enable row level security;

-- Perfis: cada um vê e edita o seu; a organização vê todos.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Horário: toda a gente pode ler; só a organização escreve.
drop policy if exists areas_read on public.areas;
create policy areas_read on public.areas
  for select using (true);

drop policy if exists areas_write on public.areas;
create policy areas_write on public.areas
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists sessions_read on public.sessions;
create policy sessions_read on public.sessions
  for select using (published or public.is_admin());

drop policy if exists sessions_write on public.sessions;
create policy sessions_write on public.sessions
  for all using (public.is_admin()) with check (public.is_admin());

-- Inscrições: cada um vê as suas; a organização vê todas.
-- Inserir/apagar passa pelas funções acima (garantem o limite de vagas).
drop policy if exists enrollments_select on public.enrollments;
create policy enrollments_select on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists enrollments_admin_write on public.enrollments;
create policy enrollments_admin_write on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());
