import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.username || !form.password) {
      setError('Username dan password wajib diisi')
      return
    }

    setError('')
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      alert('Login berhasil (mock)')
    }, 1200)
  }

  const handleGoogleSignIn = () => {
    alert('Masuk dengan Google (mock)')
  }

  return (
    <div className="page-root">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">IF</div>
          <span>IdentiFace</span>
        </div>

        <button type="button" className="topbar-button">
          Beranda
        </button>
      </header>

      <main className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <h1>Login Form</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Username"
              name="username"
              placeholder="Masukkan username"
              value={form.username}
              onChange={handleChange}
              error={!form.username && error ? 'Username wajib diisi' : ''}
              autoComplete="username"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={handleChange}
              error={!form.password && error ? 'Password wajib diisi' : ''}
              autoComplete="current-password"
            />

            <div className="form-footer">
              <a href="#" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Masuk
            </Button>
          </form>

          <div className="divider">Atau</div>

          <Button type="button" variant="google" fullWidth onClick={handleGoogleSignIn}>
            <span className="google-icon">G</span>
            Masuk dengan Google
          </Button>

          <p className="login-note">
            Belum Punya Akun? <a href="#">Hubungi Administrator</a>
          </p>
        </div>
      </main>
    </div>
  )
}
