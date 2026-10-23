import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { PantallaPrevia } from '@/components/PantallaPrevia';
import { ThemedText } from '@/components/themed-text';
import { Boton, Campo, Cargando, Pantalla } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';
import { editarBorrador } from '@/lib/store';

/** El QR de la puerta trae "IPF-AULA:12" o directamente "AULA-12". */
function leerAula(data: string) {
  return data.replace(/^IPF-AULA:/i, 'AULA-').trim().toUpperCase();
}

/**
 * Escáner con los cuatro estados:
 * cargando (permiso === null) → concedido (cámara) → preguntable (Continuar)
 * → bloqueado (Abrir Ajustes). Si no hay cámara, el aula se escribe a mano.
 */
export default function Escanear() {
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  const yaLeyo = useRef(false);

  // Si la persona habilita la cámara en Ajustes y vuelve, el hook no se entera solo.
  const revisar = useCallback(() => {
    consultarPermiso();
  }, [consultarPermiso]);
  useRevisarAlVolver(revisar);

  const alLeer = ({ data }: BarcodeScanningResult) => {
    if (yaLeyo.current) return; // onBarcodeScanned se dispara muchas veces por segundo
    yaLeyo.current = true;
    editarBorrador({ aula: leerAula(data) });
    router.back();
  };

  // 1. Cargando: el primer render del hook siempre es null.
  if (!permiso) return <Cargando />;

  // 2. Concedido.
  if (permiso.granted) {
    return (
      <View style={styles.contenedor}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={alLeer}
        />
        <View style={styles.marco} pointerEvents="none" />
        <ThemedText style={styles.ayuda}>Apuntá al QR pegado en la puerta del aula</ThemedText>
      </View>
    );
  }

  // 3. Preguntable y 4. Bloqueado: canAskAgain decide entre "Continuar" y "Abrir Ajustes".
  return (
    <Pantalla>
      <PantallaPrevia
        recurso="camara"
        estado={permiso.canAskAgain ? 'preguntable' : 'bloqueado'}
        onContinuar={pedirPermiso}
        onAbrirAjustes={Linking.openSettings}
      />
      <CargaManual />
    </Pantalla>
  );
}

function CargaManual() {
  const [aula, setAula] = useState('');
  return (
    <View style={{ gap: Spacing.two, paddingHorizontal: Spacing.three }}>
      <Campo
        etiqueta="O escribí el código del aula"
        placeholder="Ej.: AULA-12"
        autoCapitalize="characters"
        value={aula}
        onChangeText={setAula}
      />
      <Boton
        titulo="Usar este código"
        variante="secundario"
        deshabilitado={!aula.trim()}
        onPress={() => {
          editarBorrador({ aula: aula.trim().toUpperCase() });
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  marco: { width: 240, height: 240, borderWidth: 3, borderColor: '#fff', borderRadius: 24 },
  ayuda: {
    position: 'absolute',
    bottom: Spacing.six,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: Spacing.two,
    borderRadius: 8,
  },
});
