/**
 * Paleta de la app en modo claro y oscuro: azul institucional con acento ámbar.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Marca = {
  azul: '#1e3a8a',
  azulClaro: '#3b5bdb',
  ambar: '#f59e0b',
  verde: '#15803d',
  rojo: '#b91c1c',
  naranja: '#c2410c',
  violeta: '#7c3aed',
} as const;

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#f1f4f9',
    backgroundElement: '#ffffff',
    backgroundSelected: '#e7ebf3',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    primary: Marca.azul,
  },
  dark: {
    text: '#f1f5f9',
    background: '#0b1020',
    backgroundElement: '#161d31',
    backgroundSelected: '#243052',
    textSecondary: '#94a3b8',
    border: '#253150',
    primary: Marca.azulClaro,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
