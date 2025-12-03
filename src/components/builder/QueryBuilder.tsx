/**
 * Componente principal del Constructor Visual
 * 
 * Interfaz intuitiva y segmentada para construir queries SQL paso a paso
 */

'use client'

import { useState, useEffect } from 'react'
import { QueryStructure, ColumnRef, Condition, OrderBy } from '@/lib/types/queryBuilder'

interface TableMeta {
  name: string
  label: string
}

interface ColumnMeta {
  name: string
  type: string
  label: string
}

type Step = 'table' | 'columns' | 'filters' | 'sort' | 'limit' | 'execute'

export default function QueryBuilder() {
  const [tables, setTables] = useState<TableMeta[]>([])
  const [columns, setColumns] = useState<ColumnMeta[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<Step>('table')
  const [query, setQuery] = useState<QueryStructure>({
    select: [],
    from: { name: 'dotacion_gcba_prueba' },
  })
  const [sqlPreview, setSqlPreview] = useState<string>('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [executedSql, setExecutedSql] = useState<string>('')

  // Cargar tablas al montar
  useEffect(() => {
    fetch('/api/meta/tablas')
      .then(res => res.json())
      .then(data => {
        setTables(data)
        if (data.length > 0) {
          setSelectedTable(data[0].name)
          setQuery(prev => ({ ...prev, from: { name: data[0].name } }))
        }
      })
      .catch(err => console.error('Error cargando tablas:', err))
  }, [])

  // Cargar columnas cuando cambia la tabla seleccionada
  useEffect(() => {
    if (selectedTable) {
      setColumns([]) // Limpiar columnas anteriores
      setError(null) // Limpiar errores anteriores
      
      fetch(`/api/meta/columnas?tabla=${encodeURIComponent(selectedTable)}`)
        .then(res => {
          if (!res.ok) {
            return res.json().then(err => {
              const errorMsg = err.error || 'Error al obtener las columnas'
              const hint = err.hint || ''
              const availableTables = err.availableTables || []
              
              console.error('Error obteniendo columnas:', {
                error: errorMsg,
                hint,
                availableTables,
                fullError: err
              })
              
              // Mostrar error más descriptivo al usuario
              if (availableTables.length > 0) {
                setError(`⚠️ ${errorMsg}. ${hint}`)
              } else {
                setError(`⚠️ ${errorMsg}`)
              }
              
              setColumns([])
              return Promise.reject(err)
            })
          }
          return res.json()
        })
        .then(data => {
          // Asegurarse de que data sea un array
          if (Array.isArray(data)) {
            setColumns(data)
            setError(null) // Limpiar error si se cargaron correctamente
          } else {
            console.error('Respuesta de columnas no es un array:', data)
            setError('⚠️ Error: La respuesta del servidor no es válida')
            setColumns([])
          }
        })
        .catch(err => {
          console.error('Error cargando columnas:', err)
          // El error ya se estableció en el bloque anterior si fue un error HTTP
          if (!error) {
            setError('⚠️ Error al cargar las columnas. Verifica la conexión.')
          }
          setColumns([])
        })
    }
  }, [selectedTable])

  // Actualizar SQL preview cuando cambia la query (con valores reales)
  useEffect(() => {
    if (query.select.length === 0) {
      setSqlPreview('-- Paso 2: Selecciona las columnas que quieres ver')
      return
    }

    const selectCols = query.select.map(c => `\`${c.table}\`.\`${c.column}\``).join(', ')
    const fromTable = query.from.name
    let sql = `SELECT ${selectCols}\nFROM \`${fromTable}\``

    if (query.where && query.where.length > 0) {
      const conditions = query.where.map((cond) => {
        const left = `\`${cond.left.table}\`.\`${cond.left.column}\``
        let right = ''
        if (cond.operator === 'BETWEEN' && cond.betweenValues) {
          right = `'${cond.betweenValues[0]}' AND '${cond.betweenValues[1]}'`
        } else if (cond.rightValue !== undefined && cond.rightValue !== '') {
          // Mostrar el valor real, no el placeholder
          right = `'${String(cond.rightValue).replace(/'/g, "''")}'`
        } else {
          right = '?'
        }
        return `${left} ${cond.operator} ${right}`
      }).join(' AND ')
      sql += `\nWHERE ${conditions}`
    }

    if (query.orderBy && query.orderBy.length > 0) {
      const orders = query.orderBy.map(o => 
        `\`${o.column.table}\`.\`${o.column.column}\` ${o.direction}`
      ).join(', ')
      sql += `\nORDER BY ${orders}`
    }

    // Agregar DISTINCT si está habilitado
    if (query.distinct) {
      sql = sql.replace('SELECT', 'SELECT DISTINCT')
    }

    // Solo agregar LIMIT si el usuario lo define explícitamente
    if (query.limit !== null && query.limit !== undefined) {
      sql += `\nLIMIT ${query.limit}`
    }

    setSqlPreview(sql)
  }, [query])

  const toggleColumn = (columnName: string) => {
    setQuery(prev => {
      const colRef: ColumnRef = { table: selectedTable, column: columnName }
      const exists = prev.select.some(
        c => c.table === colRef.table && c.column === colRef.column
      )
      
      if (exists) {
        return {
          ...prev,
          select: prev.select.filter(
            c => !(c.table === colRef.table && c.column === colRef.column)
          ),
        }
      } else {
        return {
          ...prev,
          select: [...prev.select, colRef],
        }
      }
    })
  }

  const addCondition = () => {
    if (columns.length === 0) return
    
    const newCondition: Condition = {
      left: { table: selectedTable, column: columns[0].name },
      operator: '=',
      rightValue: '',
    }
    
    setQuery(prev => ({
      ...prev,
      where: [...(prev.where || []), newCondition],
    }))
  }

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    setQuery(prev => {
      const newWhere = [...(prev.where || [])]
      newWhere[index] = { ...newWhere[index], ...updates }
      return { ...prev, where: newWhere }
    })
  }

  const removeCondition = (index: number) => {
    setQuery(prev => ({
      ...prev,
      where: prev.where?.filter((_, i) => i !== index) || [],
    }))
  }

  const addOrderBy = () => {
    if (columns.length === 0) return
    
    const newOrder: OrderBy = {
      column: { table: selectedTable, column: columns[0].name },
      direction: 'ASC',
    }
    
    setQuery(prev => ({
      ...prev,
      orderBy: [...(prev.orderBy || []), newOrder],
    }))
  }

  const updateOrderBy = (index: number, updates: Partial<OrderBy>) => {
    setQuery(prev => {
      const newOrderBy = [...(prev.orderBy || [])]
      newOrderBy[index] = { ...newOrderBy[index], ...updates }
      return { ...prev, orderBy: newOrderBy }
    })
  }

  const removeOrderBy = (index: number) => {
    setQuery(prev => ({
      ...prev,
      orderBy: prev.orderBy?.filter((_, i) => i !== index) || [],
    }))
  }

  const executeQuery = async () => {
    if (query.select.length === 0) {
      setError('⚠️ Debes seleccionar al menos una columna en el Paso 2')
      setCurrentStep('columns')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al ejecutar la consulta')
      }

      setResults(data.rows || [])
      setExecutedSql(data.sql || sqlPreview)
      setCurrentStep('execute')
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar la consulta. Verifica la conexión a la base de datos.')
      setResults([])
      console.error('Error ejecutando query:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportQuery = async (format: 'csv' | 'xlsx') => {
    if (query.select.length === 0) {
      alert('Debes seleccionar al menos una columna')
      return
    }

    if (results.length === 0) {
      alert('Primero debes ejecutar la consulta')
      return
    }

    try {
      const response = await fetch(`/api/query/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      })

      if (!response.ok) {
        throw new Error('Error al exportar')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `consulta.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      alert('Error al exportar el archivo')
      console.error(err)
    }
  }

  const steps: { key: Step; label: string; description: string }[] = [
    { key: 'table', label: 'Paso 1: Seleccionar Tabla', description: 'Elige de qué tabla quieres obtener datos' },
    { key: 'columns', label: 'Paso 2: Elegir Columnas', description: 'Marca las columnas que quieres ver en los resultados' },
    { key: 'filters', label: 'Paso 3: Aplicar Filtros (Opcional)', description: 'Agrega condiciones para filtrar los datos' },
    { key: 'sort', label: 'Paso 4: Ordenar Resultados (Opcional)', description: 'Define cómo quieres ordenar los datos' },
    { key: 'limit', label: 'Paso 5: Límite de Filas (Opcional)', description: 'Establece cuántas filas máximo quieres obtener' },
    { key: 'execute', label: 'Paso 6: Ejecutar y Ver Resultados', description: 'Ejecuta la consulta y descarga los resultados' },
  ]

  const getStepStatus = (step: Step): 'completed' | 'current' | 'pending' => {
    const stepIndex = steps.findIndex(s => s.key === step)
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* Barra de progreso de pasos */}
      <div className="mb-4 md:mb-8 bg-white rounded-lg shadow-md p-4 md:p-6 border-2 border-gcba-blue/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-base sm:text-lg md:text-2xl font-archivo-bold text-gcba-blue leading-tight">Constructor Visual de Queries</h2>
          <button
            onClick={() => {
              setQuery({ select: [], from: { name: selectedTable || 'dotacion_gcba_prueba' } })
              setResults([])
              setError(null)
              setCurrentStep('table')
            }}
            className="px-3 md:px-4 py-2 text-xs md:text-sm text-gcba-blue border-2 border-gcba-blue rounded-md hover:bg-gcba-blue/10 font-archivo-medium w-full sm:w-auto"
          >
            🔄 Reiniciar
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.key)
            return (
              <button
                key={step.key}
                onClick={() => setCurrentStep(step.key)}
                className={`p-3 rounded-lg text-left transition-all ${
                  status === 'completed' 
                    ? 'bg-gcba-cyan border-2 border-gcba-cyan text-gcba-blue' 
                    : status === 'current'
                    ? 'bg-gcba-blue text-white border-2 border-gcba-blue'
                    : 'bg-white border-2 border-gcba-gray/40 text-gcba-gray hover:border-gcba-blue/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-lg font-archivo-bold ${
                    status === 'completed' ? 'text-gcba-blue' : 
                    status === 'current' ? 'text-white' : 'text-gcba-gray'
                  }`}>
                    {status === 'completed' ? '✓' : idx + 1}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-archivo-medium leading-tight ${
                    status === 'current' ? 'text-white' : 
                    status === 'completed' ? 'text-gcba-blue' : 'text-gcba-gray'
                  }`}>
                    {step.label.split(':')[0]}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 w-full min-w-0">
        {/* Panel izquierdo: Configuración del paso actual */}
        <div className="lg:col-span-2 min-w-0 w-full">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-2 border-gcba-blue/20 w-full overflow-x-hidden">
            {currentStep === 'table' && (
              <div>
                <h3 className="text-base md:text-lg font-archivo-bold text-gcba-blue mb-2">
                  {steps[0].label}
                </h3>
                <p className="text-xs md:text-sm text-gcba-gray mb-4 font-archivo-regular">{steps[0].description}</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-archivo-medium text-gcba-blue mb-2">
                      Selecciona la tabla:
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => {
                        setSelectedTable(e.target.value)
                        setQuery(prev => ({ ...prev, from: { name: e.target.value } }))
                      }}
                      className="w-full px-4 py-3 border-2 border-gcba-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-gcba-yellow focus:border-gcba-yellow text-base bg-white text-gcba-blue"
                    >
                      {tables.map(t => (
                        <option key={t.name} value={t.name}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setCurrentStep('columns')}
                    disabled={!selectedTable}
                    className="w-full px-4 py-3 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 disabled:bg-gray-400 disabled:cursor-not-allowed font-archivo-medium font-bold"
                  >
                    Continuar al Paso 2 →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'columns' && (
              <div>
                <h3 className="text-base md:text-lg font-archivo-bold text-gcba-blue mb-2">
                  {steps[1].label}
                </h3>
                <p className="text-xs md:text-sm text-gcba-gray mb-4 font-archivo-regular">
                  {steps[1].description}. Puedes seleccionar todas las que necesites.
                </p>
                <div className="mb-4 p-3 bg-gcba-cyan/20 border-2 border-gcba-cyan rounded-lg">
                  <p className="text-sm text-gcba-blue font-archivo-regular">
                    <strong className="font-archivo-bold">💡 Tip:</strong> Selecciona las columnas que realmente necesitas. 
                    Cuantas más columnas, más datos se transferirán.
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto border-2 border-gcba-blue/40 rounded-lg p-4 mb-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {columns.map(col => {
                      const isSelected = query.select.some(
                        c => c.table === selectedTable && c.column === col.name
                      )
                      return (
                        <label
                          key={col.name}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-gcba-cyan border-2 border-gcba-blue text-gcba-blue' 
                              : 'bg-white border-2 border-gcba-gray/30 hover:bg-gcba-cyan/20 hover:border-gcba-blue/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleColumn(col.name)}
                            className="w-5 h-5 rounded border-2 border-gcba-blue text-gcba-yellow focus:ring-gcba-yellow"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-archivo-medium text-gcba-blue">{col.label}</span>
                            <span className="text-xs text-gcba-gray block font-archivo-regular">{col.name}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
                
                {/* Checkbox DISTINCT */}
                <div className="mb-4 p-4 bg-gcba-cyan/20 border-2 border-gcba-cyan rounded-lg">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={query.distinct || false}
                      onChange={(e) => setQuery(prev => ({ ...prev, distinct: e.target.checked }))}
                      className="w-5 h-5 rounded border-2 border-gcba-blue text-gcba-yellow focus:ring-gcba-yellow"
                    />
                    <div>
                      <span className="text-sm font-archivo-medium text-gcba-blue">
                        Solo registros únicos (DISTINCT)
                      </span>
                      <p className="text-xs text-gcba-gray mt-1 font-archivo-regular">
                        Actívalo para eliminar filas duplicadas según las columnas que seleccionaste
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setCurrentStep('table')}
                    className="w-full sm:w-auto px-4 py-2 text-gcba-blue border-2 border-gcba-blue rounded-lg hover:bg-gcba-blue/10 font-archivo-medium text-sm"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => setCurrentStep('filters')}
                    disabled={query.select.length === 0}
                    className="flex-1 px-3 md:px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 disabled:bg-gray-400 disabled:cursor-not-allowed font-archivo-medium font-bold text-sm"
                  >
                    <span className="hidden sm:inline">
                      {query.select.length > 0 
                        ? `Continuar (${query.select.length} columna${query.select.length !== 1 ? 's' : ''} seleccionada${query.select.length !== 1 ? 's' : ''}) →`
                        : 'Selecciona al menos una columna'
                      }
                    </span>
                    <span className="sm:hidden">
                      {query.select.length > 0 ? 'Continuar →' : 'Selecciona columnas'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'filters' && (
              <div>
                <h3 className="text-base md:text-lg font-archivo-bold text-gcba-blue mb-2">
                  {steps[2].label}
                </h3>
                <p className="text-xs md:text-sm text-gcba-gray mb-4 font-archivo-regular">
                  {steps[2].description}. Ejemplo: "Ministerio LIKE '%Salud%'" para buscar todos los que contengan "Salud".
                </p>
                
                {/* Tutorial de Filtros */}
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gcba-cyan/50 border-2 border-gcba-cyan rounded-lg">
                  <h4 className="text-sm md:text-base font-archivo-bold text-gcba-blue mb-2 md:mb-3">¿Cómo funcionan los filtros?</h4>
                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm font-archivo-regular text-gcba-gray">
                    <div>
                      <strong className="text-gcba-blue">Columna:</strong> El dato que querés usar para filtrar (ej. MINISTERIO, SEXO, FEC_NACIM).
                    </div>
                    <div>
                      <strong className="text-gcba-blue">Operador:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                        <li><strong>=</strong>: "igual a" (ej. MINISTERIO = "Salud")</li>
                        <li><strong>!=</strong>: "distinto a"</li>
                        <li><strong>&gt; / &lt;</strong>: "mayor que / menor que"</li>
                        <li><strong>BETWEEN</strong>: "entre dos valores" (ej. edad entre 10 y 24)</li>
                        <li><strong>LIKE</strong>: "parecido a" - Usa <code className="bg-gcba-cyan px-1 rounded">%texto%</code> para buscar cualquier registro que contenga "texto" (ej. <code className="bg-gcba-cyan px-1 rounded">%Salud%</code> encuentra todos los que contienen "Salud")</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-gcba-blue">Valor:</strong> El número, palabra o fecha que estás usando como criterio.
                    </div>
                    <div className="mt-3 p-2 bg-white rounded border border-gcba-blue/20">
                      <strong className="text-gcba-blue">Ejemplos:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-xs">
                        <li>"MINISTERIO = Salud" → solo personas del Ministerio de Salud</li>
                        <li>"Edad BETWEEN 10 y 24" → solo personas entre 10 y 24 años</li>
                        <li>"MAIL_LABORAL LIKE '%buenosaires.gob.ar'" → mails que terminan en @buenosaires.gob.ar</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  {query.where?.map((cond, i) => (
                    <div key={i} className="p-3 md:p-4 border-2 border-gcba-blue/50 rounded-lg bg-gcba-offwhite">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <div className="col-span-1 md:col-span-4">
                          <label className="block text-xs font-archivo-medium text-gcba-blue mb-1">Columna</label>
                          <select
                            value={cond.left.column}
                            onChange={(e) => updateCondition(i, {
                              left: { ...cond.left, column: e.target.value },
                            })}
                            className="w-full px-2 md:px-3 py-2 text-sm border-2 border-gcba-blue rounded-md bg-white text-gcba-blue"
                          >
                            {columns.map(col => (
                              <option key={col.name} value={col.name}>{col.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1 md:col-span-3">
                          <label className="block text-xs font-archivo-medium text-gcba-blue mb-1">Operador</label>
                          <select
                            value={cond.operator}
                            onChange={(e) => updateCondition(i, { operator: e.target.value as any })}
                            className="w-full px-2 md:px-3 py-2 text-sm border-2 border-gcba-blue rounded-md bg-white text-gcba-blue"
                          >
                            <option value="=">= (igual)</option>
                            <option value="!=">!= (diferente)</option>
                            <option value=">">&gt; (mayor)</option>
                            <option value="<">&lt; (menor)</option>
                            <option value=">=">&gt;= (mayor o igual)</option>
                            <option value="<=">&lt;= (menor o igual)</option>
                            <option value="LIKE">LIKE (contiene)</option>
                            <option value="BETWEEN">BETWEEN (entre)</option>
                          </select>
                        </div>
                        <div className="col-span-1 md:col-span-4">
                          <label className="block text-xs font-archivo-medium text-gcba-blue mb-1">
                            {cond.operator === 'BETWEEN' ? 'Valores (desde - hasta)' : 'Valor'}
                          </label>
                          {cond.operator === 'BETWEEN' ? (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={cond.betweenValues?.[0] || ''}
                                onChange={(e) => updateCondition(i, {
                                  betweenValues: [e.target.value, cond.betweenValues?.[1] || ''],
                                })}
                                className="flex-1 px-2 md:px-3 py-2 text-sm border-2 border-gcba-blue rounded-md bg-white text-gcba-blue"
                                placeholder="Desde"
                              />
                              <input
                                type="text"
                                value={cond.betweenValues?.[1] || ''}
                                onChange={(e) => updateCondition(i, {
                                  betweenValues: [cond.betweenValues?.[0] || '', e.target.value],
                                })}
                                className="flex-1 px-2 md:px-3 py-2 text-sm border-2 border-gcba-blue rounded-md bg-white text-gcba-blue"
                                placeholder="Hasta"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={cond.rightValue || ''}
                              onChange={(e) => updateCondition(i, { rightValue: e.target.value })}
                              className="w-full px-2 md:px-3 py-2 text-sm border-2 border-gcba-blue rounded-md bg-white text-gcba-blue"
                              placeholder={cond.operator === 'LIKE' ? 'Ej: %Salud%' : 'Ingresa el valor'}
                            />
                          )}
                        </div>
                        <div className="col-span-1 md:col-span-1">
                          <button
                            onClick={() => removeCondition(i)}
                            className="w-full px-2 md:px-3 py-2 text-red-600 hover:bg-red-50 rounded-md border-2 border-red-300 text-sm font-archivo-medium"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!query.where || query.where.length === 0) && (
                    <div className="p-4 border-2 border-dashed border-gcba-blue/60 rounded-lg text-center text-gcba-gray font-archivo-regular bg-gcba-offwhite">
                      No hay filtros. Haz clic en "Agregar Filtro" para crear uno.
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={addCondition}
                    className="w-full sm:w-auto px-4 py-2 bg-gcba-blue text-white rounded-lg hover:bg-gcba-blue/90 text-sm font-archivo-medium"
                  >
                    + Agregar Filtro
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setCurrentStep('columns')}
                    className="w-full sm:w-auto px-4 py-2 text-gcba-blue border-2 border-gcba-blue rounded-lg hover:bg-gcba-blue/10 font-archivo-medium text-sm"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => setCurrentStep('sort')}
                    className="flex-1 px-3 md:px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 font-archivo-medium font-bold text-sm"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'sort' && (
              <div>
                <h3 className="text-base md:text-lg font-archivo-bold text-gcba-blue mb-2">
                  {steps[3].label}
                </h3>
                <p className="text-xs md:text-sm text-gcba-gray mb-4 font-archivo-regular">{steps[3].description}</p>
                <div className="space-y-3 mb-4">
                  {query.orderBy?.map((order, i) => (
                    <div key={i} className="p-3 md:p-4 border-2 border-gcba-blue/50 rounded-lg bg-gcba-offwhite flex flex-col sm:flex-row gap-2 items-end">
                      <div className="flex-1 w-full sm:w-auto">
                        <label className="block text-xs font-archivo-medium text-gcba-blue mb-1">Columna</label>
                        <select
                          value={order.column.column}
                          onChange={(e) => updateOrderBy(i, {
                            column: { ...order.column, column: e.target.value },
                          })}
                          className="w-full px-2 md:px-3 py-2 text-sm border-2 border-gcba-blue rounded-md bg-white text-gcba-blue"
                        >
                          {columns.map(col => (
                            <option key={col.name} value={col.name}>{col.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-xs font-archivo-medium text-gcba-blue mb-1">Orden</label>
                        <select
                          value={order.direction}
                          onChange={(e) => updateOrderBy(i, { direction: e.target.value as 'ASC' | 'DESC' })}
                          className="w-full px-2 md:px-3 py-2 text-sm border-2 border-gcba-blue rounded-md bg-white text-gcba-blue"
                        >
                          <option value="ASC">Ascendente (A-Z)</option>
                          <option value="DESC">Descendente (Z-A)</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeOrderBy(i)}
                        className="w-full sm:w-auto px-2 md:px-3 py-2 text-red-600 hover:bg-red-50 rounded-md border-2 border-red-300 text-sm font-archivo-medium"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(!query.orderBy || query.orderBy.length === 0) && (
                    <div className="p-4 border-2 border-dashed border-gcba-blue/60 rounded-lg text-center text-gcba-gray font-archivo-regular bg-gcba-offwhite">
                      No hay ordenamiento. Haz clic en "Agregar Orden" para crear uno.
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={addOrderBy}
                    className="w-full sm:w-auto px-4 py-2 bg-gcba-blue text-white rounded-lg hover:bg-gcba-blue/90 text-sm font-archivo-medium"
                  >
                    + Agregar Orden
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setCurrentStep('filters')}
                    className="w-full sm:w-auto px-4 py-2 text-gcba-blue border-2 border-gcba-blue rounded-lg hover:bg-gcba-blue/10 font-archivo-medium text-sm"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => setCurrentStep('limit')}
                    className="flex-1 px-3 md:px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 font-archivo-medium font-bold text-sm"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'limit' && (
              <div>
                <h3 className="text-base md:text-lg font-archivo-bold text-gcba-blue mb-2">
                  {steps[4].label}
                </h3>
                <p className="text-xs md:text-sm text-gcba-gray mb-4 font-archivo-regular">
                  {steps[4].description}. Si no defines un límite, se obtendrán todos los resultados.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-archivo-medium text-gcba-blue mb-2">
                    Máximo de filas a obtener (opcional):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    value={query.limit || ''}
                    onChange={(e) => setQuery(prev => ({
                      ...prev,
                      limit: e.target.value ? parseInt(e.target.value) : undefined,
                    }))}
                    className="w-full px-4 py-3 border-2 border-gcba-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-gcba-yellow focus:border-gcba-yellow text-base"
                    placeholder="Sin límite (dejar vacío)"
                  />
                  <p className="text-xs text-gcba-gray mt-2 font-archivo-regular">
                    Deja vacío para obtener todos los resultados. Máximo permitido: 50,000 filas
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setCurrentStep('sort')}
                    className="w-full sm:w-auto px-4 py-2 text-gcba-blue border-2 border-gcba-blue rounded-lg hover:bg-gcba-blue/10 font-archivo-medium text-sm"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => setCurrentStep('execute')}
                    className="flex-1 px-3 md:px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 font-archivo-medium font-bold text-sm"
                  >
                    Ver SQL y Ejecutar →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'execute' && (
              <div>
                <h3 className="text-base md:text-lg font-archivo-bold text-gcba-blue mb-2">
                  {steps[5].label}
                </h3>
                <p className="text-xs md:text-sm text-gcba-gray mb-4 font-archivo-regular">
                  Revisa el SQL generado y ejecuta la consulta para ver los resultados.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-archivo-medium text-gcba-blue mb-2">
                    SQL Generado:
                  </label>
                  <pre className="bg-gcba-blue text-gcba-cyan p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto max-h-48 md:max-h-64 overflow-y-auto font-mono break-words whitespace-pre-wrap max-w-full">
                    {executedSql || sqlPreview}
                  </pre>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={executeQuery}
                    disabled={loading || query.select.length === 0}
                    className="flex-1 px-6 py-3 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 disabled:bg-gray-400 disabled:cursor-not-allowed font-archivo-medium font-bold text-base"
                  >
                    {loading ? '⏳ Ejecutando...' : '▶ Ejecutar Consulta'}
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="text-sm text-red-800 font-archivo-medium">{error}</p>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <p className="text-xs md:text-sm font-archivo-medium text-gcba-blue">
                        ✅ Resultados: {results.length} fila{results.length !== 1 ? 's' : ''} encontrada{results.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => exportQuery('csv')}
                          className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 text-xs md:text-sm font-archivo-medium font-bold"
                        >
                          📄 CSV
                        </button>
                        <button
                          onClick={() => exportQuery('xlsx')}
                          className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-gcba-yellow text-gcba-blue rounded-lg hover:bg-gcba-yellow/90 text-xs md:text-sm font-archivo-medium font-bold"
                        >
                          📊 XLSX
                        </button>
                      </div>
                    </div>
                    <div className="border-2 border-gcba-blue/30 rounded-lg overflow-x-auto overflow-y-auto max-h-96 bg-white w-full">
                      <table className="min-w-full text-xs w-full table-fixed">
                        <thead className="bg-gcba-cyan/20 sticky top-0">
                          <tr>
                            {Object.keys(results[0] || {}).map(key => (
                              <th key={key} className="px-3 py-2 text-left font-archivo-medium text-gcba-blue border-b border-gcba-blue/30">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gcba-blue/10">
                          {results.slice(0, 100).map((row, i) => (
                            <tr key={i} className="hover:bg-gcba-cyan/10">
                              {Object.values(row).map((val: any, j) => (
                                <td key={j} className="px-3 py-2 text-gcba-gray font-archivo-regular">
                                  {val !== null && val !== undefined ? String(val) : ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {results.length > 100 && (
                        <div className="p-2 text-xs text-gcba-gray text-center bg-gcba-cyan/10 font-archivo-regular">
                          Mostrando las primeras 100 filas de {results.length} totales
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setCurrentStep('limit')}
                    className="w-full sm:w-auto px-4 py-2 text-gcba-blue border-2 border-gcba-blue rounded-lg hover:bg-gcba-blue/10 font-archivo-medium text-sm"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => {
                      setQuery({ select: [], from: { name: selectedTable } })
                      setResults([])
                      setError(null)
                      setCurrentStep('table')
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gcba-blue text-white rounded-lg hover:bg-gcba-blue/90 font-archivo-medium text-sm"
                  >
                    Nueva Consulta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: Vista previa del SQL */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-2 border-gcba-blue/20 order-first lg:order-last min-w-0 w-full overflow-x-hidden">
          <h3 className="text-sm sm:text-base md:text-lg font-archivo-bold text-gcba-blue mb-3 md:mb-4 leading-tight">
            📋 Vista Previa SQL
          </h3>
          <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gcba-cyan/20 border-2 border-gcba-cyan rounded-lg">
            <p className="text-xs text-gcba-blue font-archivo-regular">
              Esta es una vista previa del SQL que se generará. Los valores se mostrarán cuando ejecutes la consulta.
            </p>
          </div>
          <pre className="bg-gcba-blue text-gcba-cyan p-3 md:p-4 rounded-lg text-xs overflow-x-auto max-h-[300px] md:max-h-[600px] overflow-y-auto font-mono break-words whitespace-pre-wrap max-w-full">
            {sqlPreview}
          </pre>
        </div>
      </div>
    </div>
  )
}
