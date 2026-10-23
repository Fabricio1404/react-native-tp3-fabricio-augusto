import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Pantalla, Tarjeta } from '@/components/ui';
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
        <ThemedText type="subtitle">No existe el reporte</ThemedText>
        <ThemedText themeColor="textSecondary">
          No encontramos ningún reporte con el id “{id}”. Puede que se haya borrado al reiniciar la app.
        </ThemedText>
        <Boton titulo="Volver al inicio" onPress={() => router.replace('/')} />
      </Pantalla>
    );
  }

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
      <Stack.Screen options={{ title: reporte.titulo }} />
      <Chip texto={reporte.estado} />
      <ThemedText type="subtitle">{reporte.titulo}</ThemedText>
      {!!reporte.descripcion && <ThemedText>{reporte.descripcion}</ThemedText>}

      <Tarjeta>
        <Dato etiqueta="Categoría" valor={reporte.categoria} />
        <Dato etiqueta="Aula" valor={reporte.aula || '—'} />
        <Dato etiqueta="Ubicación" valor={reporte.ubicacion ? describirUbicacion(reporte.ubicacion) : '—'} />
        <Dato etiqueta="Sector" valor={reporte.sector ?? '—'} />
        <Dato etiqueta="Creado" valor={new Date(reporte.creado).toLocaleString()} />
      </Tarjeta>

      {reporte.fotoUri && <Image source={{ uri: reporte.fotoUri }} style={styles.foto} contentFit="cover" />}

      <Boton
        titulo="Simular resolución"
        variante="secundario"
        deshabilitado={reporte.estado !== 'pendiente'}
        onPress={simular}
      />
      {mensaje && (
        <ThemedText type="small" themeColor="textSecondary">
          {mensaje}
        </ThemedText>
      )}
    </Pantalla>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <ThemedText type="small">
      <ThemedText type="smallBold">{etiqueta}: </ThemedText>
      {valor}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 240, borderRadius: 16 },
});
