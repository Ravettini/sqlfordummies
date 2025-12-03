# Guía de Despliegue en Vercel con Repositorio Privado

Esta guía te ayudará a conectar tu repositorio privado de GitHub a Vercel y configurar los deploys automáticos.

> **Nota**: Esta guía está actualizada para repositorios privados de GitHub.

## 🔐 Paso 1: Conectar Repositorio Privado en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. **Inicia sesión en Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub

2. **Autorizar Vercel en GitHub**:
   - Si es la primera vez, GitHub te pedirá autorizar a Vercel
   - Haz clic en **"Authorize Vercel"** o **"Grant access"**
   - Esto permite que Vercel acceda a tus repositorios (incluyendo privados)

3. **Crear Nuevo Proyecto**:
   - En el dashboard de Vercel, haz clic en **"Add New Project"**
   - Busca tu repositorio `sqlfordummies`
   - Si no aparece, haz clic en **"Adjust GitHub App Permissions"** y selecciona:
     - ✅ **All repositories** (o solo el repositorio específico)
     - ✅ **Read and write access** (necesario para webhooks de deploy)

4. **Importar el Proyecto**:
   - Selecciona el repositorio `Ravettini/sqlfordummies`
   - Vercel detectará automáticamente que es Next.js

### Opción B: Si el Repositorio No Aparece

Si tu repositorio privado no aparece en la lista:

1. **Verificar Permisos de GitHub**:
   - Ve a GitHub → Settings → Applications → Authorized OAuth Apps
   - Busca "Vercel"
   - Haz clic en "Configure" y asegúrate de que tenga acceso a repositorios privados

2. **Re-autorizar Vercel**:
   - En Vercel, ve a Settings → Git
   - Haz clic en "Disconnect" y luego "Connect Git Provider"
   - Autoriza nuevamente con los permisos correctos

## ⚙️ Paso 2: Configurar Variables de Entorno

**⚠️ IMPORTANTE**: Las credenciales NO deben estar en el código, solo en variables de entorno.

1. **En la pantalla de configuración del proyecto**:
   - Ve a la sección **"Environment Variables"**
   - Haz clic en **"Add"**

2. **Agregar DATABASE_URL**:
   - **Name**: `DATABASE_URL`
   - **Value**: `mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron`
   - **Environments**: Selecciona todas (Production, Preview, Development)

3. **Haz clic en "Save"**

## 🚀 Paso 3: Configurar Build Settings

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (o `prisma generate && next build`)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install`

Si necesitas ajustar algo:
- Ve a **Settings → General → Build & Development Settings**

## ✅ Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Vercel comenzará el build automáticamente
3. Puedes ver el progreso en tiempo real
4. Una vez terminado, tu app estará en `tu-proyecto.vercel.app`

## 🔄 Paso 5: Verificar Deploys Automáticos

Después del primer deploy, Vercel debería detectar automáticamente los nuevos commits:

1. **Verificar Webhook de GitHub**:
   - Ve a tu repositorio en GitHub
   - Settings → Webhooks
   - Deberías ver un webhook de Vercel activo

2. **Probar Deploy Automático**:
   - Haz un pequeño cambio en tu código
   - Haz commit y push
   - Vercel debería detectar el cambio y desplegar automáticamente

## 🔍 Solución de Problemas

### Vercel No Detecta el Repositorio

**Solución**:
1. Ve a GitHub → Settings → Applications → Authorized OAuth Apps
2. Busca "Vercel" y haz clic en "Configure"
3. Asegúrate de que tenga acceso a repositorios privados
4. Si es necesario, revoca y re-autoriza

### Vercel No Hace Deploy Automático

**Solución**:
1. En Vercel, ve a Settings → Git
2. Verifica que el repositorio esté conectado
3. Ve a GitHub → Settings → Webhooks en tu repositorio
4. Verifica que el webhook de Vercel esté activo
5. Si no está, Vercel lo creará automáticamente en el próximo push

### Error de Permisos

**Solución**:
1. Ve a Vercel → Settings → Git
2. Haz clic en "Disconnect" y luego "Connect Git Provider"
3. Autoriza con permisos completos (read and write)

## 🔒 Seguridad: Verificar que las Credenciales NO Estén en el Código

Antes de hacer push, verifica:

1. **El archivo `.env` está en `.gitignore`** ✅ (ya está configurado)
2. **No hay credenciales hardcodeadas en el código** ✅
3. **Las credenciales solo están en variables de entorno de Vercel** ✅

Para verificar que no hay credenciales en el código:
```bash
# Buscar posibles credenciales (ejecuta esto antes de hacer push)
grep -r "powerbi1063" . --exclude-dir=node_modules --exclude="*.md"
```

Si encuentras algo, elimínalo antes de hacer push.

## 📝 Notas Importantes

- ✅ **Repositorio privado**: Vercel puede acceder a repositorios privados sin problemas
- ✅ **Deploys automáticos**: Funcionan igual con repositorios privados
- ✅ **Seguridad**: Las variables de entorno en Vercel están encriptadas
- ✅ **Webhooks**: Vercel crea webhooks automáticamente para detectar cambios

## 🎯 Resumen Rápido

1. Inicia sesión en Vercel con GitHub
2. Autoriza Vercel para acceder a repositorios privados
3. Importa el proyecto desde GitHub
4. Agrega `DATABASE_URL` en Environment Variables
5. Haz clic en Deploy
6. ¡Listo! Los próximos commits se desplegarán automáticamente

