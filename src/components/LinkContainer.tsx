// src/components/LinkContainer.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LinkCard from './LinkCard';
import * as Icons from 'lucide-react'

interface Link {
  id: string;
  name: string;
  desc: string;
  url: string;
  category1: string;
  category2: string;
  iconfile?: string;
  iconlink?: string;
  tags: string[];
}

interface LinkContainerProps {
  initialLinks: Link[];
  enabledCategories: Set<string>;
  categories: { 
    id: string; 
    name: string;
    iconName?: string;
  }[];
}

export default function LinkContainer({ initialLinks, enabledCategories, categories }: LinkContainerProps) {
  // 按一级和二级分类组织链接，只包含启用的分类
  const linksByCategory = initialLinks.reduce((acc, link) => {
    const cat1 = link.category1;
    const cat2 = link.category2;
    
    if (enabledCategories.has(cat1)) {
      if (!acc[cat1]) {
        acc[cat1] = {};
      }
      if (!acc[cat1][cat2]) {
        acc[cat1][cat2] = [];
      }
      acc[cat1][cat2].push(link);
    }
    return acc;
  }, {} as Record<string, Record<string, Link[]>>);

  return (
    <div className="space-y-16">
      {categories.map(category => {
        const categoryLinks = linksByCategory[category.name];
        if (!categoryLinks) return null;

        return (
          <section 
            key={category.id}
            id={category.id}
            className="space-y-8"
          >
            <div className="flex items-center space-x-2">
              {category.iconName && Icons[category.iconName as keyof typeof Icons] ? (
                <div className="w-6 h-6">
                  {React.createElement(Icons[category.iconName as keyof typeof Icons])}
                </div>
              ) : null}
              <h2 className="text-2xl font-bold">{category.name}</h2>
            </div>

            <div className="space-y-12">
              {Object.entries(categoryLinks).map(([subCategory, links]) => (
                <div 
                  key={`${category.id}-${subCategory.toLowerCase().replace(/\s+/g, '-')}`}
                  id={`${category.id}-${subCategory.toLowerCase().replace(/\s+/g, '-')}`}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-4 text-muted-foreground">{subCategory}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {links.map(link => (
                      <LinkCard key={link.id} link={link} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}