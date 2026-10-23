import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Marca } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/lib/store';

function Icono({ simbolo, activo }: { simbolo: string; activo: boolean }) {
  return <Text style={{ fontSize: 20, lineHeight: 24, opacity: activo ? 1 : 0.45 }}>{simbolo}</Text>;
}

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const sinLeer = useStore((e) => e.avisos.filter((a) => !a.leido).length);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        // Alto explícito (más el área segura de abajo) para que el nombre de la pestaña no se corte.
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarBadgeStyle: { backgroundColor: Marca.ambar, color: '#1f1300', fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reportes',
          headerTitle: 'Mantenimiento IPF',
          tabBarIcon: ({ focused }) => <Icono simbolo="🛠️" activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarBadge: sinLeer > 0 ? sinLeer : undefined,
          tabBarIcon: ({ focused }) => <Icono simbolo="🔔" activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="permisos"
        options={{
          title: 'Permisos',
          tabBarIcon: ({ focused }) => <Icono simbolo="🔐" activo={focused} />,
        }}
      />
    </Tabs>
  );
}
