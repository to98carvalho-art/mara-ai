/**
 * Generates PWA icons from the SVG favicon.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')

// Read the SVG
const svgPath = join(publicDir, 'favicon.svg')
const svgBuffer = readFileSync(svgPath)

// We'll create a 512x512 canvas with dark background + centered icon
async function makeIcon(size, outFile) {
  // Resize SVG to 60% of icon size, centered on dark background
  const iconSize = Math.round(size * 0.62)
  const padding = Math.round((size - iconSize) / 2)

  const iconBuffer = await sharp(svgBuffer)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // Create background
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 10, g: 7, b: 23, alpha: 1 }, // #0A0717
    }
  })
    .composite([{ input: iconBuffer, top: padding, left: padding }])
    .png()
    .toFile(join(publicDir, outFile))

  console.log(`✓ ${outFile} (${size}×${size})`)
}

await makeIcon(512, 'icon-512.png')
await makeIcon(192, 'icon-192.png')
await makeIcon(180, 'apple-touch-icon.png')

console.log('\nAll icons generated!')
