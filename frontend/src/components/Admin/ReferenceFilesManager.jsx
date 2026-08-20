import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api.js'

const FILE_TYPES = [
  {
    key: 'mc',
    label: 'Master Closing (MC)',
    hint: 'reference_file.xlsx — berisi data karyawan (NIP, Directorate, dll). Nama sheet diambil dari A1.',
    accept: '.xlsx,.xls',
    example: 'reference_file.xlsx',
  },
  {
    key: 'mandatory_nip',
    label: 'Mandatory NIP List',
    hint: 'Mandatory<yyyy>.xlsx — berisi daftar NIP karyawan wajib training tahun ini. (contoh: Mandatory2026.xlsx)',
    accept: '.xlsx,.xls',
    example: 'Mandatory2026.xlsx',
  },
  {
    key: 'template',
    label: 'Export Template',
    hint: 'template.xlsx — template output export (Summary All, Mandatory, LOG+, VR Learning). Header, formula, dan pivot diambil dari file ini.',
    accept: '.xlsx,.xls',
    example: 'template.xlsx',
  },
]

const REFS_KEY = {
  mc: 'mc',
  mandatory_nip: 'mandatory_nip',
  template: 'template',
}

function ReferenceCard({ config, info, onUpload, isUploading }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onUpload(file)
  }

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  const hasInfo = info && info.original_name

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{config.label}</h3>
        <p className="mt-1 text-xs text-gray-500">{config.hint}</p>
      </div>

      {hasInfo && (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs space-y-1">
          <p><span className="font-medium text-gray-700">File aktif:</span> {info.original_name}</p>
          {info.sheet_name && (
            <p><span className="font-medium text-gray-700">Sheet name:</span> {info.sheet_name}</p>
          )}
          {info.sheet_title && (
            <p><span className="font-medium text-gray-700">Judul (A1):</span> {info.sheet_title}</p>
          )}
          {info.nip_sheet_name && (
            <p><span className="font-medium text-gray-700">Sheet NIP:</span> {info.nip_sheet_name}</p>
          )}
          {info.row_count != null && (
            <p><span className="font-medium text-gray-700">Jumlah baris:</span> {info.row_count.toLocaleString()}</p>
          )}
          {info.uploaded_at && (
            <p><span className="font-medium text-gray-700">Diupload:</span> {new Date(info.uploaded_at).toLocaleString('id-ID')}</p>
          )}
        </div>
      )}

      {!hasInfo && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800">
          Menggunakan file default bawaan sistem. Upload file baru untuk mengganti.
        </div>
      )}

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={[
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors',
          isUploading ? 'opacity-50 cursor-not-allowed' : '',
          dragOver
            ? 'border-success bg-success-light'
            : 'border-gray-300 bg-gray-50 hover:border-primary-700 hover:bg-primary-50',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          disabled={isUploading}
          onChange={handleChange}
          className="hidden"
        />
        <p className="text-sm font-medium text-gray-700">
          {isUploading ? 'Mengupload...' : 'Drag & drop atau klik untuk pilih file'}
        </p>
        <p className="mt-1 text-xs text-gray-500">Contoh: {config.example}</p>
      </label>
    </div>
  )
}

export default function ReferenceFilesManager() {
  const queryClient = useQueryClient()

  const { data: refs, isLoading, isError } = useQuery({
    queryKey: ['admin-references'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/references')
      return data
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post(`/api/admin/references/${type}`, form)
      return data
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-references'] })
      toast.success(`File referensi '${vars.type}' berhasil diperbarui`)
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Upload gagal'),
  })

  const handleUpload = (type, file) => {
    if (uploadMutation.isPending) return
    uploadMutation.mutate({ type, file })
  }

  if (isLoading) return <p className="text-sm text-gray-500">Memuat info referensi...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat info referensi.</p>

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Reference Files</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload file referensi untuk mengganti data aktif. File baru akan langsung menggantikan file lama.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {FILE_TYPES.map((config) => (
          <ReferenceCard
            key={config.key}
            config={config}
            info={refs?.[REFS_KEY[config.key]]}
            onUpload={(file) => handleUpload(config.key, file)}
            isUploading={uploadMutation.isPending && uploadMutation.variables?.type === config.key}
          />
        ))}
      </div>
    </div>
  )
}
