// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/types/notion';
import LinkCard from '@/components/LinkCard';
import Sidebar from '@/components/Sidebar';
import { organizeCategories } from '@/lib/category';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>();

  // 获取数据
  useEffect(() => {
    async function fetchLinks() {
      try {
        const response = await fetch('/api/links');
        if (!response.ok) {
          throw new Error('获取数据失败');
        }
        const data = await response.json();
        setLinks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, []);

  // 处理加载状态
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">加载中...</p>
    </div>;
  }

  // 处理错误状态
  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-red-500">错误: {error}</p>
    </div>;
  }

  // 组织分类数据
  const categories = organizeCategories(links);

  // 过滤链接
  const filteredLinks = links.filter(link => {
    if (selectedCategory === 'all') return true;
    if (!selectedSubCategory) return link.category1 === selectedCategory;
    return link.category1 === selectedCategory && link.category2 === selectedSubCategory;
  });

  // 处理分类选择
  const handleCategorySelect = (category: string, subCategory?: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 原有的主要内容 */}
          <div className="flex gap-8">
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}