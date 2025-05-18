'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface IPData {
  ip: string;
  location: string;
}

// 将 WebRTC 相关函数移到组件外部
const getLocalIP = () => {
  return new Promise<string>((resolve, reject) => {
    const RTCPeerConnection = window.RTCPeerConnection || 
      (window as any).webkitRTCPeerConnection || 
      (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      reject(new Error('WebRTC not supported'));
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.createDataChannel('');
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(err => {
        pc.close();
        reject(err);
      });

    let foundIP = false;
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        return;
      }

      const candidate = ice.candidate.candidate;
      const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
      if (match) {
        const ip = match[1];
        const ipParts = ip.split('.');
        const isValidIP = ipParts.length === 4 && 
          ipParts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255;
          });

        if (isValidIP && !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
          foundIP = true;
          pc.onicecandidate = null;
          pc.close();
          resolve(ip);
        }
      }
    };

    setTimeout(() => {
      if (!foundIP) {
        pc.onicecandidate = null;
        pc.close();
        reject(new Error('获取本地IP超时'));
      }
    }, 5000);
  });
};

export default function IPInfo() {
  const [currentIP, setCurrentIP] = useState<IPData>({ ip: '获取中...', location: '获取中...' });
  const [proxyIP, setProxyIP] = useState<IPData>({ ip: '获取中...', location: '获取中...' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchIPInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取本地IP
        const localIP = await getLocalIP();
        
        // 获取本地IP的位置信息
        const currentLocationResponse = await fetch(`https://ipapi.co/${localIP}/json/`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!currentLocationResponse.ok) {
          throw new Error('获取位置信息失败');
        }
        
        const currentLocationData = await currentLocationResponse.json();

        if (mounted) {
          setCurrentIP({
            ip: localIP,
            location: currentLocationData.country_name && currentLocationData.city 
              ? `${currentLocationData.city}, ${currentLocationData.country_name}`
              : '未知位置'
          });
        }

        // 获取代理IP
        const proxyResponse = await fetch('https://api.ipify.org?format=json', {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!proxyResponse.ok) {
          throw new Error('获取代理IP失败');
        }
        
        const proxyData = await proxyResponse.json();
        
        if (!proxyData.ip) {
          throw new Error('无法获取代理IP');
        }

        // 获取代理IP的位置信息
        const proxyLocationResponse = await fetch(`https://ipapi.co/${proxyData.ip}/json/`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!proxyLocationResponse.ok) {
          throw new Error('获取代理位置信息失败');
        }
        
        const proxyLocationData = await proxyLocationResponse.json();

        if (mounted) {
          setProxyIP({
            ip: proxyData.ip,
            location: proxyLocationData.country_name && proxyLocationData.city 
              ? `${proxyLocationData.city}, ${proxyLocationData.country_name}`
              : '未知位置'
          });
        }

      } catch (error) {
        if (mounted) {
          console.error('Failed to fetch IP info:', error);
          setError(error instanceof Error ? error.message : '获取IP信息失败，请稍后重试');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchIPInfo();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // 重新触发 useEffect
    setCurrentIP({ ip: '获取中...', location: '获取中...' });
    setProxyIP({ ip: '获取中...', location: '获取中...' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="widget-card ip-info-widget p-4 bg-card/80 backdrop-blur-sm text-card-foreground w-[220px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
      
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">获取IP信息...</p>
        </div>
      ) : error ? (
        <>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-xl font-medium text-destructive">获取失败</h3>
            </div>
            <div className="flex items-center space-x-1">
              <div className="weather-icon">
                <span className="text-2xl text-destructive">⚠️</span>
              </div>
            </div>
          </div>
          
          <div className="mt-2 relative z-10">
            <p className="text-sm text-muted-foreground break-words overflow-hidden line-clamp-3">{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 text-xs text-primary hover:underline focus:outline-none"
            >
              点击重试
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center space-x-1">
              <div className="weather-icon text-primary">
                <i className="qi-location text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">当前IP</p>
                <p className="text-sm font-medium">{currentIP.ip}</p>
                <p className="text-xs text-muted-foreground">{currentIP.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">代理IP</p>
                <p className="text-sm font-medium">{proxyIP.ip}</p>
                <p className="text-xs text-muted-foreground">{proxyIP.location}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}