# TP N° 3 — Permisos móviles: Android, iOS y Expo · Respuestas (Partes A a F)

Taller Complementario – React Native II · Instituto Politécnico Formosa
Alumno: Fabricio Augusto

> Versiones verificadas sobre el proyecto (Expo SDK 57, React Native 0.86): `targetSdk 36`, `minSdk 24` e iOS mínimo 16.4.

---

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a)** Un permiso es la autorización para que una app use un recurso o dato protegido (cámara, ubicación, contactos, notificaciones…).

- **La app** declara qué necesita y lo pide en el momento de usarlo.
- **El sistema operativo** muestra el diálogo (lo dibuja él), guarda la respuesta y bloquea el acceso si no hay autorización.
- **La persona usuaria** decide: concede, deniega o revoca desde Ajustes.

**b)** La **caja de arena (sandbox)** aísla a cada app: solo ve sus propios archivos y no puede tocar datos de otras apps ni hardware sensible. Los permisos son las puertas controladas para salir de esa caja. Sin ningún permiso, una app puede mostrar su interfaz, guardar sus propios datos, usar permisos normales como `INTERNET` y usar los selectores del sistema (fotos, documentos).

**c)**

1. **Privacidad:** una linterna no tiene por qué leer los contactos.
2. **Seguridad:** que una app no grabe el micrófono en secreto ni dibuje encima de la app del banco.
3. **Control y transparencia:** poder quitarle la ubicación a una red social desde Ajustes.
4. **Batería y rendimiento:** la ubicación "siempre" o las alarmas exactas consumen energía, por eso son permisos aparte.

**d)** La visita es la app, el portero es el sistema operativo y el dueño es la persona usuaria. "El portero se acuerda de la respuesta" significa que el SO guarda la decisión: si dijo que no (una vez en iOS, dos en Android), no vuelve a preguntar y solo se cambia desde Ajustes.

### A2. Declarar y solicitar

| | Declarar (al compilar) | Solicitar (al ejecutar) |
|---|---|---|
| **¿Qué se hace?** | Se anuncia qué permisos podría usar la app. | Se pide al SO que muestre el diálogo y se lee la respuesta. |
| **Android** | `<uses-permission>` en `AndroidManifest.xml`. | Diálogo del sistema (`requestPermissions`). |
| **iOS** | Claves `NS…UsageDescription` en `Info.plist`. | La API de cada framework muestra el diálogo con ese texto. |
| **Expo** | `app.json`: plugins, `android.permissions`, `android.blockedPermissions`, `ios.infoPlist`. | `request…PermissionsAsync()` o los hooks `use…Permissions()`. |
| **Si se omite** | Android deniega sin diálogo. iOS cierra la app y App Store rechaza la build (ITMS-90683). | La app no obtiene acceso. |

### A3. Verdadero o falso

- **a) F.** El diálogo lo dibuja el sistema operativo, no la app.
- **b) V.** `prebuild` regenera `android/` e `ios/` a partir de `app.json`.
- **c) F.** El `Info.plist` es nativo: un OTA solo cambia JavaScript, así que hace falta una build nueva.
- **d) F.** Si no está en el manifiesto, Android lo deniega sin mostrar diálogo.
- **e) F.** `expo-permissions` está deprecado y eliminado; cada módulo trae sus propias funciones.
- **f) V.** Las notificaciones no llevan clave en el `Info.plist`.
- **g) V.** El matiz está en `accessPrivileges: 'limited'`.
- **h) F.** No es del todo confiable: en iOS algunas decisiones (como las de notificaciones) pueden sobrevivir a la reinstalación, y en Android puede haber restauración por backup. Lo confiable es `adb` en Android y `xcrun simctl privacy` en iOS (ver D6.d).

### A4. Los estados de un permiso

**a)**

```
ANDROID 11+
Sin decidir ─pedir─▶ Concedido
     └─No─▶ Denegado (canAskAgain: true) ─pedir─▶ Concedido
                  └─No─▶ BLOQUEADO (canAskAgain: false) ─Ajustes─▶ Concedido

iOS
Sin decidir ─pedir─▶ Concedido
     └─No─▶ BLOQUEADO (canAskAgain: false) ─Ajustes─▶ Concedido
```

**Diferencia central:** Android da dos oportunidades e iOS una sola.

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
| `INTERNET` | De instalación | Automático al instalar. |
| `CAMERA` | De tiempo de ejecución | Diálogo del sistema. |
| `VIBRATE` | De instalación | Automático al instalar. |
| `SYSTEM_ALERT_WINDOW` | Especial | Ajustes › "Mostrar sobre otras apps". |
| `POST_NOTIFICATIONS` | De tiempo de ejecución (Android 13+) | Diálogo del sistema (requiere un canal creado). |
| `ACCESS_NETWORK_STATE` | De instalación | Automático al instalar. |
| `READ_CONTACTS` | De tiempo de ejecución | Diálogo del sistema. |
| `SCHEDULE_EXACT_ALARM` | Especial | Ajustes › "Alarmas y recordatorios". |
| `RECORD_AUDIO` | De tiempo de ejecución | Diálogo del sistema. |
| `MANAGE_EXTERNAL_STORAGE` | Especial | Ajustes › "Acceso a todos los archivos". |

### B2. Grupos y nombres

**a)** Un grupo de permisos junta permisos del mismo recurso (Ubicación, Cámara, Contactos…) y el sistema muestra un solo diálogo por grupo. Si se piden `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve **un único diálogo**, con la opción de precisa o aproximada (Android 12+).

**b)** El prefijo es `android.permission.`. El de cámara es `android.permission.CAMERA`.

**c)** Los permisos de firma solo se conceden a apps firmadas con el mismo certificado que el sistema o que la app que los define. Una app común no tiene esa firma, por eso no puede usarlos.

### B3. Leé el manifiesto

**a)** Al instalar se concede `INTERNET`. En tiempo de ejecución hay que pedir `CAMERA`, la ubicación (COARSE y FINE, un solo diálogo), `POST_NOTIFICATIONS` y `READ_EXTERNAL_STORAGE` (solo hasta Android 12). `RECORD_AUDIO` no queda en el manifiesto final.

**b)** `android:maxSdkVersion="32"` hace que el permiso solo se declare hasta Android 12L. Desde Android 13 lo reemplazan `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` y `READ_MEDIA_AUDIO`.

**c)** `tools:node="remove"` borra ese permiso del manifiesto final aunque lo agregue una librería. Lo genera:

```json
{ "expo": { "android": { "blockedPermissions": ["android.permission.RECORD_AUDIO"] } } }
```

**d)** En `expo.android.permissions`: `"permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]`.

**e)** Porque `android/` se regenera con cada `npx expo prebuild` y los cambios a mano se pierden: la fuente de verdad es `app.json`. `blockedPermissions` **no funciona en Expo Go**, porque Expo Go tiene su propio manifiesto; solo se aplica en una build propia.

### B4. Así pregunta Android

**a)** No. El diálogo es del sistema y no acepta texto propio. La explicación va en una pantalla propia, antes del diálogo.

**b)** "Mientras la app está en uso" es permanente con la app en primer plano. "Solo esta vez" se revoca poco después de salir de la app. Existe para ubicación, cámara y micrófono (Android 11+).

**c)** El sistema deja de mostrar el diálogo y `canAskAgain` pasa a `false`. Solo se habilita desde Ajustes.

**d)** Anda bien para el clima de la ciudad o las farmacias del barrio. No anda para la navegación giro a giro ni para marcar en qué pasillo está un desperfecto.

**e)** Android mata el proceso de la app; al volver, arranca de cero.

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
|---|---|---|
| Nacen los permisos en tiempo de ejecución | Android 6.0 (API 23) | Consultar y pedir en ejecución, y manejar el "No". |
| Ubicación en segundo plano aparte | Android 10 (API 29) | Pedir `ACCESS_BACKGROUND_LOCATION` después del primer plano. |
| Dos rechazos = "no volver a preguntar" | Android 11 (API 30) | Leer `canAskAgain`; si es `false`, ofrecer Ajustes. |
| Ubicación precisa o aproximada | Android 12 (API 31) | Leer `android.accuracy` y funcionar con las dos. |
| Notificaciones como permiso | Android 13 (API 33) | Crear el canal y pedir en contexto. |
| Acceso parcial a fotos | Android 14 (API 34) | `accessPrivileges` puede ser `'limited'`; mejor usar el selector. |
| Red local (`ACCESS_LOCAL_NETWORK`) | Android 17 (API 37) | Acceder a dispositivos de la red local requiere pedir este permiso. |

El **`targetSdkVersion`** es la versión de Android para la que la app declara estar preparada; el sistema le aplica las reglas de esa versión. **Expo SDK 57 apunta a API 36** (Android 16). **Google Play exige API 36** para apps nuevas y actualizaciones desde el 31/08/2026.

---

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso | Clave en Info.plist |
|---|---|
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación en uso | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` |
| Fotos (leer) | `NSPhotoLibraryUsageDescription` |
| Fotos (solo guardar) | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | No lleva clave. |

### C2. Sin texto, no hay permiso

**a)** La app **se cierra (crash)** al usar la cámara. Al subir la build, App Store Connect la rechaza con **ITMS-90683: Missing Purpose String in Info.plist**.

**b)** **Una sola vez.** Si dice que no, queda bloqueado. A la app le queda explicar, ofrecer "Abrir Ajustes" y dar una alternativa.

**c)** El sistema arma el título y los botones; vos escribís el texto de propósito. En Expo va en las opciones del plugin de cada módulo (por ejemplo `cameraPermission`) o en `ios.infoPlist`.

**d)** Apple analiza el binario: si la librería contiene código de una API protegida, exige su clave aunque la app no la llame. Se resuelve agregando el texto de propósito o desactivando esa parte de la librería desde el plugin.

### C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobado? | Versión mejorada |
|---|---|---|
| "Necesitamos tu ubicación." | No: no dice para qué. | "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas a donde estás." |
| "Para mejorar tu experiencia." | No: es vago. | "Usamos tu ubicación para ordenar los locales por cercanía y estimar el tiempo de envío." |
| "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." | **Sí** | — |
| "La app no funciona sin ubicación." | No: presiona y no explica. | "Usamos tu ubicación para marcar en el mapa dónde está el problema que reportás." |
| "Ubicación requerida por el sistema." | No: es falso. | "Usamos tu ubicación para avisarte qué puntos de reciclaje hay en tu barrio." |

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
|---|---|---|
| Fotos limitadas | iOS 14 | `accessPrivileges: 'limited'` |
| Ubicación aproximada | iOS 14 | `ios.accuracy === 'reduced'` |
| "Permitir una vez" | iOS 13 | `granted` durante la sesión; al reabrir vuelve a `'undetermined'`. |
| De "al usar la app" a "Siempre" | iOS 13 | `requestForegroundPermissionsAsync()` y después `requestBackgroundPermissionsAsync()`. |
| Notificaciones provisionales | iOS 12 | `allowProvisional: true`; se detecta con `ios.status === IosAuthorizationStatus.PROVISIONAL`. |
| Rastreo entre apps (ATT) | iOS 14.5 | `expo-tracking-transparency`: `requestTrackingPermissionsAsync()`. |

**Expo SDK 57 requiere iOS 16.4.** Consecuencia: todos estos casos existen en cualquier iPhone que use la app, así que no hace falta revisar la versión, pero sí manejar cada matiz.

### C5. Android vs iOS, lado a lado

| | Android | iOS |
|---|---|---|
| ¿Dónde se declara? | `AndroidManifest.xml` | `Info.plist` |
| Texto en el diálogo | No se puede poner texto propio. | Obligatorio (texto de propósito). |
| Oportunidades para preguntar | Dos | Una |
| "Solo esta vez" / "Permitir una vez" | Ubicación, cámara y micrófono | Solo ubicación |
| Notificaciones | Permiso desde Android 13; requieren canal. | Siempre se piden; existen las provisionales. |
| Ubicación en segundo plano | Permiso aparte, se concede en Ajustes. | Se pide "Siempre" después de "en uso". |
| Si falta la declaración | Se deniega sin diálogo. | Crash y rechazo de la tienda. |

---

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
|---|---|---|
| Escanear un QR | `expo-camera` | `useCameraPermissions()` |
| Grabar video con sonido | `expo-camera` | `useCameraPermissions()` + `useMicrophonePermissions()` |
| Farmacias cercanas | `expo-location` | `useForegroundPermissions()` |
| Seguir un envío en segundo plano | `expo-location` + `expo-task-manager` | Primer plano y después `requestBackgroundPermissionsAsync()` |
| Mostrar un recordatorio | `expo-notifications` | `requestPermissionsAsync()` |
| Grabar una nota de voz | `expo-audio` | `requestRecordingPermissionsAsync()` |
| Galería propia | `expo-media-library` | `usePermissions()` |
| Publicidad entre apps (iOS) | `expo-tracking-transparency` | `useTrackingPermissions()` |

Si un tutorial usa `expo-permissions`, está **desactualizado**: ese paquete ya no existe.

### D2. Consultar, pedir y el hook

**a)** `get…` solo consulta, sin diálogo. `request…` pide y **es la única que puede mostrar el diálogo**.

**b)** `permiso` es la respuesta actual, `pedirPermiso` llama a `request` y `consultarPermiso` llama a `get`. En el primer render `permiso` vale **`null`**: hay que mostrar un indicador de carga.

**c)** Responde al instante `denied`, sin diálogo. En un bucle, cada respuesta provoca otro render y otro pedido: un ciclo infinito que deja la pantalla trabada.

### D3. Leé la respuesta

| Respuesta | Qué hace la app |
|---|---|
| `null` | Muestra el indicador de carga. |
| `{ status: 'granted', granted: true }` | Usa la función. |
| `{ status: 'undetermined', canAskAgain: true }` | Pantalla previa con "Continuar". |
| `{ status: 'denied', canAskAgain: true }` | Ofrece la alternativa; si vuelve a tocar la función, la pantalla previa otra vez. |
| `{ status: 'denied', canAskAgain: false }` | "Abrir Ajustes" y la alternativa. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Trabaja con las fotos elegidas. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Muestra "Ubicación aproximada", sin coordenadas. |

Los dos campos que deciden casi todo: **`granted`** (¿puedo usarlo?) y **`canAskAgain`** (¿lo pido o mando a Ajustes?).

### D4. Simulación del ciclo completo

| # | Acción | status | canAskAgain | ¿Diálogo? |
|---|---|---|---|---|
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No |
| 2 | `request…` → "No permitir" | `denied` | `true` | Sí |
| 3 | `request…` → "No permitir" | `denied` | `false` | Sí |
| 4 | `request…` | `denied` | `false` | No |
| 5 | Ajustes → habilita → vuelve y consulta | `granted` | `true` | No |
| 6 | Igual, pero sin consultar | Sigue mostrando `denied` (dato viejo) | `false` | No |

**En iOS** cambia en el **paso 2**: el primer "No" ya deja `canAskAgain: false`, así que en el paso 3 no aparece el diálogo. Con **"Permitir una vez"**, al cerrar y reabrir la app vuelve a `undetermined`.

### D5. Configurar app.json

```json
{
  "expo": {
    "plugins": [
      ["expo-camera", {
        "cameraPermission": "Usamos tu cámara para leer el código QR del punto de reciclaje.",
        "microphonePermission": false,
        "recordAudioAndroid": false
      }],
      ["expo-location", {
        "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos.",
        "isAndroidBackgroundLocationEnabled": false
      }]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

`expo-camera` agrega `RECORD_AUDIO` por defecto porque también sirve para grabar video con sonido, y no puede saber si tu app lo va a hacer.

### D6. Expo Go no es tu app

**a)** Porque Expo Go es otra app, con su propio `Info.plist` y manifiesto: tus textos solo se aplican al compilar tu binario.

**b)** **En Expo Go** se prueba la cámara, la ubicación en primer plano, el selector de fotos, las notificaciones locales y la lógica de estados. **Necesita development build** lo siguiente: tus textos de propósito, `blockedPermissions`, push en Android y ubicación en segundo plano.

**c)**

```bash
npx expo prebuild --clean   # ver android/ e ios/
npx expo install expo-dev-client
npx expo run:android        # o: npx eas-cli@latest build --profile development --platform android
```

**d)**

```bash
# Android
adb shell pm revoke ar.edu.ipf.mantenimiento android.permission.CAMERA
adb shell pm clear-permission-flags ar.edu.ipf.mantenimiento android.permission.CAMERA user-set user-fixed
# Simulador de iOS
xcrun simctl privacy booted reset camera ar.edu.ipf.mantenimiento
```

---

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

1. `permiso` es `null` en el primer render y `permiso.status` rompe la app: falta el estado **cargando**.
2. No contempla el **bloqueado**: con `canAskAgain: false` el botón no hace nada. Falta "Abrir Ajustes".
3. El botón dice "Permitir": debe decir **"Continuar"**.
4. No se actualiza al volver de Ajustes ni ofrece escribir el aula a mano.

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Button, Linking } from 'react-native';

import { Explicacion } from '@/components/Explicacion';

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();

  if (!permiso) return <ActivityIndicator />;                        // 1. cargando
  if (permiso.granted) return <CameraView style={{ flex: 1 }} facing="back" />; // 2. concedido

  if (permiso.canAskAgain) {                                         // 3. preguntable
    return (
      <Explicacion texto="Usamos la cámara para leer el QR del aula.">
        <Button title="Continuar" onPress={pedirPermiso} />
      </Explicacion>
    );
  }
  return (                                                           // 4. bloqueado
    <Explicacion texto="La cámara está desactivada. Podés habilitarla en Ajustes.">
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
    </Explicacion>
  );
}
```

La versión completa, con la vuelta de Ajustes y la carga manual, está en [src/app/reporte/escanear.tsx](src/app/reporte/escanear.tsx).

### E2. El orden importa (ubicación)

**a)** Pide "siempre" antes que "en uso". En iOS el pedido de segundo plano sin el de primer plano no funciona como se espera. En Android 11+ el segundo plano no se puede pedir sin tener antes el primer plano, así que la función devuelve `false`.

**b)**

```ts
export async function activarSeguimiento() {
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) return false;
  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

**c)**

```ts
export async function obtenerUbicacion() {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) return null;
    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const aproximada = permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';
    return { latitud: coords.latitude, longitud: coords.longitude, aproximada };
  } catch {
    return null;
  }
}
```

**d)** No, alcanza con primer plano. Si se pide segundo plano, Google Play exige una declaración en Play Console, un aviso visible dentro de la app y un video de la función.

### E3. Notificaciones mudas

**a)** Falta crear un **canal de notificaciones**: en Android 13+ el diálogo no aparece sin uno. Hay que llamar a `setNotificationChannelAsync('reportes', …)` antes de pedir.

**b)** En Android 12 o anterior no es un permiso de tiempo de ejecución: viene concedido y responde `granted` sin diálogo.

**c)** Las **notificaciones provisionales** (`allowProvisional: true`). Se detectan con `ios.status === IosAuthorizationStatus.PROVISIONAL`.

**d)** Cuando la persona entiende para qué es. **Bueno:** al activar "Avisarme cuando se resuelva mi reporte". **Malo:** apenas se abre la app.

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
|---|---|---|
| Foto de perfil | `ImagePicker.launchImageLibraryAsync()` | Ninguno |
| Sacar una foto | `ImagePicker.launchCameraAsync()` o `expo-camera` | Cámara |
| Editor con toda la galería | `expo-media-library` | Galería completa |
| Foto de un comprobante | `ImagePicker.launchImageLibraryAsync()` | Ninguno |

Google Play los restringe porque dan acceso a **toda** la galería cuando casi siempre alcanza con una foto. Solo pueden declararlos las apps cuya función principal es la galería; el resto tiene que usar el selector del sistema. El plazo para cumplir fue el **22/01/2025**, con prórroga hasta el **28/05/2025**. "El mejor permiso" es **el que no hace falta pedir**.

### E5. Volver de Ajustes

```ts
const estabaAfuera = /inactive|background/.test(anterior.current);
if (estabaAfuera && nuevo === 'active') revisar();
// …
return () => sub.remove();
```

**a)** Porque solo consultan al montarse: el sistema no avisa cuando el permiso cambia en Ajustes.

**b)** `consultarPermiso`, la tercera función de `useCameraPermissions()`.

**c)** Porque el permiso puede cambiar fuera de la app (Ajustes, "Solo esta vez", revocación automática): un valor guardado queda desactualizado. La fuente de verdad es el sistema.

---

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
|---|---|---|
| Delivery · ubicación | Al tocar "Usar mi ubicación" en la dirección. | Escribir la dirección a mano. |
| Billetera · cámara | Al tocar "Pagar con QR". | Ingresar el código o alias a mano. |
| Red social · contactos | Al tocar "Buscar amigos". | Buscar por usuario o compartir un enlace. |
| Mensajería · micrófono | Al tocar el botón de nota de voz. | Escribir el mensaje. |
| Turnos médicos · notificaciones | Después de sacar un turno. | Bandeja de avisos en la app o email. |
| Editor de fotos · galería | Al abrir la galería del editor. | Elegir foto por foto con el selector. |

Pedir todo al abrir **entrena el "No" automático**: la persona no entiende para qué es cada permiso, los rechaza por reflejo y cada "No" gasta una de sus pocas oportunidades.

### F2. La pantalla previa

**a)** El beneficio en una frase, un único botón "Continuar" y la aclaración de que se puede cambiar en Ajustes.

**b)** Porque quien concede es el sistema: "Permitir" hace creer que el permiso ya se dio.

**c)** La 5.1.1(iv) prohíbe manipular o forzar el consentimiento: la pantalla previa siempre tiene que llevar al diálogo, sin botones como "Ahora no" o "Cerrar".

**d)** Explica cómo habilitarlo en Ajustes, el botón pasa a ser "Abrir Ajustes" y se ofrece la alternativa.

### F3. Mínimo privilegio

**a)** **Aproximada**: para el barrio alcanzan unos 3 km².

**b)** **"En uso"**: si la persona inicia la carrera con la app abierta, alcanza con eso más un servicio en primer plano (Android) o el modo de fondo (iOS).

**c)** **Selector del sistema**: es una sola foto que elige la persona.

**d)** **Sin micrófono**: escanear un QR no graba audio.

### F4. Tiendas

**a)**

- **Google Play:** apuntar a API 36 (desde el 31/08/2026), completar la sección de Seguridad de los datos y declarar los permisos sensibles (ubicación en segundo plano, fotos y videos).
- **App Store:** textos de propósito en todas las claves `NS…`, etiquetas de privacidad, manifiesto de privacidad y no forzar el consentimiento (5.1.1).

**b)** Es un archivo donde la app y sus librerías declaran qué datos recolectan y por qué usan ciertas APIs sensibles. En Expo se configura con `expo.ios.privacyManifests` en `app.json`.

**c)** Android 17 suma el **selector de contactos del sistema** y el permiso de red local. Google Play va a exigir que las apps con target API 37 usen el selector y solo pidan `READ_CONTACTS` si no les alcanza, con una declaración en Play Console. La consigna dice desde el 27/01/2027; la página de Google menciona el 28/10/2026.

### F5. Errores comunes

**a)** Falta el texto de propósito → agregarlo en el plugin de `app.json` y recompilar.

**b)** El permiso no está declarado en la build (falta el plugin o está en `blockedPermissions`) → agregarlo en `app.json` y hacer una build nueva.

**c)** La app no vuelve a consultar al regresar de Ajustes → escuchar `AppState` y llamar a `get…` al volver a `active`.

**d)** Se llama a `request…()` en cada render → pedir solo al tocar un botón; si está bloqueado, ofrecer Ajustes.

**e)** Trata un permiso opcional como obligatorio → dejar usar la app y ofrecer una alternativa (bandeja de avisos).
