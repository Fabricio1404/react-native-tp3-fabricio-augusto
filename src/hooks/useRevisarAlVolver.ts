import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Ejecuta `revisar` cada vez que la app vuelve a primer plano (por ejemplo,
 * al regresar de Ajustes). Los hooks de Expo no se enteran solos de que el
 * permiso cambió fuera de la app.
 */
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
