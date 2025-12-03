/**
 * Página del Constructor Visual de Queries
 * 
 * Permite construir consultas SQL de forma visual usando bloques,
 * sin necesidad de escribir código SQL directamente.
 */

'use client'

import { useState, useEffect } from 'react'
import { QueryStructure, ColumnRef, Condition, OrderBy } from '@/lib/types/queryBuilder'
import QueryBuilder from '@/components/builder/QueryBuilder'

export default function BuilderPage() {
  return (
    <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-archivo-bold text-gcba-blue mb-2 leading-tight">
          Constructor Visual de Queries
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-gcba-gray font-archivo-regular px-2 md:px-0">
          Construye tus consultas paso a paso sin escribir código SQL
        </p>
      </div>

      <QueryBuilder />
    </div>
  )
}

