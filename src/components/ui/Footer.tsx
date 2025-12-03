/**
 * Componente Footer con créditos
 * 
 * Muestra información de creación por la GO de Observatorio y Datos
 */

'use client'

export default function Footer() {
  return (
    <footer className="bg-gcba-blue text-white mt-12 py-6 w-full overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-7xl w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-archivo-medium">
              CREADO POR LA GO DE OBSERVATORIO Y DATOS
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1.5 md:p-2 shadow-sm">
              <img 
                src="/logo-go.png" 
                alt="GO Observatorio y Datos" 
                className="h-24 md:h-28 object-contain"
              />
            </div>
            <p className="text-xs font-archivo-regular opacity-80 hidden sm:block">
              Gobierno de la Ciudad de Buenos Aires
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

