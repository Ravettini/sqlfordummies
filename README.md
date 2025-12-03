# SQL para No Técnicos

Una aplicación web tipo "SQL for dummies" que permite consultar una base de datos MySQL de forma visual y segura, sin necesidad de escribir código SQL directamente.

## 🎯 Características

- **Descargas Rápidas**: Consultas predefinidas con un solo clic (CSV y XLSX)
- **Constructor Visual**: Arma consultas SQL arrastrando bloques, sin escribir código
- **Seguridad**: Todas las consultas se ejecutan con permisos de solo lectura
- **Exportación**: Descarga resultados en formato CSV o XLSX

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: MySQL
- **Estilos**: Tailwind CSS
- **Exportación**: Librería `xlsx` para archivos Excel

## 📋 Requisitos

- Node.js 18+ (recomendado: 20.x)
- MySQL 8.0+ con la base de datos `padron` y la tabla `dotacion_gcba_prueba`
- npm o yarn

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
DATABASE_URL="mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron"
```

**⚠️ IMPORTANTE**: En producción, se recomienda crear un usuario de MySQL con permisos de solo lectura:

```sql
-- Crear usuario de solo lectura
CREATE USER 'padron_read'@'%' IDENTIFIED BY 'password_seguro';

-- Otorgar permisos de solo lectura
GRANT SELECT ON padron.* TO 'padron_read'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

Luego actualiza el `.env`:

```env
DATABASE_URL="mysql://padron_read:password_seguro@phpmyadminny.sectc.app:3306/padron"
```

### 3. Generar cliente de Prisma

```bash
npx prisma generate
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
sql-for-dummies/
├── src/
│   ├── app/                    # Páginas y rutas API (Next.js App Router)
│   │   ├── api/                # Endpoints API
│   │   │   ├── descargas/      # Descargas rápidas
│   │   │   ├── query/          # Constructor visual
│   │   │   └── meta/           # Metadatos de tablas/columnas
│   │   ├── descargas/          # Página de descargas rápidas
│   │   ├── builder/            # Página del constructor visual
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página de inicio
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes UI reutilizables
│   │   └── builder/            # Componentes del constructor visual
│   └── lib/                    # Lógica de negocio
│       ├── db.ts              # Cliente de Prisma
│       ├── types/             # Tipos TypeScript
│       ├── descargas/         # Configuración de descargas
│       ├── sql-builder/       # Constructor de SQL seguro
│       └── utils/             # Utilidades (CSV, XLSX)
├── prisma/
│   └── schema.prisma          # Schema de Prisma
└── README.md
```

## 🚀 Uso

### Descargas Rápidas

1. Navega a **"Descargas Rápidas"** desde el menú superior
2. Selecciona una consulta predefinida
3. Haz clic en **"CSV"** o **"XLSX"** para descargar los resultados

### Constructor Visual

1. Navega a **"Constructor Visual"** desde el menú superior
2. Selecciona la tabla y las columnas que deseas consultar
3. Agrega condiciones WHERE (opcional)
4. Configura el ordenamiento ORDER BY (opcional)
5. Establece un límite de filas (opcional)
6. Haz clic en **"Ejecutar"** para ver los resultados
7. Descarga los resultados en CSV o XLSX

## 🔒 Seguridad

- **Usuario de solo lectura**: Todas las conexiones a MySQL deben usar un usuario con permisos `SELECT` únicamente
- **Validación de tablas y columnas**: Solo se permiten tablas y columnas de una lista blanca
- **Sin SQL arbitrario**: El constructor visual genera SQL desde estructuras tipadas, nunca desde texto libre del usuario
- **Límites de filas**: Máximo 50,000 filas por consulta (configurable)
- **Manejo de errores**: Los errores no exponen detalles internos de la base de datos

## 📝 Agregar Nuevas Descargas Rápidas

Edita el archivo `src/lib/descargas/config.ts` y agrega una nueva entrada al array `DESCARGAS`:

```typescript
{
  slug: 'mi-nueva-descarga',
  nombre: 'Mi Nueva Descarga',
  descripcion: 'Descripción de la descarga',
  buildSql: () => `
    SELECT *
    FROM \`dotacion_gcba_prueba\`
    WHERE MINISTERIO = 'Valor'
  `.trim(),
}
```

## 🐛 Solución de Problemas

### Error de conexión a la base de datos

- Verifica que la variable `DATABASE_URL` en `.env` sea correcta
- Asegúrate de que el servidor MySQL esté accesible desde tu red
- Verifica que el usuario tenga los permisos necesarios

### Error "Tabla no permitida"

- Solo se permite consultar la tabla `dotacion_gcba_prueba` por defecto
- Para agregar más tablas, edita `src/lib/sql-builder/meta.ts` y `src/lib/sql-builder/buildSql.ts`

### Error al generar Prisma Client

```bash
# Regenerar el cliente
npx prisma generate

# Si persiste, verifica el schema.prisma
npx prisma validate
```

## 📚 Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run prisma:generate` - Genera el cliente de Prisma
- `npm run prisma:studio` - Abre Prisma Studio (GUI para la base de datos)

## 🔄 Próximas Mejoras (Opcional)

- Sistema de consultas guardadas
- Autenticación de usuarios
- Soporte para JOINs en el constructor visual
- Filtros más avanzados (OR, NOT, etc.)
- Historial de consultas ejecutadas

## 📄 Licencia

Este proyecto es de uso interno.

## 👥 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

---

**Nota**: Los valores de filtros en las descargas rápidas (como nombres de ministerios) pueden necesitar ajustarse según los datos reales de la base de datos. Revisa los comentarios en `src/lib/descargas/config.ts`.

