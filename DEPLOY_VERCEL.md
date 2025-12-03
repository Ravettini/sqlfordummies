# Guía de Despliegue en Vercel

Vercel es la plataforma recomendada para Next.js. Es muy fácil de usar y tiene excelente soporte para conexiones a bases de datos externas.

## Pasos para Desplegar

### 1. Preparar el Proyecto

Asegúrate de que tu proyecto esté en un repositorio Git (GitHub, GitLab o Bitbucket).

### 2. Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta (puedes usar GitHub para login rápido)
3. Es gratis para proyectos personales

### 3. Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New Project"**
2. Conecta tu repositorio Git
3. Vercel detectará automáticamente que es un proyecto Next.js

### 4. Configurar Variables de Entorno

1. En la pantalla de configuración, ve a **"Environment Variables"**
2. Agrega la variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron`
   - **Environments**: Selecciona Production, Preview y Development

### 5. Configurar Build Settings

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (o `prisma generate && next build`)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install`

Si necesitas ajustar algo, puedes hacerlo en **"Settings" → "General" → "Build & Development Settings"**

### 6. Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (generalmente 2-3 minutos)
3. Tu aplicación estará disponible en una URL tipo: `tu-proyecto.vercel.app`

## Ventajas de Vercel

✅ **Optimizado para Next.js**: Creado por el mismo equipo que creó Next.js  
✅ **Deploy automático**: Cada push a la rama principal despliega automáticamente  
✅ **Preview Deployments**: Cada PR genera una URL de preview  
✅ **Mejor logging**: Logs más detallados y fáciles de ver  
✅ **Edge Functions**: Soporte para funciones en el edge  
✅ **Gratis**: Plan gratuito generoso para proyectos personales  

## Verificar el Despliegue

1. Visita tu URL de Vercel
2. Prueba el health check: `https://tu-proyecto.vercel.app/api/health`
3. Deberías ver el estado de la conexión a la base de datos

## Solución de Problemas

### Error de Build

- Revisa los logs en el dashboard de Vercel
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de que `prisma generate` se ejecute durante el build

### Error de Conexión a Base de Datos

- Verifica que el servidor MySQL permita conexiones remotas
- Revisa los logs de Vercel en **"Deployments" → [tu deploy] → "Functions"**
- Prueba el endpoint `/api/health` para diagnosticar

## Actualizar el Código

Cada vez que hagas push a tu repositorio:
- Vercel detectará los cambios automáticamente
- Creará un nuevo deployment
- Si el build es exitoso, actualizará la URL de producción

## Configuración Avanzada

Si necesitas configuraciones especiales, puedes crear un archivo `vercel.json`:

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

Pero generalmente no es necesario, Vercel detecta todo automáticamente.

