import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Campo, Opciones, Pantalla, Tarjeta, TituloSeccion } from '@/components/ui';
import { CATEGORIA_INFO } from '@/constants/iconos';
import { Marca, Spacing } from '@/constants/theme';
import { useConPermiso } from '@/hooks/useConPermiso';
import { CATEGORIAS, editarBorrador, guardarBorrador, useStore } from '@/lib/store';
import { describirUbicacion } from '@/lib/ubicacion';

const ICONOS_CATEGORIA = Object.fromEntries(
  CATEGORIAS.map((c) => [c, CATEGORIA_INFO[c].emoji]),
) as Record<(typeof CATEGORIAS)[number], string>;

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

  const lugar = [
    borrador.ubicacion && describirUbicacion(borrador.ubicacion),
    borrador.sector && `Sector: ${borrador.sector}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pantalla>
      <Tarjeta>
        <TituloSeccion icono="📝" titulo="¿Qué pasó?" />
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
        <ThemedText type="smallBold" themeColor="textSecondary">
          Categoría
        </ThemedText>
        <Opciones
          opciones={CATEGORIAS}
          iconos={ICONOS_CATEGORIA}
          valor={borrador.categoria}
          onChange={(categoria) => editarBorrador({ categoria })}
        />
      </Tarjeta>

      <Tarjeta>
        <TituloSeccion icono="🏫" titulo="¿En qué aula?" />
        <Campo
          etiqueta="Código del aula"
          placeholder="Ej.: AULA-12"
          autoCapitalize="characters"
          value={borrador.aula}
          onChangeText={(aula) => editarBorrador({ aula })}
        />
        <Boton titulo="Escanear QR de la puerta" icono="📷" variante="secundario" onPress={camara.ejecutar} />
      </Tarjeta>

      <Tarjeta>
        <TituloSeccion icono="🖼️" titulo="Foto del desperfecto" />
        {borrador.fotoUri ? (
          <Image source={{ uri: borrador.fotoUri }} style={styles.foto} contentFit="cover" />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Opcional, pero ayuda a encontrar el problema más rápido.
          </ThemedText>
        )}
        <Boton
          titulo={borrador.fotoUri ? 'Cambiar foto' : 'Adjuntar foto'}
          icono="📎"
          variante="secundario"
          onPress={() => router.push('/reporte/foto')}
        />
      </Tarjeta>

      <Tarjeta>
        <TituloSeccion icono="📍" titulo="Dónde está el problema" />
        <ThemedText type="small" themeColor="textSecondary">
          {lugar || 'Sin marcar (opcional si indicaste el aula)'}
        </ThemedText>
        <Boton
          titulo="Marcar ubicación"
          icono="🗺️"
          variante="secundario"
          onPress={() => router.push('/reporte/ubicacion')}
        />
      </Tarjeta>

      {error && (
        <View style={styles.error}>
          <ThemedText type="small" style={{ color: Marca.rojo }}>
            ⚠️ {error}
          </ThemedText>
        </View>
      )}
      <Boton titulo="Enviar reporte" icono="🚀" onPress={guardar} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 180, borderRadius: 12 },
  error: {
    backgroundColor: Marca.rojo + '14',
    borderColor: Marca.rojo + '55',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
});
