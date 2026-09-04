import { EVENTO, LINEUP } from '../content/evento'
import Foto from '../componentes/Foto'

export default function MainStage({ aoMudar }) {
  return (
    <div className="escuro">
      <main className="vista">
        <div className="linha-titulo">
          <span className="sobrancelha">MAIN STAGE · {EVENTO.mainStage}</span>
          <span className="regua" />
        </div>

        <div className="duas-colunas duas-colunas--flyer">
          <Foto nome={LINEUP.flyer} legenda="flyer — line-up 7WONDERS"
                className="" style={{ width: '100%', borderRadius: 14, display: 'block', minHeight: 260 }} />

          <div className="pilha pilha--larga">
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 18, alignItems: 'center' }}>
              <Foto nome={LINEUP.cabeca.foto} legenda="foto — Reelow"
                    className="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12 }} />
              <div>
                <p className="sobrancelha">HEADLINER</p>
                <p className="nome-grande" style={{ color: 'var(--creme)', margin: '4px 0' }}>
                  {LINEUP.cabeca.nome}
                </p>
                <p className="sobrancelha">{LINEUP.cabeca.editora}</p>
              </div>
            </div>

            <hr className="divisor" />

            <div>
              <p className="sobrancelha" style={{ marginBottom: 12 }}>TAMBÉM NO LINE-UP</p>
              <div className="lista-lineup">
                {LINEUP.restantes.map(nome => <div key={nome}>{nome}</div>)}
              </div>
            </div>

            <p className="corpo">{LINEUP.nota}</p>

            <button className="botao botao--creme" onClick={() => aoMudar('bilh')}>BILHETES</button>
          </div>
        </div>
      </main>
    </div>
  )
}
