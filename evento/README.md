# Plataforma do Evento — o motor

Uma plataforma onde os participantes entram, veem **todas as áreas e atividades
num horário** (estilo ginásio) e se **inscrevem** nas que têm vagas limitadas.

O **visual é propositadamente neutro** — está à espera do design final.
Toda a lógica está separada da aparência, por isso aplicar o design não obriga
a mexer em nada do que está aqui descrito.

---

## Arrancar em 30 segundos

```bash
cd evento
npm install
npm run dev
```

Abre <http://localhost:5180>. Arranca em **modo demonstração**: horário de
exemplo com 3 dias, 6 áreas e 34 atividades, guardado no próprio browser.
Não é preciso configurar nada.

Para entrar como organização no modo demo: `admin@evento.pt` + qualquer
palavra-passe com 6 ou mais caracteres.

---

## As duas metades

```
  ECRÃS  ──────────►  src/lib/api.js  ──────────►  MOTOR
  (aparência)          (porta única)                (dados + regras)
                                                    ├── demoApi.js   (browser)
                                                    └── supabaseApi.js (a sério)
```

Os ecrãs **nunca** falam com a base de dados. Falam com `src/lib/api.js`,
que escolhe sozinho o motor certo. Trocar demo → real é preencher o `.env`.

---

## Os conceitos

| Conceito | O que é |
|---|---|
| **Área** | Uma zona do evento (Movimento, Workshops, Palco…). Tem cor e ícone. |
| **Atividade** | Uma coisa que acontece a uma hora e num sítio, dentro de uma área. |
| **Entrada livre** | Atividade sem `capacidade` — aparece e entra, sem inscrição. |
| **Vagas limitadas** | Atividade com `capacidade` — precisa de inscrição, e esgota. |
| **Inscrição** | A ligação entre uma pessoa e uma atividade. Confirmada ou em espera. |
| **Lista de espera** | Quando esgota, entra-se na fila. Se alguém cancela, o primeiro sobe. |

---

## O que o motor sabe fazer

### Contas — `auth`

| Função | O que faz |
|---|---|
| `auth.signUp({ name, email, password })` | Cria conta e inicia sessão |
| `auth.signIn({ email, password })` | Inicia sessão |
| `auth.signOut()` | Termina sessão |
| `auth.getCurrentUser()` | Quem está a usar (ou `null`) |
| `auth.onAuthChange(cb)` | Avisa quando alguém entra ou sai |

### Horário — `data`

| Função | O que faz |
|---|---|
| `data.listAreas()` | Todas as áreas, por ordem |
| `data.listSessions(filtros)` | Atividades. Filtros: `areaId`, `onlyMine`, `onlyAvailable`, `query` |
| `data.getSession(id)` | Uma atividade, com vagas e o meu estado |
| `data.listMyEnrollments()` | As minhas atividades marcadas |
| `data.findConflicts(id)` | O que já tenho marcado à mesma hora |
| `data.enroll(id, { force })` | Inscrever (ou entrar na lista de espera) |
| `data.cancelEnrollment(id)` | Cancelar, e subir o primeiro da espera |
| `data.listEnrollmentsForSession(id)` | Quem se inscreveu (só organização) |

### Cada atividade traz sempre

```js
{
  id, title, description, host, location,
  startsAt, endsAt,                 // datas ISO
  area: { id, name, color, icon },

  requiresSignup,                   // false → entrada livre
  capacity, spotsTaken, spotsLeft,  // vagas
  isFull,                           // sem vagas
  waitlistCount,                    // quantos estão em espera

  myStatus,                         // 'confirmed' | 'waitlist' | null
  myWaitlistPosition,               // 3 → "és o 3º da fila"
  hasStarted,                       // já começou
}
```

Isto é tudo o que um cartão de atividade precisa para se desenhar.

### Erros que o motor devolve

`FULL` · `ALREADY_ENROLLED` · `NOT_ENROLLED` · `TIME_CONFLICT` ·
`ALREADY_STARTED` · `NO_SIGNUP_NEEDED` · `NOT_AUTHENTICATED` ·
`INVALID_CREDENTIALS` · `EMAIL_IN_USE` · `WEAK_PASSWORD` · `LIMIT_REACHED`

Cada um já tem uma frase em português pronta a mostrar — `messageFor(erro)`
em `src/lib/errors.js`.

---

## Regras que se mudam num sítio só

`src/lib/config.js` → `RULES`:

```js
waitlistEnabled:      true,   // lista de espera quando esgota
warnOnTimeConflict:   true,   // avisa se já tens algo à mesma hora
blockSignupAfterStart:true,   // fecha inscrições quando começa
maxEnrollmentsPerUser: null,  // limite por pessoa (null = sem limite)
```

---

## Ecrãs

| Rota | Ecrã | Precisa de conta |
|---|---|---|
| `/` | Horário — dias, áreas, procura, filtros | não |
| `/atividade/:id` | Detalhe + inscrever/cancelar | só para inscrever |
| `/minha-agenda` | As minhas atividades, por dia | sim |
| `/entrar` | Entrar / criar conta | — |
| `/organizacao` | Inscritos por atividade + exportar CSV | sim (admin) |

---

## Onde mexer no visual

| Ficheiro | O que controla |
|---|---|
| `src/design/tokens.js` | Cores, espaçamentos, cantos, tipos de letra |
| `src/styles.css` | Todo o aspeto, assente nesses tokens |
| `src/components/SessionCard.jsx` | O cartão de atividade |
| `src/components/Badges.jsx` | Etiquetas: entrada livre, vagas, inscrito… |

**Nenhum destes ficheiros contém regras de negócio.** Podem ser reescritos
de raiz sem partir nada.

---

## Passar para o modo real (Supabase)

1. Criar um projeto grátis em <https://supabase.com>
2. **SQL Editor** → colar e correr o `supabase/schema.sql`
3. **Settings → API** → copiar `Project URL` e `anon public key`
4. Criar o ficheiro `.env` a partir do `.env.example` e colar os dois valores
5. `npm run dev` — a plataforma passa a usar contas e base de dados a sério

Para te tornares organização: regista-te normalmente e depois, no
**Table Editor → profiles**, muda o teu `role` de `participant` para `admin`.

O limite de vagas é garantido dentro da base de dados (a função
`enroll_in_session` tranca a atividade enquanto conta), por isso duas
pessoas a carregar no botão ao mesmo tempo nunca passam do limite.

---

## Pôr online

Deploy na Vercel a apontar para a pasta `evento/`. O `vercel.json` já trata
das rotas. As variáveis do `.env` entram em **Settings → Environment Variables**.
