import { useEffect, useState, useCallback } from 'react'
import {
  entrarNaEquipa, listarInscricoes, listarPorAula, listarAfter,
  decidir, descarregarCsv, fichaDaEquipa, sairDaEquipa,
} from '../lib/equipa'

/* ────────────────────────────────────────────────────────────────
   A ÁREA DA EQUIPA

   Chega-se por /#equipa — fora das seis vistas do evento, para
   nenhum participante lá cair por engano. Três separadores:

     REVER    o que a leitura automática não quis decidir sozinha.
              É a excepção: quase tudo é decidido na hora.
     AULAS    quem está inscrito em cada aula. A lista para levar
              para o recinto.
     AFTER    as candidaturas à After Party.

   Todas as listas se descarregam em folha. No dia, a rede do
   recinto não é de confiar, e uma folha no telemóvel abre sem rede.
   ──────────────────────────────────────────────────────────────── */

const SEPARADORES = [
  ['rever', 'Rever'],
  ['aulas', 'Aulas'],
  ['after', 'After Party'],
]

const ESTADOS = {
  por_validar: 'Por validar',
  valido: 'Validados',
  recusado: 'Recusados',
}

const quando = iso => new Date(iso).toLocaleString('pt-PT', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
})

const semAcentos = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
const nomeDeFicheiro = t => semAcentos(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function Equipa() {
  const [dentro, setDentro] = useState(() => Boolean(fichaDaEquipa()))
  const [palavra, setPalavra] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const [separador, setSeparador] = useState('rever')
  const [aCarregar, setACarregar] = useState(false)

  const [filtro, setFiltro] = useState('por_validar')
  const [inscricoes, setInscricoes] = useState([])
  const [contagem, setContagem] = useState({})
  const [aDecidir, setADecidir] = useState(null)

  const [listas, setListas] = useState([])
  const [candidaturas, setCandidaturas] = useState([])

  const cair = useCallback(e => {
    if (e.codigo === 'SESSAO_INVALIDA') { sairDaEquipa(); setDentro(false) }
    setErro(e.mensagem)
  }, [])

  const recarregar = useCallback(async () => {
    setACarregar(true); setErro('')
    try {
      if (separador === 'rever') {
        const d = await listarInscricoes(filtro)
        setInscricoes(d.inscricoes); setContagem(d.contagem)
      } else if (separador === 'aulas') {
        setListas((await listarPorAula()).listas)
      } else {
        setCandidaturas((await listarAfter()).candidaturas)
      }
    } catch (e) { cair(e) } finally { setACarregar(false) }
  }, [separador, filtro, cair])

  useEffect(() => { if (dentro) recarregar() }, [dentro, recarregar])

  async function entrar(evento) {
    evento.preventDefault()
    setOcupado(true); setErro('')
    try { await entrarNaEquipa(palavra); setDentro(true) }
    catch (e) { setErro(e.mensagem) } finally { setOcupado(false) }
  }

  async function marcar(id, estado) {
    setADecidir(id); setErro('')
    try {
      const pessoa = inscricoes.find(i => i.id === id)?.telefone
      await decidir(id, estado)
      // A decisão vale para a pessoa, não para uma aula só.
      setInscricoes(l => l.filter(i => (pessoa ? i.telefone !== pessoa : i.id !== id)))
      setContagem(c => ({
        ...c,
        [filtro]: Math.max(0, (c[filtro] || 1) - 1),
        [estado]: (c[estado] || 0) + 1,
      }))
    } catch (e) { cair(e) } finally { setADecidir(null) }
  }

  /* ── porta ── */
  if (!dentro) {
    return (
      <div className="escuro">
        <main className="vista" style={{ maxWidth: 420 }}>
          <p className="sobrancelha">ÁREA DA ORGANIZAÇÃO</p>
          <h1 className="titulo" style={{ margin: '10px 0 12px' }}>Listas e entradas</h1>
          <p className="corpo" style={{ marginBottom: 20 }}>
            As entradas são conferidas sozinhas. Aqui ficam as listas e o que sobrou em dúvida.
          </p>
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

  return (
    <div className="escuro">
      <main className="vista">
        <div className="linha-titulo">
          <span className="sobrancelha">ORGANIZAÇÃO</span>
          <span className="regua" />
          <button className="pilula pilula--tracejada"
                  onClick={() => { sairDaEquipa(); setDentro(false) }}>SAIR</button>
        </div>

        <div className="chiprow" style={{ marginBottom: 18 }}>
          {SEPARADORES.map(([id, etiqueta]) => (
            <button key={id}
                    className={`pilula ${separador === id ? 'pilula--creme' : 'pilula--contorno'}`}
                    onClick={() => setSeparador(id)}>
              {etiqueta}
            </button>
          ))}
        </div>

        {erro && <p className="aviso aviso--erro" style={{ marginBottom: 16 }}>{erro}</p>}
        {aCarregar && <p className="corpo">A carregar…</p>}

        {!aCarregar && separador === 'rever' && (
          <Rever {...{ filtro, setFiltro, inscricoes, contagem, marcar, aDecidir }} />
        )}
        {!aCarregar && separador === 'aulas' && <Aulas listas={listas} />}
        {!aCarregar && separador === 'after' && <After candidaturas={candidaturas} />}
      </main>
    </div>
  )
}

/* ════════ rever, uma a uma ════════ */

function Rever({ filtro, setFiltro, inscricoes, contagem, marcar, aDecidir }) {
  return (
    <>
      <div className="chiprow" style={{ marginBottom: 20 }}>
        {Object.entries(ESTADOS).map(([estado, etiqueta]) => (
          <button key={estado}
                  className={`pilula ${filtro === estado ? 'pilula--creme' : 'pilula--contorno'}`}
                  onClick={() => setFiltro(estado)}>
            {etiqueta} {contagem[estado] ? `· ${contagem[estado]}` : ''}
          </button>
        ))}
      </div>

      {inscricoes.length === 0 ? (
        <p className="corpo">
          {filtro === 'por_validar'
            ? 'Não há nada à espera. As entradas estão a ser conferidas sozinhas. 👌'
            : 'Nada nesta lista.'}
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
                          <img src={i.comprovativo} alt={`Entrada de ${i.nome}`} />
                        </a>)
                  : <span className="revisao__sem-foto">sem comprovativo</span>}
              </div>

              <div className="revisao__dados">
                <h2 className="revisao__nome">{i.nome || 'sem nome'}</h2>
                <p className="revisao__linha">{i.aula}</p>
                <p className="revisao__linha suave">
                  <a href={`tel:${i.telefone}`}>{i.telefone}</a> · {quando(i.quando)}
                </p>
                {i.email && <p className="revisao__linha suave">{i.email}</p>}
                {i.nota && (
                  <p className="revisao__linha suave">{i.automatico ? '🤖 ' : ''}{i.nota}</p>
                )}
                {i.repetido && (
                  <p className="revisao__aviso">⚠️ Este ficheiro já foi usado noutra inscrição</p>
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
                            onClick={() => marcar(i.id, 'recusado')}>RECUSAR</button>
                  )}
                  {i.estado !== 'por_validar' && (
                    <button className="botao botao--linha" disabled={aDecidir === i.id}
                            onClick={() => marcar(i.id, 'por_validar')}>VOLTAR A PÔR NA FILA</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

/* ════════ a lista de cada aula ════════ */

const COLUNAS_AULA = [
  { titulo: 'Nome', ler: p => p.nome },
  { titulo: 'Telemóvel', ler: p => p.telefone },
  { titulo: 'Email', ler: p => p.email },
  { titulo: 'Estado', ler: p => (p.estado === 'valido' ? 'confirmado' : 'por validar') },
  { titulo: 'Inscreveu-se', ler: p => quando(p.quando) },
]

function Aulas({ listas }) {
  const comGente = listas.filter(a => a.pessoas.length > 0)
  const vazias = listas.filter(a => a.pessoas.length === 0)
  const total = comGente.reduce((n, a) => n + a.pessoas.length, 0)

  function tudo() {
    const linhas = comGente.flatMap(a => a.pessoas.map(p => ({ ...p, aula: a.nome })))
    descarregarCsv('7wonders-inscricoes.csv',
      [{ titulo: 'Aula', ler: p => p.aula }, ...COLUNAS_AULA], linhas)
  }

  if (!listas.length) return <p className="corpo">Ainda não há aulas na base de dados.</p>

  return (
    <>
      <div className="linha-lista">
        <p className="corpo" style={{ margin: 0 }}>
          <strong>{total}</strong> {total === 1 ? 'inscrição' : 'inscrições'} em{' '}
          {comGente.length} {comGente.length === 1 ? 'aula' : 'aulas'}
        </p>
        {total > 0 && (
          <button className="botao botao--creme" onClick={tudo}>DESCARREGAR TUDO</button>
        )}
      </div>

      <div className="pilha pilha--larga" style={{ marginTop: 18 }}>
        {comGente.map(aula => (
          <section className="lista" key={aula.id}>
            <header className="lista__topo">
              <div>
                <h2 className="lista__nome">{aula.nome}</h2>
                <p className="lista__conta">
                  {aula.pessoas.length}
                  {aula.lugares ? ` de ${aula.lugares} lugares` : ' inscritos · sem limite'}
                </p>
              </div>
              <button className="botao botao--linha"
                      onClick={() => descarregarCsv(
                        `7wonders-${nomeDeFicheiro(aula.nome)}.csv`, COLUNAS_AULA, aula.pessoas)}>
                CSV
              </button>
            </header>

            <table className="tabela">
              <thead>
                <tr><th>Nome</th><th>Telemóvel</th><th>Email</th></tr>
              </thead>
              <tbody>
                {aula.pessoas.map((p, n) => (
                  <tr key={`${p.telefone}-${n}`}>
                    <td>
                      <span className="tabela__nome">
                        <span className={`ponto ${p.estado === 'valido' ? 'ponto--bom' : ''}`}
                              title={p.estado === 'valido' ? 'Entrada confirmada' : 'Por validar'}>●</span>
                        {p.nome || '—'}
                      </span>
                    </td>
                    <td><a href={`tel:${p.telefone}`}>{p.telefone}</a></td>
                    <td className="suave">{p.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        {vazias.length > 0 && (
          <p className="corpo suave">
            Ainda sem ninguém: {vazias.map(a => a.nome).join(' · ')}
          </p>
        )}
      </div>
    </>
  )
}

/* ════════ After Party ════════ */

const COLUNAS_AFTER = [
  { titulo: 'Nome', ler: c => `${c.nome} ${c.apelido}` },
  { titulo: 'Telemóvel', ler: c => c.telefone },
  { titulo: 'Email', ler: c => c.email },
  { titulo: 'Estado', ler: c => c.estado },
  { titulo: 'Razões', ler: c => c.razoes },
  { titulo: 'Candidatou-se', ler: c => quando(c.criado_em) },
]

function After({ candidaturas }) {
  if (!candidaturas.length) return <p className="corpo">Ainda não há candidaturas à After Party.</p>

  return (
    <>
      <div className="linha-lista">
        <p className="corpo" style={{ margin: 0 }}>
          <strong>{candidaturas.length}</strong>{' '}
          {candidaturas.length === 1 ? 'candidatura' : 'candidaturas'}
        </p>
        <button className="botao botao--creme"
                onClick={() => descarregarCsv('7wonders-after-party.csv', COLUNAS_AFTER, candidaturas)}>
          DESCARREGAR
        </button>
      </div>

      <div className="pilha pilha--larga" style={{ marginTop: 18 }}>
        {candidaturas.map(c => (
          <article className="lista" key={c.id}>
            <header className="lista__topo">
              <div>
                <h2 className="lista__nome">{c.nome} {c.apelido}</h2>
                <p className="lista__conta">
                  <a href={`tel:${c.telefone}`}>{c.telefone}</a> · {c.email} · {quando(c.criado_em)}
                </p>
              </div>
              <span className={`pilula ${c.estado === 'aceite' ? 'pilula--creme' : 'pilula--contorno'}`}>
                {c.estado}
              </span>
            </header>
            <p className="lista__razoes">{c.razoes}</p>
          </article>
        ))}
      </div>
    </>
  )
}
