# Dunkin Decor

## Acceso y configuración de seguridad

La configuración web de Firebase en `app.js`, incluida `apiKey`, es pública por diseño; no es una contraseña. El acceso a `/registros` se protege con Firebase Authentication y una lista explícita de UID autorizados en `app.js` y `database.rules.json`. No hay registro de usuarios desde la página: el administrador crea las cuentas del equipo en Firebase Console.

### Firebase Console

1. Abre el proyecto `dunkindecor` y ve a **Authentication → Sign-in method**. Habilita **Email/Password**.
2. En **Authentication → Users**, usa **Add user** para crear una cuenta individual por persona. Crea también una cuenta técnica aparte, por ejemplo `dunkindecor-automation@...`, solo para el workflow diario. No uses la cuenta personal del dueño.
3. En **Authentication → Users**, copia el UID de cada usuario que autorizas. Los UID actuales ya están configurados en `app.js` y `database.rules.json`. Si autorizas más cuentas, añádelas en `authorizedStaffUids` en `app.js` y a ambas expresiones `.read` y `.write` de `database.rules.json`. Los UID no son contraseñas, pero no publiques los correos.
4. Copia la clave pública `apiKey` que ya está en `app.js`. En GitHub, agrega estos secretos al repositorio en **Settings → Secrets and variables → Actions → New repository secret**:
   - `FIREBASE_WEB_API_KEY`: la `apiKey` pública de la app.
   - `FIREBASE_AUTOMATION_EMAIL`: correo de la cuenta técnica.
   - `FIREBASE_AUTOMATION_PASSWORD`: contraseña larga y única de esa cuenta.

La cuenta técnica queda autorizada a leer y escribir registros porque el workflow diario necesita ambas operaciones. Protege la cuenta y sus secretos como credenciales; no los pongas en el código.

### Reglas y despliegue

El archivo `database.rules.json` deniega el acceso general y permite `/registros` solo a los UID enumerados. No agregues validaciones `.validate` debajo de cada registro sin probar el guardado: la app usa una transacción en `/registros` para evitar duplicados por fecha, y Firebase puede volver a validar todos los registros existentes durante esa transacción, bloqueándola si un registro anterior no cumple el esquema.

Instala Firebase CLI, inicia sesión y selecciona `dunkindecor` con `firebase use --add`. Después despliega únicamente las reglas con `firebase deploy --only database`. No uses las reglas `public` ni cambies `.read` o `.write` a `true`.

La configuración de App Check no es necesaria para este flujo. No habilites enforcement en Realtime Database mientras el workflow de GitHub Actions use Firebase Authentication por REST; ese cliente no envía un token App Check. Authentication y las reglas de la base son los controles de acceso.

### Generación automática

El workflow **Generate daily records** se ejecuta diariamente a las 00:05 de Bogotá (05:05 UTC) y también puede iniciarse manualmente desde **Actions**. Para probarlo, ejecuta **Run workflow** después de agregar los tres secretos y autorizar el correo técnico en `database.rules.json`.

GitHub puede retrasar la ejecución programada unos minutos; si ocurre, la siguiente ejecución procesa los registros pendientes de fechas anteriores.
