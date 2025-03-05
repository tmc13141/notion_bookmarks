'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { IconPalette } from '@tabler/icons-react';
import { getAllThemes, getThemeDisplayName } from '@/themes';
import { ThemeConfig } from '@/types/theme';

interface ThemeSwitcherProps {
  className?: string;
}

// 获取所有可用主题
const allThemes = getAllThemes();

// 构建主题选项列表
const themeOptions = allThemes.flatMap((theme: ThemeConfig) => 
  theme.modes.map(mode => ({
    id: `${theme.name}-${mode}`,
    name: `${theme.name}-${mode}`,
    displayName: `${getThemeDisplayName(theme.name)}${theme.modes.length > 1 ? (mode === 'light' ? '浅色' : '深色') : ''}`
  }))
);

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 避免水合不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        buttonRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`relative ${className || ''}`}>
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground
                  transition-colors"
        aria-label="切换主题"
      >
        <IconPalette className="w-5 h-5" />
      </motion.button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 py-2 bg-popover border rounded-lg shadow-lg z-[200]"
          onClick={(e) => e.stopPropagation()}
        >
          {themeOptions.map((themeOption) => (
            <button
              key={themeOption.id}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors
                        ${theme === themeOption.name
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              onClick={() => {
                setTheme(themeOption.name);
                setIsOpen(false);
              }}
            >
              {themeOption.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}