/* Prepara as fotografias para a web.
   Os originais vêm com 5–8 MB cada; no recinto, com a rede cheia de
   gente, isso não carrega. Aqui redimensionam-se para o tamanho a que
   são realmente mostradas e comprimem-se.

   Uso:  node scripts/preparar-imagens.mjs [pasta-de-origem]
*/
import sharp from 'sharp'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const origem = process.argv[2] || '.'
const destino = 'public/imagens'
mkdirSync(destino, { recursive: true })

/* [ficheiro de origem, nome final, largura máxima, formato] */
const TRABALHOS = [
  ['7wonders-logo.png',        'logo.png',          720,  'png'],
  ['hero-mobile.jpg',          'hero-mobile.jpg',   900,  'jpeg'],
  ['hero-tablet-8dff8ef4.jpg', 'hero.jpg',          1920, 'jpeg'],
  ['zone-vinyl.jpg',           'zone-vinyl.jpg',    1200, 'jpeg'],
  ['zone-wellness.jpg',        'zone-wellness.jpg', 1200, 'jpeg'],
  ['zone-spirit.jpg',          'zone-spirit.jpg',   1200, 'jpeg'],
  ['zone-food.jpg',            'zone-food.jpg',     1200, 'jpeg'],
  ['privados-mapa.png',        'privados-mapa.jpg', 1400, 'jpeg'],
  ['IMG_8232.PNG',             'flyer.jpg',         1200, 'jpeg'],
  ['IMG_8264.PNG',             'reelow.jpg',        600,  'jpeg'],
  ['hf_20260820_181505_2ad0a656-ffd8-448e-a1b3-f9c8bfa3ca2b.png', 'zone-art.jpg',    1200, 'jpeg'],
  ['hf_20260818_163523_ad534cd1-20e4-48cb-b551-97da4b60fab6.png', 'zone-market.jpg', 1200, 'jpeg'],
]

const kB = caminho => (statSync(caminho).size / 1024).toFixed(0)
let antes = 0, depois = 0, feitos = 0

for (const [ficheiro, nome, largura, formato] of TRABALHOS) {
  const caminho = join(origem, ficheiro)
  if (!existsSync(caminho)) {
    console.log(`  —  ${nome.padEnd(20)} (falta ${ficheiro})`)
    continue
  }

  const saida = join(destino, nome)
  const imagem = sharp(caminho).resize({ width: largura, withoutEnlargement: true })

  await (formato === 'png'
    ? imagem.png({ compressionLevel: 9, palette: true })
    : imagem.jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
  ).toFile(saida)

  antes += Number(kB(caminho)); depois += Number(kB(saida)); feitos++
  console.log(`  ✓  ${nome.padEnd(20)} ${kB(caminho).padStart(6)} kB → ${kB(saida).padStart(5)} kB`)
}

console.log(`\n${feitos} imagens · ${(antes / 1024).toFixed(1)} MB → ${(depois / 1024).toFixed(1)} MB`)
