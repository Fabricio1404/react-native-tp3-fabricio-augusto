import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Insignia, Pantalla, Tarjeta, Vacio } from '@/components/ui';
import { Marca, Spacing } from '@/constants/theme';
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

  if (avisos.length === 0) {
    return (
      <Pantalla>
        <Tarjeta>
          <Vacio
            emoji="📭"
            titulo="No tenés avisos"
            texto="Cuando se resuelva alguno de tus reportes, el aviso aparece acá, tengas o no activadas las notificaciones."
          />
        </Tarjeta>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      {avisos.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: a.reporteId } })}>
          <Tarjeta style={[styles.item, !a.leido && { borderColor: Marca.ambar }]}>
            <Insignia emoji="✅" color={Marca.verde} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.fila}>
                <ThemedText type="smallBold" style={{ flex: 1 }}>
                  {a.titulo}
                </ThemedText>
                {!a.leido && <View style={styles.nuevo} />}
              </View>
              <ThemedText type="small">{a.cuerpo}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(a.fecha).toLocaleString()}
              </ThemedText>
            </View>
          </Tarjeta>
        </Pressable>
      ))}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  nuevo: { width: 10, height: 10, borderRadius: 5, backgroundColor: Marca.ambar },
});
