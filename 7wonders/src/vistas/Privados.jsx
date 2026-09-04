import { CAMAROTES, CONTACTO } from '../content/evento'
import Foto from '../componentes/Foto'

export default function Privados() {
  return (
    <div className="escuro">
      <main className="vista">
        <div className="linha-titulo">
          <span className="sobrancelha">PRIVADOS · 12 CAMAROTES DE {CAMAROTES.capacidade}</span>
          <span className="regua" />
        </div>

        <div className="duas-colunas duas-colunas--mapa">
          <Foto nome={CAMAROTES.mapa} legenda="mapa — 12 camarotes VIP"
                className="" style={{ width: '100%', borderRadius: 16, display: 'block', minHeight: 260 }} />

          <div className="caixa pilha pilha--larga">
            <div className="pilha">
              {CAMAROTES.legenda.map(item => (
                <div className="legenda-preco" key={item.etiqueta}>
                  <span className={`legenda-preco__amostra legenda-preco__amostra--${item.estilo}`} />
                  <span className={`legenda-preco__texto${item.estilo === 'tracejado' ? ' legenda-preco__texto--suave' : ''}`}>
                    {item.etiqueta}
                  </span>
                </div>
              ))}
            </div>

            <hr className="divisor" />
            <p className="corpo">{CAMAROTES.nota}</p>
            <hr className="divisor" />

            <div>
              <p className="sobrancelha">RESERVA POR TELEFONE</p>
              <a className="telefone-grande" href={`tel:${CONTACTO.telefoneLimpo}`}>{CONTACTO.telefone}</a>
              <p className="corpo" style={{ marginTop: 6, fontSize: 12.5 }}>
                Escolhe o número do camarote no mapa e indica-o na chamada ou no WhatsApp.
              </p>
            </div>

            <a className="botao botao--linha botao--largo" href={CONTACTO.whatsapp} target="_blank" rel="noopener">
              RESERVAR POR WHATSAPP
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
