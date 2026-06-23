import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingScreen } from './src/components/LoadingScreen';
import { buildingApi } from './src/services/api';
import { useAppStore } from './src/store/useAppStore';
import { MOCK_BUILDINGS } from './src/utils/mockBuildings';

const queryClient = new QueryClient();

function AppGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const setBuildings = useAppStore((s) => s.setBuildings);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const res = await buildingApi.getAll();
        if (!cancelled) {
          if (res.data && res.data.length > 0) {
            setBuildings(res.data);
          } else {
            setBuildings(MOCK_BUILDINGS);
          }
        }
      } catch {
        if (!cancelled) setBuildings(MOCK_BUILDINGS);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    loadInitialData();
    return () => { cancelled = true; };
  }, []);

  if (!ready) return <LoadingScreen />;
  return <>{children}</>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <AppGate>
          <AppNavigator />
        </AppGate>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
