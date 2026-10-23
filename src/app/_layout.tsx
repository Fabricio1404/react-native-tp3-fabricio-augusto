import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
// Registra el handler de notificaciones en primer plano.
import '@/lib/notificaciones';
import { Notifications } from '@/lib/notificaciones-modulo';

export default function RootLayout() {
  const oscuro = useColorScheme() === 'dark';
  const colores = Colors[oscuro ? 'dark' : 'light'];
  const base = oscuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...base,
    colors: { ...base.colors, background: colores.background, primary: colores.primary },
  };

  // Al tocar la notificación "Reporte resuelto", abrir ese reporte.
  useEffect(() => {
    if (!Notifications) return;
    const sub = Notifications.addNotificationResponseReceivedListener((respuesta) => {
      const url = respuesta.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider value={tema}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerBackTitle: 'Atrás',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colores.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Inicio' }} />
        <Stack.Screen name="reporte/nuevo" options={{ title: 'Nuevo reporte' }} />
        <Stack.Screen name="reporte/escanear" options={{ title: 'Escanear QR del aula' }} />
        <Stack.Screen name="reporte/foto" options={{ title: 'Foto del desperfecto' }} />
        <Stack.Screen name="reporte/ubicacion" options={{ title: 'Dónde está el problema' }} />
        <Stack.Screen name="reporte/[id]" options={{ title: 'Reporte' }} />
        <Stack.Screen name="ajustes-app" options={{ title: 'Ajustes de avisos' }} />
        <Stack.Screen name="permisos/[recurso]" options={{ presentation: 'modal', title: 'Antes de continuar' }} />
      </Stack>
    </ThemeProvider>
  );
}
