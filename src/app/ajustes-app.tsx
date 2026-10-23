import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Insignia, Pantalla, Tarjeta } from '@/components/ui';
import { Marca, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useConPermiso } from '@/hooks/useConPermiso';
import { notificacionesDisponibles } from '@/lib/notificaciones-modulo';
import { setAvisarResolucion, useStore } from '@/lib/store';

/**
 * El permiso de notificaciones se pide ÚNICAMENTE al activar este interruptor
 * (el canal "reportes" se crea justo antes de pedir, en src/lib/permisos.ts).
 */
export default function AjustesApp() {
  const theme = useTheme();
  const avisar = useStore((e) => e.avisarResolucion);
  const activar = useCallback(() => setAvisarResolucion(true), []);
  const permiso = useConPermiso('notificaciones', activar);

  const activo = avisar && permiso.estado === 'concedido';

  const cambiar = (valor: boolean) => {
    if (!notificacionesDisponibles) return;
    if (valor) permiso.ejecutar();
    else setAvisarResolucion(false);
  };

  return (
    <Pantalla>
      <Tarjeta>
        <View style={styles.fila}>
          <Insignia emoji="🔔" color={activo ? Marca.verde : theme.primary} />
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Avisarme cuando se resuelva mi reporte</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {activo ? 'Activado: te llega una notificación' : 'Desactivado'}
            </ThemedText>
          </View>
          <Switch
            value={activo}
            onValueChange={cambiar}
            trackColor={{ true: Marca.verde, false: theme.backgroundSelected }}
            thumbColor="#fff"
          />
        </View>
      </Tarjeta>

      <View style={styles.nota}>
        <ThemedText type="small" themeColor="textSecondary">
          📭 Aunque esté apagado, los avisos siempre quedan en la pestaña Avisos.
        </ThemedText>
      </View>

      {!notificacionesDisponibles && (
        <Tarjeta style={{ borderColor: Marca.ambar }}>
          <ThemedText type="small">
            ℹ️ Esta versión de la app no puede mostrar notificaciones del sistema. Los avisos te
            llegan a la pestaña Avisos.
          </ThemedText>
        </Tarjeta>
      )}

      {notificacionesDisponibles && avisar && permiso.estado === 'bloqueado' && (
        <Tarjeta style={{ borderColor: Marca.rojo + '66' }}>
          <ThemedText type="small">
            🔒 Las notificaciones están desactivadas en los Ajustes del teléfono, así que por ahora
            los avisos solo llegan a la bandeja.
          </ThemedText>
          <Boton titulo="Abrir Ajustes" icono="⚙️" onPress={permiso.abrirAjustes} />
        </Tarjeta>
      )}

      {permiso.parcial && (
        <ThemedText type="small" themeColor="textSecondary">
          Notificaciones provisionales: llegan en silencio al Centro de notificaciones.
        </ThemedText>
      )}

      <Boton titulo="Ver avisos" icono="📬" variante="secundario" onPress={() => router.push('/avisos')} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nota: { paddingHorizontal: Spacing.two },
});
