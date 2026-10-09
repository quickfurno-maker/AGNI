import { StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius, type NeonTone } from '@/lib/theme';

const colors: Record<NeonTone, string> = {
  blue: palette.blueBright,
  purple: palette.purple,
  fire: palette.fire,
  green: palette.green,
  danger: palette.red,
  neutral: palette.muted,
};

export function StatusChip({
  label,
  tone = 'neutral',
  compact = false,
}: {
  label: string;
  tone?: NeonTone;
  compact?: boolean;
}) {
  const color = colors[tone];
  return (
    <View style={[styles.wrap, compact && styles.compact, { borderColor: color + '80' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: '#07101A',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  compact: { paddingHorizontal: 7, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: radius.pill },
  text: {
    fontFamily: fonts.mono,
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.4,
  },
});
