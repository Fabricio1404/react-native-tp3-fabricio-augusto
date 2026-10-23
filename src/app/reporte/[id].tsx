import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Insignia, Pantalla, Tarjeta, Vacio } from '@/components/ui';
import { CATEGORIA_INFO } from '@/constants/iconos';
import { Spacing } from '@/constants/theme';
import { simularResolucion } from '@/lib/notificaciones';
import { useStore } from '@/lib/store';
import { describirUbicacion } from '@/lib/ubicacion';

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reporte = useStore((e) => e.reportes.find((r) => r.id === id));
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Validar el id: puede llegar desde un enlace o una notificación vieja.
  if (!reporte) {
    return (
      <Pantalla>
        <Stack.Screen options={{ title: 'Reporte no encontrado' }} />
        <Tarjeta>
          <Vacio
            emoji="🔎"
            titulo="No existe el reporte"
            texto={`No encontramos ningún reporte con el id “${id}”. Puede que se haya borrado al reiniciar la app.`}
          />
        </Tarjeta>
        <Boton titulo="Volver al inicio" onPress={() => router.replace('/')} />
      </Pantalla>
    );
  }

  const cat = CATEGORIA_INFO[reporte.categoria];

  const simular = async () => {
    const conNotificacion = await simularResolucion(reporte.id);
    setMensaje(
      conNotificacion
        ? 'En 10 segundos te llega una notificación y el aviso queda en la pestaña Avisos.'
        : 'En 10 segundos el aviso aparece en la pestaña Avisos (las notificaciones están desactivadas).',
    );
  };

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Detalle del reporte' }} />

      <Tarjeta style={styles.cabecera}>
        <Insignia emoji={cat.emoji} color={cat.color} tamano={64} />
        <ThemedText type="subtitle" style={styles.centrado}>
          {reporte.titulo}
        </ThemedText>
        <Chip texto={reporte.estado} style={{ alignSelf: 'center' }} />
        {!!reporte.descripcion && (
          <ThemedText themeColor="textSecondary" style={styles.centrado}>
            {reporte.descripcion}
          </ThemedText>
        )}
      </Tarjeta>

      <Tarjeta>
        <Dato icono="🏷️" etiqueta="Categoría" valor={reporte.categoria} />
        <Dato icono="🏫" etiqueta="Aula" valor={reporte.aula || '—'} />
        <Dato icono="📍" etiqueta="Ubicación" valor={reporte.ubicacion ? describirUbicacion(reporte.ubicacion) : '—'} />
        <Dato icono="🧭" etiqueta="Sector" valor={reporte.sector ?? '—'} />
        <Dato icono="🕒" etiqueta="Creado" valor={new Date(reporte.creado).toLocaleString()} />
      </Tarjeta>

      {reporte.fotoUri && <Image source={{ uri: reporte.fotoUri }} style={styles.foto} contentFit="cover" />}

      <Boton
        titulo="Simular resolución"
        icono="🧪"
        variante="secundario"
        deshabilitado={reporte.estado !== 'pendiente'}
        onPress={simular}
      />
      {mensaje && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
          {mensaje}
        </ThemedText>
      )}
    </Pantalla>
  );
}

function Dato({ icono, etiqueta, valor }: { icono: string; etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoIcono}>{icono}</Text>
      <ThemedText type="small" themeColor="textSecondary" style={styles.datoEtiqueta}>
        {etiqueta}
      </ThemedText>
      <ThemedText type="smallBold" style={{ flex: 1, textAlign: 'right' }}>
        {valor}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecera: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  centrado: { textAlign: 'center' },
  foto: { width: '100%', height: 240, borderRadius: 18 },
  dato: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 6 },
  datoIcono: { fontSize: 16 },
  datoEtiqueta: { width: 80 },
});
