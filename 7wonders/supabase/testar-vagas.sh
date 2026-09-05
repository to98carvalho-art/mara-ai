#!/bin/bash
# ════════════════════════════════════════════════════════════════
#  Testa a trava de vagas contra um Postgres a sério.
#
#  A pergunta a que responde: se 25 pessoas carregarem no botão no
#  mesmo instante e só houver uma vaga, quantas ficam com ela?
#
#  Como correr (precisa de postgresql-16 instalado):
#
#    export PGDATA=/var/tmp/pg7w
#    initdb -D $PGDATA -A trust -U postgres
#    pg_ctl -D $PGDATA -o "-p 55432" start
#    createdb -h 127.0.0.1 -p 55432 -U postgres sete
#    psql -h 127.0.0.1 -p 55432 -U postgres -d sete -f supabase/schema.sql
#    ./supabase/testar-vagas.sh
# ════════════════════════════════════════════════════════════════
# Testa a trava de vagas contra um Postgres a sério.
PORT=55432
Q() { psql -h 127.0.0.1 -p $PORT -U postgres -d sete -tAq -c "$1" 2>&1; }
falhas=0
ok()   { echo "  ✓ $1"; }
mal()  { echo "  ✗ $1"; falhas=$((falhas+1)); }
eq()   { [ "$2" = "$3" ] && ok "$1" || mal "$1 (esperado '$3', veio '$2')"; }

echo
echo "Preparação"
Q "truncate public.inscricoes; delete from public.aulas;" >/dev/null
Q "insert into public.aulas (id,nome,capacidade_convite,capacidade_bilhete,ocupado_convite) values
   ('uma','Só uma vaga',0,1,0),
   ('crossfit','CrossFit Class',24,11,24),
   ('livre','Ice Bath',0,0,0);" >/dev/null
ok "três aulas semeadas"

echo
echo "Contagem inicial"
eq "aula com 1 lugar tem 1 livre"        "$(Q "select livres from disponibilidade where aula_id='uma'")" "1"
eq "crossfit: 35 lugares, 24 já dados"   "$(Q "select lugares||'/'||ocupados||'/'||livres from disponibilidade where aula_id='crossfit'")" "35/24/11"
eq "aula sem inscrição tem 0 lugares"    "$(Q "select lugares from disponibilidade where aula_id='livre'")" "0"

echo
echo "A prova real: 25 pessoas a carregar no botão ao mesmo tempo"
for n in $(seq 1 25); do
  ( psql -h 127.0.0.1 -p $PORT -U postgres -d sete -tAq \
      -c "select inscrever('uma','conta$n','+35191000$n');" >/dev/null 2>&1 \
      && echo "sim" || echo "nao" ) > /tmp/r$n.txt &
done
wait
ganhos=$(cat /tmp/r*.txt | grep -c "^sim$"); rm -f /tmp/r*.txt
eq "só uma pessoa conseguiu a vaga"      "$ganhos" "1"
eq "só existe uma inscrição na tabela"   "$(Q "select count(*) from inscricoes where aula_id='uma'")" "1"
eq "e a aula ficou a zero livres"        "$(Q "select livres from disponibilidade where aula_id='uma'")" "0"

echo
echo "Bolsos: convite esgotado empurra para bilhete"
Q "select inscrever('crossfit','pessoaA','+351910000001');" >/dev/null
eq "entra no bolso 'bilhete'"            "$(Q "select bolso from inscricoes where aula_id='crossfit' and conta='pessoaA'")" "bilhete"
eq "livres passam de 11 para 10"         "$(Q "select livres from disponibilidade where aula_id='crossfit'")" "10"

echo
echo "Bolso de convite com espaço é usado primeiro"
Q "insert into public.aulas (id,nome,capacidade_convite,capacidade_bilhete,ocupado_convite) values ('mista','Mista',2,5,1);" >/dev/null
Q "select inscrever('mista','pessoaB','+351910000002');" >/dev/null
eq "vai para 'convite' enquanto houver"  "$(Q "select bolso from inscricoes where aula_id='mista' and conta='pessoaB'")" "convite"
Q "select inscrever('mista','pessoaC','+351910000003');" >/dev/null
eq "esgotado o convite, passa a bilhete" "$(Q "select bolso from inscricoes where aula_id='mista' and conta='pessoaC'")" "bilhete"

echo
echo "Recusas"
r=$(Q "select inscrever('uma','conta999','+351910009999');")
case "$r" in *SEM_VAGAS*) ok "sem vagas é recusado";; *) mal "sem vagas (veio: $r)";; esac
r=$(Q "select inscrever('crossfit','pessoaA','+351910000001');")
case "$r" in *JA_INSCRITO*) ok "inscrição repetida é recusada";; *) mal "repetida (veio: $r)";; esac
r=$(Q "select inscrever('livre','pessoaZ','+351910000009');")
case "$r" in *SEM_INSCRICAO*) ok "aula sem inscrição é recusada";; *) mal "sem inscrição (veio: $r)";; esac
r=$(Q "select inscrever('nao-existe','pessoaZ','+351910000009');")
case "$r" in *AULA_DESCONHECIDA*) ok "aula inexistente é recusada";; *) mal "inexistente (veio: $r)";; esac
r=$(Q "select anular('crossfit','ninguem');")
case "$r" in *NAO_INSCRITO*) ok "anular sem estar inscrito é recusado";; *) mal "anular (veio: $r)";; esac

echo
echo "Anular devolve a vaga"
Q "select anular('crossfit','pessoaA');" >/dev/null
eq "livres voltam a 11"                  "$(Q "select livres from disponibilidade where aula_id='crossfit'")" "11"
Q "select inscrever('crossfit','pessoaA','+351910000001');" >/dev/null
eq "e pode inscrever-se outra vez"       "$(Q "select count(*) from inscricoes where aula_id='crossfit'")" "1"

echo
echo "Um telemóvel não fica com duas vagas da mesma aula"
for n in 1 2 3 4 5; do
  ( psql -h 127.0.0.1 -p $PORT -U postgres -d sete -tAq \
      -c "select inscrever('mista','pessoaD','+351910000004');" >/dev/null 2>&1 ) &
done
wait
eq "a mesma conta só entra uma vez"      "$(Q "select count(*) from inscricoes where aula_id='mista' and conta='pessoaD'")" "1"


# ── aulas sem limite de lugares ─────────────────────────────────
echo
echo "Aula sem limite (Warm Up)"
Q "insert into public.aulas (id,nome,sem_limite) values ('warmup','Warm Up',true)
   on conflict (id) do update set sem_limite = true;" >/dev/null
eq "não anuncia número de lugares"        "$(Q "select coalesce(lugares::text,'nulo') from disponibilidade where aula_id='warmup'")" "nulo"
for n in $(seq 1 30); do
  ( psql -h 127.0.0.1 -p $PORT -U postgres -d sete -tAq \
      -c "select inscrever('warmup','livre$n','+35192000$n');" >/dev/null 2>&1 ) &
done
wait
eq "30 pessoas ao mesmo tempo entram todas" "$(Q "select count(*) from inscricoes where aula_id='warmup'")" "30"
eq "e continua sem esgotar"                 "$(Q "select coalesce(livres::text,'nulo') from disponibilidade where aula_id='warmup'")" "nulo"
r=$(Q "select inscrever('warmup','livre1','+351920001');")
case "$r" in *JA_INSCRITO*) ok "mas ninguém entra duas vezes";; *) mal "repetida em aula sem limite (veio: $r)";; esac

# ── candidaturas ao after party ─────────────────────────────────
echo
echo "After Party"
Q "delete from candidaturas_after;" >/dev/null
Q "select candidatar_after('Marta','Ribeiro','+351912345678','marta@exemplo.pt','1. … 2. … 3. …');" >/dev/null
eq "guarda a candidatura"                "$(Q "select count(*) from candidaturas_after")" "1"
eq "entra com estado 'nova'"             "$(Q "select estado from candidaturas_after where telefone='+351912345678'")" "nova"
Q "select candidatar_after('Marta','Ribeiro Nova','+351912345678','marta2@exemplo.pt','razões corrigidas');" >/dev/null
eq "voltar a submeter corrige, não duplica" "$(Q "select count(*) from candidaturas_after")" "1"
eq "e fica com os dados novos"           "$(Q "select apelido from candidaturas_after where telefone='+351912345678'")" "Ribeiro Nova"
r=$(Q "update candidaturas_after set estado='talvez' where telefone='+351912345678';")
case "$r" in *violates*|*ERROR*) ok "estado inventado é recusado";; *) mal "estado inventado (veio: $r)";; esac

echo
echo "Validação do bilhete"
Q "truncate public.inscricoes;" >/dev/null

# Quem se inscreve fica por validar até o bilhete ser lido.
Q "select inscrever('crossfit','+351911000001','+351911000001','Ana','fotos/a.jpg','impressao-a','ana@exemplo.pt');" >/dev/null
eq "entra por validar"                   "$(Q "select estado from inscricoes where conta='+351911000001'")" "por_validar"
eq "guarda o email"                      "$(Q "select email from inscricoes where conta='+351911000001'")" "ana@exemplo.pt"
eq "e ocupa lugar enquanto espera"       "$(Q "select livres from disponibilidade where aula_id='crossfit'")" "10"

# A leitura automática confirma: a conta inteira passa a válida.
Q "select validar_conta('+351911000001','valido','bilhete do 7WONDERS','REF-123',true);" >/dev/null
eq "fica válida"                         "$(Q "select estado from inscricoes where conta='+351911000001'")" "valido"
eq "guarda a referência do bilhete"      "$(Q "select referencia from inscricoes where conta='+351911000001'")" "REF-123"
eq "marcada como automática"             "$(Q "select automatico from inscricoes where conta='+351911000001'")" "t"
eq "e continua a ocupar lugar"           "$(Q "select livres from disponibilidade where aula_id='crossfit'")" "10"

# Uma pessoa, várias aulas: a decisão é uma só.
Q "select inscrever('uma','+351911000001','+351911000001','Ana',null,null,'ana@exemplo.pt','valido');" >/dev/null
eq "segunda aula herda o estado"         "$(Q "select estado from inscricoes where conta='+351911000001' and aula_id='uma'")" "valido"
Q "select validar_conta('+351911000001','recusado','afinal não','REF-123',false);" >/dev/null
eq "recusar arrasta as duas inscrições"  "$(Q "select count(*) from inscricoes where conta='+351911000001' and estado='recusado'")" "2"
eq "e as vagas voltam todas"             "$(Q "select livres from disponibilidade where aula_id='crossfit'")" "11"

# Recusado não fecha a porta: anexa-se outro bilhete e tenta-se de novo.
r=$(Q "select estado from inscrever('crossfit','+351911000001','+351911000001','Ana','fotos/b.jpg','impressao-b','ana@exemplo.pt');")
eq "pode tentar outra vez"               "$r" "por_validar"
eq "e não ficam duas linhas da mesma aula" "$(Q "select count(*) from inscricoes where conta='+351911000001' and aula_id='crossfit'")" "1"

# Quem está válido não se inscreve duas vezes na mesma aula.
Q "select validar_conta('+351911000001','valido',null,null,true);" >/dev/null
r=$(Q "select inscrever('crossfit','+351911000001','+351911000001','Ana',null,null,null,'valido');")
case "$r" in *JA_INSCRITO*) ok "válido não entra duas vezes";; *) mal "válido entrou duas vezes (veio: $r)";; esac

# Uma decisão numa linha vale para a pessoa toda.
Q "truncate public.inscricoes;" >/dev/null
Q "select inscrever('crossfit','+351911000002','+351911000002','Rui','fotos/c.jpg','impressao-c','rui@exemplo.pt');" >/dev/null
Q "select inscrever('uma','+351911000002','+351911000002','Rui',null,null,null);" >/dev/null
Q "select decidir_inscricao((select id from inscricoes where conta='+351911000002' limit 1),'valido','conferido à mão');" >/dev/null
eq "decidir numa linha decide as duas"   "$(Q "select count(*) from inscricoes where conta='+351911000002' and estado='valido'")" "2"
eq "e não é marcada como automática"     "$(Q "select distinct automatico from inscricoes where conta='+351911000002'")" "f"

r=$(Q "select validar_conta('+351911000002','talvez');")
case "$r" in *ESTADO_INVALIDO*) ok "estado inventado é recusado";; *) mal "estado inventado passou (veio: $r)";; esac
r=$(Q "select inscrever('uma','+351911000003','+351911000003','Zé','fotos/d.jpg','impressao-d','ze@exemplo.pt','talvez');")
case "$r" in *ESTADO_INVALIDO*) ok "inscrever com estado inventado é recusado";; *) mal "inscrever com estado inventado passou (veio: $r)";; esac

Q "select marcar_avisado('+351911000002');" >/dev/null
eq "marca que o passe seguiu"            "$(Q "select count(*) from inscricoes where conta='+351911000002' and avisado_em is not null")" "2"

echo
if [ $falhas -eq 0 ]; then echo "✅ todas as verificações passaram"; else echo "⚠️  $falhas falharam"; exit 1; fi
