# Guia de Integração — 3cket API
## Login por telemóvel + validação de bilhete · Evento: **7 Wonders**

Este guia descreve tudo o que precisas para pôr a app a funcionar com a API da 3cket:
o utilizador faz login com o número de telemóvel, recebe um PIN por SMS e, se tiver
bilhete para o evento, entra na app.

---

## 1. Visão geral do fluxo

```
[1] Telemóvel  → phone_validation   → 3cket envia SMS com PIN de 4 dígitos
[2] PIN        → pin_validation      → devolve o ACCOUNT ID
[3] Account ID → cashless/wallet     → devolve o WALLET ID
[4] Wallet ID  → tickets             → lista de bilhetes  →  tem bilhete? entra : não entra
```

> **Importante:** o passo [1] envia o SMS a **qualquer número válido**, não só a quem tem
> bilhete. O "tem bilhete?" é decidido no passo [4]. Tens de encadear sempre até ao passo 4
> antes de dar acesso — caso contrário qualquer pessoa que receba o SMS entra na app.

---

## 2. Autenticação e segurança (ler primeiro)

Todos os pedidos levam o header:

```
Authorization: Bearer <SECRET_KEY>
Content-Type: application/json
```

- A `SECRET_KEY` é **por evento** e será enviada **em separado** (não vem neste documento).
- É um **segredo de servidor**. Responde `401 Unauthorized` também quando o evento expira.

> ### ⚠️ A chave NUNCA pode ir dentro da app
> A app não pode chamar a 3cket diretamente do telemóvel / browser com esta chave — seria
> extraída em segundos, e com ela é possível consultar e cancelar bilhetes de terceiros.
> **Faz um pequeno backend/proxy:** a app fala com o teu backend, e é o backend (que guarda
> a chave) que fala com a 3cket. Se estás a fazer isto com vibe coding, este é o ponto que
> mais provavelmente parte — trata-o primeiro.

---

## 3. Base URL

```
API_URL = https://api.3cket.com
```

Nota: dois endpoints opcionais (Attendee Info e Cancel Tickets) usam outro host,
`https://services.3cket.com/api/external/.../*.php`. É de propósito, não é gralha.

---

## 4. O fluxo, endpoint a endpoint

### Passo 1 — Enviar o PIN por SMS

```
POST {API_URL}/external/account/phone_validation
```

**Body**
```json
{ "mobile_phone": "+351939202361" }
```
(sempre com `+` e indicativo do país)

**Respostas**

| Código | Significado | Corpo |
|--------|-------------|-------|
| `201` | SMS enviado | `{ "expires_at": "2023-02-24T14:30:13Z" }` |
| `400` | Número inválido | `error.code = "invalid_input"` |
| `400` | Já foi pedido um PIN e ainda não expirou | `error.code = "operation_started"` |
| `401` | Chave errada ou evento expirado | `{ "message": "Unauthorized." }` |

> **UX:** enquanto o PIN não expirar, um novo pedido dá `operation_started`. Bloqueia o botão
> "reenviar" e mostra um contador até ao `expires_at`.

---

### Passo 2 — Validar o PIN e obter a conta

```
POST {API_URL}/external/account/pin_validation
```

**Body**
```json
{ "mobile_phone": "+351939202361", "pin": 1558 }
```
(o `pin` vai como **número**, não string)

**Respostas**

| Código | Significado | Corpo |
|--------|-------------|-------|
| `201` | PIN correto | `{ "id": "685b013e3ebc4997aa10dfe27385d80e" }` ← **account id** |
| `400` | PIN errado | `error.code = "operation_pin_mismatch"` |
| `404` | Não foi pedido PIN para este número | `{ "message": "Operation not found" }` |
| `404` | Conta não registada | `{ "message": "Account not registered" }` |
| `401` | Chave errada ou evento expirado | `{ "message": "Unauthorized." }` |

Guarda o `id` (o **account id**) — é ele que abre os passos seguintes.

---

### Passo 3 — Obter a wallet da conta

```
POST {API_URL}/external/cashless/wallet
```

**Body**
```json
{ "account": "685b013e3ebc4997aa10dfe27385d80e" }
```

**Respostas**

| Código | Significado | Corpo |
|--------|-------------|-------|
| `200` | OK | `{ "wallet": "f894175e274f4bbd82fff4d4ae9b7210" }` ← **wallet id** |
| `404` | Conta não existe | `{ "message": "Account not found" }` |
| `400` | Falta o campo `account` | `error.code = "invalid_input"` |
| `401` | Chave errada ou evento expirado | `{ "message": "Unauthorized." }` |

O `wallet` é também o conteúdo que vai dentro do QR code, caso venhas a precisar.

---

### Passo 4 — Listar os bilhetes (decisão de acesso)

```
POST {API_URL}/external/tickets
```

**Body**
```json
{ "wallet_id": "f894175e274f4bbd82fff4d4ae9b7210" }
```

**Respostas**

| Código | Significado | Corpo |
|--------|-------------|-------|
| `201` | Lista de bilhetes | ver exemplo abaixo |
| `400` | Falta o campo `wallet_id` | `error.code = "invalid_input"` |
| `401` | Chave errada ou evento expirado | `{ "message": "Unauthorized." }` |

Exemplo de bilhete devolvido:
```json
{
  "ticket_id": "6fb3d218331a417587076834730b5303",
  "product_id": "ec44b9ddf8cd46fa950e96b154fe01",
  "ticket_name": "Bilhete Lote 1",
  "ticket_description": "Uma pequena descrição do bilhete",
  "paid_value": 0,
  "seat": null
}
```

**Regra de acesso:** se a lista trouxer bilhetes → deixa entrar. Se vier vazia → não tem
bilhete para o 7 Wonders → nega o acesso.

---

## 5. Endpoints opcionais (só se precisares)

**Dados do participante** — email + campos personalizados preenchidos na compra:
```
POST https://services.3cket.com/api/external/Account/account-info.php
Body: { "account": "<account_id>" }
→ 200: { "email": "...", "custom_fields": { "234": "exemplo" } }
```

Existem ainda `tickets/register` e `Tickets/cancel-tickets.php` (criar/cancelar bilhetes).
Para o login + validação **não são precisos** — ignora-os, a não ser que peçamos.

---

## 6. Checklist de erros a tratar na app

- `401 Unauthorized` em qualquer chamada → chave inválida **ou o evento já expirou**. Mostra
  mensagem genérica e avisa a 3cket.
- `operation_started` (passo 1) → PIN ainda válido; não reenviar, mostrar contador.
- `operation_pin_mismatch` (passo 2) → PIN errado; deixar tentar de novo.
- `Account not registered` / `Operation not found` (passo 2) → tratar como "sem acesso".
- Lista de bilhetes vazia (passo 4) → "sem bilhete para este evento".
- **Sem rede no recinto:** decidir com a 3cket se a validação é sempre online ou se é preciso
  pensar num plano para falhas de rede.

---

## 7. Quem faz o quê

**A 3cket fornece (à parte deste guia):**
- A `SECRET_KEY` do evento 7 Wonders.
- Um número de telemóvel de teste **com bilhete**, para testares o fluxo completo e receberes
  o SMS a sério (e, se possível, casos de "sem bilhete" e "PIN errado").
- Confirmação de se testas num evento de teste ou diretamente no 7 Wonders.

**O developer constrói:**
- O backend/proxy que guarda a chave e faz as 4 chamadas.
- A app: ecrã de telemóvel → ecrã de PIN → obtenção de wallet + bilhetes → decisão de acesso.

---

*Dúvidas técnicas durante a integração: falar com a equipa da 3cket.*
