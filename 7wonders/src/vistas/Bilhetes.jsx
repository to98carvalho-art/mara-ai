import { EVENTO, BILHETES, BILHETEIRA } from '../content/evento'

export default function Bilhetes({ aoMudar }) {
  return (
    <div className="escuro">
      <main className="vista">
        <div className="linha-titulo">
          <span className="sobrancelha">BILHETES</span>
          <span className="regua" />
        </div>

        <div className="duas-colunas duas-colunas--iguais">
          <div className="pilha pilha--larga">
            <p className="sobrancelha">{BILHETES.esgotado.subtitulo}</p>
            <p className="esgotado">SOLD<br />OUT</p>
            <div>
              <div className="barra"><div className="barra__cheia" /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span className="sobrancelha">100%</span>
                <span className="sobrancelha">ESGOTADO</span>
              </div>
            </div>

            <hr className="divisor" />
            <p className="sobrancelha">TAMBÉM DISPONÍVEIS</p>
            <div className="pilha">
              {BILHETES.disponiveis.map(bilhete => (
                <a className="cartao-bilhete" key={bilhete.nome}
                   href={BILHETEIRA.url} target="_blank" rel="noopener">
                  <span>
                    <span className="cartao-bilhete__nome">{bilhete.nome}</span>
                    <span className="cartao-bilhete__quando" style={{ display: 'block' }}>{bilhete.quando}</span>
                  </span>
                  <span className="cartao-bilhete__preco">{bilhete.preco}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="pilha pilha--larga">
            <p className="corpo">{BILHETES.nota}</p>

            <a className="cartao-3cket" href={BILHETEIRA.url} target="_blank" rel="noopener">
              <span>
                <span className="sobrancelha" style={{ color: 'var(--verde)', display: 'block' }}>COMPRAR EM</span>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '.02em' }}>{BILHETEIRA.nome}</span>
              </span>
              <span style={{ fontSize: 24, fontWeight: 800 }} aria-hidden="true">↗</span>
            </a>

            <hr className="divisor" />
            <div className="pilha" style={{ gap: 8 }}>
              <span className="sobrancelha">{EVENTO.dataLonga} · {EVENTO.local}</span>
              <span className="sobrancelha">RECINTO {EVENTO.recinto} · MAIN STAGE {EVENTO.mainStage}</span>
              <span className="sobrancelha">{EVENTO.idadeMinima}</span>
            </div>
            <hr className="divisor" />

            <div>
              <p className="sobrancelha">PRIVADOS</p>
              <p style={{ color: 'var(--creme)', fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>
                {BILHETES.notaPrivados}{' '}
                <button className="suave" style={{ fontWeight: 700, cursor: 'pointer' }} onClick={() => aoMudar('priv')}>
                  Ver o mapa dos privados ↗
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
