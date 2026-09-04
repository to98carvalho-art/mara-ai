import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ScheduleProvider } from './context/ScheduleContext'
import AppShell from './components/AppShell'
import Horario from './pages/Horario'
import Atividade from './pages/Atividade'
import MinhaAgenda from './pages/MinhaAgenda'
import Entrar from './pages/Entrar'
import Organizacao from './pages/Organizacao'

/* Rota que exige conta iniciada. */
function Privada({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/entrar" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Horario />} />
            <Route path="/atividade/:id" element={<Atividade />} />
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/minha-agenda" element={<Privada><MinhaAgenda /></Privada>} />
            <Route path="/organizacao" element={<Privada adminOnly><Organizacao /></Privada>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </ScheduleProvider>
    </AuthProvider>
  )
}
