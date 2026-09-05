-- ═══════════════════════════════════════════════════════════════
--  VALIDAÇÃO AUTOMÁTICA DO BILHETE
--
--  O bilhete anexado é lido na hora e a inscrição fica logo
--  decidida. A pessoa não espera por ninguém.
--
--    valido      → confirmado, o passe segue por email
--    recusado    → a vaga volta a ficar livre e dizemos porquê
--    por_validar → ficou a dúvida; alguém da equipa vê em /#equipa
--
--  Uma pessoa é validada uma vez. As aulas seguintes herdam a
--  decisão do bilhete que já entregou.
--
--  Correr no SQL Editor do Supabase, depois do comprovativos.sql.
-- ═══════════════════════════════════════════════════════════════

alter table public.inscricoes
  add column if not exists email      text,
  add column if not exists referencia text,   -- número do bilhete, quando se lê
  add column if not exists automatico boolean not null default false,
  add column if not exists avisado_em timestamptz;

create index if not exists inscricoes_referencia_idx on public.inscricoes (referencia);
create index if not exists inscricoes_conta_idx on public.inscricoes (conta);

-- ── inscrever ───────────────────────────────────────────────────
--  Muda a assinatura, por isso as versões antigas saem primeiro:
--  duas versões com o mesmo nome deixariam a chamada ambígua.

drop function if exists public.inscrever(text, text, text);
drop function if exists public.inscrever(text, text, text, text, text, text);

create or replace function public.inscrever(
  p_aula text, p_conta text, p_telefone text,
  p_nome text default null, p_comprovativo text default null, p_impressao text default null,
  p_email text default null, p_estado text default 'por_validar'
) returns public.inscricoes
language plpgsql security definer set search_path = public as $$
declare
  v_aula            public.aulas%rowtype;
  v_usados_convite  int;
  v_usados_bilhete  int;
  v_bolso           text;
  v_linha           public.inscricoes%rowtype;
begin
  if p_estado not in ('por_validar', 'valido', 'recusado') then
    raise exception 'ESTADO_INVALIDO' using errcode = 'P0001';
  end if;

  select * into v_aula from public.aulas where id = p_aula for update;
  if not found then
    raise exception 'AULA_DESCONHECIDA' using errcode = 'P0001';
  end if;

  if not v_aula.sem_limite
     and v_aula.capacidade_convite + v_aula.capacidade_bilhete = 0 then
    raise exception 'SEM_INSCRICAO' using errcode = 'P0001';
  end if;

  -- Uma tentativa recusada não fecha a porta: quem anexa outro
  -- bilhete começa de novo, e a linha antiga sai da frente.
  delete from public.inscricoes
   where aula_id = p_aula and conta = p_conta and estado = 'recusado';

  if exists (select 1 from public.inscricoes
             where aula_id = p_aula and conta = p_conta) then
    raise exception 'JA_INSCRITO' using errcode = 'P0001';
  end if;

  -- Aula sem limite: entra sempre, sem contar lugares.
  if v_aula.sem_limite then
    insert into public.inscricoes
      (aula_id, conta, telefone, bolso, nome, comprovativo, impressao, email, estado)
    values
      (p_aula, p_conta, p_telefone, 'bilhete', p_nome, p_comprovativo, p_impressao, p_email, p_estado)
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

  insert into public.inscricoes
    (aula_id, conta, telefone, bolso, nome, comprovativo, impressao, email, estado)
  values
    (p_aula, p_conta, p_telefone, v_bolso, p_nome, p_comprovativo, p_impressao, p_email, p_estado)
  returning * into v_linha;

  return v_linha;
end $$;

-- ── decidir sobre o bilhete de uma pessoa ───────────────────────
--  O bilhete é da pessoa, não de uma aula. Validar ou recusar
--  arrasta todas as inscrições da mesma conta — senão alguém com
--  quatro aulas teria de ser julgado quatro vezes.

create or replace function public.validar_conta(
  p_conta text, p_estado text,
  p_nota text default null, p_referencia text default null,
  p_automatico boolean default false
) returns int
language plpgsql security definer set search_path = public as $$
declare v_quantas int;
begin
  if p_estado not in ('valido', 'recusado', 'por_validar') then
    raise exception 'ESTADO_INVALIDO' using errcode = 'P0001';
  end if;

  update public.inscricoes
     set estado      = p_estado,
         nota        = coalesce(p_nota, nota),
         referencia  = coalesce(p_referencia, referencia),
         automatico  = p_automatico,
         validado_em = case when p_estado = 'por_validar' then null else now() end
   where conta = p_conta;

  get diagnostics v_quantas = row_count;
  return v_quantas;
end $$;

-- A decisão tomada numa linha vale para a pessoa toda.
create or replace function public.decidir_inscricao(
  p_id uuid, p_estado text, p_nota text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare v_conta text;
begin
  select conta into v_conta from public.inscricoes where id = p_id;
  if v_conta is null then
    raise exception 'INSCRICAO_DESCONHECIDA' using errcode = 'P0001';
  end if;
  perform public.validar_conta(v_conta, p_estado, p_nota, null, false);
end $$;

-- ── marcar que o passe já seguiu por email ──────────────────────

create or replace function public.marcar_avisado(p_conta text)
returns void
language sql security definer set search_path = public as $$
  update public.inscricoes set avisado_em = now() where conta = p_conta;
$$;
