// Light-mode design tokens for Lejerli, shaped to mirror Chatbramp-app's
// contexts/ThemeContext.tsx AppColors (background/card/primary/text/
// textSecondary/border/statusBar), extended with the extra tokens this
// trading-desk UI needs (surfaceAlt, primaryMuted/Border for tinted
// accents, danger/success for status states).
//
// This file is the raw value source. Components should consume it through
// `useTheme()` (see contexts/ThemeContext.tsx) rather than importing this
// directly — the only legitimate direct imports are ThemeContext.tsx itself
// and the handful of call sites that render before ThemeProvider mounts
// (app/_layout.tsx's pre-font-load web background effect).
//
// The brand accent (#F26522) is unchanged from the original dark theme —
// it's the established Lejerli orange, recontextualized as `primary` here.

export type AppColors = {
  background: string;
  card: string;
  surfaceAlt: string;
  primary: string;
  primaryMuted: string;
  primaryBorder: string;
  text: string;
  textSecondary: string;
  border: string;
  danger: string;
  success: string;
  statusBar: 'dark-content' | 'light-content';
};

export const lightColors: AppColors = {
  background: '#FFFFFF',
  card: '#FAFAFA',
  surfaceAlt: '#F2F2F3',
  primary: '#F26522',
  primaryMuted: 'rgba(242, 101, 34, 0.12)',
  primaryBorder: 'rgba(242, 101, 34, 0.3)',
  text: '#0A0A0A',
  textSecondary: '#6B6B70',
  border: '#E5E5E7',
  danger: '#EF4444',
  success: '#10B981',
  statusBar: 'dark-content',
};

// Back-compat default export — same values, used only by the pre-mount
// call site mentioned above.
export default lightColors;
