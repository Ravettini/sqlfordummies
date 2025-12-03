/**
 * API Route: Listar todas las tablas disponibles en la base de datos
 * 
 * GET /api/meta/tablas-disponibles
 * 
 * Devuelve todas las tablas que existen en la base de datos actual.
 * Útil para diagnosticar problemas con nombres de tablas.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Obtener todas las tablas de la base de datos actual
    const tables = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        TABLE_NAME as name,
        TABLE_NAME as label
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `)

    // Asegurarse de que sea un array
    const tableList = Array.isArray(tables) ? tables : []

    return NextResponse.json({
      tables: tableList,
      count: tableList.length,
      database: process.env.DATABASE_URL ? 'connected' : 'not_configured',
    })
  } catch (error: any) {
    console.error('Error obteniendo tablas disponibles:', error)
    return NextResponse.json(
      {
        error: 'Error al obtener las tablas de la base de datos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        tables: [],
        count: 0,
      },
      { status: 500 }
    )
  }
}

