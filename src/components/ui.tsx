/**
 * Piezas de interfaz reutilizables: contenedor de pantalla, botón, tarjeta,
 * chip, opciones, campo de texto, ícono, estado vacío y carga.
 */
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ESTADO_COLOR } from '@/constants/iconos';
import { Marca, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const AZUL = Marca.azul;

const SOMBRA = '0px 4px 14px rgba(15, 23, 42, 0.08)';

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
  variante?: 'primario' | 'secundario' | 'acento';
  icono?: string;
  deshabilitado?: boolean;
  style?: ViewStyle;
};

export function Boton({ titulo, onPress, variante = 'primario', icono, deshabilitado, style }: BotonProps) {
  const theme = useTheme();
  const fondo =
    variante === 'primario' ? theme.primary : variante === 'acento' ? Marca.ambar : theme.backgroundSelected;
  const colorTexto = variante === 'primario' ? '#fff' : variante === 'acento' ? '#1f1300' : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!deshabilitado }}
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: fondo },
        variante !== 'secundario' && { boxShadow: SOMBRA },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        deshabilitado && { opacity: 0.5 },
        style,
      ]}>
      {icono && <Text style={styles.botonIcono}>{icono}</Text>}
      <ThemedText style={[styles.botonTexto, { color: colorTexto }]}>{titulo}</ThemedText>
    </Pressable>
  );
}

export function Tarjeta({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.tarjeta, { borderColor: theme.border, boxShadow: SOMBRA }, style]}>
      {children}
    </ThemedView>
  );
}

/** Título de sección con ícono, dentro de una tarjeta. */
export function TituloSeccion({ icono, titulo }: { icono: string; titulo: string }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.tituloIcono}>{icono}</Text>
      <ThemedText type="smallBold" style={{ flex: 1 }}>
        {titulo}
      </ThemedText>
    </View>
  );
}

/** Círculo de color con un emoji adentro. */
export function Insignia({ emoji, color, tamano = 44 }: { emoji: string; color: string; tamano?: number }) {
  return (
    <View
      style={[
        styles.insignia,
        { width: tamano, height: tamano, borderRadius: tamano / 2, backgroundColor: color + '22' },
      ]}>
      <Text style={{ fontSize: tamano * 0.5 }}>{emoji}</Text>
    </View>
  );
}

export function Chip({ texto, style }: { texto: string; style?: StyleProp<ViewStyle> }) {
  const color = ESTADO_COLOR[texto] ?? '#64748b';
  return (
    <View style={[styles.chip, { backgroundColor: color + '1f', borderColor: color + '55' }, style]}>
      <View style={[styles.punto, { backgroundColor: color }]} />
      <ThemedText type="smallBold" style={{ color }}>
        {texto}
      </ThemedText>
    </View>
  );
}

export function Opciones<T extends string>({
  opciones,
  valor,
  onChange,
  iconos,
}: {
  opciones: readonly T[];
  valor: T | null;
  onChange: (valor: T) => void;
  iconos?: Partial<Record<T, string>>;
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
              activa
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            {iconos?.[opcion] && <Text style={styles.opcionIcono}>{iconos[opcion]}</Text>}
            <ThemedText type="small" style={activa && { color: '#fff' }}>
              {opcion}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Campo({ etiqueta, style, ...props }: TextInputProps & { etiqueta: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.one }}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        maxFontSizeMultiplier={1.4}
        {...props}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border },
          style,
        ]}
      />
    </View>
  );
}

/** Estado vacío con ilustración. */
export function Vacio({ emoji, titulo, texto }: { emoji: string; titulo: string; texto: string }) {
  return (
    <View style={styles.vacio}>
      <Text style={styles.vacioEmoji}>{emoji}</Text>
      <ThemedText type="smallBold" style={{ textAlign: 'center' }}>
        {titulo}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
        {texto}
      </ThemedText>
    </View>
  );
}

export function Cargando({ texto = 'Consultando permiso…' }: { texto?: string }) {
  const theme = useTheme();
  return (
    <ThemedView style={styles.centro}>
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText themeColor="textSecondary">{texto}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  boton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    borderRadius: 14,
  },
  botonIcono: { fontSize: 18 },
  botonTexto: { fontWeight: 700, fontSize: 16 },
  tarjeta: { padding: Spacing.three, borderRadius: 18, gap: Spacing.two, borderWidth: 1 },
  tituloIcono: { fontSize: 18 },
  insignia: { alignItems: 'center', justifyContent: 'center' },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  punto: { width: 7, height: 7, borderRadius: 4 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
  },
  opcionIcono: { fontSize: 15 },
  input: { borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1 },
  vacio: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five, paddingHorizontal: Spacing.four },
  vacioEmoji: { fontSize: 56 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
});
