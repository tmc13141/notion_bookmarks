'use client';

import { useState, useEffect } from 'react';
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

  const fetchIPData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ip', { 
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || '服务暂时不可用');
        return;
      }
      
      setIpData(data);
    } catch {
      setError('网络连接失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPData();
    const intervalId = setInterval(fetchIPData, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !ipData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[200px] h-[150px] flex items-center justify-center"
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
        className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[200px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
      >
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-medium text-destructive">获取失败</h3>
        </div>
        
        <div className="mt-2 relative z-10">
          <p className="text-sm text-muted-foreground break-words overflow-hidden line-clamp-3">{error}</p>
          <button 
            onClick={fetchIPData} 
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
      className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[200px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-medium flex items-center gap-1 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
            <path d="M18 12a2 2 0 0 0 0 4h2v-4h-2z"/>
          </svg>
          IP信息
          <button 
            onClick={fetchIPData} 
            className="ml-auto text-xs p-1 rounded-full hover:bg-primary/10 focus:outline-none transition-colors"
            title="刷新IP信息"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
        </h3>
        
        <div className="space-y-3">
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-10">国内:</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{ipData?.domestic.ip}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <span className="inline-block w-10">位置:</span>
              <span className="truncate max-w-[120px]">{ipData?.domestic.location}</span>
            </div>
          </div>
          
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-10">海外:</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{ipData?.overseas.ip}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <span className="inline-block w-10">位置:</span>
              <span className="truncate max-w-[120px]">{ipData?.overseas.location}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}