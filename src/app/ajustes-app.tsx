import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Pantalla, Tarjeta } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useConPermiso } from '@/hooks/useConPermiso';
import { setAvisarResolucion, useStore } from '@/lib/store';

/**
 * El permiso de notificaciones se pide ÚNICAMENTE al activar este interruptor
 * (el canal "reportes" se crea justo antes de pedir, en src/lib/permisos.ts).
 */
export default function AjustesApp() {
  const avisar = useStore((e) => e.avisarResolucion);
  const activar = useCallback(() => setAvisarResolucion(true), []);
  const permiso = useConPermiso('notificaciones', activar);

  const activo = avisar && permiso.estado === 'concedido';

  const cambiar = (valor: boolean) => {
    if (valor) permiso.ejecutar();
    else setAvisarResolucion(false);
  };

  return (
    <Pantalla>
      <Tarjeta>
        <View style={styles.fila}>
          <ThemedText style={{ flex: 1 }}>Avisarme cuando se resuelva mi reporte</ThemedText>
          <Switch value={activo} onValueChange={cambiar} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Aunque esté apagado, los avisos siempre quedan en la pestaña Avisos.
        </ThemedText>
      </Tarjeta>

      {avisar && permiso.estado === 'bloqueado' && (
        <Tarjeta>
          <ThemedText type="small">
            Las notificaciones están desactivadas en los Ajustes del teléfono, así que por ahora
            los avisos solo llegan a la bandeja.
          </ThemedText>
          <Boton titulo="Abrir Ajustes" onPress={permiso.abrirAjustes} />
        </Tarjeta>
      )}

      {permiso.parcial && (
        <ThemedText type="small" themeColor="textSecondary">
          Notificaciones provisionales: llegan en silencio al Centro de notificaciones.
        </ThemedText>
      )}

      <Boton titulo="Ver avisos" variante="secundario" onPress={() => router.push('/avisos')} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
