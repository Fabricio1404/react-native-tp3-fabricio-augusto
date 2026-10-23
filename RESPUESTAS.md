# TP N° 3 — Permisos móviles: Android, iOS y Expo · Respuestas (Partes A a F)

Taller Complementario – React Native II · Instituto Politécnico Formosa
Alumno: Fabricio Augusto

> Las versiones citadas se verificaron sobre el proyecto (Expo SDK 57, React Native 0.86):
> `targetSdk = 36`, `minSdk = 24` (`node_modules/react-native/gradle/libs.versions.toml`) e
> iOS mínimo 16.4 (`ExpoModulesCore.podspec`).

---

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a)** Un permiso es una autorización explícita para que una app use un recurso o dato protegido (cámara, ubicación, contactos, notificaciones…). Participan tres actores:

- **La app** declara qué recursos necesita y los *solicita* en el momento en que los va a usar.
- **El sistema operativo** es el árbitro: verifica que el permiso esté declarado, muestra el diálogo (que dibuja él, no la app), recuerda la respuesta y bloquea el acceso si no hay autorización.
- **La persona usuaria** es la dueña de los datos y la que decide: concede, deniega o revoca en cualquier momento desde Ajustes.

**b)** La **caja de arena (sandbox)** es el aislamiento que el SO impone a cada app: corre con su propio usuario o proceso, solo ve su propia carpeta de archivos y no puede tocar los datos de otras apps ni el hardware sensible. Los permisos son las "puertas" controladas para salir de esa caja. Sin ningún permiso, una app puede mostrar su interfaz, guardar datos en su propio almacenamiento, hacer cálculos, reproducir sonido, vibrar y, en Android, usar recursos de "instalación" como `INTERNET`. También puede usar los **selectores del sistema** (de fotos o documentos), porque ahí es la persona la que elige qué entregar.

**c)** Las cuatro razones:

1. **Privacidad:** proteger datos personales. *Ej.:* una linterna no tiene por qué leer los contactos.
2. **Seguridad:** evitar abusos o malware. *Ej.:* que una app no pueda grabar el micrófono en secreto ni dibujar encima de la app del banco (`SYSTEM_ALERT_WINDOW`).
3. **Control y transparencia para la persona:** que sepa qué usa cada app y pueda cambiarlo. *Ej.:* revocar la ubicación de una red social desde Ajustes.
4. **Recursos del dispositivo (batería y rendimiento):** limitar lo que consume energía en segundo plano. *Ej.:* la ubicación "siempre" o las alarmas exactas drenan batería, por eso tienen permisos aparte.

**d)** En la analogía del portero:

- **La visita** es la app, que quiere entrar a un recurso.
- **El portero** es el sistema operativo, que controla la puerta y pregunta.
- **El dueño del departamento** es la persona usuaria, que decide si la visita pasa.

Que "el portero se acuerda de la respuesta" significa que el SO **guarda la decisión**: no vuelve a preguntar cada vez. Si dijo que sí, deja pasar directo; si dijo que no (y en iOS basta una vez, en Android dos), ya no muestra el diálogo y la única forma de cambiarlo es que el dueño vaya a Ajustes.

### A2. Declarar y solicitar

| | Declarar (al compilar) | Solicitar (al ejecutar) |
|---|---|---|
| **¿Qué se hace?** | Se anuncia en el binario qué permisos *podría* usar la app (y en iOS, para qué). | Se le pide al SO, en el momento de uso, que muestre el diálogo y se lee la respuesta. |
| **¿Dónde / cómo en Android?** | `<uses-permission>` en `AndroidManifest.xml`. | `ActivityCompat.requestPermissions()` / `checkSelfPermission()` (en RN: `PermissionsAndroid`). |
| **¿Dónde / cómo en iOS?** | Claves `NS…UsageDescription` con el texto de propósito en `Info.plist`. | La API de cada framework (`AVCaptureDevice.requestAccess`, `CLLocationManager.requestWhenInUseAuthorization`, etc.). |
| **¿Dónde / cómo en Expo?** | `app.json` / `app.config.ts`: plugins de cada módulo (`expo-camera`, `expo-location`…), `android.permissions`, `android.blockedPermissions`, `ios.infoPlist`. `prebuild` genera el manifiesto y el plist. | `request…PermissionsAsync()` o los hooks `use…Permissions()` de cada módulo; `get…PermissionsAsync()` para consultar. |
| **¿Qué pasa si se omite?** | Android: el pedido se deniega al instante, sin diálogo. iOS: la app **se cierra (crash)** al usar el recurso, y App Store Connect rechaza la build (ITMS-90683). | La app no tiene acceso: la llamada a la API falla o devuelve error. Si se usa sin pedir, el recurso no funciona. |

### A3. Verdadero o falso

- **a) F.** El diálogo lo dibuja **el sistema operativo**, fuera de la app. Por eso no se puede cambiar su diseño y por eso la explicación va en una pantalla previa propia.
- **b) V.** Con *Continuous Native Generation*, `android/` e `ios/` se regeneran con `prebuild` a partir de `app.json`.
- **c) F.** El `Info.plist` es parte del binario nativo. Una actualización OTA solo cambia el JavaScript y los assets, así que un permiso nuevo requiere una **nueva build** y pasar otra vez por la tienda.
- **d) F.** Si el permiso no está en el manifiesto, Android lo **deniega directamente sin mostrar diálogo**.
- **e) F.** `expo-permissions` está **deprecado y eliminado** (desde SDK 41 aprox.). Cada módulo trae sus propias funciones o hooks de permiso.
- **f) V.** Las notificaciones locales o remotas no llevan clave `NS…UsageDescription`. El diálogo es genérico del sistema.
- **g) V.** En iOS 14+ y Android 14+, el acceso limitado devuelve `status: 'granted'`, y el matiz se lee en `accessPrivileges: 'limited'`.
- **h) F.** No es confiable. En iOS algunas decisiones (por ejemplo, las de notificaciones) pueden sobrevivir a una reinstalación por un tiempo, y en Android puede haber restauración por backup. La forma confiable es `adb shell pm revoke` / `pm clear-permission-flags` en Android y `xcrun simctl privacy … reset` en el simulador de iOS (ver D6.d).

### A4. Los estados de un permiso

**a) Diagrama de estados**

```
ANDROID (11+)
  Sin decidir ──pedir──▶ diálogo ──Permitir──────────▶ Concedido
                            │
                            └─No permitir─▶ Denegado (canAskAgain: true)
                                               │
                                          pedir otra vez ─▶ diálogo ─Permitir─▶ Concedido
                                               │
                                               └─No permitir─▶ BLOQUEADO (canAskAgain: false)
  Bloqueado ──solo desde Ajustes──▶ Concedido      Concedido ──revocar en Ajustes──▶ Denegado
  ("Solo esta vez": Concedido temporal ──al salir de la app──▶ Sin decidir/Denegado)

iOS
  Sin decidir ──pedir──▶ diálogo ──Permitir──────────▶ Concedido
                            └─No permitir──────────────▶ BLOQUEADO (canAskAgain: false)
  Bloqueado ──solo desde Ajustes──▶ Concedido
  ("Permitir una vez": Concedido durante la sesión ──al cerrar la app──▶ Sin decidir)
```

**Diferencia central:** Android da **dos oportunidades** (el primer "No" todavía permite volver a preguntar), mientras que iOS da **una sola**: el primer "No permitir" ya bloquea, y a partir de ahí solo queda Ajustes.

**b)**

| Estado | status | canAskAgain | ¿Puede aparecer el diálogo? |
|---|---|---|---|
| Sin decidir | `'undetermined'` | `true` | Sí |
| Concedido | `'granted'` | `true` | No (no hace falta) |
| Denegado (se puede volver a pedir) | `'denied'` | `true` | Sí |
| Bloqueado | `'denied'` | `false` | No: solo Ajustes |

---

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
|---|---|---|
| `INTERNET` | De instalación (normal) | Se concede solo al instalar si está en el manifiesto. |
| `CAMERA` | De tiempo de ejecución (peligroso) | Declarar y pedir con diálogo (`requestCameraPermissionsAsync`). |
| `VIBRATE` | De instalación (normal) | Automático al instalar. |
| `SYSTEM_ALERT_WINDOW` | Especial | La persona lo activa en Ajustes › "Mostrar sobre otras apps" (la app la manda con un *intent*). |
| `POST_NOTIFICATIONS` | De tiempo de ejecución (Android 13+) | Declarar, crear un canal y pedir con diálogo. En Android ≤ 12 está concedido por defecto. |
| `ACCESS_NETWORK_STATE` | De instalación (normal) | Automático al instalar. |
| `READ_CONTACTS` | De tiempo de ejecución (peligroso) | Diálogo del sistema (y en Android 17+, Google Play pide usar el selector de contactos). |
| `SCHEDULE_EXACT_ALARM` | Especial | Ajustes › "Alarmas y recordatorios". Desde Android 14 viene denegado por defecto en instalaciones nuevas. |
| `RECORD_AUDIO` | De tiempo de ejecución (peligroso) | Diálogo del sistema. |
| `MANAGE_EXTERNAL_STORAGE` | Especial | Ajustes › "Acceso a todos los archivos". Google Play lo restringe a gestores de archivos, antivirus, etc. |

### B2. Grupos y nombres

**a)** Un **grupo de permisos** reúne permisos relacionados con el mismo recurso (Ubicación, Cámara, Micrófono, Contactos, Dispositivos cercanos…), y el sistema muestra **un solo diálogo** por grupo. Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve **un único diálogo**, que en Android 12+ ofrece elegir "Precisa" o "Aproximada".

**b)** El prefijo es `android.permission.`. El de cámara es `android.permission.CAMERA`.

**c)** Los **permisos de firma (signature)** solo se conceden a apps firmadas con el mismo certificado que la app (o el sistema) que los define. Sirven para que apps de un mismo fabricante o el propio sistema se comuniquen entre sí. Una app común no puede obtenerlos porque no está firmada con la clave de la plataforma ni del fabricante.

### B3. Leé el manifiesto

**a)** **Se conceden solos al instalar:** `INTERNET`. **Hay que pedirlos en tiempo de ejecución:** `CAMERA`, `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` (un diálogo), `POST_NOTIFICATIONS` (Android 13+) y `READ_EXTERNAL_STORAGE` (solo hasta Android 12). `RECORD_AUDIO` no se concede ni se pide: está quitado con `tools:node="remove"`.

**b)** `android:maxSdkVersion="32"` hace que el permiso solo se declare en dispositivos con API ≤ 32 (Android 12L). En Android 13+ (API 33) ese permiso ya no existe para multimedia y lo reemplazan `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` y `READ_MEDIA_AUDIO` (y en Android 14, `READ_MEDIA_VISUAL_USER_SELECTED` para el acceso parcial).

**c)** `tools:node="remove"` le indica al *manifest merger* que **elimine** ese permiso del manifiesto final aunque lo declare alguna librería. Lo genera:

```json
{
  "expo": {
    "android": {
      "blockedPermissions": ["android.permission.RECORD_AUDIO"]
    }
  }
}
```

(En el caso de la cámara también se logra con `"recordAudioAndroid": false` en el plugin `expo-camera`.)

**d)** En `expo.android.permissions`:

```json
{ "expo": { "android": { "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"] } } }
```

**e)** Con *Continuous Native Generation* la carpeta `android/` es un **artefacto generado**: `npx expo prebuild` la regenera desde `app.json`, y en SDK 57 la limpia por defecto, así que cualquier edición manual se pierde (además, `android/` está en `.gitignore`). `blockedPermissions` **no funciona en Expo Go**: Expo Go es una app ya compilada con su propio manifiesto, y tu `app.json` no lo modifica. Solo se aplica en una development build o en la build de producción.

### B4. Así pregunta Android

**a)** No. El diálogo es del sistema y no acepta texto propio (a diferencia de iOS, no existe un "texto de propósito"). La explicación va en **una pantalla propia previa** al diálogo, en el contexto de la función, y en la ficha de Google Play.

**b)** "Mientras la app está en uso" concede el permiso de forma **persistente**, siempre que la app esté en primer plano. "Solo esta vez" lo concede **temporalmente**: se revoca poco después de que la app pasa a segundo plano, y la próxima vez hay que volver a pedirlo. Existe (Android 11+) para **ubicación, cámara y micrófono**.

**c)** Desde Android 11, el segundo "No permitir" equivale a "no volver a preguntar": el sistema deja de mostrar el diálogo y `canAskAgain` pasa a `false`. Solo se puede habilitar desde Ajustes.

**d)** *Anda bien:* mostrar el clima de la ciudad, las farmacias de turno del barrio o los puntos de reciclaje cercanos. *No anda:* la navegación giro a giro, encontrar un auto estacionado o marcar en qué pasillo o aula del instituto está el desperfecto.

**e)** Android **mata el proceso** de la app. Al volver, la app se reinicia desde cero (se pierde el estado en memoria) y tiene que volver a consultar el permiso.

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
|---|---|---|
| Nacen los permisos en tiempo de ejecución | Android 6.0 (API 23) | Ya no alcanza con el manifiesto: hay que consultar y pedir en ejecución, y manejar el "No". |
| La ubicación en segundo plano pasa a ser un permiso aparte | Android 10 (API 29) | Declarar `ACCESS_BACKGROUND_LOCATION` y pedirlo **después** del de primer plano (desde Android 11 la persona lo concede en Ajustes). |
| Dos rechazos equivalen a "no volver a preguntar" | Android 11 (API 30) | Leer `canAskAgain`. Si es `false`, mostrar "Abrir Ajustes" en vez de volver a pedir. |
| Ubicación precisa o aproximada | Android 12 (API 31) | Pedir FINE junto con COARSE y leer `android.accuracy` (`'fine'` / `'coarse'`). La app tiene que funcionar con la aproximada. |
| Las notificaciones pasan a ser un permiso (`POST_NOTIFICATIONS`) | Android 13 (API 33) | Declararlo, crear el canal antes de pedir y pedir en contexto. Sin permiso, la notificación no se muestra. |
| Acceso parcial a fotos y videos ("Seleccionar fotos") | Android 14 (API 34) | `READ_MEDIA_VISUAL_USER_SELECTED`: `status` puede ser `granted` con `accessPrivileges: 'limited'`. Mejor usar el selector del sistema. |
| Permiso de red local (`ACCESS_LOCAL_NETWORK`) | Android 17 (API 37) | Al apuntar a API 37, acceder a dispositivos de la LAN (casting, IoT) requiere este permiso de tiempo de ejecución (grupo "Dispositivos cercanos"). |

**`targetSdkVersion`** es el nivel de API para el que la app declara estar preparada. El sistema le aplica los comportamientos y restricciones de esa versión (por ejemplo, con target ≥ 33 aplica `POST_NOTIFICATIONS`). **Expo SDK 57 apunta a API 36 (Android 16)**, con `compileSdk` 36 y `minSdk` 24. **Google Play exige desde el 31 de agosto de 2026** que las apps nuevas y las actualizaciones apunten a **API 36 o superior** (se puede pedir una prórroga hasta el 1/11/2026). Las apps existentes que apunten por debajo de API 35 dejan de mostrarse a usuarios nuevos con Android más reciente.

---

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso | Clave en Info.plist |
|---|---|
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación en uso | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` (además de la de "en uso") |
| Fotos (leer) | `NSPhotoLibraryUsageDescription` |
| Fotos (solo guardar) | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | **No lleva clave**: el diálogo es genérico del sistema. |

### C2. Sin texto, no hay permiso

**a)** Si falta el texto de propósito, iOS **cierra la app** (crash) en cuanto intenta acceder a la cámara, con el mensaje *"This app has crashed because it attempted to access privacy-sensitive data without a usage description…"*. Al subir la build, App Store Connect la **rechaza** con el error **ITMS-90683: Missing Purpose String in Info.plist**.

**b)** **Una sola vez.** Si la persona dice que no, el permiso queda bloqueado (`canAskAgain: false`): `request…()` devuelve `denied` sin mostrar nada. A la app le queda explicar el beneficio, ofrecer el botón "Abrir Ajustes" (`Linking.openSettings()`) y, sobre todo, **un camino alternativo** que no necesite el permiso.

**c)** El sistema arma el título (*"“Mantenimiento IPF” quiere acceder a la cámara"*) y los botones ("Permitir" / "No permitir"). Vos escribís **el mensaje** de abajo: el texto de propósito. En Expo se configura en `app.json`, en las opciones del plugin de cada módulo (`cameraPermission`, `locationWhenInUsePermission`, `photosPermission`…) o directamente en `expo.ios.infoPlist`.

**d)** Apple hace un **análisis estático del binario**: si el código compilado contiene referencias a una API protegida (aunque tu app nunca la llame), exige la clave `NS…UsageDescription` correspondiente. Se resuelve agregando un texto de propósito válido para esa clave (por el plugin o en `ios.infoPlist`), o, mejor, quitando o desactivando la parte de la librería que no se usa (por ejemplo, la opción del plugin que excluye esa función, o reemplazar la librería).

### C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobado? | Versión mejorada |
|---|---|---|
| "Necesitamos tu ubicación." | No: no dice para qué. | "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas a donde estás." |
| "Para mejorar tu experiencia." | No: es vago y no dice qué dato usa. | "Usamos tu ubicación para ordenar los locales por cercanía y estimar el tiempo de envío." |
| "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." | **Sí**: cumple el molde con un beneficio concreto. | — |
| "La app no funciona sin ubicación." | No: es una amenaza, presiona a la persona y no explica el uso. | "Usamos tu ubicación para marcar en el mapa dónde está el problema que reportás." |
| "Ubicación requerida por el sistema." | No: es falso y no explica el beneficio. | "Usamos tu ubicación para avisarte qué puntos de reciclaje hay en tu barrio." |

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
|---|---|---|
| Fotos limitadas ("Seleccionar fotos") | iOS 14 | `status: 'granted'` + `accessPrivileges: 'limited'` (`expo-image-picker` / `expo-media-library`). Para ampliar la selección: `presentPermissionsPickerAsync()` de `expo-media-library`. |
| Ubicación aproximada (interruptor "Precisa") | iOS 14 | `ios.accuracy === 'reduced'` en la respuesta de `expo-location` (`'full'` = precisa). |
| "Permitir una vez" (ubicación) | iOS 13 | Durante la sesión `status: 'granted'` (`ios.scope: 'whenInUse'`). Al reabrir la app vuelve a `'undetermined'` y se puede pedir de nuevo. |
| Ubicación escalonada: de "al usar la app" a "Siempre" | iOS 13 | Primero `requestForegroundPermissionsAsync()`, después `requestBackgroundPermissionsAsync()`. Se detecta con `ios.scope === 'always'`. |
| Notificaciones provisionales | iOS 12 | `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })`. Se detecta con `ios.status === IosAuthorizationStatus.PROVISIONAL`. |
| Rastreo entre apps (App Tracking Transparency) | iOS 14.5 | `expo-tracking-transparency`: `requestTrackingPermissionsAsync()` / `useTrackingPermissions()`. |

**Versión mínima de iOS en Expo SDK 57: iOS 16.4.** Consecuencia práctica: todos los casos de la tabla **siempre están disponibles** en cualquier iPhone que ejecute la app. No hace falta preguntar por la versión de iOS (`ios.accuracy`, fotos limitadas, provisionales y ATT existen siempre), pero **sí hay que manejar cada matiz**, porque cualquier persona puede elegirlo.

### C5. Android vs iOS, lado a lado

| | Android | iOS |
|---|---|---|
| ¿Dónde se declara? | `AndroidManifest.xml` (`<uses-permission>`) | `Info.plist` (`NS…UsageDescription`) |
| Texto en el diálogo | No se puede poner texto propio: el diálogo es fijo. | Obligatorio: el texto de propósito aparece en el diálogo. |
| Oportunidades para preguntar | Dos (Android 11+): el segundo "No" bloquea. | Una: el primer "No" bloquea. |
| "Solo esta vez" / "Permitir una vez" | Android 11+: ubicación, cámara y micrófono. | iOS 13+: solo ubicación. |
| Notificaciones | Permiso de tiempo de ejecución desde Android 13 (`POST_NOTIFICATIONS`). Requiere canal. | Siempre requieren permiso, sin texto de propósito. Existen las provisionales. |
| Ubicación en segundo plano | Permiso aparte (`ACCESS_BACKGROUND_LOCATION`), se concede en Ajustes. Requiere un servicio en primer plano y declaración en Play. | Escalonada: "Siempre" se pide después de "en uso". Requiere `UIBackgroundModes: location`. |
| Si falta la declaración | Se deniega sin diálogo (`denied`). | La app se cierra (crash) y App Store la rechaza (ITMS-90683). |

---

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
|---|---|---|
| Escanear un QR con la cámara | `expo-camera` | `useCameraPermissions()` |
| Grabar video con sonido | `expo-camera` | `useCameraPermissions()` + `useMicrophonePermissions()` |
| Mostrar farmacias cercanas | `expo-location` | `useForegroundPermissions()` / `requestForegroundPermissionsAsync()` |
| Seguir un envío con la app en segundo plano | `expo-location` (+ `expo-task-manager`) | `requestForegroundPermissionsAsync()` y después `requestBackgroundPermissionsAsync()` |
| Mostrar un recordatorio | `expo-notifications` | `getPermissionsAsync()` / `requestPermissionsAsync()` |
| Grabar una nota de voz | `expo-audio` | `requestRecordingPermissionsAsync()` / `getRecordingPermissionsAsync()` |
| Galería propia dentro de la app | `expo-media-library` | `usePermissions()` / `requestPermissionsAsync()` |
| Publicidad personalizada entre apps (iOS) | `expo-tracking-transparency` | `useTrackingPermissions()` / `requestTrackingPermissionsAsync()` |

Si un tutorial usa `import * as Permissions from 'expo-permissions'`, está **desactualizado** (es de la época de SDK ≤ 40). Ese paquete fue deprecado y eliminado, y hoy cada módulo trae sus propias funciones. Conviene buscar documentación de la versión actual (docs.expo.dev/versions/v57.0.0).

### D2. Consultar, pedir y el hook

**a)** `get…PermissionsAsync()` **solo consulta** el estado actual y nunca muestra nada. `request…PermissionsAsync()` **pide**: si el estado es "sin decidir" o "denegado con `canAskAgain`", el sistema muestra el diálogo. **Solo `request…` puede mostrar un diálogo.**

**b)** El hook devuelve:

1. `permiso`: la última `PermissionResponse` (o `null`).
2. `pedirPermiso`: la función que llama a `request…`.
3. `consultarPermiso`: la función que llama a `get…`.

En el primer render `permiso` vale **`null`**, porque la consulta es asíncrona. Mientras tanto la pantalla tiene que mostrar un **indicador de carga**, no la cámara ni el botón de pedir.

**c)** Si `canAskAgain` es `false`, `request…()` **resuelve al instante con `denied` y sin mostrar diálogo**. Si se lo llama en un bucle (por ejemplo, en cada render o en un `useEffect` que depende de la respuesta), cada respuesta nueva provoca otro render y otro pedido: un **bucle infinito** que consume CPU y batería y deja la pantalla clavada en "Pidiendo permiso…".

### D3. Leé la respuesta

| Respuesta | Qué hace la app |
|---|---|
| `null` | Todavía está consultando: muestra un indicador de carga. |
| `{ status: 'granted', granted: true }` | Usa la función (muestra la cámara, obtiene la ubicación, etc.). |
| `{ status: 'undetermined', canAskAgain: true }` | Nunca se preguntó: muestra la pantalla previa con "Continuar", que lleva al diálogo. |
| `{ status: 'denied', canAskAgain: true }` | Dijo que no una vez (Android): ofrece la alternativa y, si vuelve a tocar la función, la pantalla previa con "Continuar". |
| `{ status: 'denied', canAskAgain: false }` | Bloqueado: explica cómo habilitarlo, botón "Abrir Ajustes" y la alternativa. No vuelve a pedir. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Funciona con las fotos que la persona eligió. Puede ofrecer "elegir más fotos", sin insistir. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Usa la ubicación aproximada: muestra "Ubicación aproximada", no coordenadas exactas. Si la función necesita precisión, ofrece elegir a mano. |

**Los dos campos que deciden casi todo:**

- `granted` responde **"¿puedo usar el recurso ahora?"**.
- `canAskAgain` responde **"¿puedo mostrar el diálogo o tengo que mandar a Ajustes?"**. Es lo que decide entre "Continuar" y "Abrir Ajustes".

### D4. Simulación del ciclo completo

Android 14, app recién instalada, `expo-location`:

| # | Acción | status | canAskAgain | ¿Diálogo? |
|---|---|---|---|---|
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No |
| 2 | `requestForegroundPermissionsAsync()` → "No permitir" | `denied` | `true` | Sí |
| 3 | `requestForegroundPermissionsAsync()` → "No permitir" | `denied` | `false` | Sí |
| 4 | `requestForegroundPermissionsAsync()` | `denied` | `false` | **No** (responde al instante) |
| 5 | `Linking.openSettings()` → habilita "Mientras la app está en uso" → vuelve y la app consulta | `granted` | `true` | No |
| 6 | Igual que el 5, pero la app **no** vuelve a consultar | Muestra lo viejo: `denied` | `false` | No: la pantalla sigue diciendo "bloqueado" aunque el permiso ya está concedido |

**En iOS** el resultado cambia en el **paso 2**: el primer "No permitir" ya devuelve `denied` con `canAskAgain: false`, porque iOS pregunta una sola vez. Por eso en el paso 3 **ya no aparece el diálogo** y la respuesta es la misma que en el 4.

**"Permitir una vez" en iOS:** durante esa sesión el estado es `granted`. Al cerrar y reabrir la app, el permiso **vuelve a "sin decidir"** (`undetermined`, `canAskAgain: true`), y la próxima vez que la persona use la función se puede mostrar el diálogo de nuevo.

### D5. Configurar app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para leer el código QR del punto de reciclaje.",
          "microphonePermission": false,
          "recordAudioAndroid": false,
          "barcodeScannerEnabled": true
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos.",
          "isAndroidBackgroundLocationEnabled": false,
          "isIosBackgroundLocationEnabled": false
        }
      ]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

`expo-camera` agrega `RECORD_AUDIO` en Android **por defecto** (`recordAudioAndroid` vale `true`) porque el mismo módulo sirve para **grabar video con sonido** (`recordAsync`). El plugin no puede saber si tu app va a grabar, así que lo declara por las dudas. Por eso, si solo escaneás QR, hay que desactivarlo.

### D6. Expo Go no es tu app

**a)** Porque Expo Go es **otra app**, ya compilada y publicada por Expo, con su propio `Info.plist` y su propio manifiesto. El diálogo muestra los textos de Expo Go, no los de tu `app.json`: los plugins solo se aplican cuando se compila **tu** binario.

**b)** **En Expo Go se puede probar:** cámara y escáner, ubicación en primer plano, selector de imágenes, notificaciones **locales** y la lógica de los estados (`get` / `request`, `canAskAgain`, volver de Ajustes). **Necesita development build:** notificaciones **push en Android** (no están en Expo Go desde SDK 53), **ubicación en segundo plano** (servicio en primer plano y `UIBackgroundModes`), tus textos de propósito, `blockedPermissions`, cualquier opción de config plugin y los módulos nativos que no vienen en Expo Go.

**c)**

```bash
# Ver los archivos nativos generados (android/ y ios/)
npx expo prebuild --clean
# Compilar e instalar una development build en Android (local)
npx expo install expo-dev-client
npx expo run:android
# …o en la nube con EAS
npx eas-cli@latest build --profile development --platform android
```

**d)**

```bash
# Android: revocar y limpiar las marcas "el usuario ya decidió" → vuelve a "sin decidir"
adb shell pm revoke ar.edu.ipf.mantenimiento android.permission.CAMERA
adb shell pm clear-permission-flags ar.edu.ipf.mantenimiento android.permission.CAMERA user-set user-fixed
# (o todos los permisos de la app)
adb shell pm reset-permissions -p ar.edu.ipf.mantenimiento

# Simulador de iOS
xcrun simctl privacy booted reset camera ar.edu.ipf.mantenimiento
xcrun simctl privacy booted reset all ar.edu.ipf.mantenimiento
```

---

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

Errores:

1. **`permiso` es `null` en el primer render:** `permiso.status` lanza `TypeError: Cannot read property 'status' of null` y la pantalla se rompe. Falta el estado **cargando**.
2. **No contempla el estado bloqueado:** si `canAskAgain` es `false`, el botón llama a `pedirPermiso`, que no muestra nada, y la persona queda atrapada. Hay que mostrar "Abrir Ajustes".
3. **El botón dice "Permitir":** confunde con el diálogo del sistema. Debe decir **"Continuar"** (pauta 5.1.1).
4. **No se entera al volver de Ajustes:** falta revisar con `AppState` (`consultarPermiso`).
5. **No hay alternativa:** si la persona no quiere dar la cámara, no puede escribir el aula a mano.
6. `Explicacion` no está importado, y la cámara no tiene configurado el escaneo (`barcodeScannerSettings` / `onBarcodeScanned`).

Versión corregida (es la que usa la app en [src/app/reporte/escanear.tsx](src/app/reporte/escanear.tsx)):

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, Button, Linking, StyleSheet, View } from 'react-native';

import { CargaManual } from '@/components/CargaManual';
import { Explicacion } from '@/components/Explicacion';
import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';

export default function Escanear() {
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  const yaLeyo = useRef(false);

  const revisar = useCallback(() => { consultarPermiso(); }, [consultarPermiso]);
  useRevisarAlVolver(revisar); // se actualiza al volver de Ajustes

  // 1. Cargando
  if (!permiso) return <ActivityIndicator style={{ flex: 1 }} />;

  // 2. Concedido
  if (permiso.granted) {
    return (
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (yaLeyo.current) return;
          yaLeyo.current = true;
          router.back(); // …y guardar `data` como aula
        }}
      />
    );
  }

  // 3. Preguntable
  if (permiso.canAskAgain) {
    return (
      <Explicacion texto="Usamos la cámara para leer el QR del aula.">
        <Button title="Continuar" onPress={pedirPermiso} />
        <CargaManual />
      </Explicacion>
    );
  }

  // 4. Bloqueado
  return (
    <Explicacion texto="La cámara está desactivada. Activala en Ajustes › Mantenimiento IPF › Cámara.">
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
      <CargaManual />
    </Explicacion>
  );
}
```

### E2. El orden importa (ubicación)

**a)** Pide **primero "siempre" (segundo plano) y después "en uso"**, y además corta si no le dan "siempre". El orden correcto es el inverso: el segundo plano solo se puede pedir **después** de tener el primer plano.

- **En iOS:** el pedido de "Siempre" sin "En uso" previo no muestra el diálogo esperado (o lo muestra fuera de contexto). En la práctica queda `denied` y la función devuelve `false` sin haber pedido nunca el primer plano.
- **En Android 11+:** `ACCESS_BACKGROUND_LOCATION` no se puede pedir si no está concedida la ubicación en primer plano: el pedido se ignora o se deniega. Además, desde Android 11 el segundo plano no se concede en un diálogo, sino en Ajustes ("Permitir todo el tiempo").

**b)**

```ts
import * as Location from 'expo-location';

export async function activarSeguimiento(): Promise<boolean> {
  // 1º primer plano
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) return false;

  // 2º segundo plano, recién ahora (en Android 11+ abre Ajustes)
  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

**c)** (Es la de [src/lib/ubicacion.ts](src/lib/ubicacion.ts), con el pedido incluido.)

```ts
import * as Location from 'expo-location';

export type Coordenadas = { latitud: number; longitud: number; aproximada: boolean };

export async function obtenerUbicacion(): Promise<Coordenadas | null> {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const aproximada =
      permiso.android?.accuracy === 'coarse' || // Android 12+: eligió "Aproximada"
      permiso.ios?.accuracy === 'reduced'; // iOS 14+: apagó "Ubicación precisa"

    return { latitud: coords.latitude, longitud: coords.longitude, aproximada };
  } catch {
    return null; // GPS apagado, timeout, etc.: nunca rompe la app
  }
}
```

**d)** **No hace falta.** Las farmacias cercanas se buscan cuando la persona abre la pantalla, así que alcanza con la ubicación en primer plano (y hasta con la aproximada). Si se pidiera segundo plano, Google Play exige completar la **declaración de ubicación en segundo plano** en Play Console: justificar que es una función central para la persona, mostrar un **aviso destacado** (*prominent disclosure*) dentro de la app antes de pedirlo y subir un **video** que muestre la función. Si no se justifica, la app se rechaza.

### E3. Notificaciones mudas

**a)** La causa más probable es que **no hay ningún canal de notificaciones creado**. En Android 13+ el diálogo de `POST_NOTIFICATIONS` no aparece hasta que la app crea al menos un canal. También puede faltar la declaración en el manifiesto (si se bloqueó el permiso) o que la persona ya lo haya denegado dos veces. **Antes de pedir** hay que llamar a `Notifications.setNotificationChannelAsync('reportes', { name: …, importance: AndroidImportance.HIGH })`.

**b)** En **Android 12 o anterior** no existe como permiso de tiempo de ejecución: las notificaciones están **concedidas por defecto** al instalar. `requestPermissionsAsync()` devuelve `granted` sin diálogo, aunque la persona puede desactivarlas desde Ajustes.

**c)** Las **notificaciones provisionales** (iOS 12+): se piden con `requestPermissionsAsync({ ios: { allowProvisional: true } })` y llegan en silencio al Centro de notificaciones, sin diálogo previo. Se detecta con:

```ts
const { ios } = await Notifications.getPermissionsAsync();
const provisional = ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
```

**d)** Conviene pedirlo **cuando la persona entiende el beneficio**, justo al activar una función que lo necesita.

- **Buen momento:** después de enviar un reporte, al activar "Avisarme cuando se resuelva".
- **Mal momento:** apenas se abre la app por primera vez, antes de que la persona sepa qué hace la app.

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
|---|---|---|
| Elegir una foto de perfil | `ImagePicker.launchImageLibraryAsync()` (selector del sistema / Photo Picker) | Ninguno |
| Sacar una foto en el momento | `ImagePicker.launchCameraAsync()` o `expo-camera` | Cámara |
| Editor que muestra toda la galería | `expo-media-library` | Galería completa (`READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO`, `NSPhotoLibraryUsageDescription`) |
| Adjuntar la foto de un comprobante | `ImagePicker.launchImageLibraryAsync()` (o `expo-document-picker`) | Ninguno |

Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` porque dan acceso a **toda** la galería (fotos íntimas, documentos, ubicación en los metadatos) cuando la mayoría de las apps solo necesita una foto puntual. Desde **2024** (la política de permisos de fotos y videos se aplica desde el 31/08/2024, con plazo final el 22/01/2025 para las apps de uso puntual), solo pueden declararlos las apps cuya función central es gestionar la galería, y tienen que justificarlo en Play Console. Las demás deben usar el **selector de fotos del sistema**. "El mejor permiso" es **el que no tenés que pedir**: si una herramienta del sistema resuelve la necesidad sin permiso, se usa esa.

### E5. Volver de Ajustes

```ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
```

**a)** Porque los hooks de Expo consultan el permiso **solo al montar** (o cuando se llama a `get` o `request`). El sistema no emite ningún evento que avise "el permiso cambió". Cuando la persona lo concede en Ajustes, la app sigue mostrando la respuesta vieja hasta que vuelva a consultar.

**b)** `consultarPermiso`, el **tercer elemento** del hook `useCameraPermissions()` (la función `get`, que no muestra diálogo).

**c)** Porque la fuente de verdad es **el sistema**, no la app: la persona puede cambiar el permiso en Ajustes en cualquier momento, el permiso puede expirar ("Solo esta vez", revocación automática de apps sin uso) o el proceso puede reiniciarse. Un valor guardado "para siempre" queda **desactualizado** y hace que la app muestre "bloqueado" cuando ya está concedido (o al revés). Hay que **consultar siempre** antes de decidir.

---

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
|---|---|---|
| Delivery · ubicación | Al tocar "Usar mi ubicación actual" en la dirección de entrega. | Escribir la dirección o elegirla en el mapa. |
| Billetera virtual · cámara | Al tocar "Pagar con QR" o "Escanear DNI". | Ingresar el código o alias a mano, o subir la foto desde el selector. |
| Red social · contactos | Al tocar "Buscar amigos de mi agenda". | Buscar por nombre de usuario o compartir un enlace de invitación (o el selector de contactos). |
| Mensajería · micrófono | Al mantener presionado el botón de nota de voz por primera vez. | Escribir el mensaje. |
| Turnos médicos · notificaciones | Después de sacar un turno: "¿Te recordamos el turno un día antes?". | Recordatorios en una bandeja dentro de la app, agregar al calendario o email. |
| Editor de fotos · galería completa | Al abrir la sección "Galería" del editor. | Elegir foto por foto con el selector del sistema (o trabajar con el acceso limitado). |

Pedir cuatro permisos apenas se abre la app "entrena el No permitir automático" porque la persona todavía no sabe para qué sirve cada uno. Ve una ráfaga de diálogos sin contexto, aprende a cerrarlos tocando "No" por reflejo, y cada rechazo gasta una de las oportunidades (una sola en iOS, dos en Android). Así los permisos quedan **bloqueados** antes de que llegue el momento de usarlos.

### F2. La pantalla previa

**a)** Tres elementos:

1. El **beneficio en una frase** ("Usamos tu cámara para leer el QR del aula").
2. **Un único botón "Continuar"**, que lleva al diálogo del sistema.
3. La **aclaración de que se puede cambiar** después en Ajustes.

**b)** Porque **quien concede es el sistema**, no ese botón. "Permitir" hace creer que ya se dio el permiso, o duplica la decisión. "Continuar" es honesto: avisa que viene el diálogo real, donde la persona decide. Apple lo pide expresamente.

**c)** La pauta 5.1.1(iv) dice que hay que respetar la decisión de la persona y **no manipular, engañar ni forzar** el consentimiento. En la práctica, la revisión de Apple exige que la pantalla previa **siempre lleve al diálogo del sistema**, así que no se permiten botones como "Ahora no" o "Cerrar" que salteen o pospongan el pedido. La decisión se toma en el diálogo, y si la persona no quiere, dice "No permitir" ahí.

**d)** Si el permiso ya está bloqueado, no tiene sentido "Continuar" (el diálogo no va a aparecer). La pantalla **explica cómo habilitarlo**, con el camino exacto en Ajustes según la plataforma, el botón pasa a ser **"Abrir Ajustes"** (`Linking.openSettings()`) y se ofrece la **alternativa** para seguir sin el permiso.

### F3. Mínimo privilegio

**a)** **Aproximada.** Para saber qué puntos de reciclaje hay en el barrio alcanza con unos 3 km² de precisión, y la precisa no agrega valor.

**b)** **"En uso".** La carrera la inicia la persona con la app abierta. Con "en uso" más un servicio en primer plano (Android, con notificación fija) o el modo de fondo de ubicación (iOS, con el indicador azul), se sigue registrando con el celular en el bolsillo durante esa sesión. "Siempre" solo haría falta para registrar sin que la persona inicie nada (geovallas, detección automática).

**c)** **Selector del sistema.** Es una foto puntual que elige la persona, así que no hace falta acceso a toda la galería (y Google Play lo restringe).

**d)** **Sin micrófono** (`microphonePermission: false`, `recordAudioAndroid: false`). Escanear un QR no graba audio.

### F4. Tiendas

**a) Google Play:**

1. Apuntar a la API exigida (API 36 desde el 31/08/2026).
2. Completar la sección **Seguridad de los datos** (*Data safety*).
3. Declarar en Play Console los permisos sensibles, como ubicación en segundo plano, fotos y videos, `MANAGE_EXTERNAL_STORAGE` o `SCHEDULE_EXACT_ALARM` (con aviso destacado y video cuando corresponde).
4. Publicar una política de privacidad.

**App Store:**

1. Textos de propósito en todas las claves `NS…UsageDescription` (si no, ITMS-90683).
2. **Etiquetas de privacidad** (*Privacy Nutrition Labels*) en App Store Connect.
3. **Manifiesto de privacidad** (`PrivacyInfo.xcprivacy`) con las *required reason APIs*.
4. **App Tracking Transparency** si la app rastrea entre apps, y respetar la pauta 5.1.1 (no forzar el consentimiento).

**b)** `PrivacyInfo.xcprivacy` es un archivo que Apple exige (desde mayo de 2024) donde la app **y cada SDK** declaran qué datos recolectan, si hacen rastreo y con qué dominios, y **por qué motivo** usan ciertas APIs sensibles (*required reason APIs*: `UserDefaults`, fechas de archivos, espacio en disco, tiempo de arranque…). En Expo se configura en `app.json` con `expo.ios.privacyManifests` (`NSPrivacyAccessedAPITypes`, `NSPrivacyCollectedDataTypes`, `NSPrivacyTracking`…), y `prebuild` genera el archivo.

**c)** Android 17 (API 37) suma el **selector de contactos del sistema** (*Android Contact Picker*): la persona elige contactos puntuales y la app recibe solo esos, sin acceso a toda la agenda. También suma el permiso de red local (`ACCESS_LOCAL_NETWORK`). Google Play va a exigir que las apps que apunten a Android 17+ **usen el selector** y solo pidan `READ_CONTACTS` si el selector no alcanza para su función principal. En ese caso tienen que **completar una declaración en Play Console** justificando el acceso completo. La consigna indica el 27/01/2027. Ojo: la página de ayuda de Play Console menciona el 28/10/2026 para las apps que apuntan a API 37, así que conviene revisar la fecha vigente.

### F5. Errores comunes

**a)** *"…attempted to access privacy-sensitive data without a usage description."*

- **Causa:** falta la clave `NS…UsageDescription` en el `Info.plist` del recurso que se usó.
- **Solución:** agregar el texto de propósito en `app.json` (opción del plugin, por ejemplo `cameraPermission`, o `ios.infoPlist`), correr `npx expo prebuild --clean` y **recompilar**. Un OTA no alcanza.

**b)** *"En Expo Go anda, en la build no".*

- **Causa:** Expo Go trae declarados todos los permisos, pero tu build solo tiene los que genera tu `app.json`. Si falta el plugin `expo-camera`, o `CAMERA` quedó en `blockedPermissions` (o lo quitó otra opción), Android deniega sin diálogo. También puede pasar que en esa build el permiso ya se haya denegado dos veces.
- **Solución:** revisar el `AndroidManifest.xml` generado (`npx expo prebuild`), agregar el plugin o el permiso, recompilar y resetear el permiso con `adb`.

**c)** *Después de habilitar la ubicación en Ajustes, la app sigue diciendo "bloqueado".*

- **Causa:** la app no vuelve a consultar al regresar de Ajustes (o guardó el estado en un store "para siempre").
- **Solución:** escuchar `AppState` (`useRevisarAlVolver`) y llamar a `get…PermissionsAsync()` / `consultarPermiso` al volver a `active`.

**d)** *La pantalla queda en "Pidiendo permiso…" para siempre.*

- **Causa:** `request…()` se llama en el cuerpo del render (o en un efecto sin control): cada respuesta re-renderiza y vuelve a pedir. Con `canAskAgain: false` responde al instante y se forma un bucle infinito.
- **Solución:** pedir **solo en respuesta a una acción** de la persona (`onPress` de "Continuar"), mostrar `null` como "cargando" y decidir la pantalla según `granted` / `canAskAgain`.

**e)** *Una app de turnos no deja entrar a ninguna pantalla si se deniegan las notificaciones.*

- **Causa:** la app trata un permiso **opcional** como obligatorio y bloquea toda la app. Es un mal diseño, y Apple lo rechaza por la pauta 5.1.1 (forzar el consentimiento).
- **Solución:** dejar usar la app igual y ofrecer una **alternativa**: bandeja de avisos dentro de la app, recordatorio por email o "agregar al calendario". El pedido se hace en contexto, al activar "Recordarme el turno".
