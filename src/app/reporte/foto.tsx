import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Pantalla, Tarjeta, Vacio } from '@/components/ui';
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
      <Tarjeta>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.foto} contentFit="cover" />
        ) : (
          <Vacio
            emoji="📸"
            titulo="Sin foto todavía"
            texto="Sacá una foto del desperfecto o elegí una que ya tengas."
          />
        )}
      </Tarjeta>

      <Boton titulo="Sacar foto" icono="📷" onPress={camara.ejecutar} />
      {camara.estado === 'bloqueado' && (
        <ThemedText type="small" themeColor="textSecondary">
          La cámara está desactivada. Podés elegir una foto de la galería.
        </ThemedText>
      )}
      <Boton titulo="Elegir de la galería" icono="🖼️" variante="secundario" onPress={elegirDeGaleria} />
      <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
        🔒 Para elegir una foto no necesitamos acceso a tu galería.
      </ThemedText>

      {fotoUri && (
        <>
          <Boton titulo="Quitar foto" icono="🗑️" variante="secundario" onPress={() => editarBorrador({ fotoUri: null })} />
          <Boton titulo="Listo" icono="✅" variante="acento" onPress={() => router.back()} />
        </>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 260, borderRadius: 12 },
});
