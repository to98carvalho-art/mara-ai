-- ═══════════════════════════════════════════════════════════════
--  7WONDERS — vagas e inscrições
--  Correr uma vez no SQL Editor do Supabase.
--
--  Porquê base de dados: as vagas são poucas e disputadas. Se cada
--  telemóvel guardar a sua contagem, duas pessoas ficam ambas com a
--  última vaga do CrossFit e uma delas leva com a porta na cara.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. AULAS ────────────────────────────────────────────────────
-- Dois bolsos de lugares por aula:
--   convite — reservados para convidados, já contados de início
--   bilhete — abertos a quem tem bilhete
-- Quem usa a app nunca vê a divisão, só o total que sobra.

create table if not exists public.aulas (
  id                  text primary key,          -- 'barre', 'crossfit', …
  nome                text not null,
  capacidade_convite  int  not null default 0,
  capacidade_bilhete  int  not null default 0,
  ocupado_convite     int  not null default 0,   -- lista de convidados já entregue
  atualizado_em       timestamptz not null default now(),
  constraint capacidades_nao_negativas
    check (capacidade_convite >= 0 and capacidade_bilhete >= 0 and ocupado_convite >= 0),
  constraint convite_ocupado_cabe
    check (ocupado_convite <= capacidade_convite)
);

-- ── 2. INSCRIÇÕES ───────────────────────────────────────────────
-- A pessoa é identificada pela conta 3cket, que só existe depois de
-- o servidor confirmar que aquele número tem bilhete.

create table if not exists public.inscricoes (
  id          uuid primary key default gen_random_uuid(),
  aula_id     text not null references public.aulas(id) on delete cascade,
  conta       text not null,                     -- account id da 3cket
  telefone    text not null,
  bolso       text not null check (bolso in ('convite', 'bilhete')),
  criado_em   timestamptz not null default now(),
  unique (aula_id, conta)                        -- ninguém se inscreve duas vezes
);

create index if not exists inscricoes_aula_idx  on public.inscricoes (aula_id);
create index if not exists inscricoes_conta_idx on public.inscricoes (conta);

-- ── 3. VAGAS (contagem, sem revelar quem) ───────────────────────

create or replace view public.disponibilidade as
  select
    a.id as aula_id,
    a.capacidade_convite + a.capacidade_bilhete as lugares,
    a.ocupado_convite
      + count(i.id) filter (where i.bolso = 'convite')
      + count(i.id) filter (where i.bolso = 'bilhete') as ocupados,
    greatest(0, a.capacidade_convite - a.ocupado_convite
                - count(i.id) filter (where i.bolso = 'convite'))
    + greatest(0, a.capacidade_bilhete
                - count(i.id) filter (where i.bolso = 'bilhete')) as livres
  from public.aulas a
  left join public.inscricoes i on i.aula_id = a.id
  group by a.id, a.capacidade_convite, a.capacidade_bilhete, a.ocupado_convite;

-- ── 4. INSCREVER (com trava de concorrência) ────────────────────
-- O `for update` tranca a linha da aula enquanto conta as vagas.
-- Dois pedidos ao mesmo instante fazem fila, e o segundo já vê o
-- lugar que o primeiro ocupou. É isto que impede a vaga dupla.

create or replace function public.inscrever(
  p_aula text, p_conta text, p_telefone text
) returns public.inscricoes
language plpgsql security definer set search_path = public as $$
declare
  v_aula            public.aulas%rowtype;
  v_usados_convite  int;
  v_usados_bilhete  int;
  v_bolso           text;
  v_linha           public.inscricoes%rowtype;
begin
  select * into v_aula from public.aulas where id = p_aula for update;
  if not found then
    raise exception 'AULA_DESCONHECIDA' using errcode = 'P0001';
  end if;

  if v_aula.capacidade_convite + v_aula.capacidade_bilhete = 0 then
    raise exception 'SEM_INSCRICAO' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.inscricoes
             where aula_id = p_aula and conta = p_conta) then
    raise exception 'JA_INSCRITO' using errcode = 'P0001';
  end if;

  select
    count(*) filter (where bolso = 'convite'),
    count(*) filter (where bolso = 'bilhete')
  into v_usados_convite, v_usados_bilhete
  from public.inscricoes where aula_id = p_aula;

  -- Primeiro bolso com espaço. Nas aulas com convidados o bolso de
  -- convite já vem cheio, por isso quem se inscreve pela app cai
  -- sempre no de bilhete.
  v_bolso := case
    when v_aula.capacidade_convite - v_aula.ocupado_convite - v_usados_convite > 0 then 'convite'
    when v_aula.capacidade_bilhete - v_usados_bilhete > 0 then 'bilhete'
    else null
  end;

  if v_bolso is null then
    raise exception 'SEM_VAGAS' using errcode = 'P0001';
  end if;

  insert into public.inscricoes (aula_id, conta, telefone, bolso)
  values (p_aula, p_conta, p_telefone, v_bolso)
  returning * into v_linha;

  return v_linha;
end $$;

-- ── 5. ANULAR ───────────────────────────────────────────────────

create or replace function public.anular(p_aula text, p_conta text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_apagadas int;
begin
  delete from public.inscricoes where aula_id = p_aula and conta = p_conta;
  get diagnostics v_apagadas = row_count;
  if v_apagadas = 0 then
    raise exception 'NAO_INSCRITO' using errcode = 'P0001';
  end if;
end $$;

-- ── 6. SEGURANÇA ────────────────────────────────────────────────
-- Ninguém fala com estas tabelas a partir do browser. Todos os
-- pedidos passam pelas funções de servidor, que usam a chave de
-- serviço. Com RLS ligado e sem políticas, a chave pública não lê
-- nem escreve nada — que é exactamente o que queremos.

alter table public.aulas      enable row level security;
alter table public.inscricoes enable row level security;

-- Os papéis anon/authenticated só existem no Supabase; noutro
-- Postgres (por exemplo, para testar) esta parte é ignorada.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.disponibilidade from anon, authenticated';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════
--  AFTER PARTY — candidaturas
--
--  O after é por convite e nunca mostra morada nem line-up. Estas
--  são as pessoas que se propõem; a organização escolhe e liga.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.candidaturas_after (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  apelido     text not null,
  telefone    text not null unique,     -- um pedido por pessoa
  email       text not null,
  razoes      text not null,
  estado      text not null default 'nova'
              check (estado in ('nova', 'aceite', 'recusada')),
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists candidaturas_estado_idx
  on public.candidaturas_after (estado, criado_em desc);

alter table public.candidaturas_after enable row level security;

-- Quem se engana no número volta a submeter e corrige o que escreveu,
-- em vez de ficar preso a um pedido errado.
create or replace function public.candidatar_after(
  p_nome text, p_apelido text, p_telefone text, p_email text, p_razoes text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.candidaturas_after (nome, apelido, telefone, email, razoes)
  values (p_nome, p_apelido, p_telefone, p_email, p_razoes)
  on conflict (telefone) do update
    set nome = excluded.nome,
        apelido = excluded.apelido,
        email = excluded.email,
        razoes = excluded.razoes,
        atualizado_em = now();
end $$;
