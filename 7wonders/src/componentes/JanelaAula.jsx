import { useState } from 'react'
import Janela from './Janela'
import { EVENTO, AULAS_LOCAL } from '../content/evento'
import { pedirCodigo, validarCodigo, ErroDeEntrada } from '../lib/sessao'

/* ────────────────────────────────────────────────────────────────
   A janela de uma aula, em três passos:

     telefone  → a 3cket manda o PIN por SMS
     codigo    → o PIN confirma quem é, e que tem bilhete
     confirmar → inscrever ou anular

   Quem já entrou salta os dois primeiros passos.
   As aulas só informativas mostram apenas o passo de confirmação.
   ──────────────────────────────────────────────────────────────── */

export default function JanelaAula({ aula, utilizador, aoEntrar, aoInscrever, aoAnular, aoFechar }) {
  const precisaDeEntrar = !aula.soInformacao && !utilizador
  const [passo, setPasso] = useState(precisaDeEntrar ? 'telefone' : 'confirmar')
  const [telefone, setTelefone] = useState('')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [dica, setDica] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function enviarCodigo(evento) {
    evento.preventDefault()
    setOcupado(true); setErro(''); setDica('')
    try {
      const resposta = await pedirCodigo(telefone)
      if (resposta?.mock) setDica(`Modo de teste — o código é ${resposta.mockPin}.`)
      setPasso('codigo')
    } catch (e) {
      // Se já houver um PIN por expirar, seguimos para o passo do código:
      // a pessoa recebeu-o mesmo, não vale a pena prendê-la aqui.
      if (e instanceof ErroDeEntrada && e.codigo === 'PIN_ALREADY_SENT') {
        setDica(e.mensagem)
        setPasso('codigo')
      } else {
        setErro(e.mensagem || 'Não foi possível enviar o código.')
      }
    } finally {
      setOcupado(false)
    }
  }

  async function confirmarCodigo(evento) {
    evento.preventDefault()
    setOcupado(true); setErro('')
    try {
      const pessoa = await validarCodigo(telefone, codigo)
      aoEntrar(pessoa)
      setPasso('confirmar')
    } catch (e) {
      setErro(e.mensagem || 'Não foi possível confirmar o código.')
    } finally {
      setOcupado(false)
    }
  }

  const horaPorExtenso = aula.hora.replace(' — ', ' às ')

  return (
    <Janela sobrancelha={aula.zona} titulo={aula.nome} aoFechar={aoFechar}>

      {/* ── passo 1 · telefone ── */}
      {passo === 'telefone' && (
        <form className="pilha" onSubmit={enviarCodigo}>
          {aula.temInscricao && !aula.esgotado && aula.livres <= 10 && (
            <span className="pilula pilula--taupe">
              APENAS {aula.livres} {aula.livres === 1 ? 'VAGA LIVRE' : 'VAGAS LIVRES'}
            </span>
          )}
          <p className="corpo">
            As aulas são gratuitas para quem tem bilhete. Escreve o teu número —
            enviamos-te um código por SMS para confirmar.
          </p>
          <div className="campo">
            <label className="campo__nome" htmlFor="telefone">NÚMERO DE TELEMÓVEL</label>
            <input
              id="telefone" name="telefone" type="tel" inputMode="tel" autoComplete="tel"
              placeholder="912 345 678" value={telefone}
              onChange={e => setTelefone(e.target.value)} required autoFocus
            />
          </div>
          {erro && <p className="aviso aviso--erro">{erro}</p>}
          <button className="botao botao--verde botao--largo" disabled={ocupado || !telefone.trim()}>
            {ocupado ? 'A ENVIAR…' : 'ENVIAR CÓDIGO POR SMS'}
          </button>
        </form>
      )}

      {/* ── passo 2 · código ── */}
      {passo === 'codigo' && (
        <form className="pilha" onSubmit={confirmarCodigo}>
          <p className="corpo">Enviámos um código por SMS para <strong>{telefone}</strong>.</p>
          {dica && <p className="aviso aviso--nota">{dica}</p>}
          <div className="campo campo--codigo">
            <label className="campo__nome" htmlFor="codigo">CÓDIGO</label>
            <input
              id="codigo" name="codigo" type="text" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6} placeholder="1234" value={codigo}
              onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))} required autoFocus
            />
          </div>
          {erro && <p className="aviso aviso--erro">{erro}</p>}
          <button className="botao botao--verde botao--largo" disabled={ocupado || codigo.length < 4}>
            {ocupado ? 'A CONFIRMAR…' : 'VALIDAR CÓDIGO'}
          </button>
          <button type="button" className="discreto" onClick={() => { setPasso('telefone'); setErro('') }}>
            ← corrigir o número
          </button>
        </form>
      )}

      {/* ── passo 3 · confirmar ── */}
      {passo === 'confirmar' && (
        <>
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
              ? aula.precos.map(([nome, valor]) => (
                  <div className="facto" key={nome}>
                    <span className="facto__nome">{nome}</span>
                    <span className="facto__valor">{valor}</span>
                  </div>
                ))
              : aula.preco
                ? (
                  <div className="facto">
                    <span className="facto__nome">PREÇO</span>
                    <span className="facto__valor">{aula.preco}</span>
                  </div>
                )
                : (
                  <div className="facto">
                    <span className="facto__nome">LOCAL</span>
                    <span className="facto__valor">{AULAS_LOCAL}</span>
                  </div>
                )}
          </div>

          <p className="corpo" style={{ marginTop: 16 }}>
            {aula.soInformacao
              ? (aula.nota || '').replace('{HORA}', horaPorExtenso)
              : aula.inscrito
                ? 'Estás inscrito. Chega 10 minutos antes.'
                : aula.esgotado
                  ? 'Esta aula já não tem vagas.'
                  : 'Inscrição gratuita com bilhete.'}
          </p>

          {aula.soInformacao ? (
            <button className="botao botao--creme botao--largo" style={{ marginTop: 20, background: '#111', color: '#FBF7EB' }} onClick={aoFechar}>
              ENTENDIDO
            </button>
          ) : aula.inscrito ? (
            <button className="botao botao--recuo botao--largo" style={{ marginTop: 20 }}
                    disabled={ocupado} onClick={async () => { setOcupado(true); await aoAnular(aula.id); setOcupado(false) }}>
              ANULAR INSCRIÇÃO
            </button>
          ) : aula.esgotado ? (
            <button className="botao botao--morto botao--largo" style={{ marginTop: 20 }} disabled>
              SEM VAGAS
            </button>
          ) : (
            <button className="botao botao--verde botao--largo" style={{ marginTop: 20 }}
                    disabled={ocupado} onClick={async () => { setOcupado(true); await aoInscrever(aula.id); setOcupado(false) }}>
              {ocupado ? 'A INSCREVER…' : 'INSCREVER-ME'}
            </button>
          )}
        </>
      )}
    </Janela>
  )
}
