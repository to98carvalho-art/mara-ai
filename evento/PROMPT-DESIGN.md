# Prompt para desenhar a plataforma no Claude Design

Copia o bloco abaixo, preenche os `[…]` com as coisas do teu evento, e envia.
O prompt é auto-suficiente — não precisa do contexto de nenhuma conversa.

---

Preciso que desenhes a interface de uma plataforma web para os participantes
de um evento. A lógica já está construída e testada — falta-lhe o aspeto.
Não escrevas código de backend: quero ecrãs desenhados.

## O evento

Nome: [NOME DO EVENTO]
Quando: [3 dias / 1 fim de semana / …]
Quem entra lá: [participantes inscritos / público geral]
Tom: [ex.: caloroso e informal / desportivo e enérgico / calmo e natural]

As áreas do evento são:
[LISTA AS TUAS ÁREAS, ex.:]
- Movimento
- Bem-Estar
- Workshops
- Palco Principal
- Aventura
- Comunidade

## O que a plataforma faz

A pessoa entra e vê o evento inteiro disposto por horas, como o quadro de
aulas de um ginásio. Cada bloco é uma hora; dentro dele estão as atividades
que acontecem nessa altura, identificadas pela cor da área a que pertencem.

Há dois tipos de atividade, e esta distinção manda em todo o design:

- **Entrada livre** — sem limite de lugares. Aparece-se e entra-se.
  Não há botão nem contagem.
- **Vagas limitadas** — tem lugares contados. Exige inscrição, mostra
  quantos faltam, esgota, e abre lista de espera.

## Os ecrãs a desenhar

**1. Horário** (o mais importante — é onde se passa 80% do tempo)
Seletor de dias · filtro por área com as cores · alternar "só com vagas" e
"só as minhas" · caixa de procura · blocos de hora com os cartões dentro.
Desenha em **desktop e telemóvel** — a maioria vai abrir isto no telemóvel,
de pé, à pressa.

**2. Detalhe da atividade**
Área, título, descrição, dia, hora, duração, local, quem orienta.
Uma barra de ocupação ("8 de 12 lugares ocupados").
Um único botão grande de ação.
Mais a janela de aviso: "Já tens algo a esta hora" — com duas saídas,
*Deixar estar* e *Inscrever à mesma*.

**3. A minha agenda**
Só o que a pessoa marcou, agrupado por dia. Estado vazio incluído.

**4. Entrar / criar conta**
Um formulário só, que alterna entre os dois modos. Nome, email, palavra-passe.

**5. Painel da organização**
Tabela de quem se inscreveu em quê. Não precisa de ser bonito — precisa de
ser legível numa tenda com sol a bater no ecrã.

## A peça central: o cartão de atividade

Repete-se dezenas de vezes por ecrã. Se este ficar bem, a plataforma fica bem.

Contém: risca de cor da área · nome da área com ícone · título ·
quem orienta · local · duração · e as etiquetas de estado.

Desenha o cartão com **cada uma destas seis etiquetas**:

| Etiqueta | Quando aparece |
|---|---|
| `Entrada livre` | atividade sem inscrição |
| `8 vagas` | há lugares de sobra — discreta, só informa |
| `Últimas 2 vagas` | restam 3 ou menos — tem de criar urgência |
| `Sem vagas` | esgotou, mas ainda dá para a lista de espera |
| `✓ Inscrito` | tenho lugar garantido — **a mais importante de todas**, tem de saltar à vista no meio do horário |
| `Lista de espera · 3.º` | estou na fila, com a posição — não pode confundir-se com "Inscrito" |

Importante: as etiquetas **acumulam-se**. Um cartão pode mostrar
`✓ Inscrito` + `Últimas 2 vagas` ao mesmo tempo. O desenho tem de aguentar
duas ou três lado a lado sem partir a linha.

Desenha também o cartão no estado **já passou** (esbatido).

## O botão do ecrã de detalhe

É sempre o mesmo sítio, mas muda conforme a situação. Preciso de ver:

- `Inscrever-me` (principal)
- `Entrar na lista de espera` (quando esgotou)
- `Cancelar inscrição` (recuo, quando já estou dentro)
- `Sair da lista de espera` (recuo)
- `A inscrever…` (desativado, a processar)
- Caixa de aviso sem botão: "Esta atividade é de entrada livre"
- Caixa de aviso sem botão: "As inscrições fecharam — já começou"
- Faixa verde de confirmação: "Inscrição confirmada!"
- Faixa vermelha de erro: "Esta atividade já não tem vagas."

## Restrições

- **As cores das áreas não são decoração** — são o que permite ler o horário
  de relance. Têm de se distinguir umas das outras mesmo numa risca de 4px,
  e funcionar sobre fundo claro e escuro.
- **Telemóvel primeiro** nos ecrãs de horário e agenda.
- Contraste acessível: muita gente vai ler isto ao sol.
- Números alinhados (horas, vagas) — usa numerais tabulares.

## O que quero de volta

- Os ecrãs desenhados, com os estados listados acima
- A paleta: fundo, superfícies, texto, texto secundário, cor de marca,
  mais uma cor por cada área do evento
- Os tipos de letra escolhidos (nome basta)
- O cartão de atividade isolado, com as suas variações

Dá-me [1 / 2 / 3] direções visuais diferentes para eu escolher.
