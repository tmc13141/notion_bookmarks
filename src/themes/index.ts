import { type ThemeConfig } from '@/types/theme';

// 导入所有主题配置
import { simpleTheme } from './simple';
import { cyberpunkTheme } from './cyberpunk';

// 所有可用主题的映射
export const themes: Record<string, ThemeConfig> = {
  simple: simpleTheme,
  cyberpunk: cyberpunkTheme,
};

// 默认主题配置
export const defaultTheme = simpleTheme;

/**
 * 获取主题配置
 * @param themeName 主题名称
 * @returns 主题配置
 */
export function getTheme(themeName: string): ThemeConfig | undefined {
  return themes[themeName];
}

/**
 * 获取所有可用主题
 * @returns 所有主题的配置
 */
export function getAllThemes(): ThemeConfig[] {
  return Object.values(themes);
}

/**
 * 注册新主题
 * @param theme 主题配置
 */
export function registerTheme(theme: ThemeConfig): void {
  if (!theme.name) {
    console.error('主题必须有一个名称');
    return;
  }
  
  themes[theme.name] = theme;
  
  // 如果在浏览器环境中，触发主题变化事件以更新样式
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('themeChange'));
  }
}

/**
 * 获取主题的模式列表
 * @param themeName 主题名称
 * @returns 主题支持的模式列表
 */
export function getThemeModes(themeName: string): string[] {
  const theme = getTheme(themeName);
  return theme ? theme.modes : [];
}

/**
 * 获取主题的显示名称
 * @param themeName 主题名称
 * @returns 主题的显示名称
 */
export function getThemeDisplayName(themeName: string): string {
  const theme = getTheme(themeName);
  return theme ? theme.displayName : themeName;
}