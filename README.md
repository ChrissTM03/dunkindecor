# Dunkin Decor

## Generación automática al cierre del día

La app permite un solo registro por fecha. Al crear uno, verifica Firebase; al guardarlo, una transacción en `/registros` vuelve a comprobar la fecha para evitar duplicados concurrentes. Las reglas de Realtime Database deben permitir la lectura y escritura transaccional de ese nodo. Las fechas se calculan con la zona horaria del negocio, `America/Bogota`.

El workflow de GitHub Actions `Generate daily records` se ejecuta diariamente a las 00:05 de Bogotá (05:05 UTC) y marca como generados los registros editables de fechas anteriores, aunque la app esté cerrada. También se puede ejecutar manualmente desde la pestaña **Actions**. GitHub puede retrasar la ejecución programada unos minutos; si una ejecución se retrasa, la siguiente también procesa los registros pendientes de días anteriores. El workflow debe estar habilitado y presente en la rama predeterminada del repositorio.

La tarea no requiere Cloud Functions ni habilitar el plan Blaze de Firebase. Necesita permiso de lectura y escritura en Realtime Database, igual que la app. Si las reglas de la base exigen autenticación, configura el secreto del repositorio `FIREBASE_DATABASE_AUTH_TOKEN` con un token de acceso válido. No guardes ese token en el código.
