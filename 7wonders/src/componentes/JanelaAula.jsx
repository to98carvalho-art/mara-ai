import { useState, useRef } from 'react'
import Janela from './Janela'
import { EVENTO, AULAS_LOCAL } from '../content/evento'
import { prepararComprovativo, enviarComprovativo, TIPOS_ACEITES } from '../lib/comprovativo'
import { estaEmModoServidor } from '../lib/inscricoes'

/* ────────────────────────────────────────────────────────────────
   A janela de uma aula.

   Quem ainda não se identificou preenche nome, telemóvel, email e
   anexa o bilhete — um print serve, ou o PDF da bilheteira. O
   bilhete é lido na hora: quase sempre a inscrição sai confirmada
   antes de a pessoa fechar o telemóvel, e o passe segue por email.

   Quando a leitura fica em dúvida, a vaga fica na mesma reservada e
   alguém da equipa confirma depois. Vale mais dar trabalho à equipa
   do que recusar por engano quem pagou bilhete.

   Quem já se inscreveu antes neste telemóvel salta o formulário.
   ──────────────────────────────────────────────────────────────── */

export default function JanelaAula({ aula, utilizador, aoInscrever, aoAnular, aoFechar }) {
  const precisaIdentificar = !aula.soInformacao && !utilizador

  const [nome, setNome] = useState(utilizador?.nome || '')
  const [telefone, setTelefone] = useState(utilizador?.phone || '')
  const [email, setEmail] = useState(utilizador?.email || '')
  const [ficheiro, setFicheiro] = useState(null)
  const [antevisao, setAntevisao] = useState(null)
  const [erro, setErro] = useState('')
  const [passo, setPasso] = useState('')          // o que está a acontecer
  const [resultado, setResultado] = useState(null)   // como correu o bilhete
  const escolher = useRef(null)

  const ocupado = Boolean(passo)
  const completo = precisaIdentificar
    ? nome.trim() && telefone.trim() && email.trim() && ficheiro
    : true

  function escolherFicheiro(evento) {
    const f = evento.target.files?.[0]
    setErro('')
    if (!f) return
    setFicheiro(f)
    setAntevisao(f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  async function submeter(evento) {
    evento?.preventDefault()
    if (ocupado) return
    setErro('')

    try {
      let comprovativo = null
      let impressao = null

      // Sem base de dados não há onde guardar o ficheiro. Em
      // desenvolvimento a inscrição segue à mesma, para o ecrã poder
      // ser percorrido de ponta a ponta.
      if (ficheiro && estaEmModoServidor()) {
        setPasso('A preparar o bilhete…')
        const preparado = await prepararComprovativo(ficheiro)
        impressao = preparado.impressao
        setPasso('A enviar o bilhete…')
        comprovativo = await enviarComprovativo(preparado)
      }

      setPasso(comprovativo ? 'A confirmar o bilhete…' : 'A guardar a inscrição…')
      setResultado(await aoInscrever(aula.id, {
        nome: nome.trim(), telefone: telefone.trim(), email: email.trim(),
        comprovativo, impressao,
      }))
    } catch (e) {
      setErro(e.mensagem || 'Não foi possível concluir. Tenta outra vez.')
    } finally {
      setPasso('')
    }
  }

  async function anular() {
    setErro(''); setPasso('A anular…')
    try {
      await aoAnular(aula.id)
    } catch (e) {
      setErro(e.mensagem || 'Não foi possível anular.')
    } finally {
      setPasso('')
    }
  }

  const horaPorExtenso = aula.hora.replace(' — ', ' às ')

  return (
    <Janela sobrancelha={aula.zona} titulo={aula.nome} aoFechar={aoFechar}>

      <div className="janela__factos">
        <div className="facto">
          <span className="facto__nome">DIA</span>
          <span className="facto__valor">{EVENTO.data}</span>
        </div>
        <div className="facto">
          <span className="facto__nome">HORA</span>
          <span className="facto__valor">{aula.hora}</span>
        </div>
        {aula.precos
          ? aula.precos.map(([etiqueta, valor]) => (
              <div className="facto" key={etiqueta}>
                <span className="facto__nome">{etiqueta}</span>
                <span className="facto__valor">{valor}</span>
              </div>
            ))
          : (
            <div className="facto">
              <span className="facto__nome">{aula.preco ? 'PREÇO' : 'LOCAL'}</span>
              <span className="facto__valor">{aula.preco || AULAS_LOCAL}</span>
            </div>
          )}
      </div>

      {/* ── só informação ── */}
      {aula.soInformacao && (
        <>
          <p className="corpo" style={{ marginTop: 16 }}>
            {(aula.nota || '').replace('{HORA}', horaPorExtenso)}
          </p>
          <button className="botao botao--largo" style={{ marginTop: 20, background: '#111', color: '#FBF7EB' }}
                  onClick={aoFechar}>
            ENTENDIDO
          </button>
        </>
      )}

      {/* ── já inscrito ── */}
      {!aula.soInformacao && aula.inscrito && (
        <>
          <p className="corpo" style={{ marginTop: 16 }}>
            Estás inscrito. Chega 10 minutos antes.
          </p>

          {resultado?.estado === 'valido' && (
            <p className="aviso aviso--bom" style={{ marginTop: 12 }}>
              Bilhete confirmado.
              {resultado.passeEnviado
                ? ` Enviámos o passe para ${resultado.email}.`
                : ''}
            </p>
          )}

          {resultado?.estado === 'por_validar' && (
            <p className="aviso aviso--nota" style={{ marginTop: 12 }}>
              A tua vaga está guardada. Ficámos com uma dúvida no bilhete —
              alguém confirma e avisamos-te.
            </p>
          )}
          {erro && <p className="aviso aviso--erro" style={{ marginTop: 12 }}>{erro}</p>}
          <button className="botao botao--recuo botao--largo" style={{ marginTop: 20 }}
                  disabled={ocupado} onClick={anular}>
            {ocupado ? passo.toUpperCase() : 'ANULAR INSCRIÇÃO'}
          </button>
        </>
      )}

      {/* ── esgotada ── */}
      {!aula.soInformacao && !aula.inscrito && aula.esgotado && (
        <>
          <p className="corpo" style={{ marginTop: 16 }}>Esta aula já não tem vagas.</p>
          <button className="botao botao--morto botao--largo" style={{ marginTop: 20 }} disabled>
            SEM VAGAS
          </button>
        </>
      )}

      {/* ── inscrever ── */}
      {!aula.soInformacao && !aula.inscrito && !aula.esgotado && (
        <form className="pilha" style={{ marginTop: 16 }} onSubmit={submeter}>

          {aula.livres != null && aula.livres <= 10 && (
            <span className="pilula pilula--taupe" style={{ alignSelf: 'flex-start' }}>
              APENAS {aula.livres} {aula.livres === 1 ? 'VAGA LIVRE' : 'VAGAS LIVRES'}
            </span>
          )}

          <p className="corpo">
            {precisaIdentificar
              ? 'As aulas são gratuitas para quem tem bilhete. Deixa os teus dados e anexa o bilhete — um print serve. Confirmamos na hora.'
              : 'Inscrição gratuita com bilhete.'}
          </p>

          {precisaIdentificar && (
            <>
              <div className="campo">
                <label className="campo__nome" htmlFor="nome">NOME</label>
                <input id="nome" type="text" autoComplete="name" placeholder="Marta Ribeiro"
                       value={nome} onChange={e => setNome(e.target.value)} required />
              </div>

              <div className="campo">
                <label className="campo__nome" htmlFor="telefone">TELEMÓVEL</label>
                <input id="telefone" type="tel" inputMode="tel" autoComplete="tel" placeholder="912 345 678"
                       value={telefone} onChange={e => setTelefone(e.target.value)} required />
              </div>

              <div className="campo">
                <label className="campo__nome" htmlFor="email">EMAIL</label>
                <input id="email" type="email" inputMode="email" autoComplete="email"
                       placeholder="marta@email.com"
                       value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="campo">
                <span className="campo__nome">O TEU BILHETE</span>

                <input ref={escolher} type="file" accept={TIPOS_ACEITES}
                       onChange={escolherFicheiro} hidden />

                {ficheiro ? (
                  <div className="anexo">
                    {antevisao
                      ? <img className="anexo__imagem" src={antevisao} alt="O bilhete que anexaste" />
                      : <span className="anexo__pdf" aria-hidden="true">PDF</span>}
                    <span className="anexo__nome">{ficheiro.name}</span>
                    <button type="button" className="anexo__trocar" onClick={() => escolher.current?.click()}>
                      Trocar
                    </button>
                  </div>
                ) : (
                  <button type="button" className="anexo anexo--vazio" onClick={() => escolher.current?.click()}>
                    <span className="anexo__mais" aria-hidden="true">＋</span>
                    <span>
                      <strong>Anexar bilhete</strong>
                      <small>Um print do telemóvel ou o PDF da bilheteira</small>
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          {erro && <p className="aviso aviso--erro">{erro}</p>}

          <button className="botao botao--verde botao--largo" disabled={ocupado || !completo}>
            {ocupado ? passo.toUpperCase() : 'INSCREVER-ME'}
          </button>

          {precisaIdentificar && (
            <p className="rodape-nota">
              O bilhete é lido automaticamente e o passe segue para o teu email.
              Se ficar alguma dúvida, a organização confirma e avisa-te.
            </p>
          )}
        </form>
      )}
    </Janela>
  )
}
