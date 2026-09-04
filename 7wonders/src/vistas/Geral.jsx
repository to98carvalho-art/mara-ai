import { EVENTO, CRONOLOGIA, ZONAS } from '../content/evento'
import Foto from '../componentes/Foto'

const cor = nome => `cor-${nome}`

export default function Geral({ aoMudar }) {
  return (
    <main className="vista vista--geral">
      <div className="hero">
        {/* Duas versões da mesma foto: a vertical no telemóvel, a
            horizontal no desktop. Poupa metade dos dados a quem chega
            ao recinto com a rede cheia de gente. */}
        <picture>
          <source media="(min-width: 860px)" srcSet="/imagens/hero.jpg" />
          <img src="/imagens/hero-mobile.jpg" alt="7WONDERS — main stage à noite"
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </picture>
        <div className="hero__veu" />
        <div className="hero__fundo" />
      </div>

      <div className="vista__interior">
        <div className="linha-titulo">
          <span className="sobrancelha" style={{ whiteSpace: 'nowrap' }}>
            {EVENTO.data} · {EVENTO.local}
          </span>
          <span className="regua" />
        </div>

        <div className="duas-colunas" style={{ marginTop: 22 }}>
          <div className="pilha">
            <h1 className="titulo">
              {EVENTO.titulo[0]}<br />
              <span className="suave">{EVENTO.titulo[1]}</span>
            </h1>
            <p className="corpo">{EVENTO.intro}</p>
          </div>

          <div className="caixa pilha">
            <div className="etiqueta-linha">
              <span className="pilula pilula--verde">{EVENTO.recinto}</span>
              <span className="etiqueta-nome">RECINTO · SEIS ZONAS</span>
            </div>
            <hr className="divisor" style={{ margin: 0 }} />
            <div className="etiqueta-linha">
              <span className="pilula pilula--tinta">{EVENTO.mainStage}</span>
              <span className="etiqueta-nome suave">MAIN STAGE</span>
            </div>
          </div>
        </div>

        {/* ── o dia ── */}
        <div style={{ marginTop: 48 }}>
          <div className="linha-titulo">
            <span className="sobrancelha">O DIA</span>
            <span className="regua" />
          </div>
          <div className="crono">
            {CRONOLOGIA.map(passo => (
              <div className="crono__passo" key={passo.hora}>
                <span className="crono__ponto" style={{
                  background: passo.cor === 'verde' ? 'var(--verde)'
                    : passo.cor === 'taupe' ? 'var(--taupe)' : 'var(--tinta)',
                }} />
                <div className={`crono__hora ${cor(passo.cor)}`}>{passo.hora}</div>
                <div className="crono__linhas">
                  {passo.linhas.map(([texto, tom]) => (
                    <div key={texto} className={cor(tom)}>{texto}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── seis zonas ── */}
        <div style={{ marginTop: 52 }}>
          <div className="linha-titulo">
            <span className="sobrancelha">SEIS ZONAS · {EVENTO.recinto} · TODAS AO MESMO TEMPO</span>
            <span className="regua" />
          </div>
          {ZONAS.map(zona => (
            <section className="zona" key={zona.id}>
              <div className="zona__texto">
                <h2 className="zona__nome">{zona.nome}</h2>
                <div className="zona__linhas">
                  {zona.linhas.map((linha, i) => (
                    <span key={linha} className={i % 2 ? 'cor-taupe' : 'cor-verde'}>{linha}</span>
                  ))}
                </div>
                {zona.hora && <div><span className="pilula pilula--verde">{zona.hora}</span></div>}
              </div>
              <Foto nome={zona.imagem} legenda={zona.legenda} />
            </section>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 40 }}>
          <button className="botao botao--verde" onClick={() => aoMudar('ativ')}>VER O HORÁRIO</button>
          <button className="botao botao--linha" onClick={() => aoMudar('bilh')}>BILHETES</button>
        </div>
      </div>
    </main>
  )
}
