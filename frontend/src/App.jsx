import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
// TODO (Fase 3.1): Import AuthProvider & ProtectedRoute
// TODO (Fase 3.2–3.6): Import pages
import Login     from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Upload    from './pages/Upload.jsx'
import Export    from './pages/Export.jsx'
import Admin     from './pages/Admin.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* TODO: wrap dengan ProtectedRoute */}
        <Route path="/"       element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/export" element={<Export />} />
        <Route path="/admin"  element={<Admin />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
