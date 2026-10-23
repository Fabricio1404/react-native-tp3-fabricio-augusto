import { Platform, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Cargando, Insignia, Tarjeta } from '@/components/ui';
import { RECURSO_EMOJI } from '@/constants/iconos';
import { Marca, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TEXTOS, caminoAjustes, type EstadoPermiso, type Recurso } from '@/lib/permisos';

type Props = {
  recurso: Recurso;
  estado: EstadoPermiso;
  onContinuar: () => void;
  onAbrirAjustes: () => void;
};

/**
 * Pantalla previa al diálogo del sistema (pauta 5.1.1(iv) de Apple):
 * beneficio en una frase, un único botón y la aclaración de que se puede
 * cambiar en Ajustes. Sin "Ahora no" ni "Cerrar".
 * Si el permiso está bloqueado, explica el camino en Ajustes y el botón
 * pasa a ser "Abrir Ajustes".
 */
export function PantallaPrevia({ recurso, estado, onContinuar, onAbrirAjustes }: Props) {
  const theme = useTheme();
  const textos = TEXTOS[recurso];

  if (estado === 'cargando') return <Cargando />;

  // Esta es la decisión clave: canAskAgain === false → 'bloqueado' → Abrir Ajustes.
  const bloqueado = estado === 'bloqueado';

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Insignia
          emoji={RECURSO_EMOJI[recurso]}
          color={bloqueado ? Marca.rojo : theme.primary}
          tamano={96}
        />
        <ThemedText type="subtitle" style={styles.centrado}>
          {textos.titulo}
        </ThemedText>
        <ThemedText style={[styles.beneficio, styles.centrado]}>{textos.beneficio}</ThemedText>
      </View>

      {bloqueado ? (
        <Tarjeta style={{ borderColor: Marca.rojo + '66' }}>
          <ThemedText type="smallBold">🔒 El permiso está desactivado</ThemedText>
          <ThemedText type="small">
            Ya no podemos mostrarte el aviso del sistema. Para activarlo andá a:
          </ThemedText>
          <View style={[styles.camino, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="code">{caminoAjustes(recurso)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            ({Platform.OS === 'ios' ? 'iOS' : 'Android'})
          </ThemedText>
        </Tarjeta>
      ) : (
        <View style={styles.nota}>
          <Text style={styles.notaIcono}>⚙️</Text>
          <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>
            Podés cambiar esta decisión cuando quieras desde los Ajustes del teléfono.
          </ThemedText>
        </View>
      )}

      <View style={styles.nota}>
        <Text style={styles.notaIcono}>💡</Text>
        <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>
          {textos.alternativa}
        </ThemedText>
      </View>

      {bloqueado ? (
        <Boton titulo="Abrir Ajustes" icono="⚙️" onPress={onAbrirAjustes} />
      ) : (
        <Boton titulo="Continuar" onPress={onContinuar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Spacing.three, paddingVertical: Spacing.two },
  cabecera: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  centrado: { textAlign: 'center' },
  beneficio: { fontSize: 18, lineHeight: 26 },
  camino: { borderRadius: 10, padding: Spacing.two },
  nota: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  notaIcono: { fontSize: 16 },
});
