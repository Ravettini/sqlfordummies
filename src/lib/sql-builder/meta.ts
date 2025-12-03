/**
 * Utilidades para obtener metadatos de tablas y columnas
 * 
 * Proporciona información sobre las tablas y columnas disponibles
 * para el constructor visual de queries.
 */

// Lista de tablas permitidas con sus etiquetas
export const ALLOWED_TABLES = [
  {
    name: 'dotacion_gcba_prueba',
    label: 'Dotación GCBA (Prueba)',
    description: 'Tabla principal de dotación del GCBA',
  },
  {
    name: 'padron',
    label: 'Padrón',
    description: 'Tabla de padrón',
  },
]

// Columnas de dotacion_gcba_prueba con sus tipos
export const DOTACION_COLUMNS = [
  { name: 'id_dotacion', type: 'number', label: 'ID Dotación' },
  { name: 'MINISTERIO', type: 'string', label: 'Ministerio' },
  { name: 'CUIL', type: 'string', label: 'CUIL' },
  { name: 'AYN', type: 'string', label: 'Apellido y Nombre' },
  { name: 'FEC_NACIM', type: 'date', label: 'Fecha de Nacimiento' },
  { name: 'SEXO', type: 'string', label: 'Sexo' },
  { name: 'TIP_DOC', type: 'string', label: 'Tipo de Documento' },
  { name: 'NUM_DOC', type: 'string', label: 'Número de Documento' },
  { name: 'INGRESO', type: 'date', label: 'Fecha de Ingreso' },
  { name: 'ROL', type: 'number', label: 'Rol' },
  { name: 'LIT_PUESTO', type: 'string', label: 'Literal Puesto' },
  { name: 'REGIMEN', type: 'string', label: 'Régimen' },
  { name: 'SIGLA', type: 'string', label: 'Sigla' },
  { name: 'COD_REP', type: 'string', label: 'Código REP' },
  { name: 'DESC_REP', type: 'string', label: 'Descripción REP' },
  { name: 'PATH_NOMBRES', type: 'string', label: 'Path Nombres' },
  { name: 'DOMICILIO_LABORAL', type: 'string', label: 'Domicilio Laboral' },
  { name: 'LIT_AGRUPAMIENTO', type: 'string', label: 'Literal Agrupamiento' },
  { name: 'MAIL_LABORAL', type: 'string', label: 'Mail Laboral' },
  { name: 'MAIL_PERSONAL', type: 'string', label: 'Mail Personal' },
  { name: 'MAIL_MIA', type: 'string', label: 'Mail MIA' },
  { name: 'DOMICILIO_PERSONAL', type: 'string', label: 'Domicilio Personal' },
  { name: 'CP', type: 'string', label: 'Código Postal' },
  { name: 'DISCAP', type: 'string', label: 'Discapacidad' },
  { name: 'CUIL_SIN_GUIONES', type: 'string', label: 'CUIL Sin Guiones' },
]

/**
 * Obtiene todas las tablas permitidas
 */
export function getTables() {
  return ALLOWED_TABLES
}

/**
 * Obtiene las columnas de una tabla específica
 * Para tablas conocidas, devuelve las columnas estáticas
 * Para otras tablas permitidas, se pueden obtener dinámicamente desde la base de datos
 */
export function getColumns(tableName: string) {
  if (tableName === 'dotacion_gcba_prueba') {
    return DOTACION_COLUMNS
  }
  // Para otras tablas permitidas, se obtendrán dinámicamente desde la API
  // Por ahora retornamos array vacío, la API las obtendrá de la BD
  return []
}

/**
 * Valida que una tabla esté permitida
 */
export function isValidTable(tableName: string): boolean {
  return ALLOWED_TABLES.some(t => t.name === tableName)
}

/**
 * Valida que una columna exista en una tabla
 */
export function isValidColumn(tableName: string, columnName: string): boolean {
  const columns = getColumns(tableName)
  return columns.some(c => c.name === columnName)
}

