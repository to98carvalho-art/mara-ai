-- ════════════════════════════════════════════════════════════════
--  7WONDERS — actualização
--
--  Correr depois do schema.sql. Acrescenta as aulas sem limite de
--  lugares (o Warm Up) e põe as nove aulas na base de dados.
--  Pode correr-se as vezes que forem precisas.
-- ════════════════════════════════════════════════════════════════

-- 1. coluna nova
alter table public.aulas add column if not exists sem_limite boolean not null default false;

-- 2. a contagem de vagas passa a saber que há aulas sem limite
create or replace view public.disponibilidade as
  select
    a.id as aula_id,
    case when a.sem_limite then null
         else a.capacidade_convite + a.capacidade_bilhete end as lugares,
    a.ocupado_convite
      + count(i.id) filter (where i.bolso = 'convite')
      + count(i.id) filter (where i.bolso = 'bilhete') as ocupados,
    case when a.sem_limite then null else
      greatest(0, a.capacidade_convite - a.ocupado_convite
                  - count(i.id) filter (where i.bolso = 'convite'))
      + greatest(0, a.capacidade_bilhete
                  - count(i.id) filter (where i.bolso = 'bilhete'))
    end as livres
  from public.aulas a
  left join public.inscricoes i on i.aula_id = a.id
  group by a.id, a.capacidade_convite, a.capacidade_bilhete, a.ocupado_convite, a.sem_limite;

-- 3. inscrever() salta a contagem nessas aulas
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
    insert into public.inscricoes (aula_id, conta, telefone, bolso)
    values (p_aula, p_conta, p_telefone, 'bilhete')
    returning * into v_linha;
    return v_linha;
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

-- 4. as nove aulas
insert into public.aulas (id, nome, capacidade_convite, capacidade_bilhete, ocupado_convite, sem_limite) values
  ('warmup', 'Warm Up', 0, 0, 0, true),
  ('barre', 'Barre Class', 0, 10, 0, false),
  ('rob', 'Fitness Class', 15, 15, 15, false),
  ('crossfit', 'CrossFit Class', 24, 11, 24, false),
  ('run', 'Run Club', 0, 49, 0, false),
  ('ice', 'Ice Bath & Sauna', 0, 0, 0, false),
  ('reiki', 'Reiki · Tarot · Massagens', 0, 0, 0, false),
  ('yoga', 'Yoga', 0, 15, 0, false),
  ('cacau', 'Cacau''s Ritual', 0, 15, 0, false)
on conflict (id) do update set
  nome               = excluded.nome,
  capacidade_convite = excluded.capacidade_convite,
  capacidade_bilhete = excluded.capacidade_bilhete,
  ocupado_convite    = excluded.ocupado_convite,
  sem_limite         = excluded.sem_limite,
  atualizado_em      = now();
