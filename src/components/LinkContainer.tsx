// src/components/LinkContainer.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import LinkCard from "./LinkCard";
import * as Icons from "lucide-react";
import type { Link, Category } from '@/types/notion'; 

interface LinkContainerProps {
  initialLinks: Link[];
  enabledCategories: Set<string>;
  categories: Category[];
}

export default function LinkContainer({
  initialLinks,
  enabledCategories,
  categories,
}: LinkContainerProps) {
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
      {categories.map((category) => {
        const categoryLinks = linksByCategory[category.name];
        if (!categoryLinks) return null;

        return (
          <section key={category.id} id={category.id} className="space-y-8">
            <div className="flex items-center space-x-3 pb-2 border-b">
              {category.iconName &&
              Icons[category.iconName as keyof typeof Icons] ? (
                <div className="w-7 h-7 p-1 rounded-lg bg-primary/5 text-primary">
                  {React.createElement(
                    Icons[
                      category.iconName as keyof typeof Icons
                    ] as React.ComponentType<{ className: string }>,
                    { className: "w-5 h-5" }
                  )}
                </div>
              ) : null}
              <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
            </div>

            <div className="space-y-12">
              {Object.entries(categoryLinks).map(([subCategory, links]) => (
                <div
                  key={`${category.id}-${subCategory
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  id={`${category.id}-${subCategory
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    <h3 className="text-lg font-medium text-foreground/90">
                      {subCategory}
                    </h3>
                    <div className="text-sm text-muted-foreground">({links.length})</div>
                  </div>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {links.map((link) => (
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
