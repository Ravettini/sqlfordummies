# Guía de Despliegue en Render

Render es otra excelente alternativa, similar a Railway, con buen soporte para aplicaciones Node.js y bases de datos.

## Pasos para Desplegar

### 1. Crear Cuenta en Render

1. Ve a [render.com](https://render.com)
2. Crea una cuenta (puedes usar GitHub para login)
3. El plan gratuito es generoso para proyectos personales

### 2. Crear Nuevo Web Service

1. En el dashboard, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona el repositorio de tu proyecto

### 3. Configurar el Servicio

Render detectará automáticamente que es un proyecto Node.js.

Configura:
- **Name**: El nombre de tu servicio (ej: `sql-for-dummies`)
- **Region**: Elige la región más cercana (ej: `Oregon (US West)`)
- **Branch**: `main` o `master` (tu rama principal)
- **Root Directory**: Deja en blanco (raíz del proyecto)
- **Runtime**: `Node` (debería detectarse automáticamente)
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 4. Configurar Variables de Entorno

1. En la sección **"Environment"**, haz clic en **"Add Environment Variable"**
2. Agrega:
   - **Key**: `DATABASE_URL`
   - **Value**: `mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron`

### 5. Configurar Plan

- **Free**: Para empezar (puede tener sleep después de inactividad)
- **Starter ($7/mes)**: Sin sleep, mejor para producción

### 6. Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará el build automáticamente
3. Puedes ver el progreso en tiempo real
4. Una vez terminado, tu app estará disponible en una URL tipo: `tu-proyecto.onrender.com`

## Configurar Dominio Personalizado (Opcional)

1. Ve a **"Settings" → "Custom Domain"**
2. Agrega tu dominio personalizado
3. Render te dará instrucciones para configurar DNS

## Ventajas de Render

✅ **Fácil de usar**: Interfaz simple e intuitiva  
✅ **Logs en tiempo real**: Ve qué está pasando  
✅ **Auto-deploy**: Despliega automáticamente con cada push  
✅ **SSL automático**: Certificados SSL gratuitos  
✅ **Plan gratuito**: Generoso para proyectos personales  

## Verificar el Despliegue

1. Visita la URL de Render
2. Prueba el health check: `https://tu-proyecto.onrender.com/api/health`
3. Revisa los logs en **"Logs"** en el dashboard

## Solución de Problemas

### Error de Build

- Revisa los logs en la pestaña **"Logs"**
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `prisma generate` se ejecute durante el build

### Error de Conexión

- Verifica que `DATABASE_URL` esté configurada correctamente
- Revisa los logs en tiempo real
- Prueba el endpoint `/api/health`

### Sleep en Plan Gratuito

El plan gratuito puede poner el servicio en "sleep" después de 15 minutos de inactividad. La primera solicitud después del sleep puede tardar ~30 segundos.

Para evitar esto:
- Usa el plan Starter ($7/mes)
- O configura un ping periódico para mantener el servicio activo

## Actualizar el Código

Render detecta automáticamente los cambios cuando haces push a tu repositorio conectado y despliega una nueva versión.

## Monitoreo

Render proporciona:
- **Logs en tiempo real**: Ve qué está pasando en tu aplicación
- **Métricas**: CPU, memoria, requests
- **Deployments**: Historial de todos los despliegues
- **Health Checks**: Puedes configurar health checks automáticos

