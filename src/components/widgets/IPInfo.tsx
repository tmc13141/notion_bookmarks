'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface IPData {
  ip: string;
  location: string;
  error?: string;
}

export default function IPInfo() {
  const [mounted, setMounted] = useState(false);
  const [ipData, setIpData] = useState<{
    current: IPData;
    proxy: IPData;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchIPData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 使用 ipinfo.io 获取当前 IP 信息
        const currentResponse = await fetch('https://ipinfo.io/json', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!currentResponse.ok) {
          throw new Error('获取当前IP信息失败');
        }
        const currentData = await currentResponse.json();
        
        const currentIP = {
          ip: currentData.ip || '',
          location: [currentData.city, currentData.region, currentData.country].filter(Boolean).join(' ') || '',
          error: currentData.error
        };

        // 使用我们的 API 获取代理 IP 信息
        const proxyResponse = await fetch('/api/ip/domestic', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!proxyResponse.ok) {
          throw new Error('获取代理IP信息失败');
        }
        const proxyData = await proxyResponse.json();

        // 确保数据正确映射
        setIpData({
          current: {
            ip: currentData.ip || '',
            location: [currentData.city, currentData.region, currentData.country].filter(Boolean).join(' ') || '',
            error: currentData.error
          },
          proxy: {
            ip: proxyData.ip || '',
            location: proxyData.location || '',
            error: proxyData.error
          }
        });
      } catch (err) {
        console.error('IP信息获取失败:', err);
        setError('IP信息获取失败');
      } finally {
        setLoading(false);
      }
    };

    fetchIPData();
  }, [mounted]);

  // 在客户端渲染之前显示加载状态
  if (!mounted) {
    return (
      <div className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[250px] h-[150px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[250px] h-[150px] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">获取IP信息...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !ipData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[250px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
      >
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-medium text-destructive">获取失败</h3>
        </div>
        <div className="mt-2 relative z-10">
          <p className="text-sm text-muted-foreground break-words overflow-hidden line-clamp-3">{error || '无法获取IP信息'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-xs text-primary hover:underline focus:outline-none"
          >
            点击重试
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[250px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
      <div className="relative z-10 space-y-3 text-xs">
        <div>
          <h3 className="text-xs font-medium mb-1">当前IP</h3>
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-14">IP地址:</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{ipData.current.ip || '未知'}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground break-all whitespace-pre-line text-[11px] leading-snug">
              <span className="inline-block w-14">归属地:</span>
              <span className="truncate max-w-[120px]">{ipData.current.location || '未知'}</span>
            </div>
            {ipData.current.error && <div className="text-destructive text-xs">{ipData.current.error}</div>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-medium mb-1">代理IP</h3>
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-14">IP地址:</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{ipData.proxy.ip || '未知'}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground break-all whitespace-pre-line text-[11px] leading-snug">
              <span className="inline-block w-14">归属地:</span>
              <span className="truncate max-w-[120px]">{ipData.proxy.location || '未知'}</span>
            </div>
            {ipData.proxy.error && <div className="text-destructive text-xs">{ipData.proxy.error}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}