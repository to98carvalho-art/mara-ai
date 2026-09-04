import { useState } from 'react'
import { AFTER } from '../content/evento'
import { candidatar } from '../lib/after'

const CAMPOS = [
  { chave: 'nome',      etiqueta: 'PRIMEIRO NOME', exemplo: 'Marta',            tipo: 'text',  auto: 'given-name' },
  { chave: 'apelido',   etiqueta: 'ÚLTIMO NOME',   exemplo: 'Ribeiro',          tipo: 'text',  auto: 'family-name' },
  { chave: 'telefone',  etiqueta: 'TELEFONE',      exemplo: '912 345 678',      tipo: 'tel',   auto: 'tel' },
  { chave: 'email',     etiqueta: 'EMAIL',         exemplo: 'marta@exemplo.pt', tipo: 'email', auto: 'email' },
]

export default function After() {
  const [dados, setDados] = useState({ nome: '', apelido: '', telefone: '', email: '', razoes: '' })
  const [enviado, setEnviado] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  const completo = CAMPOS.every(c => dados[c.chave].trim()) && dados.razoes.trim()
  const mudar = chave => e => setDados(d => ({ ...d, [chave]: e.target.value }))

  async function enviar(evento) {
    evento.preventDefault()
    if (!completo) return
    setOcupado(true); setErro('')
    try {
      await candidatar(dados)
      setEnviado(true)          // só depois de o servidor a ter guardado
    } catch (e) {
      setErro(e.mensagem || 'Não foi possível enviar. Tenta outra vez.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="escuro">
      <main className="vista" style={{ maxWidth: 640 }}>
        <p className="sobrancelha" style={{ marginBottom: 20 }}>☾ AFTER PARTY · SECRETO</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="pilula pilula--creme">{AFTER.etiquetas[0]}</span>
          <span className="pilula pilula--tracejada">{AFTER.etiquetas[1]}</span>
          <span className="pilula pilula--contorno">{AFTER.etiquetas[2]}</span>
        </div>

        {enviado ? (
          <div style={{
            marginTop: 32, padding: 26, textAlign: 'center',
            border: '1.5px dashed var(--taupe-50)', borderRadius: 14,
          }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--creme)', margin: 0 }}>
              {AFTER.enviado.titulo}
            </p>
            <p className="corpo" style={{ marginTop: 10 }}>{AFTER.enviado.nota}</p>
          </div>
        ) : (
          <form className="pilha" style={{ marginTop: 28 }} onSubmit={enviar}>
            {CAMPOS.map(campo => (
              <div className="campo" key={campo.chave}>
                <label className="campo__nome" htmlFor={`after-${campo.chave}`}>{campo.etiqueta}</label>
                <input
                  id={`after-${campo.chave}`} type={campo.tipo} autoComplete={campo.auto}
                  placeholder={campo.exemplo} value={dados[campo.chave]} onChange={mudar(campo.chave)} required
                />
              </div>
            ))}

            <hr className="divisor" style={{ margin: '6px 0' }} />

            <div className="campo">
              <label className="campo__nome" htmlFor="after-razoes">{AFTER.pergunta}</label>
              <textarea
                id="after-razoes" placeholder={'1. …\n2. …\n3. …'}
                value={dados.razoes} onChange={mudar('razoes')} required
              />
            </div>

            {erro && <p className="aviso aviso--erro">{erro}</p>}

            <button className="botao botao--creme botao--largo" disabled={!completo || ocupado}>
              {ocupado ? 'A ENVIAR…' : AFTER.botao}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
