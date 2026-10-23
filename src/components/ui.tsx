/**
 * Piezas de interfaz reutilizables: contenedor de pantalla, botón, chip,
 * campo de texto y tarjeta.
 */
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const AZUL = '#1e3a8a';

export function Pantalla({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  if (!scroll) return <ThemedView style={[styles.pantalla, styles.contenido]}>{children}</ThemedView>;
  return (
    <ThemedView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </ThemedView>
  );
}

type BotonProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  deshabilitado?: boolean;
  style?: ViewStyle;
};

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado, style }: BotonProps) {
  const theme = useTheme();
  const primario = variante === 'primario';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        styles.boton,
        primario ? { backgroundColor: AZUL } : { backgroundColor: theme.backgroundElement },
        (pressed || deshabilitado) && { opacity: 0.6 },
        style,
      ]}>
      <ThemedText style={[styles.botonTexto, primario && { color: '#fff' }]}>{titulo}</ThemedText>
    </Pressable>
  );
}

export function Tarjeta({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <ThemedView type="backgroundElement" style={[styles.tarjeta, style]}>
      {children}
    </ThemedView>
  );
}

const COLORES_CHIP: Record<string, string> = {
  concedido: '#15803d',
  resuelto: '#15803d',
  preguntable: '#b45309',
  'en curso': '#1d4ed8',
  pendiente: '#b45309',
  bloqueado: '#b91c1c',
  parcial: '#7c3aed',
  cargando: '#6b7280',
};

export function Chip({ texto }: { texto: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: COLORES_CHIP[texto] ?? '#6b7280' }]}>
      <ThemedText type="smallBold" style={{ color: '#fff' }}>
        {texto}
      </ThemedText>
    </View>
  );
}

export function Opciones<T extends string>({
  opciones,
  valor,
  onChange,
}: {
  opciones: readonly T[];
  valor: T | null;
  onChange: (valor: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.opciones}>
      {opciones.map((opcion) => {
        const activa = opcion === valor;
        return (
          <Pressable
            key={opcion}
            accessibilityRole="radio"
            accessibilityState={{ selected: activa }}
            onPress={() => onChange(opcion)}
            style={[
              styles.opcion,
              { backgroundColor: activa ? AZUL : theme.backgroundElement },
            ]}>
            <ThemedText type="small" style={activa && { color: '#fff' }}>
              {opcion}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Campo({ etiqueta, ...props }: TextInputProps & { etiqueta: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.one }}>
      <ThemedText type="smallBold">{etiqueta}</ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        {...props}
      />
    </View>
  );
}

export function Cargando({ texto = 'Consultando permiso…' }: { texto?: string }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" />
      <ThemedText themeColor="textSecondary">{texto}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  boton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonTexto: { fontWeight: 700 },
  tarjeta: { padding: Spacing.three, borderRadius: 16, gap: Spacing.two },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
  },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  opcion: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  input: { borderRadius: 12, padding: Spacing.three, fontSize: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
});
