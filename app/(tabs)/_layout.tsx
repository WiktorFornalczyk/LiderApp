import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { liderColors, LiderIconName } from '@/components/lider-ui';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: liderColors.blue,
        tabBarInactiveTintColor: '#a0a8b1',
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingTop: 7,
          paddingBottom: bottomInset,
          backgroundColor: '#0b1118',
          borderTopColor: liderColors.borderSoft,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bb"
        options={{
          title: 'BB',
          tabBarIcon: ({ color }) => <TabIcon name="briefcase-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="raporty"
        options={{
          title: 'Raporty',
          tabBarIcon: ({ color }) => <TabIcon name="reader-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="grafik"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notatki"
        options={{
          title: 'Notatki',
          tabBarIcon: ({ color }) => <TabIcon name="document-text-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="wiecej"
        options={{
          title: 'Więcej',
          tabBarIcon: ({ color }) => <TabIcon name="ellipsis-horizontal" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: LiderIconName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}
