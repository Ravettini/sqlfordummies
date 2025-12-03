/**
 * Constructor de SQL seguro desde QueryStructure
 * 
 * Convierte una estructura tipada (QueryStructure) en SQL válido,
 * validando tablas y columnas contra listas blancas para prevenir
 * inyección SQL.
 */

import { QueryStructure, ColumnRef, Condition, OrderBy } from '../types/queryBuilder'

// Lista blanca de tablas permitidas
const ALLOWED_TABLES = ['dotacion_gcba_prueba', 'padron']

// Lista blanca de columnas de dotacion_gcba_prueba
const DOTACION_COLUMNS = [
  'id_dotacion',
  'MINISTERIO',
  'CUIL',
  'AYN',
  'FEC_NACIM',
  'SEXO',
  'TIP_DOC',
  'NUM_DOC',
  'INGRESO',
  'ROL',
  'LIT_PUESTO',
  'REGIMEN',
  'SIGLA',
  'COD_REP',
  'DESC_REP',
  'PATH_NOMBRES',
  'DOMICILIO_LABORAL',
  'LIT_AGRUPAMIENTO',
  'MAIL_LABORAL',
  'MAIL_PERSONAL',
  'MAIL_MIA',
  'DOMICILIO_PERSONAL',
  'CP',
  'DISCAP',
  'CUIL_SIN_GUIONES',
]

// Mapeo de tablas a sus columnas permitidas
const TABLE_COLUMNS: Record<string, string[]> = {
  dotacion_gcba_prueba: DOTACION_COLUMNS,
}

/**
 * Valida que una tabla esté en la lista blanca
 */
function validateTable(tableName: string): void {
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error(`Tabla no permitida: ${tableName}`)
  }
}

/**
 * Valida que un nombre de columna sea seguro (solo letras, números, guiones bajos)
 */
function isValidColumnName(columnName: string): boolean {
  // Solo permite letras, números, guiones bajos y guiones
  // Esto previene inyección SQL básica
  return /^[a-zA-Z0-9_\-]+$/.test(columnName)
}

/**
 * Valida que una columna exista en la tabla especificada
 */
function validateColumn(tableName: string, columnName: string): void {
  validateTable(tableName)
  
  // Validar que el nombre de la columna sea seguro
  if (!isValidColumnName(columnName)) {
    throw new Error(`Nombre de columna inválido: ${columnName}`)
  }
  
  // Si la tabla tiene una lista estática de columnas, validar contra ella
  const allowedColumns = TABLE_COLUMNS[tableName]
  if (allowedColumns && allowedColumns.length > 0) {
    if (!allowedColumns.includes(columnName)) {
      throw new Error(`Columna no permitida: ${columnName} en tabla ${tableName}`)
    }
  }
  // Si no hay lista estática, confiamos en que el frontend solo muestra columnas válidas
  // obtenidas de la API, y validamos solo que el nombre sea seguro
}

/**
 * Escapa un identificador SQL (tabla o columna)
 * En MySQL, se usan backticks para nombres con mayúsculas o caracteres especiales
 */
function escapeIdentifier(name: string): string {
  return `\`${name.replace(/`/g, '``')}\``
}

/**
 * Construye la referencia a una columna (tabla.columna o solo columna)
 */
function buildColumnRef(col: ColumnRef): string {
  validateColumn(col.table, col.column)
  const tableRef = escapeIdentifier(col.table)
  const columnRef = escapeIdentifier(col.column)
  return `${tableRef}.${columnRef}`
}

/**
 * Construye una condición WHERE
 */
function buildCondition(condition: Condition, params: any[]): string {
  const leftRef = buildColumnRef(condition.left)
  
  switch (condition.operator) {
    case '=':
    case '!=':
    case '>':
    case '<':
    case '>=':
    case '<=':
      if (condition.rightColumn) {
        // Comparación entre columnas
        const rightRef = buildColumnRef(condition.rightColumn)
        return `${leftRef} ${condition.operator} ${rightRef}`
      } else {
        // Comparación con valor literal
        params.push(condition.rightValue)
        return `${leftRef} ${condition.operator} ?`
      }
    
    case 'LIKE':
      params.push(condition.rightValue)
      return `${leftRef} LIKE ?`
    
    case 'BETWEEN':
      if (!condition.betweenValues || condition.betweenValues.length !== 2) {
        throw new Error('BETWEEN requiere dos valores')
      }
      params.push(condition.betweenValues[0])
      params.push(condition.betweenValues[1])
      return `${leftRef} BETWEEN ? AND ?`
    
    case 'IN':
      if (!condition.inValues || condition.inValues.length === 0) {
        throw new Error('IN requiere al menos un valor')
      }
      const placeholders: string[] = []
      for (const value of condition.inValues) {
        params.push(value)
        placeholders.push('?')
      }
      return `${leftRef} IN (${placeholders.join(', ')})`
    
    default:
      throw new Error(`Operador no soportado: ${condition.operator}`)
  }
}

/**
 * Construye SQL desde una QueryStructure
 * 
 * @param query Estructura de la query
 * @param maxLimit Límite máximo de seguridad (solo se aplica si el usuario define un limit mayor)
 * @returns Objeto con SQL y parámetros para consulta parametrizada
 */
export function buildSqlFromQuery(
  query: QueryStructure,
  maxLimit: number = 50000
): { sql: string; params: any[] } {
  const params: any[] = []
  const parts: string[] = []
  
  // Validar tabla principal
  validateTable(query.from.name)
  
  // SELECT
  if (query.select.length === 0) {
    throw new Error('Debe seleccionar al menos una columna')
  }
  
  const selectColumns = query.select.map(col => buildColumnRef(col)).join(', ')
  // Usar SELECT DISTINCT si está habilitado
  const selectKeyword = query.distinct ? 'SELECT DISTINCT' : 'SELECT'
  parts.push(`${selectKeyword} ${selectColumns}`)
  
  // FROM
  const fromTable = escapeIdentifier(query.from.name)
  const fromAlias = query.from.alias ? ` AS ${escapeIdentifier(query.from.alias)}` : ''
  parts.push(`FROM ${fromTable}${fromAlias}`)
  
  // JOINs (por ahora no implementado, pero preparado)
  if (query.joins && query.joins.length > 0) {
    // TODO: implementar JOINs
    throw new Error('JOINs aún no están implementados')
  }
  
  // WHERE
  if (query.where && query.where.length > 0) {
    const conditions = query.where.map(cond => buildCondition(cond, params))
    parts.push(`WHERE ${conditions.join(' AND ')}`)
  }
  
  // GROUP BY
  if (query.groupBy && query.groupBy.length > 0) {
    const groupColumns = query.groupBy.map(col => buildColumnRef(col)).join(', ')
    parts.push(`GROUP BY ${groupColumns}`)
  }
  
  // ORDER BY
  if (query.orderBy && query.orderBy.length > 0) {
    const orderColumns = query.orderBy.map(order => {
      const colRef = buildColumnRef(order.column)
      return `${colRef} ${order.direction}`
    }).join(', ')
    parts.push(`ORDER BY ${orderColumns}`)
  }
  
  // LIMIT - Solo agregar si el usuario lo define explícitamente
  // Si está definido, aplicar límite de seguridad máximo
  if (query.limit !== null && query.limit !== undefined) {
    const limit = Math.min(query.limit, maxLimit)
    parts.push(`LIMIT ${limit}`)
  }
  // Si no hay limit definido, no agregamos LIMIT (sin límite)
  
  const sql = parts.join(' ')
  
  return { sql, params }
}

