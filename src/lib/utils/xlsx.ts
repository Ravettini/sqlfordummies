/**
 * Utilidades para generar archivos XLSX
 * 
 * Usa la librería 'xlsx' para crear archivos Excel desde arrays de objetos.
 */

import * as XLSX from 'xlsx'

/**
 * Convierte un array de objetos a un buffer XLSX
 * 
 * @param data Array de objetos (cada objeto es una fila)
 * @param sheetName Nombre de la hoja (por defecto "Datos")
 * @returns Buffer del archivo XLSX
 */
export function arrayToXlsx(
  data: Record<string, any>[],
  sheetName: string = 'Datos'
): Buffer {
  // Crear un workbook
  const workbook = XLSX.utils.book_new()
  
  // Convertir array de objetos a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  
  // Generar buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  return buffer
}

/**
 * Genera un nombre de archivo XLSX con timestamp
 */
export function generateXlsxFilename(baseName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${baseName}_${timestamp}.xlsx`
}

