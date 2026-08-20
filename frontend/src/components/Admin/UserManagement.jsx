import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { useAuth } from '../../hooks/useAuth.jsx'

const EMPTY_FORM = {
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: 'user',
  department: '',
}

const inputClass = 'rounded-md border border-gray-300 px-3 py-2 text-sm'

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState(null)
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
      closeForm()
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/api/admin/users/${id}`, payload)
      return { data, payload }
    },
    onSuccess: ({ data, payload }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      if (payload?.email && data?.email && data.email !== String(payload.email).toLowerCase().trim()) {
        toast.error('Email was not updated on the server. Redeploy the latest backend, then try again.')
        return
      }
      toast.success('User updated')
      closeForm()
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

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (user) => {
    setEditingId(user.id)
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      full_name: user.full_name || '',
      role: user.role || 'user',
      department: user.department || '',
    })
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.username || !form.email) {
      toast.error('Username and email are required')
      return
    }

    if (editingId) {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        full_name: form.full_name,
        role: form.role,
        department: form.department,
      }
      if (form.password) payload.password = form.password
      updateMutation.mutate({ id: editingId, payload })
      return
    }

    if (!form.password) {
      toast.error('Username, email, and password are required')
      return
    }
    createMutation.mutate(form)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  if (isLoading) return <p className="text-sm text-gray-500">Loading users...</p>
  if (isError) return <p className="text-sm text-red-600">Failed to load users.</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Users</h2>
        <button
          type="button"
          onClick={() => (showForm ? closeForm() : openCreate())}
          className="rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800"
        >
          {showForm ? 'Cancel' : 'Add user'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-2">
          <p className="text-sm font-medium text-gray-700 md:col-span-2">
            {editingId ? 'Edit user' : 'Add user'}
          </p>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <input
            type="password"
            placeholder={editingId ? 'New password (optional)' : 'Password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className={inputClass}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={inputClass}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60 md:col-span-2"
          >
            {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create user'}
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Login name', 'Email', 'Role', 'Department', 'Status', 'Actions'].map((label) => (
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
                <td className="px-3 py-2 text-gray-700">{user.username}</td>
                <td className="px-3 py-2 text-gray-700">{user.email}</td>
                <td className="px-3 py-2 capitalize text-gray-700">{user.role}</td>
                <td className="px-3 py-2 text-gray-700">{user.department || '-'}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="text-sm text-primary-700 hover:underline"
                    >
                      Edit
                    </button>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
