import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { gradients, palette, radius, type NeonTone } from '@/lib/theme';

const toneGradient: Record<NeonTone, readonly [string, string, string]> = {
  blue: gradients.blueHot,
  purple: gradients.purple,
  fire: gradients.fire,
  green: gradients.green,
  danger: gradients.danger,
  neutral: gradients.neutral,
};

export function NeonPanel({
  children,
  tone = 'neutral',
  style,
  innerStyle,
}: PropsWithChildren<{
  tone?: NeonTone;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}>) {
  return (
    <LinearGradient colors={toneGradient[tone]} style={[styles.frame, style]}>
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  frame: {
    padding: 1,
    borderRadius: radius.lg,
  },
  inner: {
    backgroundColor: '#07111D',
    borderRadius: radius.lg - 1,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
});
