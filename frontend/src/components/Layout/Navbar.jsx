import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">CMND Analytics</h1>
        <p className="text-sm text-gray-500">Mandatory LOG+ & VR Learning Dashboard</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase text-primary-700">
          {user?.role || 'guest'}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
