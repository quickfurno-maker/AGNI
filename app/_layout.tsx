import 'react-native-url-polyfill/auto';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { palette } from '@/lib/theme';
import { OwnerSessionProvider } from '@/state/session';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 5_000,
            refetchOnReconnect: true,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
      <QueryClientProvider client={queryClient}>
        <OwnerSessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.bg },
            }}
          />
        </OwnerSessionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
