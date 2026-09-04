import { EVENTO, HORAS, AULAS_LOCAL } from '../content/evento'

export default function Atividades({ aulas, quantasMinhas, aoAbrir }) {
  const contagem = quantasMinhas === 0 ? 'SEM INSCRIÇÕES'
    : quantasMinhas === 1 ? '1 INSCRIÇÃO' : `${quantasMinhas} INSCRIÇÕES`

  return (
    <main className="vista">
      <p className="sobrancelha">ATIVIDADES · {EVENTO.data} · {AULAS_LOCAL}</p>
      <h1 className="titulo titulo--grande" style={{ marginTop: 8 }}>
        WELLNESS ZONE <span className="suave">&amp;</span> SPIRIT &amp; SOUL
      </h1>
      <p className="corpo" style={{ marginTop: 12 }}>
        Um percurso pelo corpo e pela mente — do primeiro alongamento ao último ritual,
        antes de a noite tomar conta do palco. Carrega numa aula para te inscreveres.
      </p>

      <div className="legenda" style={{ marginTop: 20 }}>
        <span className="legenda__item">
          <span className="legenda__ponto" style={{ background: 'var(--verde)' }} />WELLNESS
        </span>
        <span className="legenda__item">
          <span className="legenda__ponto" style={{ background: 'var(--tinta)' }} />SPIRIT &amp; SOUL
        </span>
      </div>

      <div className="caixa" style={{ marginTop: 20 }}>
        <div className="grelha-cabeca">
          <div />
          <div className="grelha-cabeca__grupo grelha-cabeca__grupo--wellness">WELLNESS</div>
          <div className="grelha-cabeca__grupo grelha-cabeca__grupo--spirit">SPIRIT &amp; SOUL</div>
        </div>

        <div className="grelha">
          {HORAS.map((hora, i) => (
            <div className="grelha__hora" key={hora} style={{ gridRow: i + 1 }}>{hora}</div>
          ))}
          {HORAS.slice(0, 8).map((hora, i) => (
            <div className="grelha__risca" key={`r${hora}`} style={{ gridRow: i + 1 }} />
          ))}

          {aulas.map(aula => (
            <button
              key={aula.id}
              className={`aula aula--${aula.tom}${aula.inscrito ? ' aula--minha' : ''}`}
              style={{ gridColumn: aula.coluna, gridRow: `${aula.inicio} / span ${aula.duracao}` }}
              onClick={() => aoAbrir(aula.id)}
            >
              <span className="aula__hora">{aula.hora}</span>
              <span className="aula__nome">{aula.nome}</span>
              {aula.por && <span className="aula__por">by {aula.por}</span>}
              {aula.inscrito && <span className="aula__marca">✓ INSCRITO</span>}
            </button>
          ))}
        </div>

        <div className="rodape-grelha">
          <span className="suave">PROGRAMA SUJEITO A ALTERAÇÕES</span>
          <span className="cor-tinta">{contagem}</span>
        </div>
      </div>
    </main>
  )
}
