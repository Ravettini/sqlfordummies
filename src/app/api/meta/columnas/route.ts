/**
 * API Route: Metadatos de columnas
 * 
 * GET /api/meta/columnas?tabla=dotacion_gcba_prueba
 * 
 * Devuelve las columnas disponibles para una tabla específica.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getColumns } from '@/lib/sql-builder/meta'

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

    const columnas = getColumns(tabla)
    
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

