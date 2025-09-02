import { colors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
}

export const lightTheme: Theme = {
  colors: colors.light,
  typography,
  spacing,
  borderRadius,
};

export const darkTheme: Theme = {
  colors: colors.dark,
  typography,
  spacing,
  borderRadius,
};

export { colors, typography, spacing, borderRadius };