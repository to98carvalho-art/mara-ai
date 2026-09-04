import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

/* ────────────────────────────────────────────────────────────────
   Em produção a Vercel transforma cada ficheiro de api/ numa função
   de servidor. Em desenvolvimento isso não acontece, e o site ficaria
   sem servidor nenhum para falar com a 3cket.

   Este plugin monta as mesmas funções no servidor de desenvolvimento,
   para o fluxo de entrada funcionar de ponta a ponta na mesma máquina.
   ──────────────────────────────────────────────────────────────── */
function apiDeDesenvolvimento() {
  return {
    name: 'api-de-desenvolvimento',
    apply: 'serve',
    configureServer(server) {
      const raiz = join(process.cwd(), 'api')
      if (!existsSync(raiz)) return

      const rotas = []
      const percorrer = dir => {
        for (const entrada of readdirSync(dir, { withFileTypes: true })) {
          const caminho = join(dir, entrada.name)
          if (entrada.isDirectory()) {
            if (entrada.name !== '_lib') percorrer(caminho)
          } else if (entrada.name.endsWith('.js')) {
            const relativo = relative(raiz, caminho).replace(/\\/g, '/').replace(/\.js$/, '')
            // Como na Vercel: api/aulas/index.js responde em /api/aulas
            rotas.push({
              url: '/api/' + relativo.replace(/(^|\/)index$/, ''),
              ficheiro: caminho,
            })
          }
        }
      }
      percorrer(raiz)

      server.middlewares.use(async (req, res, next) => {
        const pedido = req.url.split('?')[0].replace(/\/$/, '')
        const rota = rotas.find(r => r.url.replace(/\/$/, '') === pedido)
        if (!rota) return next()

        const corpo = await new Promise(resolve => {
          let dados = ''
          req.on('data', pedaco => { dados += pedaco })
          req.on('end', () => { try { resolve(JSON.parse(dados || '{}')) } catch { resolve({}) } })
        })

        try {
          const modulo = await server.ssrLoadModule(rota.ficheiro)
          await modulo.default({ ...req, body: corpo, headers: req.headers, socket: req.socket }, res)
        } catch (erro) {
          server.config.logger.error(`[api] ${rota.url}: ${erro.stack || erro}`)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'DEV_HANDLER_FAILED' }))
        }
      })

      server.config.logger.info(`  ➜  API local:  ${rotas.map(r => r.url).join(', ')}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), apiDeDesenvolvimento()],
  server: { port: 5180, host: true },
})
