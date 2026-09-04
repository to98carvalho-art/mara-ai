-- As aulas do 7WONDERS, geradas a partir de src/content/evento.js.
-- Correr no SQL Editor do Supabase. Pode correr-se vezes sem conta:
-- atualiza o que mudou e não apaga inscrições já feitas.

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
