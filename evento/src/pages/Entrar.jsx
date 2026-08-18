import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { messageFor } from '../lib/errors'
import { isDemo } from '../lib/api'
import { EVENT } from '../lib/config'
import { Alert } from '../components/States'

export default function Entrar() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')   // 'signin' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      if (mode === 'signup') await signUp(form)
      else await signIn(form)
      navigate('/')
    } catch (err) {
      setError(messageFor(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth">
      <div className="auth__card">
        <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>
          {mode === 'signup' ? 'Criar conta' : 'Entrar'}
        </h1>
        <p style={{ color: 'var(--c-text-dim)', margin: '0 0 var(--s-5)', fontSize: 14 }}>
          {mode === 'signup'
            ? `Cria a tua conta para te inscreveres nas atividades do ${EVENT.name}.`
            : 'Entra para veres e gerires as tuas inscrições.'}
        </p>

        <form className="form" onSubmit={submit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Nome</label>
              <input id="name" value={form.name} onChange={set('name')} autoComplete="name" required />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Palavra-passe</label>
            <input
              id="password" type="password" value={form.password} onChange={set('password')}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6} required
            />
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Um momento…' : mode === 'signup' ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <p className="auth__switch">
          {mode === 'signup' ? 'Já tens conta?' : 'Ainda não tens conta?'}{' '}
          <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }}>
            {mode === 'signup' ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>

      {isDemo && (
        <div style={{ marginTop: 'var(--s-4)' }}>
          <Alert kind="info">
            <strong>Modo demonstração.</strong> Cria uma conta qualquer (o email não é verificado).
            Para entrares como organização usa <code>admin@evento.pt</code> com qualquer palavra-passe de 6+ caracteres.
          </Alert>
        </div>
      )}
    </main>
  )
}
