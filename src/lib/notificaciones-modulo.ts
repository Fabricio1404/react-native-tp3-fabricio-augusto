/**
 * Carga opcional de expo-notifications. Si el módulo nativo no está disponible
 * (por ejemplo, en algunas versiones de Expo Go), la app sigue funcionando y los
 * avisos llegan solo a la bandeja /avisos.
 */
import type * as NotificationsModulo from 'expo-notifications';

let modulo: typeof NotificationsModulo | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  modulo = require('expo-notifications');
} catch {
  modulo = null;
}

export const Notifications = modulo;
export const notificacionesDisponibles = modulo !== null;
