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
    setLoading(true);
    setError(null);
    
    try {
      // 创建一个新的IPData对象
      const newIPData: IPData = {
        domestic: {
          ip: '获取中...',
          location: '获取中...'
        },
        overseas: {
          ip: '获取中...',
          location: '获取中...'
        }
      };
      
      // 并行获取国内和海外IP信息
      const [domesticResponse, overseasResponse] = await Promise.allSettled([
        fetch('/api/ip/domestic', { cache: 'no-store' }),
        fetch('/api/ip/overseas', { cache: 'no-store' })
      ]);
      
      // 处理国内IP响应
      if (domesticResponse.status === 'fulfilled' && domesticResponse.value.ok) {
        const domesticData = await domesticResponse.value.json();
        newIPData.domestic = {
          ip: domesticData.ip || '未知IP',
          location: domesticData.location || '未知位置'
        };
      } else {
        let errorMessage = '请求失败';
        if (domesticResponse.status === 'rejected') {
          errorMessage = domesticResponse.reason?.message || '网络请求失败';
        } else if (domesticResponse.status === 'fulfilled') {
          try {
            // 尝试从响应中获取错误信息
            const errorData = await domesticResponse.value.json();
            errorMessage = errorData.error || '服务响应错误';
          } catch (e) {
            errorMessage = `服务响应错误: ${domesticResponse.value.status}`;
          }
        }
        newIPData.domestic.error = errorMessage;
        console.error('获取国内IP失败:', errorMessage);
      }
      
      // 处理海外IP响应
      if (overseasResponse.status === 'fulfilled' && overseasResponse.value.ok) {
        const overseasData = await overseasResponse.value.json();
        newIPData.overseas = {
          ip: overseasData.ip || '未知IP',
          location: overseasData.location || '未知位置'
        };
      } else {
        let errorMessage = '请求失败';
        if (overseasResponse.status === 'rejected') {
          errorMessage = overseasResponse.reason?.message || '网络请求失败';
        } else if (overseasResponse.status === 'fulfilled') {
          try {
            // 尝试从响应中获取错误信息
            const errorData = await overseasResponse.value.json();
            errorMessage = errorData.error || '服务响应错误';
          } catch (e) {
            errorMessage = `服务响应错误: ${overseasResponse.value.status}`;
          }
        }
        newIPData.overseas.error = errorMessage;
        console.error('获取海外IP失败:', errorMessage);
      }
      
      setIpData(newIPData);
    } catch (err) {
      console.error('获取IP数据失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPData();
    
    // 每10分钟更新一次IP数据
    const intervalId = setInterval(fetchIPData, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 加载状态
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
  
  // 错误状态
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[200px] h-[150px] flex flex-col justify-between"
      >
        <div>
          <h3 className="text-xl font-medium text-destructive">获取失败</h3>
        </div>
        
        <div className="mt-2">
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
  
  // 正常显示IP信息
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ip-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[200px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
    >
      {/* 背景装饰 - 主题感知 */}
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
          {/* 国内IP信息 */}
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-10">国内:</span>
              {ipData?.domestic.error ? (
                <span className="text-destructive">获取失败</span>
              ) : (
                <span className="font-medium text-foreground">{ipData?.domestic.ip}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <span className="inline-block w-10">位置:</span>
              {ipData?.domestic.error ? (
                <span className="text-xs text-destructive/80" title={ipData?.domestic.error}>服务不可用</span>
              ) : (
                <span>{ipData?.domestic.location || '未知'}</span>
              )}
            </div>
          </div>
          
          {/* 海外IP信息 */}
          <div className="text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-10">海外:</span>
              {ipData?.overseas.error ? (
                <span className="text-destructive">获取失败</span>
              ) : (
                <span className="font-medium text-foreground">{ipData?.overseas.ip}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <span className="inline-block w-10">位置:</span>
              {ipData?.overseas.error ? (
                <span className="text-xs text-destructive/80" title={ipData?.overseas.error}>服务不可用</span>
              ) : (
                <span>{ipData?.overseas.location || '未知'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}