/* ────────────────────────────────────────────────────────────────
   PONTO ÚNICO DE ENTRADA DO MOTOR.

   Os ecrãs só falam com este ficheiro. Ele escolhe sozinho entre:
     • MODO DEMO  — dados de exemplo guardados no browser (sem configuração)
     • MODO REAL  — Supabase (base de dados + contas verdadeiras)

   Trocar de um para o outro é só preencher o ficheiro .env.
   Nenhum ecrã precisa de mudar uma linha.
   ──────────────────────────────────────────────────────────────── */

import { IS_DEMO } from './config'
import demo from './demoApi'
import real from './supabaseApi'

const engine = IS_DEMO ? demo : real

export const auth = engine.auth
export const data = engine.data
export const isDemo = IS_DEMO
export const resetDemoData = demo.resetDemoData

export default { auth, data, isDemo, resetDemoData }
