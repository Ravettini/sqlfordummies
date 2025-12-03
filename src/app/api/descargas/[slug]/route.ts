/**
 * API Route: Descargas rápidas predefinidas
 * 
 * GET /api/descargas/[slug]?format=csv|xlsx&param1=value1&distinct=true
 * 
 * Ejecuta una consulta predefinida con parámetros y opción DISTINCT,
 * devuelve el resultado como CSV o XLSX descargable.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDescargaBySlug } from '@/lib/descargas/config'
import { prisma } from '@/lib/db'
import { arrayToCsv, generateCsvFilename } from '@/lib/utils/csv'
import { arrayToXlsx, generateXlsxFilename } from '@/lib/utils/xlsx'

const MAX_ROWS = 50000 // Límite máximo de seguridad

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv' // csv o xlsx
    const distinct = searchParams.get('distinct') === 'true'

    // Buscar la configuración de descarga
    const descarga = getDescargaBySlug(slug)
    if (!descarga) {
      return NextResponse.json(
        { error: 'Descarga no encontrada' },
        { status: 404 }
      )
    }

    // Recopilar parámetros desde searchParams
    const paramsObj: Record<string, any> = {}
    if (descarga.params) {
      for (const param of descarga.params) {
        const value = searchParams.get(param.name)
        if (value !== null) {
          if (param.type === 'number') {
            paramsObj[param.name] = parseInt(value, 10)
          } else {
            paramsObj[param.name] = value
          }
        } else if (param.required && param.defaultValue !== undefined) {
          paramsObj[param.name] = param.defaultValue
        }
      }
    }

    // Validar parámetros requeridos
    if (descarga.params) {
      for (const param of descarga.params) {
        if (param.required && !paramsObj[param.name]) {
          return NextResponse.json(
            { error: `Parámetro requerido faltante: ${param.label}` },
            { status: 400 }
          )
        }
      }
    }

    // Determinar si usar DISTINCT
    const useDistinct = distinct || (descarga.defaultDistinct && !descarga.allowDistinct ? true : distinct)

    // Construir SQL con parámetros y DISTINCT
    const sql = descarga.buildSql({ 
      params: paramsObj, 
      distinct: useDistinct 
    })

    // Ejecutar consulta (usar $queryRawUnsafe solo porque el SQL viene de código interno)
    // No agregamos LIMIT automático aquí, solo el de seguridad si es necesario
    const results = await prisma.$queryRawUnsafe<any[]>(sql)

    // Limitar resultados si exceden el máximo (solo para seguridad)
    const limitedResults = results.slice(0, MAX_ROWS)

    // Convertir resultados a formato plano
    const rows = limitedResults.map((row: any) => {
      const plainRow: Record<string, any> = {}
      for (const key in row) {
        // Convertir fechas a strings ISO
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
      const buffer = arrayToXlsx(rows, 'Datos')
      const filename = generateXlsxFilename(descarga.slug)

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
      const filename = generateCsvFilename(descarga.slug)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }
  } catch (error: any) {
    console.error('Error en descarga:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar la consulta. Por favor, verifique los datos.' },
      { status: 500 }
    )
  }
}
