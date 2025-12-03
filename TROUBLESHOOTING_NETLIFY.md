# Solución de Problemas - Netlify

## Error 400 al ejecutar queries

Si estás viendo errores 400 al intentar ejecutar queries en Netlify, sigue estos pasos para diagnosticar y resolver el problema.

### 1. Verificar el Health Check

Primero, verifica que la conexión a la base de datos esté funcionando:

1. Visita: `https://tu-sitio.netlify.app/api/health`
2. Deberías ver una respuesta JSON con el estado de la conexión

**Respuesta esperada (éxito):**
```json
{
  "status": "ok",
  "message": "Aplicación y base de datos funcionando correctamente",
  "database": "connected",
  "tableAccessible": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Si ves un error:**
- `DATABASE_URL no está configurada`: Necesitas configurar la variable de entorno en Netlify
- `Error de conexión a la base de datos`: El servidor MySQL no está accesible desde Netlify

### 2. Verificar Variables de Entorno en Netlify

1. Ve a tu sitio en Netlify
2. Navega a **Site settings > Build & deploy > Environment**
3. Verifica que `DATABASE_URL` esté configurada con el valor correcto:
   ```
   mysql://powerbi:powerbi1063@phpmyadminny.sectc.app:3306/padron
   ```

**⚠️ IMPORTANTE:** 
- Asegúrate de que la URL no tenga espacios extra
- Verifica que el usuario y contraseña sean correctos
- Confirma que el puerto (3306) sea el correcto

### 3. Verificar Accesibilidad de la Base de Datos

El problema más común es que el servidor MySQL no permite conexiones remotas desde Netlify. Para resolverlo:

#### Opción A: Permitir conexiones desde cualquier IP (menos seguro)

En tu servidor MySQL, ejecuta:

```sql
-- Verificar si el usuario permite conexiones remotas
SELECT user, host FROM mysql.user WHERE user = 'powerbi';

-- Si solo aparece 'localhost', necesitas permitir conexiones remotas
-- Crear o modificar usuario para permitir conexiones desde cualquier IP
CREATE USER 'powerbi'@'%' IDENTIFIED BY 'powerbi1063';
GRANT SELECT ON padron.* TO 'powerbi'@'%';
FLUSH PRIVILEGES;
```

#### Opción B: Permitir conexiones solo desde IPs de Netlify (más seguro)

Netlify usa IPs dinámicas, pero puedes:

1. **Usar un túnel o proxy**: Configurar un servicio intermedio que permita conexiones
2. **Usar una base de datos en la nube**: Migrar a un servicio como PlanetScale, AWS RDS, o similar que permita conexiones remotas por defecto
3. **Usar un servicio de conexión**: Usar servicios como Prisma Data Proxy o similar

### 4. Verificar Firewall

Si tu servidor MySQL está detrás de un firewall:

1. Verifica que el puerto 3306 esté abierto
2. Permite conexiones desde las IPs de Netlify (aunque son dinámicas, puedes intentar permitir un rango amplio)
3. Considera usar un túnel SSH si es necesario

### 5. Verificar Logs de Netlify

1. Ve a tu sitio en Netlify
2. Navega a **Functions > Logs** o **Deploys > [último deploy] > Functions log**
3. Busca errores relacionados con:
   - `ECONNREFUSED`
   - `ETIMEDOUT`
   - `Access denied`
   - `Unknown database`

### 6. Alternativas si la Base de Datos no es Accesible

Si no puedes hacer que tu base de datos MySQL sea accesible desde Netlify, considera:

#### Opción 1: Usar Prisma Data Proxy
- Configura Prisma Data Proxy para crear un túnel seguro a tu base de datos
- Más información: https://www.prisma.io/docs/data-platform/data-proxy

#### Opción 2: Migrar a una Base de Datos en la Nube
- **PlanetScale**: Compatible con MySQL, fácil de configurar
- **AWS RDS**: MySQL gestionado con control de acceso
- **Railway/Render**: Servicios que permiten bases de datos MySQL accesibles

#### Opción 3: Usar Serverless Functions con Timeout Extendido
- Netlify Functions tiene un timeout de 10 segundos por defecto
- Puedes extenderlo hasta 26 segundos en el plan Pro
- Para consultas más largas, considera dividirlas en múltiples requests

### 7. Verificar Timeout de Funciones

Si las consultas son muy largas, pueden estar excediendo el timeout de Netlify Functions (10 segundos en plan gratuito).

**Solución:**
- Agrega límites más pequeños a tus queries
- Implementa paginación
- Considera usar el plan Pro de Netlify para timeouts más largos

### 8. Probar Localmente con la Misma Configuración

Para verificar que el problema es específico de Netlify:

1. Configura tu `.env` local con la misma `DATABASE_URL` que en Netlify
2. Ejecuta `npm run build && npm start`
3. Prueba la aplicación localmente
4. Si funciona localmente pero no en Netlify, el problema es de conectividad de red

### 9. Contactar al Administrador de la Base de Datos

Si no tienes control sobre el servidor MySQL, contacta al administrador y solicita:

1. Permitir conexiones remotas desde Netlify
2. Verificar que el usuario `powerbi` tenga permisos de SELECT
3. Confirmar que el puerto 3306 esté abierto
4. Verificar logs del servidor MySQL para ver intentos de conexión fallidos

## Resumen de Checklist

- [ ] Health check (`/api/health`) funciona
- [ ] Variable `DATABASE_URL` está configurada en Netlify
- [ ] Usuario MySQL permite conexiones remotas (`@'%'` o IPs específicas)
- [ ] Firewall permite conexiones en puerto 3306
- [ ] Logs de Netlify no muestran errores de conexión
- [ ] La aplicación funciona localmente con la misma configuración

Si todos estos puntos están verificados y aún tienes problemas, el problema puede ser específico de la configuración de red del servidor MySQL.

