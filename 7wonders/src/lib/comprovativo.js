/* ════════════════════════════════════════════════════════════════
   O COMPROVATIVO DO BILHETE

   A pessoa anexa uma foto do ecrã ou o PDF que recebeu por email.

   Antes de enviar:
     • as fotos são reduzidas — um print de telemóvel traz 4 MB e no
       recinto, com a rede cheia, isso não sobe
     • calcula-se uma impressão digital do ficheiro, para se saber
       quando o mesmo comprovativo aparece em várias inscrições

   O ficheiro vai directamente para o armazenamento, por um endereço
   assinado que o servidor emite. Não passa pelo nosso servidor.
   ════════════════════════════════════════════════════════════════ */

const TAMANHO_MAXIMO = 8 * 1024 * 1024      // 8 MB antes de reduzir
const LADO_MAXIMO = 1800                     // chega para se ler um bilhete

export const TIPOS_ACEITES = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

export const ERROS_COMPROVATIVO = {
  FORMATO_NAO_ACEITE: 'Aceitamos fotos (JPG, PNG) ou o PDF do bilhete.',
  FICHEIRO_GRANDE:    'Esse ficheiro é grande demais. Tenta uma foto do ecrã.',
  ENVIO_FALHOU:       'Não conseguimos enviar o ficheiro. Tenta outra vez.',
  INDISPONIVEL:       'Não conseguimos guardar o comprovativo agora. Tenta daqui a pouco.',
}

export class ErroComprovativo extends Error {
  constructor(codigo) {
    super(codigo)
    this.codigo = codigo
    this.mensagem = ERROS_COMPROVATIVO[codigo] || ERROS_COMPROVATIVO.ENVIO_FALHOU
  }
}

/* Impressão digital do conteúdo. Dois envios do mesmo ficheiro dão o
   mesmo resultado — é assim que se apanha um print reutilizado. */
async function impressaoDigital(blob) {
  const bytes = await blob.arrayBuffer()
  const resumo = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(resumo)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/* Reduz a imagem sem a tornar ilegível. PDFs passam intactos. */
async function reduzir(ficheiro) {
  if (ficheiro.type === 'application/pdf') return { blob: ficheiro, tipo: ficheiro.type }
  if (!ficheiro.type.startsWith('image/')) throw new ErroComprovativo('FORMATO_NAO_ACEITE')

  let imagem
  try {
    imagem = await createImageBitmap(ficheiro)
  } catch {
    // HEIC de iPhone que o browser não sabe abrir: vai como está.
    return { blob: ficheiro, tipo: ficheiro.type }
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height))
  const largura = Math.round(imagem.width * escala)
  const altura = Math.round(imagem.height * escala)

  const tela = document.createElement('canvas')
  tela.width = largura
  tela.height = altura
  tela.getContext('2d').drawImage(imagem, 0, 0, largura, altura)
  imagem.close?.()

  const blob = await new Promise(r => tela.toBlob(r, 'image/jpeg', 0.82))
  if (!blob) throw new ErroComprovativo('ENVIO_FALHOU')
  return { blob, tipo: 'image/jpeg' }
}

export async function prepararComprovativo(ficheiro) {
  if (!ficheiro) throw new ErroComprovativo('FORMATO_NAO_ACEITE')
  if (ficheiro.size > TAMANHO_MAXIMO) throw new ErroComprovativo('FICHEIRO_GRANDE')

  const { blob, tipo } = await reduzir(ficheiro)
  return { blob, tipo, impressao: await impressaoDigital(blob), tamanho: blob.size }
}

export async function enviarComprovativo({ blob, tipo }) {
  let preparado
  try {
    const resposta = await fetch('/api/comprovativo/preparar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo }),
    })
    preparado = await resposta.json()
    if (!resposta.ok) throw new ErroComprovativo(preparado?.error || 'INDISPONIVEL')
  } catch (e) {
    throw e instanceof ErroComprovativo ? e : new ErroComprovativo('INDISPONIVEL')
  }

  const envio = await fetch(preparado.endereco, {
    method: 'PUT',
    headers: { 'Content-Type': tipo },
    body: blob,
  })
  if (!envio.ok) throw new ErroComprovativo('ENVIO_FALHOU')

  return preparado.caminho
}
