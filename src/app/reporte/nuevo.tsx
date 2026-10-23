import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Campo, Opciones, Pantalla, Tarjeta } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useConPermiso } from '@/hooks/useConPermiso';
import { CATEGORIAS, editarBorrador, guardarBorrador, useStore } from '@/lib/store';
import { describirUbicacion } from '@/lib/ubicacion';

/**
 * Formulario de nuevo reporte. No pide ningún permiso al abrir: cada uno se
 * pide recién al tocar su función, y todas tienen alternativa.
 */
export default function NuevoReporte() {
  const borrador = useStore((e) => e.borrador);
  const [error, setError] = useState<string | null>(null);

  // Escanear: si falta el permiso de cámara, primero la pantalla previa.
  const camara = useConPermiso('camara', () => router.push('/reporte/escanear'));

  const guardar = () => {
    if (!borrador.titulo.trim()) {
      setError('Poné un título corto, por ejemplo "Luz quemada".');
      return;
    }
    if (!borrador.aula.trim() && !borrador.sector) {
      setError('Indicá el aula (escaneada o escrita) o marcá el sector.');
      return;
    }
    const reporte = guardarBorrador();
    router.replace({ pathname: '/reporte/[id]', params: { id: reporte.id } });
  };

  return (
    <Pantalla>
      <Campo
        etiqueta="Título"
        placeholder="Ej.: Canilla que pierde"
        value={borrador.titulo}
        onChangeText={(titulo) => editarBorrador({ titulo })}
      />
      <Campo
        etiqueta="Descripción"
        placeholder="Contá qué pasa y desde cuándo"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
        value={borrador.descripcion}
        onChangeText={(descripcion) => editarBorrador({ descripcion })}
      />

      <View style={styles.fila}>
        <View style={{ flex: 1 }}>
          <Campo
            etiqueta="Aula"
            placeholder="Ej.: AULA-12"
            autoCapitalize="characters"
            value={borrador.aula}
            onChangeText={(aula) => editarBorrador({ aula })}
          />
        </View>
        <Boton titulo="Escanear QR" variante="secundario" onPress={camara.ejecutar} />
      </View>

      <ThemedText type="smallBold">Categoría</ThemedText>
      <Opciones
        opciones={CATEGORIAS}
        valor={borrador.categoria}
        onChange={(categoria) => editarBorrador({ categoria })}
      />

      <Tarjeta>
        <ThemedText type="smallBold">Foto del desperfecto</ThemedText>
        {borrador.fotoUri ? (
          <Image source={{ uri: borrador.fotoUri }} style={styles.foto} contentFit="cover" />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Sin foto (opcional)
          </ThemedText>
        )}
        <Boton
          titulo={borrador.fotoUri ? 'Cambiar foto' : 'Adjuntar foto'}
          variante="secundario"
          onPress={() => router.push('/reporte/foto')}
        />
      </Tarjeta>

      <Tarjeta>
        <ThemedText type="smallBold">Dónde está el problema</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {[
            borrador.ubicacion && describirUbicacion(borrador.ubicacion),
            borrador.sector && `Sector: ${borrador.sector}`,
          ]
            .filter(Boolean)
            .join(' · ') || 'Sin marcar (opcional si indicaste el aula)'}
        </ThemedText>
        <Boton
          titulo="Marcar ubicación"
          variante="secundario"
          onPress={() => router.push('/reporte/ubicacion')}
        />
      </Tarjeta>

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <Boton titulo="Enviar reporte" onPress={guardar} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  foto: { width: '100%', height: 180, borderRadius: 12 },
  error: { color: '#b91c1c' },
});
