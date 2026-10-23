/**
 * Lógica de permisos: una "fuente" por recurso que sabe consultar (get) y pedir
 * (request) al sistema, y una función que traduce la respuesta de Expo a los
 * cuatro estados que usa la app.
 */
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { NotificationPermissionsStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import { asegurarCanal, IOS_PROVISIONAL } from '@/lib/notificaciones';
import { Notifications } from '@/lib/notificaciones-modulo';

export type Recurso = 'camara' | 'ubicacion' | 'notificaciones' | 'fotos';
export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

/** Respuesta de Expo normalizada: los mismos campos para todos los módulos. */
export type Respuesta = {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
  /** Acceso parcial: ubicación aproximada, fotos limitadas o notificaciones provisionales. */
  parcial: boolean;
  /** Detalle técnico para mostrar en el panel (accuracy, accessPrivileges, ios.status...). */
  matiz: string | null;
};

type Fuente = {
  consultar: () => Promise<Respuesta>;
  /** null si la app nunca pide este permiso (solo lo informa en el panel). */
  pedir: (() => Promise<Respuesta>) | null;
};

type RespuestaExpo = { status: string; granted: boolean; canAskAgain: boolean };

function base(r: RespuestaExpo): Omit<Respuesta, 'parcial' | 'matiz'> {
  return {
    status: r.status as Respuesta['status'],
    granted: r.granted,
    canAskAgain: r.canAskAgain,
  };
}

function normalizarCamara(r: RespuestaExpo): Respuesta {
  return { ...base(r), parcial: false, matiz: null };
}

function normalizarUbicacion(r: Location.LocationPermissionResponse): Respuesta {
  // Android: accuracy 'coarse' = el usuario eligió "Aproximada".
  // iOS 14+: accuracy 'reduced' = apagó el interruptor "Ubicación precisa".
  const aproximada = r.granted && (r.android?.accuracy === 'coarse' || r.ios?.accuracy === 'reduced');
  const matiz = r.android
    ? `android.accuracy: ${r.android.accuracy}`
    : r.ios
      ? `ios.accuracy: ${r.ios.accuracy} · ios.scope: ${r.ios.scope}`
      : null;
  return { ...base(r), parcial: aproximada, matiz };
}

function normalizarFotos(r: ImagePicker.MediaLibraryPermissionResponse): Respuesta {
  return {
    ...base(r),
    parcial: r.granted && r.accessPrivileges === 'limited',
    matiz: r.accessPrivileges ? `accessPrivileges: ${r.accessPrivileges}` : null,
  };
}

// Valores de IosAuthorizationStatus de expo-notifications.
const NOMBRES_IOS = ['NOT_DETERMINED', 'DENIED', 'AUTHORIZED', 'PROVISIONAL', 'EPHEMERAL'];

/** Sin el módulo nativo no hay notificaciones del sistema: queda la bandeja /avisos. */
const SIN_NOTIFICACIONES: Respuesta = {
  status: 'denied',
  granted: false,
  canAskAgain: false,
  parcial: false,
  matiz: 'No disponibles en esta versión de la app: los avisos llegan a la bandeja.',
};

function normalizarNotificaciones(r: NotificationPermissionsStatus): Respuesta {
  // En iOS hay que mirar ios.status: las provisionales llegan sin diálogo
  // y van directo al Centro de notificaciones.
  const provisional = r.ios?.status === IOS_PROVISIONAL;
  return {
    ...base(r),
    granted: r.granted || provisional,
    parcial: provisional,
    matiz: r.ios ? `ios.status: ${NOMBRES_IOS[r.ios.status] ?? r.ios.status}` : null,
  };
}

export const FUENTES: Record<Recurso, Fuente> = {
  camara: {
    consultar: async () => normalizarCamara(await Camera.getCameraPermissionsAsync()),
    pedir: async () => normalizarCamara(await Camera.requestCameraPermissionsAsync()),
  },
  ubicacion: {
    // Solo primer plano: la app nunca pide ubicación en segundo plano.
    consultar: async () => normalizarUbicacion(await Location.getForegroundPermissionsAsync()),
    pedir: async () => normalizarUbicacion(await Location.requestForegroundPermissionsAsync()),
  },
  notificaciones: {
    consultar: async () =>
      Notifications ? normalizarNotificaciones(await Notifications.getPermissionsAsync()) : SIN_NOTIFICACIONES,
    pedir: async () => {
      if (!Notifications) return SIN_NOTIFICACIONES;
      // Android 13+: sin un canal creado, el diálogo de POST_NOTIFICATIONS no aparece.
      await asegurarCanal();
      return normalizarNotificaciones(await Notifications.requestPermissionsAsync());
    },
  },
  fotos: {
    // Solo se consulta para mostrarlo en el panel: la app elige fotos con el
    // selector del sistema, que no necesita permiso de galería.
    consultar: async () => normalizarFotos(await ImagePicker.getMediaLibraryPermissionsAsync()),
    pedir: null,
  },
};

/** El corazón de la app: decide entre "Continuar" y "Abrir Ajustes". */
export function interpretar(r: Respuesta | null): EstadoPermiso {
  if (r === null) return 'cargando';
  if (r.granted) return 'concedido';
  // undetermined o denied con canAskAgain: el sistema todavía puede mostrar el diálogo.
  if (r.canAskAgain) return 'preguntable';
  return 'bloqueado';
}

export function esRecurso(valor: unknown): valor is Recurso {
  return typeof valor === 'string' && valor in FUENTES;
}

type Textos = {
  titulo: string;
  /** Beneficio en una frase, mismo molde que los textos de propósito. */
  beneficio: string;
  /** Qué pasa si dice que no: la alternativa que siempre existe. */
  alternativa: string;
  ajustes: { android: string; ios: string };
};

export const TEXTOS: Record<Recurso, Textos> = {
  camara: {
    titulo: 'Cámara',
    beneficio:
      'Usamos tu cámara para leer el QR de la puerta del aula y sacar la foto del desperfecto.',
    alternativa: 'Si preferís no darla, podés escribir el código del aula y elegir una foto de tu galería.',
    ajustes: {
      android: 'Ajustes › Apps › Mantenimiento IPF › Permisos › Cámara › Permitir solo mientras se usa la app',
      ios: 'Ajustes › Mantenimiento IPF › Cámara (activar)',
    },
  },
  ubicacion: {
    titulo: 'Ubicación',
    beneficio: 'Usamos tu ubicación para marcar en qué parte del instituto está el problema.',
    alternativa: 'Si preferís no darla, podés elegir el sector (patio, pasillo, estacionamiento) a mano.',
    ajustes: {
      android: 'Ajustes › Apps › Mantenimiento IPF › Permisos › Ubicación › Permitir solo mientras se usa la app',
      ios: 'Ajustes › Mantenimiento IPF › Ubicación › Mientras se usa la app',
    },
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio: 'Usamos las notificaciones para avisarte cuando se resuelva tu reporte.',
    alternativa: 'Si preferís no recibirlas, los avisos igual aparecen en la pestaña Avisos.',
    ajustes: {
      android: 'Ajustes › Apps › Mantenimiento IPF › Notificaciones › Todas las notificaciones (activar)',
      ios: 'Ajustes › Mantenimiento IPF › Notificaciones › Permitir notificaciones',
    },
  },
  fotos: {
    titulo: 'Fotos (galería)',
    beneficio: 'No lo pedimos: elegís cada foto con el selector del sistema, sin dar acceso a tu galería.',
    alternativa: 'No hace falta ninguna alternativa.',
    ajustes: {
      android: 'Ajustes › Apps › Mantenimiento IPF › Permisos › Fotos y videos',
      ios: 'Ajustes › Mantenimiento IPF › Fotos',
    },
  },
};

export function caminoAjustes(recurso: Recurso) {
  return Platform.OS === 'ios' ? TEXTOS[recurso].ajustes.ios : TEXTOS[recurso].ajustes.android;
}
