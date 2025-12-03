# Guía de Configuración Rápida

## Pasos para iniciar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DATABASE_URL="mysql://usuario:contraseña@servidor:3306/nombre_base_datos"
```

**Ejemplo**:
```env
DATABASE_URL="mysql://usuario:password@servidor.com:3306/padron"
```

### 3. Generar cliente de Prisma

```bash
npx prisma generate
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## Estructura de URLs

- `/` - Página de inicio
- `/descargas` - Descargas rápidas predefinidas
- `/builder` - Constructor visual de queries

## Notas importantes

- Asegúrate de que la base de datos MySQL esté accesible
- Los valores de filtros en las descargas (como nombres de ministerios) pueden necesitar ajustarse según los datos reales
- Revisa `src/lib/descargas/config.ts` para modificar las descargas predefinidas

