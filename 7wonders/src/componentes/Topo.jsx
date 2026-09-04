import { NAV } from '../content/evento'
import Foto from './Foto'

export default function Topo({ pagina, aoMudar }) {
  return (
    <header className="topo escuro">
      <div className="topo__marca">
        <Foto nome="logo.png" legenda="7WONDERS" className="topo__logo" />
      </div>
      <nav className="abas" aria-label="Secções">
        {NAV.map(item => (
          <button
            key={item.id}
            className="aba"
            aria-current={pagina === item.id ? 'page' : undefined}
            onClick={() => aoMudar(item.id)}
          >
            <span className="aba__icone" aria-hidden="true">{item.icone}</span>
            <span className="aba__nome">{item.etiqueta}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}
