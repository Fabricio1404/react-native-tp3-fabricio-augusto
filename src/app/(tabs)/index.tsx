import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Insignia, Pantalla, Tarjeta, Vacio } from '@/components/ui';
import { CATEGORIA_INFO } from '@/constants/iconos';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore, type EstadoReporte } from '@/lib/store';

const RESUMEN: { estado: EstadoReporte; etiqueta: string }[] = [
  { estado: 'pendiente', etiqueta: 'Pendientes' },
  { estado: 'en curso', etiqueta: 'En curso' },
  { estado: 'resuelto', etiqueta: 'Resueltos' },
];

export default function Inicio() {
  const theme = useTheme();
  const reportes = useStore((e) => e.reportes);

  return (
    <Pantalla>
      <View style={styles.portada}>
        <ThemedText style={styles.portadaTitulo}>¿Viste algo roto en el instituto?</ThemedText>
        <ThemedText style={styles.portadaTexto}>
          Reportá una luz quemada, una canilla que pierde o un proyector roto y te avisamos cuando
          se resuelva.
        </ThemedText>

        <View style={styles.resumen}>
          {RESUMEN.map(({ estado, etiqueta }) => (
            <View key={estado} style={styles.resumenItem}>
              <Text style={styles.resumenNumero}>
                {reportes.filter((r) => r.estado === estado).length}
              </Text>
              <Text style={styles.resumenEtiqueta}>{etiqueta}</Text>
            </View>
          ))}
        </View>

        <Boton titulo="Nuevo reporte" icono="➕" variante="acento" onPress={() => router.push('/reporte/nuevo')} />
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.seccion}>
        MIS REPORTES
      </ThemedText>

      {reportes.length === 0 ? (
        <Tarjeta>
          <Vacio
            emoji="🧰"
            titulo="Todavía no hay reportes"
            texto="Cuando reportes un desperfecto lo vas a ver acá, con su estado."
          />
        </Tarjeta>
      ) : (
        reportes.map((r) => {
          const cat = CATEGORIA_INFO[r.categoria];
          return (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: r.id } })}
              style={({ pressed }) => pressed && { opacity: 0.85 }}>
              <Tarjeta style={styles.item}>
                <Insignia emoji={cat.emoji} color={cat.color} />
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {r.titulo}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {r.categoria} · {r.aula || r.sector || 'sin lugar'}
                  </ThemedText>
                  <Chip texto={r.estado} />
                </View>
                <Text style={[styles.flecha, { color: theme.textSecondary }]}>›</Text>
              </Tarjeta>
            </Pressable>
          );
        })
      )}

      <Pressable onPress={() => router.push('/ajustes-app')}>
        <Tarjeta style={styles.item}>
          <Insignia emoji="🔔" color={Colors.light.primary} tamano={38} />
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Avisos de resolución</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Elegí si querés recibir una notificación
            </ThemedText>
          </View>
          <Text style={[styles.flecha, { color: theme.textSecondary }]}>›</Text>
        </Tarjeta>
      </Pressable>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  portada: {
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    boxShadow: '0px 10px 24px rgba(30, 58, 138, 0.35)',
  },
  portadaTitulo: { color: '#fff', fontSize: 24, lineHeight: 30, fontWeight: 800 },
  portadaTexto: { color: '#dbe4ff', fontSize: 15 },
  resumen: { flexDirection: 'row', gap: Spacing.two },
  resumenItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  resumenNumero: { color: '#fff', fontSize: 22, fontWeight: '800' },
  resumenEtiqueta: { color: '#c7d2fe', fontSize: 12, fontWeight: '600' },
  seccion: { letterSpacing: 1, marginTop: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flecha: { fontSize: 28, fontWeight: '300' },
});
