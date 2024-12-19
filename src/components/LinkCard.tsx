'use client';

import Image from 'next/image';
import { Link } from '@/types/notion';
import { motion } from 'framer-motion';
import { IconExternalLink } from '@tabler/icons-react';

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
  return '/next.svg'; // Next.js 会自动从 public 目录加载
}

export default function LinkCard({ link, className }: LinkCardProps) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        block group relative overflow-hidden
        p-6 rounded-xl border border-border/50
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-primary/5
        bg-card/50 backdrop-blur-sm
        h-[180px]
        ${className || ''}
      `}
    >
      {/* 内容容器 */}
      <div className="flex flex-col gap-3 h-full">
        {/* 图标和名称行 */}
        <div className="flex items-center gap-3">
          {/* 图标容器 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative w-10 h-10 rounded-xl overflow-hidden transition-all shrink-0
                     bg-muted/50 p-1.5 border border-border/50"
          >
            <Image
              src={getIconUrl(link)}
              alt="Site Icon"
              fill
              className="object-contain"
              sizes="40px"
            />
          </motion.div>
          
          {/* 网站名称 */}
          <div className="flex-1 flex items-center justify-between gap-2">
            <h3 className="text-lg font-medium text-foreground/90
                         group-hover:text-primary
                         transition-colors line-clamp-1">
              {link.name}
            </h3>
            <IconExternalLink 
              className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
            />
          </div>
        </div>

        {/* 描述行 */}
        {link.desc && (
          <p className="text-sm text-muted-foreground
                       group-hover:text-foreground/80
                       line-clamp-2 transition-colors">
            {link.desc}
          </p>
        )}

        {/* 标签行 - 放在底部 */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {link.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-md
                         bg-muted/50 text-muted-foreground
                         group-hover:bg-primary/10 group-hover:text-primary
                         transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 渐变悬浮效果 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-transparent
                    group-hover:from-primary/5 group-hover:via-primary/2 group-hover:to-transparent
                    transition-colors duration-500" />
    </motion.a>
  );
}