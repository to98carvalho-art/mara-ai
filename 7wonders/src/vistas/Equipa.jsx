import { useEffect, useState, useCallback } from 'react'
import { entrarNaEquipa, listarInscricoes, decidir, fichaDaEquipa, sairDaEquipa } from '../lib/equipa'

/* ────────────────────────────────────────────────────────────────
   A ÁREA DA EQUIPA

   Onde se conferem os bilhetes anexados. Chega-se por /#equipa —
   fora das seis vistas do evento, para nenhum participante lá cair
   por engano.
   ──────────────────────────────────────────────────────────────── */

const ETIQUETAS = {
  por_validar: 'Por validar',
  valido: 'Validados',
  recusado: 'Recusados',
}

function quandoPorExtenso(iso) {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export default function Equipa() {
  const [dentro, setDentro] = useState(() => Boolean(fichaDaEquipa()))
  const [palavra, setPalavra] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const [filtro, setFiltro] = useState('por_validar')
  const [inscricoes, setInscricoes] = useState([])
  const [contagem, setContagem] = useState({})
  const [aCarregar, setACarregar] = useState(false)
  const [aDecidir, setADecidir] = useState(null)

  const recarregar = useCallback(async estado => {
    setACarregar(true); setErro('')
    try {
      const dados = await listarInscricoes(estado)
      setInscricoes(dados.inscricoes)
      setContagem(dados.contagem)
    } catch (e) {
      if (e.codigo === 'SESSAO_INVALIDA') { sairDaEquipa(); setDentro(false) }
      setErro(e.mensagem)
    } finally {
      setACarregar(false)
    }
  }, [])

  useEffect(() => { if (dentro) recarregar(filtro) }, [dentro, filtro, recarregar])

  async function entrar(evento) {
    evento.preventDefault()
    setOcupado(true); setErro('')
    try {
      await entrarNaEquipa(palavra)
      setDentro(true)
    } catch (e) {
      setErro(e.mensagem)
    } finally {
      setOcupado(false)
    }
  }

  async function marcar(id, estado) {
    setADecidir(id); setErro('')
    try {
      await decidir(id, estado)
      setInscricoes(lista => lista.filter(i => i.id !== id))
      setContagem(c => ({ ...c, [filtro]: Math.max(0, (c[filtro] || 1) - 1), [estado]: (c[estado] || 0) + 1 }))
    } catch (e) {
      setErro(e.mensagem)
    } finally {
      setADecidir(null)
    }
  }

  /* ── porta ── */
  if (!dentro) {
    return (
      <div className="escuro">
        <main className="vista" style={{ maxWidth: 420 }}>
          <p className="sobrancelha">ÁREA DA ORGANIZAÇÃO</p>
          <h1 className="titulo" style={{ margin: '10px 0 20px' }}>Conferir bilhetes</h1>
          <form className="pilha" onSubmit={entrar}>
            <div className="campo">
              <label className="campo__nome" htmlFor="palavra">PALAVRA-PASSE</label>
              <input id="palavra" type="password" autoComplete="current-password"
                     value={palavra} onChange={e => setPalavra(e.target.value)} required autoFocus />
            </div>
            {erro && <p className="aviso aviso--erro">{erro}</p>}
            <button className="botao botao--creme botao--largo" disabled={ocupado || !palavra}>
              {ocupado ? 'A ENTRAR…' : 'ENTRAR'}
            </button>
          </form>
        </main>
      </div>
    )
  }

  /* ── lista ── */
  return (
    <div className="escuro">
      <main className="vista">
        <div className="linha-titulo">
          <span className="sobrancelha">ORGANIZAÇÃO · CONFERIR BILHETES</span>
          <span className="regua" />
          <button className="pilula pilula--tracejada" onClick={() => { sairDaEquipa(); setDentro(false) }}>
            SAIR
          </button>
        </div>

        <div className="chiprow" style={{ marginBottom: 20 }}>
          {Object.entries(ETIQUETAS).map(([estado, etiqueta]) => (
            <button key={estado}
                    className={`pilula ${filtro === estado ? 'pilula--creme' : 'pilula--contorno'}`}
                    onClick={() => setFiltro(estado)}>
              {etiqueta} {contagem[estado] ? `· ${contagem[estado]}` : ''}
            </button>
          ))}
        </div>

        {erro && <p className="aviso aviso--erro" style={{ marginBottom: 16 }}>{erro}</p>}

        {aCarregar ? (
          <p className="corpo">A carregar…</p>
        ) : inscricoes.length === 0 ? (
          <p className="corpo">
            {filtro === 'por_validar' ? 'Não há nada à espera. 👌' : 'Nada nesta lista.'}
          </p>
        ) : (
          <div className="pilha pilha--larga">
            {inscricoes.map(i => (
              <article className="revisao" key={i.id}>
                <div className="revisao__foto">
                  {i.comprovativo
                    ? (i.ehPdf
                        ? <a className="revisao__pdf" href={i.comprovativo} target="_blank" rel="noopener">Abrir PDF</a>
                        : <a href={i.comprovativo} target="_blank" rel="noopener">
                            <img src={i.comprovativo} alt={`Bilhete de ${i.nome}`} />
                          </a>)
                    : <span className="revisao__sem-foto">sem comprovativo</span>}
                </div>

                <div className="revisao__dados">
                  <h2 className="revisao__nome">{i.nome || 'sem nome'}</h2>
                  <p className="revisao__linha">{i.aula}</p>
                  <p className="revisao__linha suave">
                    <a href={`tel:${i.telefone}`}>{i.telefone}</a> · {quandoPorExtenso(i.quando)}
                  </p>

                  {i.repetido && (
                    <p className="revisao__aviso">⚠️ Este bilhete já foi usado noutra inscrição</p>
                  )}

                  <div className="revisao__accoes">
                    {i.estado !== 'valido' && (
                      <button className="botao botao--creme" disabled={aDecidir === i.id}
                              onClick={() => marcar(i.id, 'valido')}>
                        {aDecidir === i.id ? '…' : 'VALIDAR'}
                      </button>
                    )}
                    {i.estado !== 'recusado' && (
                      <button className="botao botao--linha" disabled={aDecidir === i.id}
                              onClick={() => marcar(i.id, 'recusado')}>
                        RECUSAR
                      </button>
                    )}
                    {i.estado !== 'por_validar' && (
                      <button className="botao botao--linha" disabled={aDecidir === i.id}
                              onClick={() => marcar(i.id, 'por_validar')}>
                        VOLTAR A PÔR NA FILA
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
