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
import { carregar, listar, inscrever, anular } from './lib/inscricoes'

export default function App() {
  const [pagina, setPagina] = useState('geral')
  const [utilizador, setUtilizador] = useState(() => utilizadorAtual())
  const [aulas, setAulas] = useState(() => listar())
  const [aulaAberta, setAulaAberta] = useState(null)

  // Primeira leitura das vagas. Se o servidor não responder, o
  // horário abre na mesma com a contagem local.
  useEffect(() => {
    let vivo = true
    carregar().then(lista => { if (vivo) setAulas(lista) })
    return () => { vivo = false }
  }, [])

  // Quem acaba de confirmar o número pode já ter inscrições feitas
  // noutro dispositivo — vale a pena voltar a ler.
  const entrou = useCallback(async pessoa => {
    setUtilizador(pessoa)
    setAulas(await carregar())
  }, [])

  const irPara = useCallback(destino => {
    setPagina(destino)
    setAulaAberta(null)
    window.scrollTo(0, 0)
  }, [])

  const aula = aulaAberta ? aulas.find(a => a.id === aulaAberta) : null
  const minhas = aulas.filter(a => a.inscrito).length

  useEffect(() => {
    document.title = pagina === 'geral' ? '7WONDERS' : `7WONDERS · ${pagina}`
  }, [pagina])

  return (
    <div className="app">
      <Topo pagina={pagina} aoMudar={irPara} />

      {pagina === 'geral' && <Geral aoMudar={irPara} />}
      {pagina === 'ativ'  && <Atividades aulas={aulas} quantasMinhas={minhas} aoAbrir={setAulaAberta} />}
      {pagina === 'stage' && <MainStage aoMudar={irPara} />}
      {pagina === 'priv'  && <Privados />}
      {pagina === 'bilh'  && <Bilhetes aoMudar={irPara} />}
      {pagina === 'after' && <After />}

      {aula && (
        <JanelaAula
          aula={aula}
          utilizador={utilizador}
          aoEntrar={entrou}
          aoInscrever={async id => setAulas(await inscrever(id))}
          aoAnular={async id => setAulas(await anular(id))}
          aoFechar={() => setAulaAberta(null)}
        />
      )}
    </div>
  )
}
