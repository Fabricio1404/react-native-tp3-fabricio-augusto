import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Registra el handler de notificaciones en primer plano.
import '@/lib/notificaciones';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Al tocar la notificación "Reporte resuelto", abrir ese reporte.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((respuesta) => {
      const url = respuesta.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerBackTitle: 'Atrás' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Inicio' }} />
        <Stack.Screen name="reporte/nuevo" options={{ title: 'Nuevo reporte' }} />
        <Stack.Screen name="reporte/escanear" options={{ title: 'Escanear QR del aula' }} />
        <Stack.Screen name="reporte/foto" options={{ title: 'Adjuntar foto' }} />
        <Stack.Screen name="reporte/ubicacion" options={{ title: 'Marcar ubicación' }} />
        <Stack.Screen name="reporte/[id]" options={{ title: 'Reporte' }} />
        <Stack.Screen name="ajustes-app" options={{ title: 'Ajustes de avisos' }} />
        <Stack.Screen name="permisos/[recurso]" options={{ presentation: 'modal', title: 'Permiso' }} />
      </Stack>
    </ThemeProvider>
  );
}
