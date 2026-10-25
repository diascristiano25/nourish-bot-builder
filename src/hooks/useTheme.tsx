// Re-export from the canonical theme-provider to ensure a single React context
// Previously this file had its own ThemeProvider + useTheme creating a SECOND context
// that was never provided by App.tsx, causing "useTheme must be used within a ThemeProvider" crash
export { useTheme, ThemeProvider } from '@/components/theme-provider';