/**
 * API Route: Ejecutar query del constructor visual
 * 
 * POST /api/query/execute
 * 
 * Recibe una QueryStructure, genera SQL seguro, lo ejecuta
 * y devuelve los resultados en JSON.
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueryStructure } from '@/lib/types/queryBuilder'
import { buildSqlFromQuery } from '@/lib/sql-builder/buildSql'
import { prisma } from '@/lib/db'

const MAX_ROWS = 50000 // Límite máximo de filas

export async function POST(request: NextRequest) {
  let query: QueryStructure | null = null
  
  try {
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Error al parsear el cuerpo de la solicitud. Verifica que el formato JSON sea válido.' },
        { status: 400 }
      )
    }

    query = body as QueryStructure

    // Validar estructura básica
    if (!query) {
      return NextResponse.json(
        { error: 'El cuerpo de la solicitud está vacío' },
        { status: 400 }
      )
    }

    if (!query.select || query.select.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos una columna' },
        { status: 400 }
      )
    }

    if (!query.from || !query.from.name) {
      return NextResponse.json(
        { error: 'Debe especificar una tabla' },
        { status: 400 }
      )
    }

    // Construir SQL seguro
    const { sql, params } = buildSqlFromQuery(query, MAX_ROWS)

    // Ejecutar consulta
    // Nota: Usamos $queryRawUnsafe porque Prisma no soporta parámetros tipados
    // para MySQL de la misma forma que PostgreSQL. Sin embargo, el SQL viene
    // de buildSqlFromQuery que valida tablas/columnas, y escapamos valores.
    let results: any[]
    if (params.length > 0) {
      // Reemplazar placeholders con valores escapados
      let paramIndex = 0
      const escapedSql = sql.replace(/\?/g, () => {
        const param = params[paramIndex++]
        // Escapar valores para prevenir inyección
        if (param === null || param === undefined) {
          return 'NULL'
        }
        if (typeof param === 'string') {
          // Escapar comillas simples
          return `'${param.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`
        }
        if (typeof param === 'number') {
          return String(param)
        }
        if (param instanceof Date) {
          return `'${param.toISOString().slice(0, 19).replace('T', ' ')}'`
        }
        return `'${String(param).replace(/'/g, "''")}'`
      })
      results = await prisma.$queryRawUnsafe<any[]>(escapedSql)
    } else {
      results = await prisma.$queryRawUnsafe<any[]>(sql)
    }

    // Convertir resultados a formato plano
    const rows = results.map((row: any) => {
      const plainRow: Record<string, any> = {}
      for (const key in row) {
        if (row[key] instanceof Date) {
          plainRow[key] = row[key].toISOString().split('T')[0]
        } else {
          plainRow[key] = row[key]
        }
      }
      return plainRow
    })

    // Generar SQL final con valores escapados para mostrar al usuario
    let finalSql = sql
    if (params.length > 0) {
      let paramIndex = 0
      finalSql = sql.replace(/\?/g, () => {
        const param = params[paramIndex++]
        if (param === null || param === undefined) {
          return 'NULL'
        }
        if (typeof param === 'string') {
          return `'${param.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`
        }
        if (typeof param === 'number') {
          return String(param)
        }
        if (param instanceof Date) {
          return `'${param.toISOString().slice(0, 19).replace('T', ' ')}'`
        }
        return `'${String(param).replace(/'/g, "''")}'`
      })
    }

    return NextResponse.json({
      sql: finalSql, // SQL final con valores para mostrar
      rows,
      rowCount: rows.length,
    })
  } catch (error: any) {
    console.error('Error ejecutando query:', error)
    if (query) {
      console.error('Query recibida:', JSON.stringify(query, null, 2))
    } else {
      console.error('No se pudo parsear la query del request')
    }
    
    // Mensaje de error más detallado para debugging
    let errorMessage = 'Error al ejecutar la consulta.'
    let statusCode = 400
    
    if (error.message?.includes('no permitida')) {
      errorMessage = error.message
    } else if (error.message?.includes('Debe')) {
      errorMessage = error.message
    } else if (error.message?.includes('Unknown column') || error.message?.includes('Table')) {
      errorMessage = 'Error en la estructura de la consulta. Verifica que las columnas y tablas sean correctas.'
    } else if (error.message?.includes('Connection') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Error de conexión a la base de datos. Verifica la configuración.'
      statusCode = 500
    } else if (error.message) {
      // En desarrollo, mostrar más detalles
      if (process.env.NODE_ENV === 'development') {
        errorMessage = `Error: ${error.message}`
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: statusCode }
    )
  }
}

