'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'
import * as Icons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  iconName?: string
  subCategories: {
    id: string
    name: string
  }[]
}

interface NavigationProps {
  categories: Category[]
}

export default function Navigation({ categories }: NavigationProps) {
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  // 处理导航点击
  const handleNavClick = (categoryId: string, subCategoryId?: string) => {
    setActiveCategory(categoryId);
    const elementId = subCategoryId ? `${categoryId}-${subCategoryId}` : categoryId;
    const element = document.getElementById(elementId);
    
    if (element) {
      // 获取元素的位置
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 滚动到元素位置，减去顶部导航栏的高度（根据实际高度调整）
      window.scrollTo({
        top: rect.top + scrollTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* 移动端顶部导航 */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-2">
            <Icons.Rocket className="w-5 h-5" />
            <span className="font-medium">超级个体工具箱</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="overflow-x-auto flex items-center h-12 border-t">
          <div className="flex space-x-2 px-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleNavClick(category.id)}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 text-sm rounded-full transition-colors",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 桌面端边导航 */}
      <nav className="hidden md:block w-64 h-screen sticky top-0 p-4 overflow-y-auto border-r">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Icons.Rocket className="w-5 h-5" />
            <span className="font-medium">超级个体工具箱</span>
          </div>
          <ThemeToggle />
        </div>
        <ul className="space-y-1">
          {categories.map((category) => {
            const IconComponent = category.iconName && (category.iconName in Icons)
              ? (Icons[category.iconName as keyof typeof Icons] as React.ComponentType)
              : Icons.Globe;

            return (
              <li key={category.id}>
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors",
                      expandedCategories.has(category.id)
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                    <Icons.ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        expandedCategories.has(category.id) ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {expandedCategories.has(category.id) && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {category.subCategories.map((subCategory) => (
                        <li key={subCategory.id}>
                          <button
                            onClick={() => handleNavClick(category.id, subCategory.id)}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg transition-colors text-sm",
                              activeCategory === `${category.id}-${subCategory.id}`
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            {subCategory.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        {/* 社交媒体链接 */}
        <div className="fixed bottom-8 left-8 flex space-x-4">
          <a
            href="https://github.com/moyuguy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="GitHub"
          >
            <Icons.Github className="w-5 h-5" />
          </a>
          <a
            href="https://ezho.top"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Blog"
          >
            <Icons.Newspaper className="w-5 h-5" />
          </a>
        </div>
      </nav>
    </>
  )
} 