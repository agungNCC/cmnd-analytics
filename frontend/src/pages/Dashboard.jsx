import { useState } from 'react'
import SummaryAllTable from '../components/Dashboard/SummaryAllTable.jsx'
import Mandatory2026Table from '../components/Dashboard/Mandatory2026Table.jsx'
import LogPlusTable from '../components/Dashboard/LogPlusTable.jsx'
import VRLearningTable from '../components/Dashboard/VRLearningTable.jsx'

const TABS = [
  { id: 'summary', label: 'Summary All', component: SummaryAllTable },
  { id: 'mandatory', label: 'Mandatory 2026', component: Mandatory2026Table },
  { id: 'logplus', label: 'LOG+', component: LogPlusTable },
  { id: 'vr', label: 'VR Learning', component: VRLearningTable },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('summary')
  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component ?? SummaryAllTable

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor completion rates across Mandatory LOG+ and VR Learning programs.
        </p>
      </div>

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
