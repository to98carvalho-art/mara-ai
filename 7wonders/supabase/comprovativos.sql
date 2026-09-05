-- ═══════════════════════════════════════════════════════════════
--  COMPROVATIVOS DE BILHETE
--
--  Sem a API da 3cket, quem se inscreve anexa uma foto do bilhete.
--  A vaga fica reservada logo — senão a pessoa não sabe se tem lugar
--  — e a organização valida depois. Recusar liberta a vaga.
--
--  Correr no SQL Editor do Supabase, depois do schema.sql.
-- ═══════════════════════════════════════════════════════════════

alter table public.inscricoes
  add column if not exists nome         text,
  add column if not exists comprovativo text,          -- caminho da foto
  add column if not exists impressao    text,          -- para apanhar fotos repetidas
  add column if not exists estado       text not null default 'por_validar'
    check (estado in ('por_validar', 'valido', 'recusado')),
  add column if not exists validado_em  timestamptz,
  add column if not exists nota         text;

create index if not exists inscricoes_estado_idx on public.inscricoes (estado, criado_em desc);
create index if not exists inscricoes_impressao_idx on public.inscricoes (impressao);

-- ── inscrever, agora com comprovativo ───────────────────────────
-- Mesma trava de vagas de sempre: a linha da aula fica trancada
-- enquanto se contam os lugares.

create or replace function public.inscrever(
  p_aula text, p_conta text, p_telefone text,
  p_nome text default null, p_comprovativo text default null, p_impressao text default null
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

  if not v_aula.sem_limite
     and v_aula.capacidade_convite + v_aula.capacidade_bilhete = 0 then
    raise exception 'SEM_INSCRICAO' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.inscricoes
             where aula_id = p_aula and conta = p_conta) then
    raise exception 'JA_INSCRITO' using errcode = 'P0001';
  end if;

  -- Aula sem limite: entra sempre, sem contar lugares.
  if v_aula.sem_limite then
    insert into public.inscricoes (aula_id, conta, telefone, bolso, nome, comprovativo, impressao)
    values (p_aula, p_conta, p_telefone, 'bilhete', p_nome, p_comprovativo, p_impressao)
    returning * into v_linha;
    return v_linha;
  end if;

  -- Uma inscrição recusada já não ocupa lugar.
  select
    count(*) filter (where bolso = 'convite' and estado <> 'recusado'),
    count(*) filter (where bolso = 'bilhete' and estado <> 'recusado')
  into v_usados_convite, v_usados_bilhete
  from public.inscricoes where aula_id = p_aula;

  v_bolso := case
    when v_aula.capacidade_convite - v_aula.ocupado_convite - v_usados_convite > 0 then 'convite'
    when v_aula.capacidade_bilhete - v_usados_bilhete > 0 then 'bilhete'
    else null
  end;

  if v_bolso is null then
    raise exception 'SEM_VAGAS' using errcode = 'P0001';
  end if;

  insert into public.inscricoes (aula_id, conta, telefone, bolso, nome, comprovativo, impressao)
  values (p_aula, p_conta, p_telefone, v_bolso, p_nome, p_comprovativo, p_impressao)
  returning * into v_linha;

  return v_linha;
end $$;

-- ── as vagas deixam de contar as recusadas ──────────────────────

create or replace view public.disponibilidade as
  select
    a.id as aula_id,
    case when a.sem_limite then null
         else a.capacidade_convite + a.capacidade_bilhete end as lugares,
    a.ocupado_convite
      + count(i.id) filter (where i.estado <> 'recusado') as ocupados,
    case when a.sem_limite then null else
      greatest(0, a.capacidade_convite - a.ocupado_convite
                  - count(i.id) filter (where i.bolso = 'convite' and i.estado <> 'recusado'))
      + greatest(0, a.capacidade_bilhete
                  - count(i.id) filter (where i.bolso = 'bilhete' and i.estado <> 'recusado'))
    end as livres
  from public.aulas a
  left join public.inscricoes i on i.aula_id = a.id
  group by a.id, a.capacidade_convite, a.capacidade_bilhete, a.ocupado_convite, a.sem_limite;

-- ── decidir sobre uma inscrição ─────────────────────────────────

create or replace function public.decidir_inscricao(
  p_id uuid, p_estado text, p_nota text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_estado not in ('valido', 'recusado', 'por_validar') then
    raise exception 'ESTADO_INVALIDO' using errcode = 'P0001';
  end if;
  update public.inscricoes
     set estado = p_estado,
         nota = coalesce(p_nota, nota),
         validado_em = case when p_estado = 'por_validar' then null else now() end
   where id = p_id;
  if not found then
    raise exception 'INSCRICAO_DESCONHECIDA' using errcode = 'P0001';
  end if;
end $$;
