import { Redirect } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/lib/theme';
import { useOwnerSession } from '@/state/session';

export default function Index() {
  const { state, refresh } = useOwnerSession();

  if (state.status === 'LOADING') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.accent} size="large" />
      </View>
    );
  }

  if (state.status === 'RECOVERABLE_ERROR') {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorTitle}>AGNI Owner Gateway is unavailable.</Text>
        <Text style={styles.errorBody}>{state.message}</Text>
        <Pressable style={styles.retry} onPress={() => void refresh()}>
          <Text style={styles.retryText}>Retry securely</Text>
        </Pressable>
      </View>
    );
  }

  return <Redirect href={state.status === 'READY' ? '/(tabs)' : '/setup'} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
    padding: 28,
    gap: 10,
  },
  errorTitle: { color: palette.text, fontSize: 21, fontWeight: '900', textAlign: 'center' },
  errorBody: { color: palette.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: {
    marginTop: 10,
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { color: palette.bg, fontSize: 13, fontWeight: '900' },
});
