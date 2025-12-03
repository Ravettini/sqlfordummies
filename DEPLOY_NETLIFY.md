# Guía de Despliegue en Netlify

## Pasos para desplegar en Netlify

### Opción 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   - Crea un repositorio en GitHub
   - Sube todo el código (excepto `node_modules` y `.env`)

2. **Conecta con Netlify**:
   - Ve a [netlify.com](https://netlify.com) y crea una cuenta
   - Haz clic en "Add new site" → "Import an existing project"
   - Conecta tu repositorio de GitHub
   - Netlify detectará automáticamente Next.js

3. **Configuración de Build**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (o déjalo en blanco, Netlify lo detectará)
   - **Node version**: 18 o superior

4. **Variables de Entorno**:
   - Ve a "Site settings" → "Environment variables"
   - Agrega: `DATABASE_URL` con el valor:
     ```
     mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron
     ```
   - ⚠️ **IMPORTANTE**: En producción, usa un usuario de solo lectura

5. **Despliega**:
   - Haz clic en "Deploy site"
   - Espera a que termine el build
   - Tu sitio estará disponible en una URL tipo: `tu-proyecto.netlify.app`

### Opción 2: Desde la CLI de Netlify

1. **Instala Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Inicia sesión**:
   ```bash
   netlify login
   ```

3. **Inicializa el sitio**:
   ```bash
   netlify init
   ```

4. **Configura variables de entorno**:
   ```bash
   netlify env:set DATABASE_URL "mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron"
   ```

5. **Despliega**:
   ```bash
   netlify deploy --prod
   ```

## Configuración Importante

### Variables de Entorno en Netlify

En el dashboard de Netlify, ve a:
- **Site settings** → **Environment variables**

Agrega:
- `DATABASE_URL`: `mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron`

### Plugin de Next.js para Netlify

El archivo `netlify.toml` ya está configurado con el plugin de Next.js.

Si necesitas instalarlo manualmente:
```bash
npm install @netlify/plugin-nextjs
```

## Notas Importantes

1. **Base de datos remota**: Asegúrate de que la base de datos MySQL sea accesible desde internet (no solo desde localhost)

2. **Usuario de solo lectura**: En producción, crea un usuario MySQL con solo permisos SELECT:
   ```sql
   CREATE USER 'padron_read'@'%' IDENTIFIED BY 'password_seguro';
   GRANT SELECT ON padron.* TO 'padron_read'@'%';
   FLUSH PRIVILEGES;
   ```

3. **Build time**: El build puede tardar varios minutos la primera vez (especialmente con Prisma)

4. **Límites de Netlify**:
   - Plan gratuito: 100 GB de ancho de banda/mes
   - Build time: 300 minutos/mes
   - Funciones serverless incluidas

## Solución de Problemas

### Error: "Prisma Client not generated"
- Asegúrate de que el build command incluya `prisma generate`
- Ya está configurado en `package.json`: `"build": "prisma generate && next build"`

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté configurada correctamente en Netlify
- Verifica que la base de datos sea accesible desde internet
- Revisa los logs de build en Netlify

### Error: "Module not found"
- Asegúrate de que todas las dependencias estén en `dependencies` (no solo en `devDependencies`)
- Prisma debe estar en `dependencies` para producción

## Personalización del Dominio

Una vez desplegado, puedes:
1. Ir a **Domain settings** en Netlify
2. Agregar un dominio personalizado
3. Configurar DNS según las instrucciones de Netlify

