export type ThemeVariant = "cyberpunk" | "office" | "cozy" | "brutal";
export type ColorMode = "dark" | "light";

export interface ThemeConfig {
  variant: ThemeVariant;
  mode: ColorMode;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  variant: "cyberpunk",
  mode: "dark",
};
