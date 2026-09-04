import { useEffect, useRef } from 'react'

/* Folha que sobe de baixo no telemóvel e fica ao centro no desktop. */
export default function Janela({ sobrancelha, titulo, aoFechar, children }) {
  const caixa = useRef(null)

  useEffect(() => {
    const tecla = e => { if (e.key === 'Escape') aoFechar?.() }
    window.addEventListener('keydown', tecla)
    caixa.current?.focus()
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', tecla)
      document.body.style.overflow = antes
    }
  }, [aoFechar])

  return (
    <div className="veu" onClick={aoFechar}>
      <div
        className="janela"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        ref={caixa}
        onClick={e => e.stopPropagation()}
      >
        <div className="janela__topo">
          <span className="sobrancelha">{sobrancelha}</span>
          <button className="janela__fechar" onClick={aoFechar} aria-label="Fechar">×</button>
        </div>
        <h2 className="titulo" style={{ marginBottom: 12 }}>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
