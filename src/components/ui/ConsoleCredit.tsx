/**
 * Componente que muestra crédito en la consola del navegador
 */

'use client'

import { useEffect } from 'react'

export default function ConsoleCredit() {
  useEffect(() => {
    console.log('%cCreado por Ignacio Ravettini', 'color: #153244; font-size: 16px; font-weight: bold;')
    console.log('%cGO de Observatorio y Datos - Gobierno de la Ciudad de Buenos Aires', 'color: #8DE2D6; font-size: 12px;')
  }, [])

  return null
}

