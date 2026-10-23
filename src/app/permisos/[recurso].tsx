import { router, useLocalSearchParams } from 'expo-router';

import { PantallaPrevia } from '@/components/PantallaPrevia';
import { ThemedText } from '@/components/themed-text';
import { Boton, Pantalla } from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import { FUENTES, esRecurso, type Recurso } from '@/lib/permisos';

/**
 * Pantalla previa (modal) antes del diálogo del sistema.
 * Un único botón: "Continuar" (preguntable) o "Abrir Ajustes" (bloqueado).
 */
export default function PermisoPrevio() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();

  if (!esRecurso(recurso) || FUENTES[recurso].pedir === null) {
    return (
      <Pantalla>
        <ThemedText type="subtitle">Permiso desconocido</ThemedText>
        <ThemedText themeColor="textSecondary">“{recurso}” no es un permiso que use la app.</ThemedText>
        <Boton titulo="Volver" onPress={() => router.back()} />
      </Pantalla>
    );
  }

  return <Contenido recurso={recurso} />;
}

function Contenido({ recurso }: { recurso: Recurso }) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);

  if (estado === 'concedido') {
    return (
      <Pantalla>
        <ThemedText type="subtitle">Permiso concedido</ThemedText>
        <ThemedText themeColor="textSecondary">Ya podés usar esta función.</ThemedText>
        <Boton titulo="Continuar" onPress={() => router.back()} />
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <PantallaPrevia
        recurso={recurso}
        estado={estado}
        onContinuar={async () => {
          // Recién acá aparece el diálogo del sistema. Sea cual sea la
          // respuesta, volvemos: la pantalla anterior ofrece la alternativa.
          await pedir();
          router.back();
        }}
        onAbrirAjustes={abrirAjustes}
      />
    </Pantalla>
  );
}
