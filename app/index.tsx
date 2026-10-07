import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { palette } from '@/lib/theme';
import { useOwnerSession } from '@/state/session';

export default function Index() {
  const { state } = useOwnerSession();

  if (state.status === 'LOADING') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.accent} size="large" />
      </View>
    );
  }

  return <Redirect href={state.status === 'READY' ? '/(tabs)' : '/setup'} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
});
