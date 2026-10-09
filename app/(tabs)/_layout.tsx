import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { fonts, palette, radius } from '@/lib/theme';

function TabIcon({
  focused,
  color,
  active,
  inactive,
}: {
  focused: boolean;
  color: ColorValue;
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
}) {
  return <Ionicons name={focused ? active : inactive} color={color} size={20} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.bg },
        tabBarActiveTintColor: palette.blueBright,
        tabBarInactiveTintColor: palette.muted,
        tabBarActiveBackgroundColor: '#0A1C34',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: palette.chrome,
          borderTopColor: '#1E3C5E',
          borderTopWidth: 1,
          height: 76,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          marginHorizontal: 3,
          marginVertical: 4,
          borderRadius: radius.md,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.mono,
          fontSize: 9,
          fontWeight: '800',
          letterSpacing: 0.2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: (props) => (
            <TabIcon {...props} active="home" inactive="home-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: (props) => (
            <TabIcon {...props} active="chatbubble-ellipses" inactive="chatbubble-ellipses-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="systems"
        options={{
          title: 'Systems',
          tabBarIcon: (props) => (
            <TabIcon {...props} active="hardware-chip" inactive="hardware-chip-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: 'Incidents',
          tabBarIcon: (props) => (
            <TabIcon {...props} active="warning" inactive="warning-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: (props) => (
            <TabIcon {...props} active="menu" inactive="menu-outline" />
          ),
        }}
      />
      <Tabs.Screen name="approvals" options={{ href: null }} />
      <Tabs.Screen name="market" options={{ href: null }} />
    </Tabs>
  );
}
