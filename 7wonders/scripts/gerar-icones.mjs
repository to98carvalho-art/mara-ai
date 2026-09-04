/* Gera os ícones da app a partir do logótipo.
   O logótipo é comprido; um ícone é quadrado — por isso assenta-se
   sobre o fundo escuro da marca, centrado e com margem.

   node scripts/gerar-icones.mjs
*/
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const LOGO = 'public/imagens/logo.png'
const DESTINO = 'public/icones'
mkdirSync(DESTINO, { recursive: true })

const TINTA = { r: 17, g: 17, b: 17, alpha: 1 }

async function quadrado(lado, nome, margem = 0.16) {
  const largura = Math.round(lado * (1 - margem * 2))
  const marca = await sharp(LOGO).resize({ width: largura }).toBuffer()
  const { height } = await sharp(marca).metadata()

  await sharp({ create: { width: lado, height: lado, channels: 4, background: TINTA } })
    .composite([{ input: marca, top: Math.round((lado - height) / 2), left: Math.round(lado * margem) }])
    .png()
    .toFile(`${DESTINO}/${nome}`)

  console.log(`  ✓ ${nome} (${lado}×${lado})`)
}

await quadrado(192, 'icone-192.png')
await quadrado(512, 'icone-512.png')
await quadrado(180, 'apple-touch-icon.png', 0.12)
console.log('\nÍcones prontos.')
