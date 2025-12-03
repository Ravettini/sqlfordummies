/**
 * Página principal / Dashboard
 * 
 * Muestra una introducción y enlaces rápidos a las funcionalidades principales.
 */

import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto w-full overflow-x-hidden">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-archivo-bold text-gcba-blue mb-4">
          SQL For Dummies
        </h1>
        <p className="text-lg md:text-xl text-gcba-gray font-archivo-regular px-4">
          Consulta la base de datos sin escribir código SQL
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
        <Link
          href="/descargas"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-gcba-blue/20 hover:border-gcba-blue/40"
        >
          <h2 className="text-2xl font-archivo-bold text-gcba-blue mb-3">
            📥 Descargas Rápidas
          </h2>
          <p className="text-gcba-gray font-archivo-regular">
            Descarga datos predefinidos con un solo clic. Consultas comunes
            ya armadas para uso inmediato.
          </p>
        </Link>

        <Link
          href="/builder"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-gcba-blue/20 hover:border-gcba-blue/40"
        >
          <h2 className="text-2xl font-archivo-bold text-gcba-blue mb-3">
            🧩 Constructor Visual
          </h2>
          <p className="text-gcba-gray font-archivo-regular">
            Crea tus propias consultas paso a paso. Sin necesidad
            de conocer SQL.
          </p>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gcba-cyan/20 rounded-lg border-2 border-gcba-cyan">
        <h3 className="text-lg font-archivo-bold text-gcba-blue mb-2">
          ℹ️ Información
        </h3>
        <p className="text-gcba-gray font-archivo-regular">
          Esta herramienta te permite consultar la base de datos{' '}
          <code className="bg-gcba-cyan/30 px-2 py-1 rounded text-gcba-blue font-mono">padron</code>{' '}
          de forma segura y sencilla. Todas las consultas se ejecutan con
          permisos de solo lectura.
        </p>
      </div>
    </div>
  )
}

