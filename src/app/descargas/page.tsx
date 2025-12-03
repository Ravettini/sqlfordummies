/**
 * Página de Descargas Rápidas
 * 
 * Muestra bloques de descargas organizadas por categorías:
 * - Ministerios
 * - Ministerios y mails
 * - Listas globales / maestras
 * 
 * Cards generadas dinámicamente según los ministerios de la base.
 */

'use client'

import { useState, useEffect } from 'react'
import { DESCARGAS, getDescargasByBloque, getBloquesDisponibles } from '@/lib/descargas/config'
import { DescargaConfig, DescargaParam } from '@/lib/types/descargas'

interface Ministerio {
  name: string
}

const BLOQUE_LABELS: Record<string, string> = {
  ministerios: 'Ministerios',
  'ministerios-mails': 'Ministerios y Mails',
  global: 'Listas Globales / Maestras',
}

export default function DescargasPage() {
  const [ministerios, setMinisterios] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [params, setParams] = useState<Record<string, Record<string, any>>>({})
  const [distinct, setDistinct] = useState<Record<string, boolean>>({})

  // Cargar ministerios al montar
  useEffect(() => {
    fetch('/api/meta/ministerios')
      .then(res => res.json())
      .then(data => setMinisterios(data.ministerios || []))
      .catch(err => console.error('Error cargando ministerios:', err))
  }, [])

  // Inicializar valores por defecto
  useEffect(() => {
    const initialParams: Record<string, Record<string, any>> = {}
    const initialDistinct: Record<string, boolean> = {}
    
    DESCARGAS.forEach(descarga => {
      if (descarga.params) {
        initialParams[descarga.slug] = {}
        descarga.params.forEach(param => {
          if (param.defaultValue !== undefined) {
            initialParams[descarga.slug][param.name] = param.defaultValue
          }
        })
      }
      if (descarga.defaultDistinct !== undefined) {
        initialDistinct[descarga.slug] = descarga.defaultDistinct
      }
    })
    
    setParams(initialParams)
    setDistinct(initialDistinct)
  }, [])

  const handleParamChange = (slug: string, paramName: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [paramName]: value,
      },
    }))
  }

  const handleDistinctChange = (slug: string, value: boolean) => {
    setDistinct(prev => ({
      ...prev,
      [slug]: value,
    }))
  }

  const handleDownload = async (descarga: DescargaConfig, format: 'csv' | 'xlsx') => {
    setLoading(prev => ({ ...prev, [`${descarga.slug}-${format}`]: true }))
    
    try {
      // Construir URL con parámetros
      const urlParams = new URLSearchParams()
      urlParams.append('format', format)
      
      if (descarga.allowDistinct) {
        const useDistinct = distinct[descarga.slug] ?? descarga.defaultDistinct ?? false
        urlParams.append('distinct', useDistinct.toString())
      }
      
      if (descarga.params) {
        descarga.params.forEach(param => {
          const value = params[descarga.slug]?.[param.name]
          if (value !== undefined && value !== null && value !== '') {
            urlParams.append(param.name, String(value))
          }
        })
      }

      const url = `/api/descargas/${descarga.slug}?${urlParams.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al descargar')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = format === 'xlsx' 
        ? `${descarga.slug}.xlsx`
        : `${descarga.slug}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error: any) {
      alert(`Error al descargar: ${error.message || 'Error desconocido'}`)
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, [`${descarga.slug}-${format}`]: false }))
    }
  }

  const renderParamInput = (descarga: DescargaConfig, param: DescargaParam) => {
    const value = params[descarga.slug]?.[param.name] ?? param.defaultValue ?? ''

    if (param.type === 'select' && param.optionsEndpoint) {
      // Cargar opciones dinámicamente
      if (param.optionsEndpoint === '/api/meta/ministerios') {
        return (
          <select
            value={value}
            onChange={(e) => handleParamChange(descarga.slug, param.name, e.target.value)}
            className="w-full px-3 py-2 border-2 border-gcba-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-gcba-yellow"
            required={param.required}
          >
            <option value="">Selecciona un ministerio</option>
            {ministerios.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )
      }
    }

    if (param.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleParamChange(descarga.slug, param.name, parseInt(e.target.value, 10))}
          className="w-full px-3 py-2 border-2 border-gcba-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-gcba-yellow"
          required={param.required}
          placeholder={param.label}
        />
      )
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleParamChange(descarga.slug, param.name, e.target.value)}
        className="w-full px-3 py-2 border-2 border-gcba-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-gcba-yellow"
        required={param.required}
        placeholder={param.label}
      />
    )
  }

  const bloques = getBloquesDisponibles()

  return (
    <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-archivo-bold text-gcba-blue mb-2">
          Descargas Rápidas
        </h1>
        <p className="text-base md:text-lg text-gcba-gray font-archivo-regular px-2 md:px-0">
          Descarga datos predefinidos con un solo clic. Consultas comunes ya armadas para uso inmediato.
        </p>
      </div>

      {bloques.map(bloqueId => {
        const descargasBloque = getDescargasByBloque(bloqueId)
        if (descargasBloque.length === 0) return null

        return (
          <section key={bloqueId} className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-archivo-bold text-gcba-blue mb-4 md:mb-6 pb-2 border-b-2 border-gcba-cyan">
              {BLOQUE_LABELS[bloqueId] || bloqueId}
            </h2>
            
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {descargasBloque.map((descarga) => (
                <div
                  key={descarga.slug}
                  className="bg-white rounded-lg shadow-md p-4 md:p-6 border-2 border-gcba-blue/20 hover:border-gcba-blue/40 transition-all"
                >
                  <h3 className="text-lg md:text-xl font-archivo-bold text-gcba-blue mb-2">
                    {descarga.nombre}
                  </h3>
                  <p className="text-sm text-gcba-gray mb-4 font-archivo-regular">
                    {descarga.descripcion}
                  </p>
                  
                  {/* Parámetros */}
                  {descarga.params && descarga.params.length > 0 && (
                    <div className="mb-4 space-y-3">
                      {descarga.params.map(param => (
                        <div key={param.name}>
                          <label className="block text-sm font-archivo-medium text-gcba-blue mb-1">
                            {param.label}
                            {param.required && <span className="text-red-500"> *</span>}
                          </label>
                          {renderParamInput(descarga, param)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Checkbox DISTINCT */}
                  {descarga.allowDistinct && (
                    <div className="mb-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={distinct[descarga.slug] ?? descarga.defaultDistinct ?? false}
                          onChange={(e) => handleDistinctChange(descarga.slug, e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-gcba-blue text-gcba-yellow focus:ring-gcba-yellow"
                        />
                        <span className="text-sm font-archivo-regular text-gcba-gray">
                          Solo registros únicos (DISTINCT)
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Botones de descarga */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(descarga, 'csv')}
                      disabled={loading[`${descarga.slug}-csv`]}
                      className="flex-1 px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-archivo-medium font-bold"
                    >
                      {loading[`${descarga.slug}-csv`] ? 'Descargando...' : '📄 CSV'}
                    </button>
                    <button
                      onClick={() => handleDownload(descarga, 'xlsx')}
                      disabled={loading[`${descarga.slug}-xlsx`]}
                      className="flex-1 px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-archivo-medium font-bold"
                    >
                      {loading[`${descarga.slug}-xlsx`] ? 'Descargando...' : '📊 XLSX'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {bloques.length === 0 && (
        <div className="text-center py-12 text-gcba-gray">
          <p className="font-archivo-regular">No hay descargas disponibles en este momento.</p>
        </div>
      )}
    </div>
  )
}
