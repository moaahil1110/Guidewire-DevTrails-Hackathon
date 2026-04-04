export const palette = {
  background: "#f7f3ea",
  card: "#fffaf0",
  surface: "#ffffff",
  primary: "#0d5c63",
  secondary: "#f0a202",
  accent: "#7fb069",
  text: "#122c34",
  muted: "#5c6b73",
  border: "#d8d2c2",
  danger: "#c44536",
  success: "#2d6a4f",
  warning: "#d17b0f",
  disabled: "#bdb6aa",
  inputBackground: "#ffffff",
  inputBorder: "#d8d2c2",
  inputText: "#122c34",
  inputPlaceholder: "#8d978f",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
} as const;

export const typography = {
  title: {
    fontSize: 30,
    fontWeight: "800" as const,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
} as const;
