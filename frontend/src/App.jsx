import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth.js'
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx'
import AppLayout from './components/Layout/AppLayout.jsx'
import Login     from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Upload    from './pages/Upload.jsx'
import Export    from './pages/Export.jsx'
import Admin     from './pages/Admin.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/export" element={<Export />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin', 'uploader']} />}>
            <Route element={<AppLayout />}>
              <Route path="/upload" element={<Upload />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
