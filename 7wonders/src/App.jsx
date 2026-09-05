import { useEffect, useState, useCallback } from 'react'
import Topo from './componentes/Topo'
import JanelaAula from './componentes/JanelaAula'
import Geral from './vistas/Geral'
import Atividades from './vistas/Atividades'
import MainStage from './vistas/MainStage'
import Privados from './vistas/Privados'
import Bilhetes from './vistas/Bilhetes'
import After from './vistas/After'
import Equipa from './vistas/Equipa'
import { NAV } from './content/evento'
import { utilizadorAtual } from './lib/sessao'
import { carregar, listar, inscrever, anular } from './lib/inscricoes'

/* A área da equipa vive fora das seis vistas do evento: chega-se por
   /#equipa. Assim nenhum participante lá cai por engano, e a equipa
   guarda o endereço nos favoritos. */
function usarEndereco() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const ouvir = () => setHash(window.location.hash)
    window.addEventListener('hashchange', ouvir)
    return () => window.removeEventListener('hashchange', ouvir)
  }, [])
  return hash
}

export default function App() {
  const hash = usarEndereco()
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

  const irPara = useCallback(destino => {
    setPagina(destino)
    setAulaAberta(null)
    window.scrollTo(0, 0)
  }, [])

  const aula = aulaAberta ? aulas.find(a => a.id === aulaAberta) : null
  const minhas = aulas.filter(a => a.inscrito).length

  useEffect(() => {
    const nome = NAV.find(n => n.id === pagina)?.etiqueta
    document.title = pagina === 'geral'
      ? '7WONDERS · 12 setembro · Club de Golf de Braga'
      : `${nome} · 7WONDERS`
  }, [pagina])

  if (hash === '#equipa') {
    return <div className="app"><Equipa /></div>
  }

  return (
    <div className="app">
      <Topo pagina={pagina} aoMudar={irPara} />

      {/* A chave muda a cada secção: o React remonta, e a animação de
          entrada recomeça em vez de ficar presa da primeira vez. */}
      <div key={pagina} style={{ display: 'contents' }}>
        {pagina === 'geral' && <Geral aoMudar={irPara} />}
        {pagina === 'ativ'  && <Atividades aulas={aulas} quantasMinhas={minhas} aoAbrir={setAulaAberta} />}
        {pagina === 'stage' && <MainStage aoMudar={irPara} />}
        {pagina === 'priv'  && <Privados />}
        {pagina === 'bilh'  && <Bilhetes aoMudar={irPara} />}
        {pagina === 'after' && <After />}
      </div>

      {aula && (
        <JanelaAula
          aula={aula}
          utilizador={utilizador}
          aoInscrever={async (id, dados) => {
            const { aulas: novas, resultado } = await inscrever(id, dados)
            setAulas(novas)
            setUtilizador(utilizadorAtual())
            return resultado
          }}
          aoAnular={async id => setAulas(await anular(id))}
          aoFechar={() => setAulaAberta(null)}
        />
      )}
    </div>
  )
}
