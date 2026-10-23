import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Cargando, Tarjeta } from '@/components/ui';
import { Spacing } from '@/constants/theme';
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
  const textos = TEXTOS[recurso];

  if (estado === 'cargando') return <Cargando />;

  // Esta es la decisión clave: canAskAgain === false → 'bloqueado' → Abrir Ajustes.
  const bloqueado = estado === 'bloqueado';

  return (
    <View style={styles.contenedor}>
      <ThemedText type="subtitle">{textos.titulo}</ThemedText>
      <ThemedText style={styles.beneficio}>{textos.beneficio}</ThemedText>

      {bloqueado ? (
        <Tarjeta>
          <ThemedText type="smallBold">El permiso está desactivado</ThemedText>
          <ThemedText type="small">
            Ya no podemos mostrarte el aviso del sistema. Para activarlo andá a:
          </ThemedText>
          <ThemedText type="code">{caminoAjustes(recurso)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ({Platform.OS === 'ios' ? 'iOS' : 'Android'})
          </ThemedText>
        </Tarjeta>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          Podés cambiar esta decisión cuando quieras desde los Ajustes del teléfono.
        </ThemedText>
      )}

      <ThemedText type="small" themeColor="textSecondary">
        {textos.alternativa}
      </ThemedText>

      {bloqueado ? (
        <Boton titulo="Abrir Ajustes" onPress={onAbrirAjustes} />
      ) : (
        <Boton titulo="Continuar" onPress={onContinuar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Spacing.three, padding: Spacing.three },
  beneficio: { fontSize: 18, lineHeight: 26 },
});
