/**
 * API Route: Metadatos de tablas
 * 
 * GET /api/meta/tablas
 * 
 * Devuelve la lista de tablas disponibles para el constructor visual.
 */

import { NextResponse } from 'next/server'
import { getTables } from '@/lib/sql-builder/meta'

export async function GET() {
  try {
    const tablas = getTables()
    return NextResponse.json(tablas)
  } catch (error: any) {
    console.error('Error obteniendo tablas:', error)
    return NextResponse.json(
      { error: 'Error al obtener las tablas' },
      { status: 500 }
    )
  }
}

