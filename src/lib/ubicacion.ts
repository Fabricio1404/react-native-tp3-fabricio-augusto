import * as Location from 'expo-location';

import type { Ubicacion } from '@/lib/store';

/**
 * Devuelve la ubicación actual y si es aproximada, o null si no hay permiso
 * o el sistema no pudo obtenerla. Nunca lanza: la pantalla ofrece elegir el
 * sector a mano.
 * Solo consulta el permiso (no lo pide): el pedido pasa por la pantalla previa.
 */
export async function obtenerUbicacion(): Promise<Ubicacion | null> {
  try {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const posicion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Android: 'coarse' = el usuario eligió "Aproximada" en el diálogo.
    // iOS 14+: 'reduced' = apagó el interruptor "Ubicación precisa".
    const aproximada =
      permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada,
    };
  } catch {
    return null;
  }
}

export function describirUbicacion(u: Ubicacion) {
  // Con ubicación aproximada no mostramos coordenadas: serían engañosas (~3 km²).
  if (u.aproximada) return 'Ubicación aproximada';
  return `${u.latitud.toFixed(5)}, ${u.longitud.toFixed(5)}`;
}
