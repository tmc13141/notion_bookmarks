'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  tempMin: number;
  tempMax: number;
  // 添加空气质量相关字段
  aqi?: number;
  aqiDisplay?: string;
  aqiLevel?: string;
  aqiCategory?: string;
  aqiColor?: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  };
  primaryPollutant?: {
    code: string;
    name: string;
    fullName?: string;
  };
}

interface WeatherProps {
  defaultCity?: string;
}

// 空气质量级别对应的中文名称 - 直接在AqiCategory类型中定义，不需要映射
// const aqiCategoryMap: Record<string, string> = {
//   'Good': '优',
//   'Moderate': '良',
//   'Unhealthy for Sensitive Groups': '轻度污染',
//   'Unhealthy': '中度污染',
//   'Very Unhealthy': '重度污染',
//   'Hazardous': '严重污染',
//   'Excellent': '优'
// };

// 添加空气质量类型定义
type AqiCategory = '优' | '良' | '轻度污染' | '中度污染' | '重度污染' | '严重污染';

const airQualityStyles: Record<AqiCategory, string> = {
  '优': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  '良': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  '轻度污染': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
  '中度污染': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  '重度污染': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  '严重污染': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
};

export default function Weather({ defaultCity = '杭州' }: WeatherProps) {
  // 1. 首先声明所有的状态 Hooks
  const [mounted, setMounted] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [currentCity, setCurrentCity] = useState(defaultCity);
  const [savedCity, setSavedCity] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // 添加suppressHydrationWarning属性到组件根元素

  // 2. 声明所有的 refs
  const cityInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 3. 声明所有的 effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. Set up portal container
    setPortalContainer(document.body);

    // 2. Determine city and fetch data (确保只在客户端执行localStorage)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const cityFromStorage = localStorage.getItem('weatherCity');
      if (cityFromStorage) {
        setSavedCity(cityFromStorage);
        setCurrentCity(cityFromStorage);
        fetchWeatherData(cityFromStorage); // Use stored city
      } else {
        fetchWeatherData('auto'); // Geolocate
      }
    } else {
      // 服务器端渲染时使用默认城市
      fetchWeatherData('auto');
    }

    // 3. Set up interval for updates
    const intervalId = setInterval(() => {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const latestCity = localStorage.getItem('weatherCity');
        if (latestCity) {
          fetchWeatherData(latestCity);
        } else {
          fetchWeatherData('auto');
        }
      } else {
        fetchWeatherData('auto');
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [mounted, defaultCity]);

  // 添加点击外部关闭弹窗的功能
  useEffect(() => {
    if (!mounted || !showCitySelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCitySelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mounted, showCitySelector]);

  // 4. 声明所有的处理函数
  const fetchWeatherData = async (city: string, saveToStorage = false) => {
    if (!mounted) return;
    
    setLoading(true);
    setError(null);
    
    // 如果是自动获取位置，设置刷新标志
    if (city === 'auto') {
      setIsRefreshing(true);
    }
    
    try {
      // 尝试获取用户位置
      let location = city;
      // locationSource变量在此代码中不再使用，移除以避免警告
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (city === 'auto') {
        location = defaultCity;
        try {
          // 确保只在客户端执行浏览器API
          if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.geolocation) {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 600000, // 10分钟缓存
              });
            });

            // 使用经纬度获取城市信息
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            const geoResponse = await fetch(`/api/weather/geo?lat=${latitude}&lon=${longitude}`);

            if (!geoResponse.ok) throw new Error('无法获取位置信息');

            const geoData = await geoResponse.json();
            if (geoData.location && geoData.location !== '未知位置') {
              location = geoData.location;
            }
          }

          // 如果浏览器定位失败，尝试使用 IP 定位
          if (location === defaultCity) {
            const ipResponse = await fetch('/api/weather/ip');

            if (ipResponse.ok) {
              const ipData = await ipResponse.json();

              if (ipData.location && ipData.location !== '未知位置') {
                location = ipData.location;
                // 如果IP定位返回了经纬度，保存下来
                if (ipData.latitude && ipData.longitude) {
                  latitude = ipData.latitude;
                  longitude = ipData.longitude;
                }
              }
            }
          }
        } catch (error) {
          console.error('位置获取失败:', error);
          // 使用默认城市
          location = defaultCity;
        }
      }

      // 如果是手动选择的城市，保存到localStorage（确保只在客户端执行）
      if (saveToStorage && city !== 'auto' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('weatherCity', city);
        setSavedCity(city);
        location = city;
      }
      
      setCurrentCity(location);
      
      // 获取天气数据
      const weatherResponse = await fetch(`/api/weather?city=${encodeURIComponent(location)}`);
      
      if (!weatherResponse.ok) {
        const status = weatherResponse.status;
        if (status === 404) {
          throw new Error(`找不到城市 ${location} 的天气数据`);
        } else {
          throw new Error(`天气数据获取失败 - HTTP状态码: ${status}`);
        }
      }
      
      const data = await weatherResponse.json();
      
      // 检查API返回的错误信息
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 创建天气数据对象
      const weatherDataObj: WeatherData = {
        location: data.location || location,
        temperature: data.temp,
        condition: data.text,
        icon: data.icon,
        tempMin: data.tempMin,
        tempMax: data.tempMax
      };
      
      // 如果有经纬度，尝试获取空气质量数据
      if (location) {
        try {
          // 如果有经纬度，优先使用经纬度，否则只使用城市名
          const airUrl = latitude && longitude
            ? `/api/weather/air?lat=${latitude}&lon=${longitude}`
            : `/api/weather/air?location=${encodeURIComponent(location)}`;
          
          const airResponse = await fetch(airUrl);
          
          if (airResponse.ok) {
            const airData = await airResponse.json();
            
            if (!airData.error) {
              // 添加空气质量数据
              weatherDataObj.aqi = airData.aqi;
              weatherDataObj.aqiDisplay = airData.aqiDisplay;
              weatherDataObj.aqiLevel = airData.level;
              weatherDataObj.aqiCategory = airData.category;
              weatherDataObj.aqiColor = airData.color;
              weatherDataObj.primaryPollutant = airData.primaryPollutant;
            }
            // 空气质量数据获取失败时静默处理，不在客户端显示错误
          }
        } catch (error) {
          // 空气质量获取失败不影响天气显示，静默处理
          console.debug('空气质量数据获取失败:', error);
        }
      }
      
      setWeatherData(weatherDataObj);
    } catch (err) {
      console.error('获取天气数据失败:', err);
      // 显示更友好的错误信息给用户
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      if (city !== 'auto') {
        // 只有在手动输入城市时才关闭选择器
        setShowCitySelector(false);
        setCustomCity('');
      }
    }
  };

  const handleCitySelect = () => {
    if (customCity.trim()) {
      fetchWeatherData(customCity.trim(), true);
    }
  };

  const handleRefreshLocation = () => {
    fetchWeatherData('auto');
  };

  const toggleCitySelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCitySelector(!showCitySelector);
  };

  // 移除未使用的函数
  // const getAqiCategoryChineseName = (category?: string) => {
  //   if (!category) return '良好';
  //   return aqiCategoryMap[category] || category;
  // };

  // 5. 渲染城市选择器
  const renderCitySelector = () => {
    if (!mounted || !showCitySelector || !portalContainer) return null;

    // 确保只在客户端渲染
    if (typeof window === 'undefined') return null;

    // 计算弹窗位置
    const position = buttonRef.current?.getBoundingClientRect() || { left: 0, bottom: 0 };
    
    return createPortal(
      <div 
        ref={menuRef}
        className="fixed bg-card border border-border/40 rounded-md shadow-md z-[100] p-2 w-48"
        style={{
          left: position.left,
          top: position.bottom + 5,
          position: 'absolute', // 改为绝对定位，这样会随页面滚动
        }}
        onClick={(e) => e.stopPropagation()}
        suppressHydrationWarning
      >
        {/* 添加关闭按钮 */}
        <button 
          onClick={() => setShowCitySelector(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
          aria-label="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="flex flex-col space-y-2 mt-2 pr-4">
          <button 
            onClick={handleRefreshLocation}
            className="text-xs text-left px-2 py-1.5 hover:bg-primary/10 rounded-sm flex items-center gap-2 transition-colors"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                </div>
                <span>正在获取位置...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                重新获取位置
              </>
            )}
          </button>
          
          {savedCity && (
            <button 
              onClick={() => {
                if (typeof localStorage !== 'undefined') {
                  localStorage.removeItem('weatherCity');
                }
                setSavedCity(null);
                fetchWeatherData('auto');
                setShowCitySelector(false);
              }}
              className="text-xs text-left px-2 py-1.5 hover:bg-primary/10 rounded-sm flex items-center gap-2 transition-colors text-destructive"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              清除记忆城市
            </button>
          )}
          
          <div className="border-t border-border/40 my-1"></div>
          
          <div className="flex flex-col space-y-1">
            <div className="text-xs text-muted-foreground px-2">手动输入城市</div>
            <div className="flex items-center px-2">
              <input
                ref={cityInputRef}
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="输入城市名称"
                className="w-24 text-xs p-1 border border-border/40 rounded bg-background/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ color: 'var(--foreground)' }} /* 使用CSS变量确保在所有主题下文字颜色正确 */
                suppressHydrationWarning /* 抑制水合错误警告 */
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCitySelect();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCitySelect();
                }}
                className="ml-1 px-3 h-7 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center whitespace-nowrap"
                disabled={!customCity.trim()}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>,
      portalContainer
    );
  };

  // 6. 条件渲染
  if (!mounted) {
    return (
      <div 
        className="widget-card weather-widget p-4 bg-card/80 backdrop-blur-sm text-card-foreground w-[220px] h-[150px] flex flex-col justify-between relative overflow-hidden group animate-fade-in"
        suppressHydrationWarning
      >
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (loading && !isRefreshing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="widget-card weather-widget p-4 bg-card/80 backdrop-blur-sm text-card-foreground w-[220px] h-[150px] flex items-center justify-center"
        suppressHydrationWarning
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">获取天气信息...</p>
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
        className="widget-card weather-widget p-4 bg-card/80 backdrop-blur-sm text-card-foreground w-[220px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
        suppressHydrationWarning
      >
        {/* 背景装饰 - 主题感知 */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-xl font-medium text-destructive">获取失败</h3>
            <p className="text-xs mt-1 text-muted-foreground">{currentCity}</p>
          </div>
          <div className="flex items-center space-x-1">
            <div className="relative">
              <button 
                ref={buttonRef}
                onClick={toggleCitySelector}
                className="text-xs p-1 rounded-full hover:bg-primary/10 focus:outline-none transition-colors"
                title="更改位置"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </button>
              {renderCitySelector()}
            </div>
            <div className="weather-icon">
              <span className="text-2xl text-destructive">⚠️</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 relative z-10">
          <p className="text-sm text-muted-foreground break-words overflow-hidden line-clamp-3">{error}</p>
          <button 
            onClick={() => fetchWeatherData('auto')} 
            className="mt-2 text-xs text-primary hover:underline focus:outline-none"
          >
            点击重试
          </button>
        </div>
      </motion.div>
    );
  }

  // 7. 主渲染
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="widget-card weather-widget p-4 bg-card/80 backdrop-blur-sm text-card-foreground w-[220px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
      suppressHydrationWarning
    >
      {/* 背景装饰 - 主题感知 */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-20"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{weatherData?.temperature}°</h3>
          <div className="text-sm text-muted-foreground flex items-center">
            {weatherData?.location}
            <div className="relative">
              <button 
                ref={buttonRef}
                onClick={toggleCitySelector}
                className="text-xs p-1 rounded-full hover:bg-primary/10 focus:outline-none transition-colors"
                title="更改位置"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </button>
              {renderCitySelector()}
            </div>
          </div>
        </div>
        <div className="weather-icon text-primary">
          {weatherData?.icon && (
            <i className={`qi-${weatherData.icon} text-3xl`}></i>
          )}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-sm text-foreground">{weatherData?.condition}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">{weatherData?.tempMin}° ~ {weatherData?.tempMax}°</p>
          
          {/* 改进空气质量显示 - 添加AQI数值 */}
          {weatherData?.aqi && (
            <div className="flex items-center gap-1">
              <div 
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  (weatherData.aqiCategory as AqiCategory) ? 
                  airQualityStyles[weatherData.aqiCategory as AqiCategory] : 
                  ''
                }`}
              >
                {weatherData.aqiCategory}
              </div>
              <span className="font-medium">{weatherData.aqi}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 添加和风天气图标的CSS */}
      <style jsx global>{`
        @font-face {
          font-family: 'qweather-icons';
          src: url('/fonts/qweather-icons.woff2') format('woff2'),
               url('/fonts/qweather-icons.woff') format('woff'),
               url('/fonts/qweather-icons.ttf') format('truetype');
          font-display: block;
        }
        
        /* 图标基础样式 */
        [class^="qi-"], [class*=" qi-"] {
          font-family: 'qweather-icons' !important;
          speak: none;
          font-style: normal;
          font-weight: normal;
          font-variant: normal;
          text-transform: none;
          line-height: 1;
        }
      `}</style>
    </motion.div>
  );
}