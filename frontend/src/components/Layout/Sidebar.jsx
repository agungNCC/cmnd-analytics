import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const linkClass = ({ isActive }) =>
  [
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-700 text-white'
      : 'text-gray-700 hover:bg-gray-100',
  ].join(' ')

export default function Sidebar() {
  const { user } = useAuth()

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/upload', label: 'Upload', roles: ['admin', 'uploader'] },
    { to: '/export', label: 'Export' },
    { to: '/admin', label: 'Admin', roles: ['admin'] },
  ].filter((link) => !link.roles || link.roles.includes(user?.role))

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
