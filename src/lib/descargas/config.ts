/**
 * Configuración de descargas rápidas predefinidas
 * 
 * Organizadas por bloques: Ministerios, Ministerios y mails, Listas globales
 */

import { DescargaConfig } from '../types/descargas'

export const DESCARGAS: DescargaConfig[] = [
  // ========== BLOQUE: MINISTERIOS ==========
  {
    slug: 'integrantes-por-ministerio',
    bloque: 'ministerios',
    nombre: 'Integrantes por Ministerio',
    descripcion: 'Descarga todos los integrantes de un ministerio específico',
    params: [
      {
        name: 'ministerio',
        label: 'Ministerio',
        type: 'select',
        optionsEndpoint: '/api/meta/ministerios',
        required: true,
      },
    ],
    allowDistinct: true,
    defaultDistinct: true,
    distinctColumns: ['CUIL_SIN_GUIONES', 'AYN', 'MINISTERIO'],
    buildSql: ({ params, distinct }) => {
      const distinctClause = distinct ? 'DISTINCT' : ''
      const ministerio = params?.ministerio || ''
      return `
        SELECT ${distinctClause} *
        FROM \`dotacion_gcba_prueba\`
        WHERE MINISTERIO = '${ministerio.replace(/'/g, "''")}'
      `.trim()
    },
  },
  {
    slug: 'integrantes-todos-los-ministerios',
    bloque: 'ministerios',
    nombre: 'Todos los Integrantes de Todos los Ministerios',
    descripcion: 'Descarga todos los integrantes de todos los ministerios',
    allowDistinct: true,
    defaultDistinct: true,
    distinctColumns: ['CUIL_SIN_GUIONES', 'AYN', 'MINISTERIO'],
    buildSql: ({ distinct }) => {
      const distinctClause = distinct ? 'DISTINCT' : ''
      return `
        SELECT ${distinctClause} *
        FROM \`dotacion_gcba_prueba\`
        WHERE MINISTERIO IS NOT NULL
          AND MINISTERIO <> ''
      `.trim()
    },
  },

  // ========== BLOQUE: MINISTERIOS Y MAILS ==========
  {
    slug: 'mails-laborales-por-ministerio',
    bloque: 'ministerios-mails',
    nombre: 'Mails Laborales por Ministerio',
    descripcion: 'Listado de mails laborales de un ministerio específico',
    params: [
      {
        name: 'ministerio',
        label: 'Ministerio',
        type: 'select',
        optionsEndpoint: '/api/meta/ministerios',
        required: true,
      },
    ],
    allowDistinct: true,
    defaultDistinct: true,
    distinctColumns: ['MAIL_LABORAL'],
    buildSql: ({ params, distinct }) => {
      const distinctClause = distinct ? 'DISTINCT' : ''
      const ministerio = params?.ministerio || ''
      return `
        SELECT ${distinctClause} MINISTERIO, AYN, MAIL_LABORAL
        FROM \`dotacion_gcba_prueba\`
        WHERE MINISTERIO = '${ministerio.replace(/'/g, "''")}'
          AND MAIL_LABORAL IS NOT NULL
          AND MAIL_LABORAL <> ''
      `.trim()
    },
  },
  {
    slug: 'mails-personales-por-ministerio',
    bloque: 'ministerios-mails',
    nombre: 'Mails Personales por Ministerio',
    descripcion: 'Listado de mails personales de un ministerio específico',
    params: [
      {
        name: 'ministerio',
        label: 'Ministerio',
        type: 'select',
        optionsEndpoint: '/api/meta/ministerios',
        required: true,
      },
    ],
    allowDistinct: true,
    defaultDistinct: true,
    distinctColumns: ['MAIL_PERSONAL'],
    buildSql: ({ params, distinct }) => {
      const distinctClause = distinct ? 'DISTINCT' : ''
      const ministerio = params?.ministerio || ''
      return `
        SELECT ${distinctClause} MINISTERIO, AYN, MAIL_PERSONAL
        FROM \`dotacion_gcba_prueba\`
        WHERE MINISTERIO = '${ministerio.replace(/'/g, "''")}'
          AND MAIL_PERSONAL IS NOT NULL
          AND MAIL_PERSONAL <> ''
      `.trim()
    },
  },
  {
    slug: 'mails-laborales-todos',
    bloque: 'ministerios-mails',
    nombre: 'Todos los Mails Laborales',
    descripcion: 'Listado global de todos los mails laborales',
    allowDistinct: true,
    defaultDistinct: true,
    distinctColumns: ['MAIL_LABORAL'],
    buildSql: ({ distinct }) => {
      const distinctClause = distinct ? 'DISTINCT' : ''
      return `
        SELECT ${distinctClause} MINISTERIO, AYN, MAIL_LABORAL
        FROM \`dotacion_gcba_prueba\`
        WHERE MAIL_LABORAL IS NOT NULL
          AND MAIL_LABORAL <> ''
      `.trim()
    },
  },
  {
    slug: 'mails-personales-todos',
    bloque: 'ministerios-mails',
    nombre: 'Todos los Mails Personales',
    descripcion: 'Listado global de todos los mails personales',
    allowDistinct: true,
    defaultDistinct: true,
    distinctColumns: ['MAIL_PERSONAL'],
    buildSql: ({ distinct }) => {
      const distinctClause = distinct ? 'DISTINCT' : ''
      return `
        SELECT ${distinctClause} MINISTERIO, AYN, MAIL_PERSONAL
        FROM \`dotacion_gcba_prueba\`
        WHERE MAIL_PERSONAL IS NOT NULL
          AND MAIL_PERSONAL <> ''
      `.trim()
    },
  },

  // ========== BLOQUE: LISTAS GLOBALES / MAESTRAS ==========
  {
    slug: 'personas-unicas-por-cuil',
    bloque: 'global',
    nombre: 'Personas Únicas por CUIL',
    descripcion: 'Listado maestro de personas únicas identificadas por CUIL',
    allowDistinct: false, // Siempre usa DISTINCT, no se puede desactivar
    defaultDistinct: true,
    distinctColumns: ['CUIL_SIN_GUIONES'],
    buildSql: () => {
      // Siempre DISTINCT para este caso
      return `
        SELECT DISTINCT CUIL_SIN_GUIONES, CUIL, AYN, MINISTERIO, MAIL_LABORAL, MAIL_PERSONAL
        FROM \`dotacion_gcba_prueba\`
        WHERE CUIL_SIN_GUIONES IS NOT NULL
          AND CUIL_SIN_GUIONES <> ''
      `.trim()
    },
  },
  {
    slug: 'integrantes-por-edad-global',
    bloque: 'global',
    nombre: 'Integrantes por Rango de Edad',
    descripcion: 'Personas dentro de un rango de edad específico',
    params: [
      {
        name: 'edad_min',
        label: 'Edad Mínima',
        type: 'number',
        required: true,
        defaultValue: 10,
      },
      {
        name: 'edad_max',
        label: 'Edad Máxima',
        type: 'number',
        required: true,
        defaultValue: 24,
      },
    ],
    allowDistinct: true,
    defaultDistinct: true,
    distinctColumns: ['CUIL_SIN_GUIONES'],
    buildSql: ({ params, distinct }) => {
      const distinctClause = distinct ? 'DISTINCT' : ''
      const edadMin = params?.edad_min || 10
      const edadMax = params?.edad_max || 24
      return `
        SELECT ${distinctClause} *
        FROM \`dotacion_gcba_prueba\`
        WHERE TIMESTAMPDIFF(YEAR, FEC_NACIM, CURDATE()) BETWEEN ${edadMin} AND ${edadMax}
      `.trim()
    },
  },
]

/**
 * Busca una descarga por su slug
 */
export function getDescargaBySlug(slug: string): DescargaConfig | undefined {
  return DESCARGAS.find(d => d.slug === slug)
}

/**
 * Obtiene todas las descargas de un bloque específico
 */
export function getDescargasByBloque(bloque: string): DescargaConfig[] {
  return DESCARGAS.filter(d => d.bloque === bloque)
}

/**
 * Obtiene los bloques únicos disponibles
 */
export function getBloquesDisponibles(): string[] {
  return Array.from(new Set(DESCARGAS.map(d => d.bloque)))
}
