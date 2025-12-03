/**
 * API Route: Obtener lista de ministerios
 * 
 * GET /api/meta/ministerios
 * 
 * Devuelve todos los ministerios únicos de la base de datos
 * para generar cards dinámicas en la página de descargas.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const results = await prisma.$queryRawUnsafe<Array<{ MINISTERIO: string }>>(`
      SELECT DISTINCT MINISTERIO
      FROM \`dotacion_gcba_prueba\`
      WHERE MINISTERIO IS NOT NULL
        AND MINISTERIO <> ''
      ORDER BY MINISTERIO
    `)

    const ministerios = results.map(row => row.MINISTERIO).filter(Boolean)

    return NextResponse.json({ ministerios })
  } catch (error: any) {
    console.error('Error obteniendo ministerios:', error)
    return NextResponse.json(
      { error: 'Error al obtener los ministerios', ministerios: [] },
      { status: 500 }
    )
  }
}

