export const palette = {
  bg: '#F5F5F0',
  bgSurface: '#FFFFFF',
  bgMuted: '#F0F0EB',
  bgInput: '#FFFFFF',
  bgSubtle: '#FAFAF7',

  orange: '#E97B10',
  orangeLight: '#F59518',
  orangeTint: '#FEF3E2',
  orangeBorder: '#F5C17A',

  textPrimary: '#111111',
  textSecondary: '#3D3D3D',
  textMuted: '#737373',
  textDisabled: '#A3A3A3',

  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  info: '#2563EB',
  infoBg: '#DBEAFE',

  border: '#E5E5E5',
  borderStrong: '#D4D4D4',
  divider: '#F0F0F0',
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
};

export const typography = {
  displayLarge: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3 },
  titleLarge: { fontSize: 18, fontWeight: '700' as const },
  titleMedium: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  caption: { fontSize: 11, fontWeight: '400' as const, color: '#737373' },
};
