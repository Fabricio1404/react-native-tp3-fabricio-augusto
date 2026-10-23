import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Pantalla, Tarjeta } from '@/components/ui';
import { Spacing } from '@/constants/theme';
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
      <ThemedText type="subtitle">Permisos</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Plataforma: {Platform.OS} {String(Platform.Version)}
      </ThemedText>
      {RECURSOS.map((recurso) => (
        <FilaPermiso key={recurso} recurso={recurso} />
      ))}
    </Pantalla>
  );
}

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const { estado, parcial, respuesta, abrirAjustes } = usePermiso(recurso);
  const sePide = FUENTES[recurso].pedir !== null;

  return (
    <Tarjeta>
      <View style={styles.fila}>
        <ThemedText type="smallBold" style={{ flex: 1 }}>
          {TEXTOS[recurso].titulo}
        </ThemedText>
        <Chip texto={estado} />
        {parcial && <Chip texto="parcial" />}
      </View>

      {respuesta && (
        <ThemedText type="code">
          status: {respuesta.status} · canAskAgain: {String(respuesta.canAskAgain)}
          {respuesta.matiz ? `\n${respuesta.matiz}` : ''}
        </ThemedText>
      )}

      {!sePide ? (
        <ThemedText type="small" themeColor="textSecondary">
          {TEXTOS[recurso].beneficio}
        </ThemedText>
      ) : estado === 'preguntable' ? (
        <Boton
          titulo="Pedir"
          onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })}
        />
      ) : estado === 'bloqueado' ? (
        <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
      ) : estado === 'concedido' ? (
        <Boton titulo="Cambiar en Ajustes" variante="secundario" onPress={abrirAjustes} />
      ) : null}
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
