import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Insignia, Pantalla, Tarjeta } from '@/components/ui';
import { ESTADO_COLOR, RECURSO_EMOJI } from '@/constants/iconos';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePermiso } from '@/hooks/usePermiso';
import { FUENTES, TEXTOS, type Recurso } from '@/lib/permisos';

const RECURSOS: Recurso[] = ['camara', 'ubicacion', 'notificaciones', 'fotos'];

/**
 * Panel de permisos. Cada fila usa usePermiso, que vuelve a consultar al
 * sistema al volver de Ajustes (AppState) y al volver a la pestaña.
 */
export default function Permisos() {
  return (
    <Pantalla>
      <ThemedText type="small" themeColor="textSecondary">
        Así está cada permiso en este teléfono. Se actualiza solo cuando volvés de Ajustes.
      </ThemedText>
      <View style={styles.plataforma}>
        <ThemedText type="smallBold">📱 {Platform.OS}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          versión {String(Platform.Version)}
        </ThemedText>
      </View>
      {RECURSOS.map((recurso) => (
        <FilaPermiso key={recurso} recurso={recurso} />
      ))}
    </Pantalla>
  );
}

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const theme = useTheme();
  const { estado, parcial, respuesta, abrirAjustes } = usePermiso(recurso);
  const sePide = FUENTES[recurso].pedir !== null;

  return (
    <Tarjeta>
      <View style={styles.fila}>
        <Insignia emoji={RECURSO_EMOJI[recurso]} color={ESTADO_COLOR[estado]} />
        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText type="smallBold">{TEXTOS[recurso].titulo}</ThemedText>
          <View style={styles.chips}>
            <Chip texto={estado} />
            {parcial && <Chip texto="parcial" />}
          </View>
        </View>
      </View>

      {respuesta && (
        <View style={[styles.detalle, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="code">
            status: {respuesta.status} · canAskAgain: {String(respuesta.canAskAgain)}
            {respuesta.matiz ? `\n${respuesta.matiz}` : ''}
          </ThemedText>
        </View>
      )}

      {!sePide ? (
        <ThemedText type="small" themeColor="textSecondary">
          {TEXTOS[recurso].beneficio}
        </ThemedText>
      ) : estado === 'preguntable' ? (
        <Boton
          titulo="Pedir permiso"
          onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })}
        />
      ) : estado === 'bloqueado' ? (
        <Boton titulo="Abrir Ajustes" icono="⚙️" onPress={abrirAjustes} />
      ) : estado === 'concedido' ? (
        <Boton titulo="Cambiar en Ajustes" icono="⚙️" variante="secundario" onPress={abrirAjustes} />
      ) : null}
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  plataforma: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  chips: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  detalle: { borderRadius: 10, padding: Spacing.two },
});
