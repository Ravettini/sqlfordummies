/**
 * Cliente de Prisma para conexión a MySQL
 * 
 * Se inicializa una única instancia del cliente Prisma para reutilizar
 * en todas las rutas API y server components.
 */

import { PrismaClient } from '@prisma/client'

// Evitar crear múltiples instancias en desarrollo (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

