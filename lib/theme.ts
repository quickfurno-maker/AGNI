import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const palette = {
  bg: '#02050B',
  bgRaised: '#050A12',
  chrome: '#050B14',
  surface: '#08111D',
  surface2: '#0B1725',
  surface3: '#101E2F',
  border: '#182A40',
  borderBright: '#244D79',
  text: '#F7FBFF',
  muted: '#7F90A6',
  dim: '#536276',
  accent: '#2F7DFF',
  accentSoft: '#0A2147',
  blue: '#2F7DFF',
  blueBright: '#42A5FF',
  cyan: '#2DE6FF',
  purple: '#9D4DFF',
  violet: '#6D3BFF',
  fire: '#FF6A00',
  orange: '#FF8A1F',
  ember: '#FF314F',
  green: '#28E6A2',
  yellow: '#FFD257',
  red: '#FF445E',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  page: ['#02050B', '#050A12', '#02050B'] as const,
  blue: ['#143B8D', '#0B1D45', '#07111F'] as const,
  blueHot: ['#2F7DFF', '#0C49BA', '#07172B'] as const,
  purple: ['#9D4DFF', '#4E20BB', '#17102D'] as const,
  fire: ['#FF6A00', '#B82F13', '#23100B'] as const,
  danger: ['#FF314F', '#8A102B', '#210911'] as const,
  green: ['#20D78F', '#0A734E', '#071D18'] as const,
  neutral: ['#16283D', '#0A1420', '#07101A'] as const,
  thunder: ['#2F7DFF', '#9D4DFF', '#FF6A00'] as const,
} as const;

export const radius = {
  xs: 8,
  sm: 11,
  md: 15,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })!,
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' })!,
} as const;

export const typography = {
  eyebrow: {
    color: palette.blueBright,
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  display: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  } satisfies TextStyle,
  title: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 17,
    fontWeight: '900',
  } satisfies TextStyle,
  body: {
    color: palette.text,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 20,
  } satisfies TextStyle,
  caption: {
    color: palette.muted,
    fontFamily: fonts.mono,
    fontSize: 10,
    lineHeight: 15,
  } satisfies TextStyle,
} as const;

export const effects = {
  blueGlow: {
    shadowColor: palette.blue,
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  } satisfies ViewStyle,
  purpleGlow: {
    shadowColor: palette.purple,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  } satisfies ViewStyle,
  fireGlow: {
    shadowColor: palette.fire,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  } satisfies ViewStyle,
  greenGlow: {
    shadowColor: palette.green,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  } satisfies ViewStyle,
} as const;

export type NeonTone = 'blue' | 'purple' | 'fire' | 'green' | 'danger' | 'neutral';

export const toneColor: Record<NeonTone, string> = {
  blue: palette.blue,
  purple: palette.purple,
  fire: palette.fire,
  green: palette.green,
  danger: palette.red,
  neutral: palette.borderBright,
};
