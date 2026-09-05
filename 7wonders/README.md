# 7WONDERS

Plataforma do evento de **12 de setembro**, no Club de Golf de Braga.
Uma app só, que se adapta do telemóvel ao desktop.

```bash
cd 7wonders
npm install
npm run dev     # http://localhost:5180
npm test        # verificações da integração 3cket
```

---

## As seis vistas

| | O quê |
|---|---|
| **Geral** | Hero, o dia hora a hora, as seis zonas do recinto |
| **Atividades** | Grelha de aulas do Wellness e Spirit & Soul, com inscrição |
| **Main Stage** | Flyer, headliner e restante line-up |
| **Privados** | Mapa dos 12 camarotes, preços, reserva por telefone |
| **Bilhetes** | Blind ticket esgotado + ligação ao 3cket |
| **After Party** | Candidatura ao after secreto |

---

## Entrar — como funciona

Não há registo nem palavra-passe. A prova de que alguém pode inscrever-se
numa aula é ter bilhete, e isso é a 3cket que responde.

```
telemóvel  →  a 3cket envia PIN por SMS
PIN        →  devolve a conta
conta      →  devolve a carteira
carteira   →  lista de bilhetes  →  vazia? não entra
```

**O SMS sozinho não prova nada.** A 3cket envia-o a qualquer número válido,
tenha bilhete ou não. Por isso o encadeamento vai sempre até ao fim antes de
abrir a porta — está em `api/_lib/3cket.js`.

### A chave nunca vai para o browser

A `THREECKET_SECRET_KEY` permite consultar e cancelar bilhetes de terceiros.
Vive só nas funções de servidor (`api/`), e é o servidor que fala com a 3cket.

Nenhuma variável com prefixo `VITE_` a pode conter — tudo o que tem esse
prefixo é embutido no site e fica visível a quem abrir o código-fonte.

### Sem chave, corre um simulador

Enquanto `THREECKET_SECRET_KEY` estiver vazia:

- o código é sempre **`1234`**
- qualquer número **acabado em `0`** finge não ter bilhete

Dá para percorrer os dois caminhos sem gastar SMS nem esperar pela 3cket.

---

## Onde está o quê

| Ficheiro | O que faz |
|---|---|
| `src/content/evento.js` | **Todo o conteúdo** — zonas, aulas, horas, preços, line-up |
| `src/tokens.css` | Cores, tipos de letra, cantos, sombras, textura |
| `src/styles.css` | O aspeto, telemóvel e desktop na mesma folha |
| `src/lib/sessao.js` | Entrar e sair; fala só com o nosso servidor |
| `src/lib/inscricoes.js` | Inscrições e contagem de vagas |
| `api/_lib/3cket.js` | Os quatro passos da bilheteira |
| `api/auth/*.js` | As duas funções que o site chama |
| `docs/` | Guia da 3cket, coleção Postman, ficheiros de design |

Mudar o programa do evento é mexer **só** em `src/content/evento.js`.

---

## Vagas: convite e bilhete

Cada aula tem dois bolsos de lugares — `convite` (reservados) e `bilhete`
(abertos). Quem usa a app **nunca vê esta divisão**: lê apenas
«APENAS N VAGAS LIVRES», que é a soma do que sobra dos dois.

| Aula | Convite | Bilhete |
|---|---|---|
| Barre Class | 0 | 10 |
| Fitness Class | 15 *(já ocupados)* | 15 |
| CrossFit Class | 24 *(já ocupados)* | 11 |
| Run Club | 0 | 49 |
| Yoga | 0 | 15 |
| Cacau's Ritual | 0 | 15 |

Ice Bath & Sauna e Reiki · Tarot · Massagens não têm inscrição.

---

## Vagas partilhadas

As inscrições vivem na base de dados, não no telemóvel de cada pessoa.
Isto é o que impede duas pessoas de ficarem ambas com a última vaga.

A conta é feita **dentro do Postgres**, com a linha da aula trancada
enquanto se contam os lugares (`inscrever()` em `supabase/schema.sql`).
Dois pedidos ao mesmo instante fazem fila, e o segundo já vê o lugar
que o primeiro ocupou.

Para pôr de pé:

1. Criar um projeto grátis em <https://supabase.com>
2. **SQL Editor** → colar e correr `supabase/schema.sql`
3. **Settings → API** → copiar `Project URL` e a chave **`service_role`**
4. Pô-las no `.env` como `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
   (sem prefixo `VITE_` — são segredos de servidor)
5. `node scripts/semear-aulas.mjs` põe as aulas na base de dados

Sem estas variáveis a app continua a funcionar, mas as inscrições ficam
só no dispositivo de quem as faz. Serve para desenvolver; não serve para
o dia 12.

### Testar a trava

`supabase/testar-vagas.sh` corre contra um Postgres local e faz a
pergunta que interessa: 25 pessoas a carregar no botão ao mesmo tempo,
uma só vaga — quantas ficam com ela? A resposta tem de ser uma.

---

## After Party

As candidaturas ficam em `candidaturas_after`, na mesma base de dados.
Lêem-se no Supabase, em **Table Editor → candidaturas_after**, e cada
uma tem um `estado`: `nova`, `aceite` ou `recusada`.

Quem se engana no número volta a submeter e corrige — não fica preso a
um pedido errado, nem se duplicam candidaturas.

**O formulário nunca diz «enviada» sem ter guardado.** Se a base de
dados não responder, mostra o erro e a pessoa pode tentar de novo. Uma
confirmação falsa perderia candidaturas de gente a sério.

---

## Bilhetes

A API da 3cket não fica pronta a tempo, por isso o bilhete é o
ficheiro que a pessoa anexa: um print do telemóvel ou o PDF da
bilheteira.

Quem se inscreve deixa nome, telemóvel e email, e anexa o bilhete. A
vaga é reservada primeiro e o bilhete é lido logo a seguir — por esta
ordem, senão os segundos da leitura seriam tempo em que outra pessoa
podia levar o último lugar. Três saídas:

| | o que acontece |
|---|---|
| **válido** | inscrição confirmada e o passe segue por email |
| **recusado** | dizemos porquê e a vaga volta a ficar livre; pode anexar-se outro |
| **dúvida** | a vaga fica guardada e a equipa decide em `/#equipa` |

O bilhete é da **pessoa**, não da aula: lê-se uma vez, e as aulas
seguintes herdam a decisão. Validar ou recusar arrasta todas as
inscrições da mesma pessoa.

A dúvida é de propósito. Uma máquina que decide sozinha erra contra
quem pagou bilhete, e isso é pior do que dar trabalho à equipa. O mesmo
bilhete em duas inscrições também não é recusado automaticamente — um
PDF com quatro bilhetes de um grupo é normal — mas passa à equipa com
um aviso.

### A área da equipa

`/#equipa`, com a palavra-passe de `ADMIN_PASSWORD`. Mostra o
comprovativo ao lado do nome, do telemóvel e da aula, com o que a
leitura automática achou, e deixa validar, recusar ou voltar a pôr na
fila. Fora das seis vistas do evento, para nenhum participante lá cair
por engano.

Sem `ANTHROPIC_API_KEY` nada disto pára: os bilhetes ficam todos à
espera da equipa. Sem `RESEND_API_KEY` a inscrição faz-se na mesma, só
não sai o email. `/api/estado` diz qual das duas falta.

---

## O que falta para o dia do evento

1. **Pôr online** na Vercel, com as variáveis do `.env`.
2. **Correr os ficheiros do `supabase/`** por ordem: `schema.sql`,
   `comprovativos.sql`, `validacao.sql`.

---

## Pôr online

Deploy na Vercel a apontar para a pasta `7wonders/`.
As variáveis vão em *Settings → Environment Variables*:

| Variável | Onde | Sem ela |
|---|---|---|
| `SUPABASE_URL` | Supabase · *Settings → API* | tudo fica no telemóvel de cada um |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase · a chave **secreta** | idem |
| `SESSION_SECRET` | `openssl rand -hex 32` | o servidor recusa arrancar |
| `ADMIN_PASSWORD` | escolhida por vocês | `/#equipa` não abre |
| `ANTHROPIC_API_KEY` | <https://console.anthropic.com> | os bilhetes esperam pela equipa |
| `RESEND_API_KEY` | <https://resend.com> | não sai o passe por email |
| `EMAIL_REMETENTE` | ex. `7WONDERS <bilhetes@odominio.pt>` | o email sai de um remetente emprestado |
| `THREECKET_SECRET_KEY` | dada pela 3cket | (não é usada por agora) |

Nenhuma leva prefixo `VITE_`: são todas segredos de servidor e o
prefixo faria com que fossem parar dentro da app.
