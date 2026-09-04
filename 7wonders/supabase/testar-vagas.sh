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

echo
if [ $falhas -eq 0 ]; then echo "✅ todas as verificações passaram"; else echo "⚠️  $falhas falharam"; exit 1; fi
