import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'
import { query } from '../config/database.js'
import {
  buildMcLookup,
  getExportTemplatePath,
  getMandatoryNipList,
} from './referenceService.js'

const TEMPLATE_DIRS = [
  'Apprentice',
  'Business Banking',
  'Compliance, Corporate Affairs & Legal',
  'Consumer & Emerging Business Banking',
  'Corporate Assurance',
  'DP/TCB',
  'Human Resources',
  'Network & Digital Banking',
  'Operations, Technology, Analytics & AI',
  'Risk Management',
  'SLC ASG Satyaguna Langgeng Capital',
  'Strategy & Finance',
  'Syariah Banking',
  'Treasury & Financial Institutions',
]

const DIR_MAP = {
  '1225 strategy & finance id': 'Strategy & Finance',
  'business banking id': 'Business Banking',
  'compliance, corporate affairs & legal id': 'Compliance, Corporate Affairs & Legal',
  'consumer banking': 'Consumer & Emerging Business Banking',
  'corporate assurance id': 'Corporate Assurance',
  'network & digital banking id': 'Network & Digital Banking',
  'o126 syariah banking id': 'Syariah Banking',
  'o226 consumer & emerging business banking id': 'Consumer & Emerging Business Banking',
  'o426 slc - asg - satyaguna langgeng capital id': 'SLC ASG Satyaguna Langgeng Capital',
  'o626 treasury & financial institutions': 'Treasury & Financial Institutions',
  'o725 operations, technology, analytics & ai id': 'Operations, Technology, Analytics & AI',
  'o922 human resources id': 'Human Resources',
  'risk management id': 'Risk Management',
  'sharia banking': 'Syariah Banking',
  'special asset': 'SLC ASG Satyaguna Langgeng Capital',
  'strategy, finance & spapm': 'Strategy & Finance',
  'treasury & capital market': 'Treasury & Financial Institutions',
  'pt bank cimb niaga tbk': 'Operations, Technology, Analytics & AI',
}

const COURSE_COLUMNS = [
  'WHY BCM IS NEEDED',
  'BCM HELPS YOU PREPARE',
  'WHEN THE DISASTER STRIKES',
  'CRISIS MANAGEMENT',
  'HELP THEM TO SURVIVE!',
  'CODE OF ETHIC AND CONDUCT',
  'POST TEST CODE OF ETHICS',
  null,
  'PENGKINIAN DATA NASABAH',
  "LET'S INVESTIGATE AML, CFT & CPF",
  "LET'S COMPLETE AML, CFT, & CPF MISSION",
  'YUK, PAHAMI DEFINISI DAN JENIS-JENIS FRAUD!',
  'MARI TELUSURI FAKTOR PENYEBAB FRAUD!',
  'AYO, TINDAK LANJUTI INDIKASI FRAUD!',
  'AYO, LAPORKAN INDIKASI PELANGGARAN!',
  'REFRESHMENT ANTI FRAUD AWARENESS POST TEST',
  null,
  'PRE-TEST REFRESHMENT INFORMATION SECURITY AWARENESS - 2026',
  null,
  'MENGENALI & MENGHADAPI ANCAMAN SIBER',
  'TANGGUNG JAWAB STAF DALAM KEAMANAN INFORMASI',
  'KEPATUHAN HUKUM',
  'ATESTASI - ACCEPTABLE USE POLICY (AUP)',
  'POST TEST IT SECURITY AWARENESS',
  null,
]

const xmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const xmlUnescape = (value) => String(value)
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&apos;', "'")
  .replaceAll('&amp;', '&')

const normaliseDir = (value) => {
  if (!value) return ''
  const raw = String(value).trim()
  return DIR_MAP[raw.toLowerCase()] || raw
}

const columnName = (index) => {
  let value = index + 1
  let result = ''
  while (value > 0) {
    value -= 1
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

const styleAttribute = (styleId) => (
  styleId === undefined || styleId === null ? '' : ` s="${styleId}"`
)

const valueCell = (ref, value, styleId, { forceText = false } = {}) => {
  const style = styleAttribute(styleId)
  if (value === null || value === undefined || value === '') {
    return `<c r="${ref}"${style}/>`
  }
  if (!forceText && typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"${style}><v>${value}</v></c>`
  }
  if (!forceText && typeof value === 'boolean') {
    return `<c r="${ref}"${style} t="b"><v>${value ? 1 : 0}</v></c>`
  }
  return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`
}

const getRowXml = (xml, rowNumber) => {
  const match = xml.match(new RegExp(`<row\\b[^>]*\\br="${rowNumber}"[^>]*(?:\\/>|>.*?<\\/row>)`))
  return match?.[0] || ''
}

const getColumnStyles = (rowXml) => {
  const styles = new Map()
  const regex = /<c\b[^>]*\br="([A-Z]+)\d+"[^>]*\bs="(\d+)"/g
  for (const match of rowXml.matchAll(regex)) {
    styles.set(match[1], match[2])
  }
  return styles
}

const parseSharedStrings = (xml) => [...xml.matchAll(/<si>(.*?)<\/si>/g)].map((match) => {
  const text = [...match[1].matchAll(/<t(?: [^>]*)?>(.*?)<\/t>/g)]
    .map((part) => xmlUnescape(part[1]))
    .join('')
  return text
})

const readCellValue = (attributes, body, sharedStrings) => {
  if (!body) return ''
  const type = attributes.match(/\bt="([^"]+)"/)?.[1]
  if (type === 'inlineStr') {
    return xmlUnescape(
      [...body.matchAll(/<t(?: [^>]*)?>(.*?)<\/t>/g)]
        .map((part) => part[1])
        .join(''),
    )
  }

  const raw = body.match(/<v>(.*?)<\/v>/)?.[1]
  if (raw === undefined) return ''
  if (type === 's') return sharedStrings[Number(raw)] ?? ''
  if (type === 'b') return raw === '1'
  return Number.isFinite(Number(raw)) ? Number(raw) : xmlUnescape(raw)
}

const parseLogDefaults = (sheetXml, sharedStringsXml) => {
  const sharedStrings = parseSharedStrings(sharedStringsXml)
  const defaults = new Map()
  const sheetData = sheetXml.match(/<sheetData>(.*?)<\/sheetData>/)?.[1] || ''

  for (const rowMatch of sheetData.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*(?:\/>|>(.*?)<\/row>)/g)) {
    if (Number(rowMatch[1]) < 4 || !rowMatch[2]) continue
    const cells = new Map()
    const cellRegex = /<c r="([A-Z]+)\d+"([^>]*)\/>|<c r="([A-Z]+)\d+"([^>]*)>(.*?)<\/c>/g
    for (const cellMatch of rowMatch[2].matchAll(cellRegex)) {
      const column = cellMatch[1] || cellMatch[3]
      const attributes = cellMatch[2] || cellMatch[4] || ''
      const body = cellMatch[5] || ''
      cells.set(
        column,
        readCellValue(attributes, body, sharedStrings),
      )
    }

    const employeeId = String(cells.get('B') || '').trim()
    if (!employeeId) continue
    const rawCompletion = cells.get('I')
    let overallCompletion = null
    if (typeof rawCompletion === 'number') {
      overallCompletion = rawCompletion > 1 ? rawCompletion / 100 : rawCompletion
    } else if (String(rawCompletion).trim()) {
      overallCompletion = Number(String(rawCompletion).replace('%', '')) / 100
    }

    defaults.set(employeeId, {
      hireDate: cells.get('D') || '',
      email: cells.get('E') || '',
      statusActive: cells.get('H') === true || String(cells.get('H')).toUpperCase() === 'TRUE',
      overallCompletion: Number.isFinite(overallCompletion) ? overallCompletion : null,
    })
  }
  return defaults
}

const replaceDataRows = (xml, headerRowCount, rows, columnCount) => {
  const sheetData = xml.match(/<sheetData>(.*?)<\/sheetData>/)
  if (!sheetData) throw new Error('Invalid worksheet XML: sheetData not found')

  const headerRows = []
  const rowRegex = /<row\b[^>]*\br="(\d+)"[^>]*(?:\/>|>.*?<\/row>)/g
  for (const match of sheetData[1].matchAll(rowRegex)) {
    if (Number(match[1]) <= headerRowCount) headerRows.push(match[0])
  }

  const lastRow = headerRowCount + rows.length
  const dimension = `A1:${columnName(columnCount - 1)}${Math.max(lastRow, headerRowCount)}`
  const content = `<sheetData>${headerRows.join('')}${rows.join('')}</sheetData>`

  return xml
    .replace(/<dimension ref="[^"]+"\/>/, `<dimension ref="${dimension}"/>`)
    .replace(/<sheetData>.*?<\/sheetData>/, content)
}

const makeRow = (rowNumber, values, styles, forceTextColumns = new Set()) => {
  const cells = values.map((value, index) => {
    const col = columnName(index)
    return valueCell(
      `${col}${rowNumber}`,
      value,
      styles.get(col),
      { forceText: forceTextColumns.has(index) },
    )
  })
  return `<row r="${rowNumber}" spans="1:${values.length}">${cells.join('')}</row>`
}

const upsertCell = (xml, ref, value, { preserveFormula = false, forceText = false } = {}) => {
  const cellRegex = new RegExp(
    `(?:<c r="${ref}"[^>]*?\\/>|<c r="${ref}"[^>]*>.*?<\\/c>)`,
  )
  const existing = xml.match(cellRegex)?.[0]
  const styleId = existing?.match(/\bs="(\d+)"/)?.[1]

  let replacement
  if (preserveFormula && existing?.includes('<f')) {
    const cached = typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : xmlEscape(value ?? '')
    replacement = existing.includes('<v>')
      ? existing.replace(/<v>.*?<\/v>/, `<v>${cached}</v>`)
      : existing.replace('</c>', `<v>${cached}</v></c>`)
  } else {
    replacement = valueCell(ref, value, styleId, { forceText })
  }

  if (existing) return xml.replace(cellRegex, replacement)

  const rowNumber = Number(ref.match(/\d+$/)?.[0])
  const rowRegex = new RegExp(`(<row\\b[^>]*\\br="${rowNumber}"[^>]*>)(.*?)(<\\/row>)`)
  if (rowRegex.test(xml)) return xml.replace(rowRegex, `$1$2${replacement}$3`)

  const newRow = `<row r="${rowNumber}">${replacement}</row>`
  const sheetData = xml.match(/<sheetData>(.*?)<\/sheetData>/)
  if (!sheetData) throw new Error(`Cannot insert ${ref}: sheetData not found`)

  const nextRow = [...sheetData[1].matchAll(/<row\b[^>]*\br="(\d+)"/g)]
    .find((match) => Number(match[1]) > rowNumber)
  if (nextRow) {
    const nextRowRegex = new RegExp(`(<row\\b[^>]*\\br="${nextRow[1]}"[^>]*(?:\\/>|>.*?<\\/row>))`)
    return xml.replace(nextRowRegex, `${newRow}$1`)
  }
  return xml.replace('</sheetData>', `${newRow}</sheetData>`)
}

const fetchLogData = async () => {
  const { rows } = await query(`
    SELECT DISTINCT ON (employee_id, course_name)
      employee_id, employee_name, directorate, sub_directorate,
      course_name, completion_status, completion_percentage, overall_completion,
      completion_date, score
    FROM raw_log_plus
    ORDER BY employee_id, course_name, id DESC
  `)

  const employees = new Map()
  for (const row of rows) {
    const employeeId = String(row.employee_id ?? '').trim()
    if (!employeeId) continue
    if (!employees.has(employeeId)) {
      employees.set(employeeId, {
        employeeId,
        employeeName: row.employee_name || '',
        directorate: row.directorate || '',
        subDirectorate: row.sub_directorate || '',
        overallCompletion: row.overall_completion === null
          ? null
          : Number(row.overall_completion) / 100,
        courses: new Map(),
      })
    }
    employees.get(employeeId).courses.set(row.course_name, {
      status: row.completion_status,
      percentage: Number(row.completion_percentage || 0),
      completionDate: row.completion_date,
      score: Number(row.score || 0),
    })
  }
  return employees
}

const fetchVrData = async () => {
  const { rows } = await query(`
    SELECT DISTINCT ON (employee_id)
      employee_id, employee_name, directorate, sub_directorate,
      region, branch, forward_30_score, completion_time, completion_status
    FROM raw_vr_learning
    ORDER BY employee_id, id DESC
  `)

  return new Map(rows.map((row) => [String(row.employee_id).trim(), row]))
}

const logCompletion = (employee) => {
  if (!employee) return 0
  if (Number.isFinite(employee.overallCompletion)) return employee.overallCompletion
  const courses = COURSE_COLUMNS.filter(Boolean)
  const completed = courses.filter(
    (course) => employee.courses.get(course)?.status === 'Completed',
  ).length
  return courses.length ? completed / courses.length : 0
}

const courseDisplay = (course) => {
  if (!course || (!course.percentage && course.status !== 'Completed')) return 'Incompleted'
  if (course.status !== 'Completed') return `${course.percentage.toFixed(2)}%`

  const date = course.completionDate
    ? new Date(course.completionDate).toISOString().slice(0, 19).replace('T', ' ')
    : ''
  const suffix = [date, `(${course.score})`].filter(Boolean).join(' ')
  return suffix ? `Completed ${suffix}` : 'Completed'
}

const buildLogRows = (sheetXml, employees) => {
  const styles = getColumnStyles(getRowXml(sheetXml, 4))
  const forceText = new Set([1, 2, 3, 4, 5, 6, 8, ...Array.from({ length: 25 }, (_, i) => i + 9)])

  return [...employees.values()]
    .sort((a, b) => a.employeeId.localeCompare(b.employeeId))
    .map((employee, index) => {
      const values = [
        index + 1,
        employee.employeeId,
        employee.employeeName,
        employee.hireDate || '',
        employee.email || '',
        employee.directorate,
        employee.subDirectorate,
        employee.statusActive ?? true,
        logCompletion(employee),
      ]
      for (const courseName of COURSE_COLUMNS) {
        values.push(courseName ? courseDisplay(employee.courses.get(courseName)) : '')
      }
      return makeRow(index + 4, values, styles, forceText)
    })
}

const buildVrRows = (sheetXml, employees) => {
  const styles = getColumnStyles(getRowXml(sheetXml, 3))
  const forceText = new Set([0, 1, 2, 3, 4, 5, 6, 8, 9])

  return [...employees.values()]
    .sort((a, b) => String(a.employee_id).localeCompare(String(b.employee_id)))
    .map((employee, index) => {
      const completed = employee.completion_status === 'Completed'
      const values = [
        String(employee.employee_id),
        employee.employee_name || '',
        employee.directorate || '',
        employee.sub_directorate || '',
        '',
        employee.region || '',
        employee.branch || '',
        Number(employee.forward_30_score || 0),
        employee.completion_time || '',
        employee.completion_status || 'Incompleted',
        completed ? 1 : 0,
      ]
      return makeRow(index + 3, values, styles, forceText)
    })
}

const patchMandatoryNips = (xml, nips) => {
  const existingLastRow = Number(xml.match(/<dimension ref="[^"]*?(\d+)"\/>/)?.[1] || 0)
  if (nips.length + 1 > existingLastRow) {
    throw new Error(
      `Mandatory NIP count (${nips.length}) exceeds sample capacity (${existingLastRow - 1})`,
    )
  }

  const sheetData = xml.match(/<sheetData>(.*?)<\/sheetData>/)
  if (!sheetData) throw new Error('Mandatory worksheet sheetData not found')

  const replaceRowCell = (rowXml, ref, value) => {
    const regex = new RegExp(
      `(?:<c r="${ref}"[^>]*?\\/>|<c r="${ref}"[^>]*>.*?<\\/c>)`,
    )
    const existing = rowXml.match(regex)?.[0]
    if (!existing) return rowXml
    const styleId = existing.match(/\bs="(\d+)"/)?.[1]
    return rowXml.replace(regex, valueCell(ref, value, styleId))
  }

  const rows = sheetData[1].replace(
    /<row\b[^>]*\br="(\d+)"[^>]*(?:\/>|>.*?<\/row>)/g,
    (rowXml, rowNumberText) => {
      const rowNumber = Number(rowNumberText)
      if (rowNumber < 2) return rowXml
      const nip = nips[rowNumber - 2]
      let patched = replaceRowCell(rowXml, `A${rowNumber}`, nip ? rowNumber - 1 : '')
      patched = replaceRowCell(
        patched,
        `B${rowNumber}`,
        nip && /^\d+$/.test(nip) ? Number(nip) : (nip || ''),
      )
      return patched
    },
  )

  return xml.replace(/<sheetData>.*?<\/sheetData>/, `<sheetData>${rows}</sheetData>`)
}

const buildSummary = (nips, mcMap, logMap, vrMap) => {
  const summary = new Map(TEMPLATE_DIRS.map((dir) => [dir, {
    total: 0,
    logDone: 0,
    vrDone: 0,
    bothDone: 0,
  }]))

  for (const nip of nips) {
    const mc = mcMap.get(nip)
    const directorate = normaliseDir(mc?.['Directorate Update'] || mc?.Directorate)
    const row = summary.get(directorate)
    if (!row) continue

    const logDone = logCompletion(logMap.get(nip)) >= 1
    const vrDone = vrMap.get(nip)?.completion_status === 'Completed'
    row.total += 1
    if (logDone) row.logDone += 1
    if (vrDone) row.vrDone += 1
    if (logDone && vrDone) row.bothDone += 1
  }

  return summary
}

const patchSummary = (xml, summary) => {
  let result = xml
  let grand = { total: 0, logDone: 0, vrDone: 0, bothDone: 0 }

  TEMPLATE_DIRS.forEach((directorate, index) => {
    const rowNumber = index + 7
    const data = summary.get(directorate)
    const logRate = data.total ? data.logDone / data.total : 0
    const vrRate = data.total ? data.vrDone / data.total : 0
    const bothRate = data.total ? data.bothDone / data.total : 0

    grand = {
      total: grand.total + data.total,
      logDone: grand.logDone + data.logDone,
      vrDone: grand.vrDone + data.vrDone,
      bothDone: grand.bothDone + data.bothDone,
    }

    result = upsertCell(result, `B${rowNumber}`, directorate, { forceText: true })
    result = upsertCell(result, `C${rowNumber}`, data.total, { preserveFormula: true })
    result = upsertCell(result, `D${rowNumber}`, data.logDone, { preserveFormula: true })
    result = upsertCell(result, `E${rowNumber}`, data.total - data.logDone, { preserveFormula: true })
    result = upsertCell(result, `F${rowNumber}`, logRate, { preserveFormula: true })
    result = upsertCell(result, `G${rowNumber}`, data.vrDone, { preserveFormula: true })
    result = upsertCell(result, `H${rowNumber}`, data.total - data.vrDone, { preserveFormula: true })
    result = upsertCell(result, `I${rowNumber}`, vrRate, { preserveFormula: true })
    result = upsertCell(result, `J${rowNumber}`, data.bothDone, { preserveFormula: true })
    result = upsertCell(result, `K${rowNumber}`, data.total - data.bothDone, { preserveFormula: true })
    result = upsertCell(result, `L${rowNumber}`, bothRate, { preserveFormula: true })
    // No source status exists yet, so keep Resign/MPP/Others as an explicit zero.
    result = upsertCell(result, `M${rowNumber}`, 0)
  })

  const grandValues = {
    C21: grand.total,
    D21: grand.logDone,
    E21: grand.total - grand.logDone,
    F21: grand.total ? grand.logDone / grand.total : 0,
    G21: grand.vrDone,
    H21: grand.total - grand.vrDone,
    I21: grand.total ? grand.vrDone / grand.total : 0,
    J21: grand.bothDone,
    K21: grand.total - grand.bothDone,
    L21: grand.total ? grand.bothDone / grand.total : 0,
    M21: 0,
  }
  for (const [ref, value] of Object.entries(grandValues)) {
    result = upsertCell(result, ref, value, { preserveFormula: ref !== 'M21' })
  }

  result = upsertCell(
    result,
    'B22',
    'Catatan: Resign/MPP/Others belum dihitung karena sumber data status belum tersedia.',
    { forceText: true },
  )

  return result
}

export const buildSampleBasedExportBuffer = async () => {
  const [nips, mcMap, logMap, vrMap] = await Promise.all([
    getMandatoryNipList(),
    buildMcLookup(),
    fetchLogData(),
    fetchVrData(),
  ])

  const templatePath = await getExportTemplatePath()
  const sampleBuffer = fs.readFileSync(templatePath)
  const zip = await JSZip.loadAsync(sampleBuffer)

  const [
    summaryXml,
    mandatoryXml,
    logXml,
    vrXml,
    sharedStringsXml,
  ] = await Promise.all([
    zip.file('xl/worksheets/sheet1.xml').async('string'),
    zip.file('xl/worksheets/sheet2.xml').async('string'),
    zip.file('xl/worksheets/sheet3.xml').async('string'),
    zip.file('xl/worksheets/sheet4.xml').async('string'),
    zip.file('xl/sharedStrings.xml').async('string'),
  ])

  const logDefaults = parseLogDefaults(logXml, sharedStringsXml)
  for (const [employeeId, employee] of logMap) {
    const defaults = logDefaults.get(employeeId)
    if (!defaults) continue
    employee.hireDate = defaults.hireDate
    employee.email = defaults.email
    employee.statusActive = defaults.statusActive
    if (!Number.isFinite(employee.overallCompletion)) {
      employee.overallCompletion = defaults.overallCompletion
    }
  }

  const summary = buildSummary(nips, mcMap, logMap, vrMap)
  const logRows = buildLogRows(logXml, logMap)
  const vrRows = buildVrRows(vrXml, vrMap)

  zip.file('xl/worksheets/sheet1.xml', patchSummary(summaryXml, summary))
  zip.file('xl/worksheets/sheet2.xml', patchMandatoryNips(mandatoryXml, nips))
  zip.file('xl/worksheets/sheet3.xml', replaceDataRows(logXml, 3, logRows, 34))
  zip.file('xl/worksheets/sheet4.xml', replaceDataRows(vrXml, 2, vrRows, 11))

  // Formula cells changed, so the template calculation chain is no longer valid.
  // Removing all three package references lets Excel rebuild it without recovery.
  const [workbookRels, contentTypes] = await Promise.all([
    zip.file('xl/_rels/workbook.xml.rels').async('string'),
    zip.file('[Content_Types].xml').async('string'),
  ])
  zip.remove('xl/calcChain.xml')
  zip.file(
    'xl/_rels/workbook.xml.rels',
    workbookRels.replace(
      /<Relationship\b(?=[^>]*Type="[^"]*\/calcChain")[^>]*\/>/,
      '',
    ),
  )
  zip.file(
    '[Content_Types].xml',
    contentTypes.replace(
      /<Override\b(?=[^>]*PartName="\/xl\/calcChain\.xml")[^>]*\/>/,
      '',
    ),
  )

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    platform: 'DOS',
  })
}
