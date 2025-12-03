/**
 * Utilidades para generar archivos CSV
 * 
 * Convierte arrays de objetos JavaScript a formato CSV
 * con encabezados y valores escapados correctamente.
 */

/**
 * Escapa un valor para CSV (maneja comillas y comas)
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const str = String(value)
  
  // Si contiene comillas, comas o saltos de línea, encerrar en comillas
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  
  return str
}

/**
 * Convierte un array de objetos a CSV
 * 
 * @param data Array de objetos (cada objeto es una fila)
 * @param headers Opcional: array de nombres de columnas. Si no se proporciona, se usan las keys del primer objeto
 * @returns String CSV con encabezados y datos
 */
export function arrayToCsv(data: Record<string, any>[], headers?: string[]): string {
  if (data.length === 0) {
    return ''
  }

  // Obtener headers si no se proporcionaron
  const csvHeaders = headers || Object.keys(data[0])
  
  // Construir línea de encabezados
  const headerLine = csvHeaders.map(escapeCsvValue).join(',')
  
  // Construir líneas de datos
  const dataLines = data.map(row => {
    return csvHeaders.map(header => escapeCsvValue(row[header])).join(',')
  })
  
  // Unir todo
  return [headerLine, ...dataLines].join('\n')
}

/**
 * Genera un nombre de archivo CSV con timestamp
 */
export function generateCsvFilename(baseName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${baseName}_${timestamp}.csv`
}

