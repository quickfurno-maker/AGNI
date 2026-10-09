import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NeonPanel } from '@/components/NeonPanel';
import { fonts, palette, type NeonTone } from '@/lib/theme';

export function SectionCard({
  title,
  subtitle,
  trailing,
  children,
  tone = 'neutral',
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  tone?: NeonTone;
}>) {
  return (
    <NeonPanel tone={tone}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {trailing}
      </View>
      <View style={styles.body}>{children}</View>
    </NeonPanel>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headText: { flex: 1, gap: 4 },
  title: { color: palette.text, fontFamily: fonts.mono, fontSize: 15, fontWeight: '900' },
  subtitle: { color: palette.muted, fontFamily: fonts.mono, fontSize: 10, lineHeight: 15 },
  body: { marginTop: 12, gap: 10 },
});
