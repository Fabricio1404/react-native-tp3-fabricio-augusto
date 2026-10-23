import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { usePermiso } from '@/hooks/usePermiso';
import { FUENTES, type Recurso } from '@/lib/permisos';

/**
 * Pedido en contexto: `ejecutar()` corre la acción si el permiso ya está
 * concedido; si no, abre la pantalla previa /permisos/[recurso]. Al volver,
 * si la persona concedió el permiso, la acción se ejecuta sola; si lo
 * denegó, no se insiste: la pantalla previa solo vuelve a aparecer cuando
 * toque otra vez la función.
 */
export function useConPermiso(recurso: Recurso, accion: () => void) {
  const permiso = usePermiso(recurso);
  const pendiente = useRef(false);
  const accionRef = useRef(accion);

  useEffect(() => {
    accionRef.current = accion;
  }, [accion]);

  useFocusEffect(
    useCallback(() => {
      if (!pendiente.current) return;
      pendiente.current = false;
      FUENTES[recurso].consultar().then((r) => {
        if (r.granted) accionRef.current();
      });
    }, [recurso]),
  );

  const ejecutar = useCallback(() => {
    if (permiso.estado === 'concedido') {
      accionRef.current();
      return;
    }
    pendiente.current = true;
    router.push({ pathname: '/permisos/[recurso]', params: { recurso } });
  }, [permiso.estado, recurso]);

  return { ...permiso, ejecutar };
}
