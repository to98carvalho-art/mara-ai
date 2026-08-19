import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import { applyTokens } from './design/tokens'
import './styles.css'

applyTokens()

/* Em páginas servidas a partir de um endereço fixo (pré-visualizações,
   ficheiro único) as rotas vivem depois do #. Em produção são normais. */
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
