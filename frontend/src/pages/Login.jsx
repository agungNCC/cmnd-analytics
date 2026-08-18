import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@cimb.local', password: 'password123' },
  { label: 'Uploader', email: 'uploader@cimb.local', password: 'password123' },
  { label: 'Viewer', email: 'viewer@cimb.local', password: 'password123' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, loading } = useAuth()
  const [email, setEmail] = useState('admin@cimb.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    const redirectTo = location.state?.from?.pathname || '/'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required')
      return
    }

    setSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate(location.state?.from?.pathname || '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm border border-gray-200"
      >
        <h1 className="text-2xl font-semibold text-gray-900">CMND Analytics</h1>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to access the Mandatory LOG+ and VR Learning dashboard.
        </p>

        <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
            Demo Accounts
          </p>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => {
                  setEmail(account.email)
                  setPassword(account.password)
                }}
                className="flex w-full items-center justify-between rounded-md border border-primary-100 bg-white px-3 py-2 text-left hover:bg-primary-50"
              >
                <span className="font-medium">{account.label}</span>
                <span className="text-xs text-gray-500">{account.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary-700"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary-700"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
