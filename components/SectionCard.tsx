import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius } from '@/lib/theme';

export function SectionCard({
  title,
  subtitle,
  trailing,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string; trailing?: ReactNode }>) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {trailing}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 14,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headText: { flex: 1, gap: 4 },
  title: { color: palette.text, fontSize: 17, fontWeight: '800' },
  subtitle: { color: palette.muted, fontSize: 12, lineHeight: 17 },
});
