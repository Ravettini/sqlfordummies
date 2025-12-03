# Guía de Despliegue en Railway

Railway es excelente para aplicaciones que necesitan conectarse a bases de datos externas. Tiene mejor soporte para conexiones de red y timeouts más largos.

## Pasos para Desplegar

### 1. Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta (puedes usar GitHub para login)
3. El plan gratuito incluye $5 de crédito mensual

### 2. Crear Nuevo Proyecto

1. En el dashboard, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Conecta tu repositorio
4. Selecciona el repositorio de tu proyecto

### 3. Configurar el Servicio

Railway detectará automáticamente que es un proyecto Node.js/Next.js.

1. Railway creará un servicio automáticamente
2. Ve a **"Settings" → "Build"**
3. Configura:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (raíz del proyecto)

### 4. Configurar Variables de Entorno

1. Ve a **"Variables"** en el panel de tu servicio
2. Haz clic en **"New Variable"**
3. Agrega:
   - **Name**: `DATABASE_URL`
   - **Value**: `mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron`
   - **Environment**: Production (o All)

### 5. Configurar Puerto

Railway asigna un puerto automáticamente. Next.js necesita la variable `PORT`:

1. En **"Variables"**, agrega:
   - **Name**: `PORT`
   - **Value**: `${{PORT}}` (Railway lo reemplazará automáticamente)

### 6. Desplegar

1. Railway comenzará el deploy automáticamente
2. Puedes ver el progreso en la pestaña **"Deployments"**
3. Una vez terminado, tu app estará disponible en una URL tipo: `tu-proyecto.up.railway.app`

## Configurar Dominio Personalizado (Opcional)

1. Ve a **"Settings" → "Networking"**
2. Haz clic en **"Generate Domain"** para obtener una URL personalizada
3. O configura un dominio personalizado si tienes uno

## Ventajas de Railway

✅ **Mejor para bases de datos**: Excelente soporte para conexiones externas  
✅ **Timeouts más largos**: No tiene el límite de 10 segundos de Netlify  
✅ **Logs en tiempo real**: Puedes ver los logs mientras se ejecuta  
✅ **Variables de entorno fáciles**: Interfaz simple para configurar  
✅ **Escalado automático**: Se adapta a la carga  

## Verificar el Despliegue

1. Visita la URL de Railway
2. Prueba el health check: `https://tu-proyecto.up.railway.app/api/health`
3. Revisa los logs en **"Deployments" → [tu deploy] → "View Logs"**

## Solución de Problemas

### Error de Build

- Revisa los logs en la pestaña **"Deployments"**
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `prisma generate` se ejecute durante el build

### Error de Conexión

- Verifica que `DATABASE_URL` esté configurada correctamente
- Revisa los logs en tiempo real
- Prueba el endpoint `/api/health`

### Puerto no Configurado

Si ves errores de puerto, asegúrate de que Next.js use la variable `PORT`:

En `next.config.js`:
```javascript
const nextConfig = {
  reactStrictMode: true,
  // Railway usa PORT automáticamente, no necesitas configurarlo
}
```

## Actualizar el Código

Railway detecta automáticamente los cambios cuando haces push a tu repositorio conectado y despliega una nueva versión.

## Monitoreo

Railway proporciona:
- **Logs en tiempo real**: Ve qué está pasando en tu aplicación
- **Métricas**: CPU, memoria, red
- **Deployments**: Historial de todos los despliegues

