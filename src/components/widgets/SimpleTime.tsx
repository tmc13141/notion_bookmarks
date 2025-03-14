'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Lunar from 'lunar-javascript';

export default function SimpleTime() {
  // 使用固定的初始时间，避免服务端和客户端渲染不一致
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date('2023-01-01T00:00:00'));
  const [lunarDate, setLunarDate] = useState('');
  
  // 使用 ref 存储当前日期，避免无限循环
  const dateRef = useRef({
    day: 0,
    month: 0,
    year: 0
  });

  // 农历日期转换函数
  function getLunarDate(date: Date): string {
    try {
      // 使用 lunar-javascript 库计算农历日期
      const { Solar } = Lunar;
      const lunar = Solar.fromDate(date).getLunar();
      return `农历 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    } catch (error) {
      console.error('Error calculating lunar date:', error);
      return '农历日期获取失败';
    }
  }

  useEffect(() => {
    // 客户端挂载后，设置为当前时间并开始计时
    setMounted(true);
    const now = new Date();
    setTime(now);
    setLunarDate(getLunarDate(now));
    
    // 初始化日期引用
    dateRef.current = {
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear()
    };
    
    const timer = setInterval(() => {
      const currentTime = new Date();
      setTime(currentTime);
      
      // 只在日期变化时更新农历日期，避免不必要的计算
      if (currentTime.getDate() !== dateRef.current.day || 
          currentTime.getMonth() !== dateRef.current.month || 
          currentTime.getFullYear() !== dateRef.current.year) {
        
        // 更新引用中存储的日期
        dateRef.current = {
          day: currentTime.getDate(),
          month: currentTime.getMonth(),
          year: currentTime.getFullYear()
        };
        
        setLunarDate(getLunarDate(currentTime));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 依赖数组为空，只在组件挂载时执行一次

  // 日期格式化
  const year = time.getFullYear();
  const month = (time.getMonth() + 1).toString().padStart(2, '0');
  const day = time.getDate().toString().padStart(2, '0');
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  // 获取星期几
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[time.getDay()];

  // 如果未挂载，返回加载状态
  if (!mounted) {
    return (
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="simple-time-widget p-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm max-w-[200px]">
          <div className="flex items-center justify-between gap-2">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary leading-none">--</div>
            </div>
            <div className="flex flex-col items-start">
              <div className="text-sm font-medium">加载中...</div>
              <div className="text-xs">----年--月</div>
              <div className="text-xs text-muted-foreground">农历 --月--</div>
            </div>
          </div>
          <div className="mt-2 text-center text-lg font-medium">--:--:--</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="simple-time-widget p-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm max-w-[200px]"
      >
        <div className="flex items-center justify-between gap-2">
          {/* 左侧日期数字 */}
          <div className="text-center">
            <div className="text-5xl font-bold text-primary leading-none">{day}</div>
          </div>
          
          {/* 右侧日期信息 */}
          <div className="flex flex-col items-start">
            <div className="text-sm font-medium">星期{weekDay}</div>
            <div className="text-xs">{year}年{month}月</div>
            <div className="text-xs text-muted-foreground">{lunarDate}</div>
          </div>
        </div>
        
        {/* 时间显示 */}
        <div className="mt-2 text-center text-lg font-medium">
          {hours}:{minutes}:{seconds}
        </div>
      </motion.div>
    </div>
  );
}