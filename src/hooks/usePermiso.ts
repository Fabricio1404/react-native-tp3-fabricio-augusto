import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';
import { FUENTES, interpretar, type EstadoPermiso, type Recurso, type Respuesta } from '@/lib/permisos';

export type UsePermiso = {
  estado: EstadoPermiso;
  /** Fotos limitadas, ubicación aproximada o notificaciones provisionales. */
  parcial: boolean;
  respuesta: Respuesta | null;
  /** Muestra el diálogo del sistema (si todavía se puede) y devuelve el nuevo estado. */
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => Promise<void>;
  /** Vuelve a consultar al sistema sin mostrar ningún diálogo. */
  consultar: () => Promise<void>;
};

/**
 * Hook unificado de permisos. Nunca guarda el estado "para siempre": consulta
 * al sistema al montar, al volver a enfocar la pantalla (por ejemplo, al cerrar
 * la pantalla previa) y al volver de Ajustes (AppState).
 */
export function usePermiso(recurso: Recurso): UsePermiso {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const fuente = FUENTES[recurso];

  const consultar = useCallback(async () => {
    try {
      setRespuesta(await fuente.consultar());
    } catch {
      // Si el módulo nativo falla (p. ej. en web), lo tratamos como bloqueado
      // para que la pantalla ofrezca la alternativa en vez de romperse.
      setRespuesta({ status: 'denied', granted: false, canAskAgain: false, parcial: false, matiz: null });
    }
  }, [fuente]);

  useFocusEffect(
    useCallback(() => {
      consultar();
    }, [consultar]),
  );

  useRevisarAlVolver(consultar);

  const pedir = useCallback(async (): Promise<EstadoPermiso> => {
    if (!fuente.pedir) return interpretar(respuesta);
    // Si canAskAgain es false el sistema devuelve 'denied' al instante sin diálogo,
    // así que no tiene sentido llamar a request: mejor mandar a Ajustes.
    if (respuesta && !respuesta.granted && !respuesta.canAskAgain) return 'bloqueado';
    const nueva = await fuente.pedir();
    setRespuesta(nueva);
    return interpretar(nueva);
  }, [fuente, respuesta]);

  const abrirAjustes = useCallback(() => Linking.openSettings(), []);

  return {
    estado: interpretar(respuesta),
    parcial: respuesta?.parcial ?? false,
    respuesta,
    pedir,
    abrirAjustes,
    consultar,
  };
}
