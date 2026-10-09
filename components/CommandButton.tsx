import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { fonts, gradients, palette, radius, type NeonTone } from '@/lib/theme';

const colors: Record<NeonTone, readonly [string, string, string]> = {
  blue: gradients.blueHot,
  purple: gradients.purple,
  fire: gradients.fire,
  green: gradients.green,
  danger: gradients.danger,
  neutral: gradients.neutral,
};

export function CommandButton({
  label,
  icon,
  tone = 'blue',
  onPress,
  style,
  disabled = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: NeonTone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [style, pressed && styles.pressed]}>
      <LinearGradient colors={colors[tone]} style={[styles.button, disabled && styles.disabled]}>
        <Ionicons name={icon} size={17} color={palette.white} />
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FFFFFF22',
    paddingHorizontal: 13,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: palette.white,
    fontFamily: fonts.mono,
    fontWeight: '900',
    fontSize: 11,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});
