"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"
import { themes, getTheme } from "@/themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // 应用主题样式的函数
  const applyThemeStyles = React.useCallback(() => {
    // 确保在客户端环境下执行
    if (typeof window === 'undefined') return;
    
    // 为每个主题生成CSS变量
    Object.entries(themes).forEach(([themeName, themeConfig]) => {
      // 处理每个模式（light/dark）
      themeConfig.modes.forEach(mode => {
        const themeStyles = themeConfig.styles[mode];
        if (!themeStyles) return;
        
        // 创建或获取样式元素
        const styleId = `theme-${themeName}-${mode}`;
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;
        
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = styleId;
          document.head.appendChild(styleEl);
        }
        
        // 生成CSS变量
        const cssVars = Object.entries(themeStyles)
          .map(([key, value]) => {
            // 处理HSL颜色值，确保正确应用
            if (typeof value === 'string' && value.startsWith('hsl(')) {
              // 提取HSL值中的参数，用于Tailwind兼容性
              const hslParams = value.replace('hsl(', '').replace(')', '');
              // 对于颜色类变量，同时生成两种格式：一种是原始HSL函数格式，一种是Tailwind兼容的参数格式
              return `--${key}: ${value};\n  --${key}-hsl: ${hslParams};`;
            }
            return `--${key}: ${value};`;
          })
          .join('\n');
        
        // 设置样式内容
        const themeSelectorValue = `${themeName}-${mode}`;
        styleEl.textContent = `
          :root[data-theme="${themeSelectorValue}"] {
            ${cssVars}
            color-scheme: ${mode};
          }
        `;
      });
    });
  }, []);

  // 在组件挂载时应用样式
  React.useEffect(() => {
    applyThemeStyles();
    
    // 监听主题变化事件
    const handleThemeChange = () => {
      requestAnimationFrame(() => {
        applyThemeStyles();
      });
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, [applyThemeStyles]);

  // 处理主题变化的函数
  const handleThemeChange = React.useCallback((theme: string) => {
    if (typeof window === 'undefined') return;

    // 如果主题名称不包含模式（如 'simple' 而不是 'simple-light'）
    if (!theme.includes('-')) {
      const themeConfig = getTheme(theme);
      if (themeConfig) {
        // 如果主题只有一种模式，直接使用该模式
        if (themeConfig.modes.length === 1) {
          const mode = themeConfig.modes[0];
          const fullTheme = `${theme}-${mode}`;
          document.documentElement.setAttribute('data-theme', fullTheme);
          return;
        }
        // 如果主题支持多种模式，使用系统模式
        const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const mode = themeConfig.modes.includes(systemMode) ? systemMode : themeConfig.modes[0];
        const fullTheme = `${theme}-${mode}`;
        document.documentElement.setAttribute('data-theme', fullTheme);
        return;
      }
    }

    document.documentElement.setAttribute('data-theme', theme);
    // 触发主题变化事件
    window.dispatchEvent(new Event('themeChange'));
    // 确保样式被正确应用
    requestAnimationFrame(() => {
      applyThemeStyles();
    });
  }, [applyThemeStyles]);
  
  return (
    <NextThemesProvider 
      {...props} 
      attribute="data-theme"
      onThemeChange={handleThemeChange}
    >
      {children}
    </NextThemesProvider>
  );
}