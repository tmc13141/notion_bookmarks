'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AnalogClock() {
  // Initialize with null to avoid hydration mismatch
  const [time, setTime] = useState(null);

  useEffect(() => {
    // Set initial time only on client side
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't render clock hands until client-side time is available
  if (!time) {
    return (
      <div className="analog-clock-widget p-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm mx-auto">
        <div className="clock-face relative w-[150px] h-[150px] rounded-full border border-border/50 bg-background/80 mx-auto">
          {/* Static clock face without hands */}
        </div>
      </div>
    );
  }

  // 计算指针角度
  const secondsDegrees = (time.getSeconds() / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="analog-clock-widget p-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm mx-auto"
    >
      <div className="clock-face relative w-[150px] h-[150px] rounded-full border border-border/50 bg-background/80 mx-auto">
        {/* 时钟刻度 - 调整为外侧刻度 */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="clock-marker absolute bg-foreground/80"
            style={{
              height: i % 3 === 0 ? '10px' : '5px', // 主要刻度更长
              width: i % 3 === 0 ? '2px' : '1px', // 主要刻度更粗
              left: '50%',
              top: '2px', // 移到更靠近边缘
              transformOrigin: '50% 73px', // 调整旋转中心点
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
            }}
          />
        ))}
        
        {/* 时钟数字 - 放置在刻度内侧更远的位置 */}
        {[...Array(12)].map((_, i) => {
          const number = i === 0 ? 12 : i;
          const angle = i * 30;
          const radian = (angle - 90) * (Math.PI / 180);
          const radius = 48; // 更靠近中心
          
          // 计算数字的位置
          const x = radius * Math.cos(radian);
          const y = radius * Math.sin(radian);
          
          return (
            <div
              key={`number-${i}`}
              className="absolute text-xs font-medium text-foreground/90"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10, // 确保数字在最上层
              }}
            >
              {number}
            </div>
          );
        })}
        
        {/* 时针 */}
        <div
          className="clock-hour-hand absolute w-1.5 h-[40px] bg-foreground rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${hoursDegrees}deg)`,
          }}
        />

        {/* 分针 */}
        <div
          className="clock-minute-hand absolute w-1 h-[55px] bg-foreground rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${minutesDegrees}deg)`,
          }}
        />

        {/* 秒针 */}
        <div
          className="clock-second-hand absolute w-0.5 h-[65px] bg-primary rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${secondsDegrees}deg)`,
          }}
        />

        {/* 中心点 */}
        <div className="clock-center absolute w-3 h-3 bg-primary rounded-full" style={{ left: 'calc(50% - 6px)', top: 'calc(50% - 6px)' }} />
      </div>
    </motion.div>
  );
}