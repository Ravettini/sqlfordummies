/**
 * API Route: Metadatos de columnas
 * 
 * GET /api/meta/columnas?tabla=dotacion_gcba_prueba
 * 
 * Devuelve las columnas disponibles para una tabla específica.
 * Si la tabla no está en la lista estática, las obtiene dinámicamente de la BD.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getColumns, isValidTable } from '@/lib/sql-builder/meta'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tabla = searchParams.get('tabla')

    if (!tabla) {
      return NextResponse.json(
        { error: 'Parámetro "tabla" requerido' },
        { status: 400 }
      )
    }

    // Validar que la tabla esté permitida
    if (!isValidTable(tabla)) {
      return NextResponse.json(
        { error: 'Tabla no permitida' },
        { status: 403 }
      )
    }

    // Intentar obtener columnas estáticas primero
    let columnas = getColumns(tabla)
    
    // Si no hay columnas estáticas, obtenerlas dinámicamente de la BD
    if (columnas.length === 0) {
      try {
        // Validar que el nombre de la tabla sea seguro antes de usarlo en la query
        if (!/^[a-zA-Z0-9_\-]+$/.test(tabla)) {
          return NextResponse.json(
            { error: 'Nombre de tabla inválido' },
            { status: 400 }
          )
        }
        
        // Escapar el nombre de la tabla para prevenir inyección SQL
        const escapedTable = tabla.replace(/'/g, "''")
        
        // Consultar información de columnas desde INFORMATION_SCHEMA
        // Usamos DATABASE() para obtener el schema actual
        const columnInfo = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            COLUMN_NAME as name,
            DATA_TYPE as type,
            COLUMN_NAME as label
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = '${escapedTable}'
          ORDER BY ORDINAL_POSITION
        `)

        // Asegurarse de que columnInfo sea un array
        if (Array.isArray(columnInfo) && columnInfo.length > 0) {
          columnas = columnInfo.map((col: any) => ({
            name: col.name,
            type: mapDataTypeToColumnType(col.type),
            label: col.label || col.name,
          }))
          console.log(`Columnas obtenidas para ${tabla}:`, columnas.length)
        } else {
          // Si no se encontraron columnas, puede ser que la tabla no exista o tenga otro nombre
          console.warn(`No se encontraron columnas para la tabla: ${tabla}. Resultado de query:`, columnInfo)
          
          // Intentar verificar si la tabla existe con otro formato (case-insensitive)
          try {
            const tableCheck = await prisma.$queryRawUnsafe<any[]>(`
              SELECT TABLE_NAME
              FROM INFORMATION_SCHEMA.TABLES
              WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME LIKE '%${escapedTable}%'
              LIMIT 5
            `)
            if (Array.isArray(tableCheck) && tableCheck.length > 0) {
              console.log(`Tablas similares encontradas:`, tableCheck.map((t: any) => t.TABLE_NAME))
            }
          } catch (checkError) {
            console.error('Error verificando existencia de tabla:', checkError)
          }
          
          columnas = []
        }
      } catch (dbError: any) {
        console.error('Error obteniendo columnas de BD:', dbError)
        // Si hay un error de conexión o de query, devolver error 500
        return NextResponse.json(
          { 
            error: 'Error al obtener las columnas de la base de datos',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          },
          { status: 500 }
        )
      }
    }

    if (columnas.length === 0) {
      return NextResponse.json(
        { error: 'Tabla no encontrada o sin columnas' },
        { status: 404 }
      )
    }

    return NextResponse.json(columnas)
  } catch (error: any) {
    console.error('Error obteniendo columnas:', error)
    return NextResponse.json(
      { error: 'Error al obtener las columnas' },
      { status: 500 }
    )
  }
}

/**
 * Mapea tipos de datos de MySQL a tipos de columna del sistema
 */
function mapDataTypeToColumnType(mysqlType: string): 'string' | 'number' | 'date' {
  const type = mysqlType.toLowerCase()
  
  if (type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double') || type.includes('numeric')) {
    return 'number'
  }
  
  if (type.includes('date') || type.includes('time')) {
    return 'date'
  }
  
  return 'string'
}

