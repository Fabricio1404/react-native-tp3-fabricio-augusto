import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Boton, Chip, Opciones, Pantalla, Tarjeta } from '@/components/ui';
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
        <ThemedText type="smallBold">Ubicación actual</ThemedText>
        {buscando ? (
          <ActivityIndicator />
        ) : ubicacion ? (
          <>
            <ThemedText>{describirUbicacion(ubicacion)}</ThemedText>
            {ubicacion.aproximada && <Chip texto="parcial" />}
          </>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            {fallo ? 'No pudimos obtener la ubicación. Elegí el sector abajo.' : 'Sin marcar'}
          </ThemedText>
        )}
        <Boton titulo="Usar mi ubicación actual" onPress={permiso.ejecutar} deshabilitado={buscando} />
        {ubicacion && (
          <Boton
            titulo="Quitar ubicación"
            variante="secundario"
            onPress={() => editarBorrador({ ubicacion: null })}
          />
        )}
      </Tarjeta>

      <Tarjeta>
        <ThemedText type="smallBold">
          {sinPermiso ? 'Elegí el sector a mano' : 'Sector (también podés elegirlo a mano)'}
        </ThemedText>
        <Opciones opciones={SECTORES} valor={sector} onChange={(s) => editarBorrador({ sector: s })} />
      </Tarjeta>

      <Boton titulo="Listo" onPress={() => router.back()} />
    </Pantalla>
  );
}
