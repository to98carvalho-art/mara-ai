/* ════════════════════════════════════════════════════════════════
   LER O QR CODE

   O QR é o que há de mais fiável numa entrada. O nome do evento não
   aparece na carteira da 3cket, a referência escrita muitas vezes
   também não — mas o QR está sempre lá, e é diferente para cada
   pessoa.

   Serve-nos para duas coisas:

     • é a identidade da entrada: o mesmo QR em dois números de
       telemóvel é a mesma entrada a ser usada duas vezes
     • confirma que aquilo é mesmo uma entrada e não uma imagem
       qualquer com um quadrado preto

   Tudo em JavaScript puro, sem programas do sistema: no servidor da
   Vercel não há onde instalar nada.
   ════════════════════════════════════════════════════════════════ */

import jsQR from 'jsqr'
import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'

/* Um print de telemóvel a 1800px de altura é mais do que o preciso
   para um QR, e descodificar imagens grandes em JavaScript é lento.
   Este tecto é generoso e evita que um ficheiro estranho prenda o
   servidor. */
const PIXEIS_MAXIMOS = 4_000_000

function paraPixeis(bytes, tipo) {
  if (tipo === 'image/jpeg') {
    const img = jpeg.decode(bytes, { useTArray: true, maxMemoryUsageInMB: 128 })
    return { dados: img.data, largura: img.width, altura: img.height }
  }
  if (tipo === 'image/png') {
    const img = PNG.sync.read(Buffer.from(bytes))
    return { dados: img.data, largura: img.width, altura: img.height }
  }
  return null                       // webp, heic e PDF ficam de fora
}

/* Reduz a imagem por saltos inteiros. Um QR sobrevive bem a isto e
   fica muito mais rápido de procurar. */
function encolher({ dados, largura, altura }, salto) {
  if (salto <= 1) return { dados, largura, altura }

  const l = Math.floor(largura / salto)
  const a = Math.floor(altura / salto)
  const saida = new Uint8ClampedArray(l * a * 4)

  for (let y = 0; y < a; y++) {
    for (let x = 0; x < l; x++) {
      const de = ((y * salto) * largura + x * salto) * 4
      const para = (y * l + x) * 4
      saida[para] = dados[de]
      saida[para + 1] = dados[de + 1]
      saida[para + 2] = dados[de + 2]
      saida[para + 3] = 255
    }
  }
  return { dados: saida, largura: l, altura: a }
}

/* Devolve o texto do QR, ou null. Nunca levanta exceção: um ficheiro
   que não se descodifica não pode derrubar uma inscrição. */
export function lerQr(bytes, tipo) {
  try {
    const imagem = paraPixeis(bytes, String(tipo || '').toLowerCase())
    if (!imagem) return null
    if (imagem.largura * imagem.altura > PIXEIS_MAXIMOS) return null

    // Primeiro à escala real; se falhar, a meio e a um terço. Prints
    // muito grandes por vezes só se lêem depois de encolhidos.
    for (const salto of [1, 2, 3]) {
      const { dados, largura, altura } = encolher(imagem, salto)
      const achado = jsQR(dados, largura, altura, { inversionAttempts: 'attemptBoth' })
      const texto = achado?.data?.trim()
      if (texto) return texto.slice(0, 500)
    }
    return null
  } catch {
    return null
  }
}
