import {
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  type LucideIcon,
} from 'lucide-react'

import { fileExtension } from './files'

/**
 * Mapeia MIME type (com fallback pra extensão) em um ícone lucide.
 * Usar SÓ em Client Components — importa React components.
 */
export function iconForFile(tipo: string, filename?: string): LucideIcon {
  const mime = tipo.toLowerCase()
  const ext = filename ? fileExtension(filename) : ''

  if (mime === 'application/pdf' || ext === '.pdf') return FileText
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    ext === '.xlsx' ||
    ext === '.xls'
  ) {
    return FileSpreadsheet
  }
  if (mime.includes('word') || ext === '.docx' || ext === '.doc') {
    return FileText
  }
  if (
    mime.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)
  ) {
    return FileImage
  }
  return FileIcon
}
