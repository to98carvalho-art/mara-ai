import { useEffect, useState, useCallback } from 'react'
import Topo from './componentes/Topo'
import JanelaAula from './componentes/JanelaAula'
import Geral from './vistas/Geral'
import Atividades from './vistas/Atividades'
import MainStage from './vistas/MainStage'
import Privados from './vistas/Privados'
import Bilhetes from './vistas/Bilhetes'
import After from './vistas/After'
import { utilizadorAtual } from './lib/sessao'
import { todasAsAulas, quantasInscricoes, inscrever, anular } from './lib/inscricoes'

export default function App() {
  const [pagina, setPagina] = useState('geral')
  const [utilizador, setUtilizador] = useState(() => utilizadorAtual())
  const [aulas, setAulas] = useState(() => todasAsAulas())
  const [minhas, setMinhas] = useState(() => quantasInscricoes())
  const [aulaAberta, setAulaAberta] = useState(null)

  const recarregar = useCallback(() => {
    setAulas(todasAsAulas())
    setMinhas(quantasInscricoes())
  }, [])

  const irPara = useCallback(destino => {
    setPagina(destino)
    setAulaAberta(null)
    window.scrollTo(0, 0)
  }, [])

  // Mantém a janela aberta a par das vagas depois de cada mudança.
  const aula = aulaAberta ? aulas.find(a => a.id === aulaAberta) : null

  useEffect(() => {
    document.title = pagina === 'geral' ? '7WONDERS' : `7WONDERS · ${pagina}`
  }, [pagina])

  return (
    <div className="app">
      <Topo pagina={pagina} aoMudar={irPara} />

      {pagina === 'geral'  && <Geral aoMudar={irPara} />}
      {pagina === 'ativ'   && (
        <Atividades aulas={aulas} quantasMinhas={minhas} aoAbrir={setAulaAberta} />
      )}
      {pagina === 'stage'  && <MainStage aoMudar={irPara} />}
      {pagina === 'priv'   && <Privados />}
      {pagina === 'bilh'   && <Bilhetes aoMudar={irPara} />}
      {pagina === 'after'  && <After />}

      {aula && (
        <JanelaAula
          aula={aula}
          utilizador={utilizador}
          aoEntrar={setUtilizador}
          aoInscrever={async id => { await inscrever(id); recarregar() }}
          aoAnular={async id => { await anular(id); recarregar() }}
          aoFechar={() => setAulaAberta(null)}
        />
      )}
    </div>
  )
}
