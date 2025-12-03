/**
 * Layout principal de la aplicación
 * 
 * Define la estructura base de todas las páginas, incluyendo
 * el navbar de navegación y los estilos globales.
 */

import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ConsoleCredit from '@/components/ui/ConsoleCredit'

export const metadata: Metadata = {
  title: 'SQL For Dummies',
  description: 'Herramienta visual para consultar la base de datos sin escribir SQL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gcba-offwhite flex flex-col overflow-x-hidden max-w-full">
        <Navbar />
        <main className="container mx-auto px-4 py-4 md:py-8 max-w-7xl flex-1 w-full overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <ConsoleCredit />
      </body>
    </html>
  )
}

