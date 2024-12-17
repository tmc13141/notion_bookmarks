// src/components/LinkCard.tsx
import Image from 'next/image';
import { Link } from '@/types/notion';

interface LinkCardProps {
  link: Link;
  className?: string;
}

// 获取图标URL的辅助函数
function getIconUrl(link: Link): string {
  if (link.iconfile) {
    return link.iconfile;
  }
  if (link.iconlink) {
    return link.iconlink;
  }
  return 'public/vercel.svg'; // 确保你在public目录下有一个默认图标
}

export default function LinkCard({ link, className }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        block group relative overflow-hidden
        p-4 rounded-lg border border-gray-200
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-1
        hover:border-blue-200
        bg-white dark:bg-gray-800
        dark:border-gray-700 dark:hover:border-blue-500
        ${className || ''}
      `}
    >
      {/* 内容容器 */}
      <div className="flex flex-col gap-3">
        {/* 图标和名称行 */}
        <div className="flex items-center gap-3">
          {/* 图标容器 */}
          <div className="relative w-8 h-8 rounded-md overflow-hidden 
                        group-hover:ring-2 ring-blue-400 transition-all">
            <Image
              src={getIconUrl(link)}
              alt="Site Icon"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          
          {/* 网站名称 */}
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200
                         group-hover:text-blue-600 dark:group-hover:text-blue-400
                         transition-colors">
            {link.name}
          </h3>
        </div>

        {/* 标签行 */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {link.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full
                         bg-gray-100 text-gray-600
                         dark:bg-gray-700 dark:text-gray-300
                         group-hover:bg-blue-100 group-hover:text-blue-700
                         dark:group-hover:bg-blue-900 dark:group-hover:text-blue-200
                         transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 描述行 */}
        {link.desc && (
          <p className="text-sm text-gray-600 dark:text-gray-400
                       group-hover:text-gray-800 dark:group-hover:text-gray-200
                       line-clamp-2 transition-colors">
            {link.desc}
          </p>
        )}
      </div>

      {/* 渐变悬浮效果 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent to-transparent
                    group-hover:from-blue-50/50 group-hover:to-indigo-50/50
                    dark:group-hover:from-blue-900/20 dark:group-hover:to-indigo-900/20
                    transition-colors duration-500" />
    </a>
  );
}