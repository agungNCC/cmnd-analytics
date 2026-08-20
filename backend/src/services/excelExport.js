import { buildSampleBasedExportBuffer } from './ooxmlExport.js'

export const buildExportFilename = () => {
  const date = new Date()
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('')
  return `LOG_VR_completion_${ymd}.xlsx`
}

export const buildExportBuffer = () => buildSampleBasedExportBuffer()
