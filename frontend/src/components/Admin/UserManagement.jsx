import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { useAuth } from '../../hooks/useAuth.js'

const EMPTY_FORM = {
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: 'viewer',
  department: '',
}

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/users')
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/admin/users', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User created')
      setForm(EMPTY_FORM)
      setShowForm(false)
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/api/admin/users/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User updated')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update user'),
  })

  const deactivateMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/api/admin/users/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deactivated')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to deactivate user'),
  })

  const handleCreate = (event) => {
    event.preventDefault()
    if (!form.username || !form.email || !form.password) {
      toast.error('Username, email, and password are required')
      return
    }
    createMutation.mutate(form)
  }

  if (isLoading) return <p className="text-sm text-gray-500">Loading users...</p>
  if (isError) return <p className="text-sm text-red-600">Failed to load users.</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Users</h2>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800"
        >
          {showForm ? 'Cancel' : 'Add user'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-2">
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="viewer">Viewer</option>
            <option value="uploader">Uploader</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60 md:col-span-2"
          >
            {createMutation.isPending ? 'Creating...' : 'Create user'}
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Role', 'Department', 'Status', 'Actions'].map((label) => (
                <th key={label} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-700">{user.full_name || user.username}</td>
                <td className="px-3 py-2 text-gray-700">{user.email}</td>
                <td className="px-3 py-2">
                  <select
                    value={user.role}
                    disabled={updateMutation.isPending}
                    onChange={(e) => updateMutation.mutate({ id: user.id, payload: { role: e.target.value } })}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="uploader">Uploader</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-gray-700">{user.department || '-'}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {user.id === currentUser?.id ? (
                    <span className="text-xs text-gray-400">Current user</span>
                  ) : user.is_active ? (
                    <button
                      type="button"
                      onClick={() => deactivateMutation.mutate(user.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: user.id, payload: { is_active: true } })}
                      className="text-sm text-primary-700 hover:underline"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
