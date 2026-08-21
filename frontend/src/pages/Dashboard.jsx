import { useState } from 'react'
import toast from 'react-hot-toast'
import Mandatory2026Table from '../components/Dashboard/Mandatory2026Table.jsx'
import LogPlusTable from '../components/Dashboard/LogPlusTable.jsx'
import VRLearningTable from '../components/Dashboard/VRLearningTable.jsx'
import ExportLoadingScreen from '../components/Export/ExportLoadingScreen.jsx'
import { useExport } from '../hooks/useExport.js'

const TABS = [
  { id: 'mandatory', label: 'Mandatory 2026', component: Mandatory2026Table },
  { id: 'logplus', label: 'LOG+', component: LogPlusTable },
  { id: 'vr', label: 'VR Learning', component: VRLearningTable },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('mandatory')
  const { exportXlsx, isExporting, error, progress } = useExport()
  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component ?? Mandatory2026Table

  const handleDownload = async () => {
    try {
      const filename = await exportXlsx()
      toast.success(`Downloaded ${filename}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {isExporting ? <ExportLoadingScreen progress={progress} /> : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor completion rates across Mandatory LOG+ and VR Learning programs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-60"
        >
          {isExporting ? `Generating report... ${progress}%` : 'Download XLSX'}
        </button>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
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

      <ActiveComponent />
    </div>
  )
}
