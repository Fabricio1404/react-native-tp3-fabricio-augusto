import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { AZUL } from '@/components/ui';
import { useStore } from '@/lib/store';

function Icono({ simbolo, color }: { simbolo: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{simbolo}</Text>;
}

export default function TabsLayout() {
  const sinLeer = useStore((e) => e.avisos.filter((a) => !a.leido).length);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: AZUL }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => <Icono simbolo="🛠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarBadge: sinLeer > 0 ? sinLeer : undefined,
          tabBarIcon: ({ color }) => <Icono simbolo="🔔" color={color} />,
        }}
      />
      <Tabs.Screen
        name="permisos"
        options={{
          title: 'Permisos',
          tabBarIcon: ({ color }) => <Icono simbolo="🔐" color={color} />,
        }}
      />
    </Tabs>
  );
}
