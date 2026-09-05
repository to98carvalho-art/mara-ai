/* ════════════════════════════════════════════════════════════════
   O PASSE, POR EMAIL

   Assim que o bilhete é confirmado, a pessoa recebe o passe com as
   aulas em que ficou inscrita. Email e não SMS por uma razão
   simples: uma mensagem escrita custa cêntimos e multiplica-se por
   toda a gente; o email não custa nada e leva a lista toda, com as
   horas e o sítio.

   Vai pela Resend. Se a chave não estiver posta, a inscrição segue
   na mesma — o passe está sempre no site, isto é o extra.
   ════════════════════════════════════════════════════════════════ */

import { EVENTO, CONTACTO, AULAS, AULAS_LOCAL } from '../../src/content/evento.js'

const REMETENTE_POR_OMISSAO = 'onboarding@resend.dev'

export function correioLigado(env = process.env) {
  return Boolean((env.RESEND_API_KEY || '').trim())
}

/* Um email escrito à mão engana-se; este é sempre o mesmo texto. */
export function emailPlausivel(email) {
  const limpo = String(email || '').trim()
  return limpo.length >= 6 && limpo.length <= 254 && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(limpo)
}

export function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase()
}

/* Aceita ids de aulas e devolve-as por ordem de hora. */
function aulasPorId(ids) {
  const escolhidas = AULAS.filter(a => ids.includes(a.id))
  return escolhidas.sort((a, b) => (a.inicio ?? 0) - (b.inicio ?? 0))
}

function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

export function corpoDoPasse({ nome, aulas }) {
  const lista = aulasPorId(aulas || [])
  const tratamento = String(nome || '').trim().split(/\s+/)[0] || 'Olá'

  const linhas = lista.map(a => ({ nome: a.nome, hora: a.hora, zona: a.zona || AULAS_LOCAL }))

  const texto = [
    `${tratamento}, está confirmado.`,
    '',
    `${EVENTO.nome} · ${EVENTO.dataLonga}`,
    EVENTO.local,
    '',
    linhas.length ? 'As tuas inscrições:' : 'Ainda não tens aulas marcadas.',
    ...linhas.map(l => `  ${l.hora}  ${l.nome}  —  ${l.zona}`),
    '',
    'Chega 10 minutos antes de cada aula.',
    'Podes ver ou anular as tuas inscrições no site, no mesmo telemóvel.',
    '',
    `Dúvidas: ${CONTACTO.telefone}`,
  ].join('\n')

  const html = `<!doctype html><html lang="pt"><body style="margin:0;padding:0;background:#FBF7EB;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7EB;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FBF7EB;font-family:Helvetica,Arial,sans-serif;color:#111;">
  <tr><td style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8A8577;padding-bottom:8px;">
    ${escapar(EVENTO.dataLonga)} · ${escapar(EVENTO.local)}
  </td></tr>
  <tr><td style="font-size:34px;line-height:1.05;font-weight:700;letter-spacing:-.02em;padding-bottom:20px;">
    ${escapar(EVENTO.nome)}
  </td></tr>
  <tr><td style="font-size:16px;line-height:1.5;padding-bottom:24px;">
    ${escapar(tratamento)}, o teu bilhete está confirmado.
  </td></tr>
  ${linhas.length ? `
  <tr><td style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8A8577;padding-bottom:10px;">
    As tuas inscrições
  </td></tr>
  <tr><td style="padding-bottom:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${linhas.map(l => `
      <tr><td style="border-top:1px solid #DED8C6;padding:12px 0;">
        <div style="font-size:11px;letter-spacing:.14em;color:#8A8577;">${escapar(l.hora)}</div>
        <div style="font-size:18px;font-weight:700;padding-top:2px;">${escapar(l.nome)}</div>
        <div style="font-size:13px;color:#5C584E;padding-top:2px;">${escapar(l.zona)}</div>
      </td></tr>`).join('')}
    </table>
  </td></tr>` : ''}
  <tr><td style="font-size:14px;line-height:1.6;color:#5C584E;border-top:1px solid #DED8C6;padding-top:16px;">
    Chega 10 minutos antes de cada aula. Podes ver ou anular as tuas inscrições no site,
    no mesmo telemóvel onde te inscreveste.<br><br>
    Dúvidas: ${escapar(CONTACTO.telefone)}
  </td></tr>
</table>
</td></tr></table></body></html>`

  const assunto = linhas.length === 1
    ? `${EVENTO.nome} · ${linhas[0].nome}, ${linhas[0].hora}`
    : `${EVENTO.nome} · a tua inscrição está confirmada`

  return { assunto, texto, html }
}

/* Envia. Nunca levanta exceção: o passe falhar não pode desfazer
   uma inscrição que já está guardada. */
export async function enviarPasse({ nome, email, aulas }, env = process.env) {
  const chave = (env.RESEND_API_KEY || '').trim()
  if (!chave) return { enviado: false, motivo: 'SEM_CHAVE' }
  if (!emailPlausivel(email)) return { enviado: false, motivo: 'EMAIL_INVALIDO' }

  const de = (env.EMAIL_REMETENTE || '').trim() || `${EVENTO.nome} <${REMETENTE_POR_OMISSAO}>`
  const { assunto, texto, html } = corpoDoPasse({ nome, aulas })

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${chave}` },
      body: JSON.stringify({ from: de, to: [normalizarEmail(email)], subject: assunto, text: texto, html }),
    })
    if (!resposta.ok) return { enviado: false, motivo: `RECUSADO_${resposta.status}` }
    return { enviado: true }
  } catch {
    return { enviado: false, motivo: 'SEM_RESPOSTA' }
  }
}
