import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Insignia, Opciones, Pantalla, Tarjeta, TituloSeccion } from '@/components/ui';
import { SECTOR_EMOJI } from '@/constants/iconos';
import { Marca, Spacing } from '@/constants/theme';
import { useConPermiso } from '@/hooks/useConPermiso';
import { SECTORES, editarBorrador, useStore } from '@/lib/store';
import { describirUbicacion, obtenerUbicacion } from '@/lib/ubicacion';

/**
 * Ubicación solo en primer plano. Si es aproximada no mostramos coordenadas;
 * si se deniega, el reporte se carga con el sector elegido a mano.
 */
export default function UbicacionReporte() {
  const { ubicacion, sector } = useStore((e) => e.borrador);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState(false);

  const marcar = useCallback(async () => {
    setBuscando(true);
    setFallo(false);
    const resultado = await obtenerUbicacion();
    setBuscando(false);
    if (resultado) editarBorrador({ ubicacion: resultado });
    else setFallo(true);
  }, []);

  const permiso = useConPermiso('ubicacion', marcar);
  const sinPermiso = permiso.estado === 'bloqueado' || permiso.respuesta?.status === 'denied';

  return (
    <Pantalla>
      <Tarjeta>
        <View style={styles.fila}>
          <Insignia emoji="📍" color={ubicacion ? Marca.verde : Marca.azulClaro} />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText type="smallBold">Ubicación actual</ThemedText>
            {buscando ? (
              <ActivityIndicator style={{ alignSelf: 'flex-start' }} />
            ) : ubicacion ? (
              <>
                <ThemedText>{describirUbicacion(ubicacion)}</ThemedText>
                {ubicacion.aproximada && <Chip texto="parcial" />}
              </>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                {fallo ? 'No pudimos obtenerla. Elegí el sector abajo.' : 'Sin marcar'}
              </ThemedText>
            )}
          </View>
        </View>
        <Boton titulo="Usar mi ubicación actual" icono="🛰️" onPress={permiso.ejecutar} deshabilitado={buscando} />
        {ubicacion && (
          <Boton titulo="Quitar ubicación" variante="secundario" onPress={() => editarBorrador({ ubicacion: null })} />
        )}
      </Tarjeta>

      <Tarjeta style={sinPermiso && { borderColor: Marca.ambar }}>
        <TituloSeccion
          icono="🧭"
          titulo={sinPermiso ? 'Elegí el sector a mano' : 'O elegí el sector a mano'}
        />
        <Opciones
          opciones={SECTORES}
          iconos={SECTOR_EMOJI}
          valor={sector}
          onChange={(s) => editarBorrador({ sector: s })}
        />
      </Tarjeta>

      <Boton titulo="Listo" icono="✅" variante="acento" onPress={() => router.back()} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
