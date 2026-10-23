/**
 * Notificaciones locales: canal de Android, presentación en primer plano y
 * la simulación de "reporte resuelto".
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { agregarAviso, cambiarEstadoReporte, getEstado } from '@/lib/store';

export const CANAL = 'reportes';
const SEGUNDOS_RESOLUCION = 10;

// Sin handler, una notificación que llega con la app abierta no se muestra.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Android 8+ exige un canal; Android 13+ no muestra el diálogo de permiso hasta que existe uno. */
export async function asegurarCanal() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: 'Estado de mis reportes',
    description: 'Avisos cuando un reporte cambia a resuelto',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/**
 * Botón de prueba "Simular resolución": a los 10 s el reporte pasa a resuelto.
 * Si la persona activó el interruptor y el permiso está concedido, llega una
 * notificación del sistema; el aviso SIEMPRE queda además en la bandeja /avisos,
 * que es la alternativa cuando las notificaciones están denegadas.
 * Devuelve true si se programó la notificación del sistema.
 */
export async function simularResolucion(reporteId: string): Promise<boolean> {
  const reporte = getEstado().reportes.find((r) => r.id === reporteId);
  if (!reporte) return false;

  cambiarEstadoReporte(reporteId, 'en curso');

  const titulo = 'Reporte resuelto';
  const cuerpo = `"${reporte.titulo}" ya fue resuelto por el equipo de mantenimiento.`;

  setTimeout(() => {
    cambiarEstadoReporte(reporteId, 'resuelto');
    agregarAviso({ reporteId, titulo, cuerpo });
  }, SEGUNDOS_RESOLUCION * 1000);

  if (!getEstado().avisarResolucion) return false;

  // Se consulta (no se pide): el permiso solo se pide desde /ajustes-app.
  const permiso = await Notifications.getPermissionsAsync();
  const provisional = permiso.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!permiso.granted && !provisional) return false;

  await asegurarCanal();
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo, data: { url: `/reporte/${reporteId}` } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RESOLUCION,
      channelId: CANAL,
    },
  });
  return true;
}
