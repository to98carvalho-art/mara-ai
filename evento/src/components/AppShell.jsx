import { NavLink, Link, useNavigate } from 'react-router-dom'
import { EVENT } from '../lib/config'
import { isDemo, resetDemoData } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function AppShell({ children }) {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/entrar')
  }

  return (
    <div className="shell">
      {isDemo && (
        <div className="demo-strip">
          <span>⚠️ Modo demonstração — os dados ficam só neste dispositivo.</span>
          <button onClick={() => { resetDemoData(); location.reload() }}>
            Repor dados de exemplo
          </button>
        </div>
      )}

      <header className="topbar">
        <Link to="/" className="topbar__brand">
          {EVENT.name.split(' ')[0]} <span>{EVENT.name.split(' ').slice(1).join(' ')}</span>
        </Link>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''}>Horário</NavLink>
          {user && (
            <NavLink to="/minha-agenda" className={({ isActive }) => isActive ? 'is-active' : ''}>
              A minha agenda
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/organizacao" className={({ isActive }) => isActive ? 'is-active' : ''}>
              Organização
            </NavLink>
          )}
          {user
            ? <button className="chip" onClick={handleSignOut}>Sair</button>
            : <NavLink to="/entrar" className={({ isActive }) => isActive ? 'is-active' : ''}>Entrar</NavLink>}
        </nav>
      </header>

      {children}
    </div>
  )
}
