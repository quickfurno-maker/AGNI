import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius, toneColor, type NeonTone } from '@/lib/theme';

export function MetricTile({
  label,
  value,
  delta,
  tone = 'blue',
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  tone?: NeonTone;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const color = toneColor[tone];
  return (
    <View style={[styles.tile, { borderColor: color + '55' }]}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        {icon ? <Ionicons name={icon} size={14} color={color} /> : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      {delta ? <Text style={[styles.delta, { color }]}>{delta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 82,
    flex: 1,
    minWidth: '46%',
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: '#081522',
    padding: 11,
    justifyContent: 'center',
    gap: 3,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  label: { color: palette.muted, fontFamily: fonts.mono, fontSize: 9, fontWeight: '700' },
  value: { color: palette.text, fontFamily: fonts.mono, fontSize: 20, fontWeight: '900' },
  delta: { fontFamily: fonts.mono, fontSize: 9, fontWeight: '900' },
});
