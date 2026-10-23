import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Pantalla, Tarjeta } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/lib/store';

export default function Inicio() {
  const reportes = useStore((e) => e.reportes);

  return (
    <Pantalla>
      <ThemedText type="subtitle">Mis reportes</ThemedText>
      <Boton titulo="Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />

      {reportes.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Todavía no reportaste nada. Si ves una luz quemada, una canilla que pierde o un proyector
          roto, tocá “Nuevo reporte”.
        </ThemedText>
      ) : (
        reportes.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: r.id } })}>
            <Tarjeta>
              <View style={styles.fila}>
                <ThemedText type="smallBold" style={{ flex: 1 }}>
                  {r.titulo}
                </ThemedText>
                <Chip texto={r.estado} />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {r.categoria} · {r.aula || r.sector || 'sin lugar'}
              </ThemedText>
            </Tarjeta>
          </Pressable>
        ))
      )}

      <Link href="/ajustes-app" style={styles.link}>
        <ThemedText type="linkPrimary">Avisos cuando se resuelva mi reporte ›</ThemedText>
      </Link>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  link: { alignSelf: 'center' },
});
