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

## O que falta para o dia do evento

1. **Vagas partilhadas.** Hoje as inscrições vivem no dispositivo de cada
   pessoa. Têm de passar para base de dados, senão dois telemóveis podem
   ficar ambos com a última vaga.
2. **Guardar as candidaturas ao After Party** — o formulário ainda só
   confirma no ecrã.
3. **Imagens** — as fotografias e o logótipo entram em `public/imagens/`.
   Enquanto não existem, aparece um retângulo com o nome da foto que ali vai.
4. **Testar com a chave real** e um número que tenha bilhete a sério.

---

## Pôr online

Deploy na Vercel a apontar para a pasta `7wonders/`.
As variáveis vão em *Settings → Environment Variables*:

| Variável | Onde |
|---|---|
| `THREECKET_SECRET_KEY` | servidor · dada pela 3cket |
| `SESSION_SECRET` | servidor · `openssl rand -hex 32` |
