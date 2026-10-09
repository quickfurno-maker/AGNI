import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AgniMark } from '@/components/AgniMark';
import { fonts, palette, typography } from '@/lib/theme';

export function ScreenHeader({
  title,
  subtitle,
  eyebrow = 'AGNI // OWNER CONSOLE',
  trailing,
  brand = false,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  trailing?: ReactNode;
  brand?: boolean;
}) {
  return (
    <View style={styles.row}>
      {brand ? <AgniMark size={44} /> : null}
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  copy: { flex: 1, gap: 2 },
  eyebrow: typography.eyebrow,
  title: { ...typography.display, fontSize: 22 },
  subtitle: { color: palette.muted, fontFamily: fonts.mono, fontSize: 10, lineHeight: 15 },
});
