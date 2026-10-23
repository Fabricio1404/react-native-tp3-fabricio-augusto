import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Pantalla, Tarjeta } from '@/components/ui';
import { marcarAvisosLeidos, useStore } from '@/lib/store';

/**
 * Bandeja de avisos dentro de la app: la alternativa a las notificaciones.
 * Funciona aunque el permiso esté denegado o bloqueado.
 */
export default function Avisos() {
  const avisos = useStore((e) => e.avisos);

  useFocusEffect(
    useCallback(() => {
      return () => marcarAvisosLeidos();
    }, []),
  );

  return (
    <Pantalla>
      <ThemedText type="subtitle">Avisos</ThemedText>
      {avisos.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Cuando se resuelva alguno de tus reportes, el aviso aparece acá, tengas o no activadas
          las notificaciones.
        </ThemedText>
      ) : (
        avisos.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: a.reporteId } })}>
            <Tarjeta>
              <ThemedText type="smallBold">
                {a.leido ? '' : '● '}
                {a.titulo}
              </ThemedText>
              <ThemedText type="small">{a.cuerpo}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(a.fecha).toLocaleString()}
              </ThemedText>
            </Tarjeta>
          </Pressable>
        ))
      )}
    </Pantalla>
  );
}
