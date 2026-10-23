import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Pantalla, Tarjeta } from '@/components/ui';
import { useConPermiso } from '@/hooks/useConPermiso';
import { editarBorrador, useStore } from '@/lib/store';

/**
 * "Sacar foto" necesita la cámara (con pantalla previa).
 * "Elegir de la galería" usa el selector del sistema: la persona elige UNA foto
 * y la app solo recibe esa, así que no hace falta permiso de galería.
 */
export default function Foto() {
  const fotoUri = useStore((e) => e.borrador.fotoUri);

  const sacarFoto = useCallback(async () => {
    const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!resultado.canceled) editarBorrador({ fotoUri: resultado.assets[0].uri });
  }, []);

  const camara = useConPermiso('camara', sacarFoto);

  const elegirDeGaleria = async () => {
    // Sin requestMediaLibraryPermissionsAsync: el selector no lo necesita.
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!resultado.canceled) editarBorrador({ fotoUri: resultado.assets[0].uri });
  };

  return (
    <Pantalla>
      <ThemedText type="subtitle">Foto del desperfecto</ThemedText>
      <Tarjeta>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.foto} contentFit="cover" />
        ) : (
          <ThemedText themeColor="textSecondary">Todavía no adjuntaste ninguna foto.</ThemedText>
        )}
      </Tarjeta>

      <Boton titulo="Sacar foto" onPress={camara.ejecutar} />
      {camara.estado === 'bloqueado' && (
        <ThemedText type="small" themeColor="textSecondary">
          La cámara está desactivada. Podés elegir una foto de la galería.
        </ThemedText>
      )}
      <Boton titulo="Elegir de la galería" variante="secundario" onPress={elegirDeGaleria} />

      {fotoUri && (
        <>
          <Boton titulo="Quitar foto" variante="secundario" onPress={() => editarBorrador({ fotoUri: null })} />
          <Boton titulo="Listo" onPress={() => router.back()} />
        </>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 260, borderRadius: 12 },
});
