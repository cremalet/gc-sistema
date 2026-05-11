// Helpers compartilhados pra montar planilhas XLSX nos handlers de /api/export.
// Cada handler define colunas + rows e chama `buildWorkbookResponse`.

import ExcelJS from 'exceljs'
import { NextResponse } from 'next/server'

export type ColumnDef<T> = {
  /** Header exibido no XLSX */
  header: string
  /** Largura sugerida em "characters" (ExcelJS unit) */
  width?: number
  /** Função pra extrair o valor da row */
  value: (row: T) => string | number | Date | null
  /** Formato de célula (ex: '#,##0.00' pra BRL, 'dd/mm/yyyy' pra data) */
  numFmt?: string
  /** Se true, soma essa coluna na linha de totais */
  sum?: boolean
}

export type BuildSheetOptions<T> = {
  sheetName: string
  /** Linhas extras no topo (cabeçalho com nome da entidade, filtros, data) */
  metaRows?: Array<Array<string | number | null>>
  columns: ColumnDef<T>[]
  rows: T[]
  /** Mostra uma linha "Total" no final somando colunas marcadas com sum:true */
  includeTotals?: boolean
}

export async function buildWorkbook<T>(
  options: BuildSheetOptions<T>,
): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'GC-Sistema'
  wb.created = new Date()

  const ws = wb.addWorksheet(options.sheetName)

  let nextRow = 1

  // Meta rows (cabeçalho informativo antes da tabela)
  if (options.metaRows) {
    options.metaRows.forEach((meta, metaIdx) => {
      const row = ws.getRow(nextRow++)
      meta.forEach((cell, i) => {
        row.getCell(i + 1).value = cell
      })
      // Primeira linha (geralmente o título) fica em bold
      if (metaIdx === 0) row.font = { bold: true, size: 14 }
    })
    nextRow++ // linha em branco
  }

  // Header da tabela
  const headerRow = ws.getRow(nextRow++)
  options.columns.forEach((col, i) => {
    headerRow.getCell(i + 1).value = col.header
    if (col.width) {
      ws.getColumn(i + 1).width = col.width
    }
  })
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEEEEEE' },
  }

  // Data rows
  const dataStartRow = nextRow
  for (const row of options.rows) {
    const r = ws.getRow(nextRow++)
    options.columns.forEach((col, i) => {
      const v = col.value(row)
      const cell = r.getCell(i + 1)
      cell.value = v ?? ''
      if (col.numFmt) cell.numFmt = col.numFmt
    })
  }
  const dataEndRow = nextRow - 1

  // Totals
  if (options.includeTotals && options.rows.length > 0) {
    const totalRow = ws.getRow(nextRow++)
    totalRow.getCell(1).value = 'TOTAL'
    options.columns.forEach((col, i) => {
      if (col.sum) {
        const colLetter = ws.getColumn(i + 1).letter
        totalRow.getCell(i + 1).value = {
          formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
        }
        if (col.numFmt) totalRow.getCell(i + 1).numFmt = col.numFmt
      }
    })
    totalRow.font = { bold: true }
    totalRow.border = { top: { style: 'thin' } }
  }

  return wb
}

export async function buildWorkbookResponse<T>(
  filename: string,
  options: BuildSheetOptions<T>,
): Promise<Response> {
  const wb = await buildWorkbook(options)
  const buffer = await wb.xlsx.writeBuffer()

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

export const BRL_FORMAT = '"R$" #,##0.00'
export const DATE_FORMAT = 'dd/mm/yyyy'

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}
