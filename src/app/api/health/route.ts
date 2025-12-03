/**
 * API Route: Health check y verificación de conexión a la base de datos
 * 
 * GET /api/health
 * 
 * Verifica que la aplicación y la conexión a la base de datos estén funcionando.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Verificar que la variable de entorno esté configurada
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    
    if (!hasDatabaseUrl) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'DATABASE_URL no está configurada',
          database: 'not_configured',
        },
        { status: 500 }
      )
    }

    // Intentar una consulta simple a la base de datos
    await prisma.$queryRawUnsafe('SELECT 1 as test')
    
    // Intentar verificar que la tabla existe
    const tableCheck = await prisma.$queryRawUnsafe<any[]>(
      'SELECT COUNT(*) as count FROM dotacion_gcba_prueba LIMIT 1'
    )

    return NextResponse.json({
      status: 'ok',
      message: 'Aplicación y base de datos funcionando correctamente',
      database: 'connected',
      tableAccessible: tableCheck.length > 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error de conexión a la base de datos',
        database: 'disconnected',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

