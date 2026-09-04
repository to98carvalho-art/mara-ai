/* Constrói a plataforma num único ficheiro HTML, para poder ser
   partilhada como uma página só (sem servidor, sem ficheiros à parte).
   Uso:  VITE_ROUTER=hash npx vite build && node scripts/pre-visualizacao.mjs
*/
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
const assets = readdirSync(join(dist, 'assets'))
const js = assets.find(f => f.endsWith('.js'))
const css = assets.find(f => f.endsWith('.css'))

const code = readFileSync(join(dist, 'assets', js), 'utf8')
const styles = readFileSync(join(dist, 'assets', css), 'utf8')
const title = (readFileSync(join(dist, 'index.html'), 'utf8').match(/<title>(.*?)<\/title>/) || [])[1]
  || 'Horário do Evento'

const out = `<title>${title}</title>
<style>
${styles}
/* A página vive dentro de um enquadramento fixo — o corpo trata do seu próprio fundo. */
html, body { min-height: 100%; }
</style>
<div id="root"></div>
<script type="module">
${code}
</script>
`

writeFileSync(process.argv[2] || 'dist/pagina-unica.html', out)
console.log(`✓ ficheiro único escrito (${(out.length / 1024).toFixed(0)} kB)`)
