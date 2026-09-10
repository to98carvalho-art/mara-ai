-- As aulas do 7WONDERS, geradas a partir de src/content/evento.js.
--
-- Nenhuma aula guarda lugares para convidados: a capacidade está
-- toda aberta a quem se inscrever primeiro. As colunas do bolso de
-- convite ficam a zero e existem só para o dia em que a organização
-- quiser voltar a reservar.
-- Correr no SQL Editor do Supabase. Pode correr-se vezes sem conta:
-- atualiza o que mudou e não apaga inscrições já feitas.

insert into public.aulas (id, nome, capacidade_convite, capacidade_bilhete, ocupado_convite, sem_limite) values
  ('warmup', 'Warm Up', 0, 0, 0, true),
  ('barre', 'Barre Class', 0, 10, 0, false),
  ('rob', 'Fitness Class', 0, 30, 0, false),
  ('crossfit', 'CrossFit Class', 0, 35, 0, false),
  ('run', 'Run Club', 0, 49, 0, false),
  ('ice', 'Ice Bath & Sauna', 0, 0, 0, false),
  ('reiki', 'Reiki · Tarot · Massagens', 0, 0, 0, false),
  ('yoga', 'Yoga', 0, 15, 0, false),
  ('cacau', 'Cocoa Ritual', 0, 15, 0, false)
on conflict (id) do update set
  nome               = excluded.nome,
  capacidade_convite = excluded.capacidade_convite,
  capacidade_bilhete = excluded.capacidade_bilhete,
  ocupado_convite    = excluded.ocupado_convite,
  sem_limite         = excluded.sem_limite,
  atualizado_em      = now();
