'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface IPData {
  domestic: {
    ip: string;
    location: string;
    error?: string;
  };
  overseas: {
    ip: string;
    location: string;
    error?: string;
  };
}

export default function IPInfo() {
  const [ipData, setIpData] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      // 国内 IP 查询 - 使用我们的 API 端点
      fetch('/api/ip/domestic')
        .then(res => res.json())
        .then(data => ({
          ip: data.ip || '',
          location: data.location || '',
          error: data.error
        }))
        .catch(() => ({ ip: '', location: '', error: '获取失败' })),
      // 海外 IP 查询
      fetch('https://ipinfo.io/json')
        .then(res => res.json())
        .then(data => ({
          ip: data.ip || '',
          location: [data.city, data.region, data.country].filter(Boolean).join(' ') || '',
          error: data.error
        }))
        .catch(() => ({ ip: '', location: '', error: '获取失败' }))
    ]).then(([domestic, overseas]) => {
      setIpData({
        domestic,
        overseas
      });
      setLoading(false);
    }).catch(() => {
      setError('IP信息获取失败');
      setLoading(false);
    });
  }, []);

  if (loading && !ipData) {
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

  if (error) {
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
          <p className="text-sm text-muted-foreground break-words overflow-hidden line-clamp-3">{error}</p>
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
          <h3 className="text-xs font-medium mb-1">国内出口</h3>
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-14">IP地址:</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{ipData?.domestic.ip}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground break-all whitespace-pre-line text-[11px] leading-snug">
              <span className="inline-block w-14">归属地:</span>
              <span className="truncate max-w-[120px]">{ipData?.domestic.location}</span>
            </div>
            {ipData?.domestic.error && <div className="text-destructive text-xs">{ipData.domestic.error}</div>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-medium mb-1">海外出口</h3>
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-14">IP地址:</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{ipData?.overseas.ip}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground break-all whitespace-pre-line text-[11px] leading-snug">
              <span className="inline-block w-14">归属地:</span>
              <span className="truncate max-w-[120px]">{ipData?.overseas.location}</span>
            </div>
            {ipData?.overseas.error && <div className="text-destructive text-xs">{ipData.overseas.error}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}