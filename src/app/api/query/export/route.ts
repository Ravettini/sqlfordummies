/**
 * API Route: Exportar query del constructor visual
 * 
 * POST /api/query/export?format=csv|xlsx
 * 
 * Recibe una QueryStructure, genera SQL seguro, lo ejecuta
 * y devuelve los resultados como CSV o XLSX descargable.
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueryStructure } from '@/lib/types/queryBuilder'
import { buildSqlFromQuery } from '@/lib/sql-builder/buildSql'
import { prisma } from '@/lib/db'
import { arrayToCsv, generateCsvFilename } from '@/lib/utils/csv'
import { arrayToXlsx, generateXlsxFilename } from '@/lib/utils/xlsx'

const MAX_ROWS = 50000

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'
    const body = await request.json()
    const query: QueryStructure = body

    // Validar estructura básica
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
    let results: any[]
    if (params.length > 0) {
      // Reemplazar placeholders con valores escapados
      let paramIndex = 0
      const escapedSql = sql.replace(/\?/g, () => {
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

    // Generar archivo según formato
    if (format === 'xlsx') {
      const buffer = arrayToXlsx(rows, 'Consulta')
      const filename = generateXlsxFilename('consulta')

      // Convertir Buffer a Uint8Array para NextResponse
      const uint8Array = new Uint8Array(buffer)

      return new NextResponse(uint8Array, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } else {
      // CSV por defecto
      const csv = arrayToCsv(rows)
      const filename = generateCsvFilename('consulta')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }
  } catch (error: any) {
    console.error('Error exportando query:', error)
    
    let errorMessage = 'Error al ejecutar la consulta.'
    if (error.message?.includes('no permitida')) {
      errorMessage = error.message
    } else if (error.message?.includes('Debe')) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

