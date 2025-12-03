/**
 * Componente de navegación principal
 * 
 * Barra superior con enlaces a las secciones principales:
 * - Descargas rápidas
 * - Constructor visual
 * Responsive con menú hamburguesa en móvil
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
      ? 'bg-gcba-yellow text-gcba-blue font-archivo-medium'
      : 'text-white hover:bg-gcba-blue/80 font-archivo-regular'
  }

  return (
    <nav className="bg-gcba-blue shadow-md w-full overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-7xl w-full">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-base sm:text-lg md:text-xl font-archivo-bold text-white whitespace-nowrap">
            SQL For Dummies
          </Link>
          
          {/* Menú desktop */}
          <div className="hidden md:flex space-x-2">
            <Link
              href="/descargas"
              className={`px-4 py-2 rounded-md text-sm transition-colors ${isActive('/descargas')}`}
            >
              Descargas Rápidas
            </Link>
            <Link
              href="/builder"
              className={`px-4 py-2 rounded-md text-sm transition-colors ${isActive('/builder')}`}
            >
              Constructor Visual
            </Link>
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/descargas"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-md text-sm transition-colors ${isActive('/descargas')}`}
            >
              Descargas Rápidas
            </Link>
            <Link
              href="/builder"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-md text-sm transition-colors ${isActive('/builder')}`}
            >
              Constructor Visual
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
