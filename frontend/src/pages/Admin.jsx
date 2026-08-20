import { useState } from 'react'
import UserManagement from '../components/Admin/UserManagement.jsx'
import AuditLogViewer from '../components/Admin/AuditLogViewer.jsx'
import ReferenceFilesManager from '../components/Admin/ReferenceFilesManager.jsx'
import ExportSettingsManager from '../components/Admin/ExportSettingsManager.jsx'

const TABS = [
  { id: 'users', label: 'User Management' },
  { id: 'references', label: 'Reference Files' },
  { id: 'export', label: 'Export Settings' },
  { id: 'logs', label: 'Audit Logs' },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage users, reference files, export settings, and review system activity logs.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'rounded-t-md px-4 py-2 text-sm font-medium',
                activeTab === tab.id
                  ? 'border border-b-white border-gray-200 bg-white text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'references' && <ReferenceFilesManager />}
        {activeTab === 'export' && <ExportSettingsManager />}
        {activeTab === 'logs' && <AuditLogViewer />}
      </div>
    </div>
  )
}
