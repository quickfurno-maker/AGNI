import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/lib/theme';
import type { HealthState } from '@/types/owner';

const dot: Record<HealthState, string> = {
  HEALTHY: palette.green,
  DEGRADED: palette.yellow,
  UNHEALTHY: palette.red,
  UNKNOWN: palette.muted,
};

export function HealthPill({ label, state }: { label: string; state: HealthState }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: dot[state] }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.border,
  },
  dot: { width: 7, height: 7, borderRadius: 999 },
  label: { color: palette.text, fontSize: 12, fontWeight: '700' },
});
