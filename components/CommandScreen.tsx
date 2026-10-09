import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { gradients, palette } from '@/lib/theme';

export function CommandScreen({
  children,
  style,
  overlay,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; overlay?: ReactNode }>) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={styles.grid}>
        {Array.from({ length: 14 }, (_, index) => (
          <View key={index} style={[styles.gridLine, { top: index * 48 }]} />
        ))}
      </View>
      <View pointerEvents="none" style={[styles.bolt, styles.boltBlue]} />
      <View pointerEvents="none" style={[styles.bolt, styles.boltFire]} />
      {overlay}
      <SafeAreaView style={[styles.safe, style]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg, overflow: 'hidden' },
  safe: { flex: 1 },
  grid: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.18 },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1D3550',
  },
  bolt: {
    position: 'absolute',
    width: 180,
    height: 2,
    opacity: 0.45,
    transform: [{ rotate: '-31deg' }],
  },
  boltBlue: {
    right: -56,
    top: 92,
    backgroundColor: palette.blue,
  },
  boltFire: {
    left: -72,
    bottom: 150,
    backgroundColor: palette.fire,
  },
});
