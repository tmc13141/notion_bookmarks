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

// 空气质量级别对应的中文名称
const aqiCategoryMap: Record<string, string> = {
  'Good': '优',
  'Moderate': '良',
  'Unhealthy for Sensitive Groups': '轻度污染',
  'Unhealthy': '中度污染',
  'Very Unhealthy': '重度污染',
  'Hazardous': '严重污染',
  'Excellent': '优'
};

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
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [currentCity, setCurrentCity] = useState(defaultCity);
  const [savedCity, setSavedCity] = useState<string | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // 客户端渲染时设置portal容器并获取保存的城市
  useEffect(() => {
    setPortalContainer(document.body);
    
    // 从localStorage获取保存的城市
    const storedCity = localStorage.getItem('weatherCity');
    if (storedCity) {
      setSavedCity(storedCity);
      setCurrentCity(storedCity);
    }
  }, []);

  // 关键修复：修改点击外部关闭菜单的逻辑
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 如果菜单没有显示，不处理
      if (!showCitySelector) return;
      
      // 检查点击是否在菜单外部，且不是在按钮上
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCitySelector(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCitySelector]);

  // 获取天气数据
  const fetchWeatherData = async (city = currentCity) => {
    setLoading(true);
    setError(null);
    
    // 如果是自动获取位置，设置刷新标志
    if (city === 'auto') {
      setIsRefreshing(true);
    }
    
    try {
      // 尝试获取用户位置
      let location = city;
      let locationSource = '自定义城市';
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      if (city === 'auto') {
        // 优先使用保存的城市
        if (savedCity) {
          location = savedCity;
          locationSource = '记忆城市';
        } else {
          location = defaultCity;
          locationSource = '默认城市';
          
          try {
            if (navigator.geolocation) {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 10000,
                  maximumAge: 600000 // 10分钟缓存
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
                locationSource = '位置服务';
              } else {
                throw new Error('位置解析失败');
              }
            }
          } catch (geoError) {
            console.log('地理位置获取失败，尝试IP定位', geoError);
            
            // 尝试IP定位
            try {
              const ipResponse = await fetch('/api/weather/ip');
              
              if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                console.log('IP定位返回数据:', ipData); // 添加日志以便调试
                
                if (ipData.location && ipData.location !== '未知位置') {
                  location = ipData.location;
                  locationSource = 'IP定位';
                  // 如果IP定位返回了经纬度，保存下来
                  if (ipData.latitude && ipData.longitude) {
                    latitude = ipData.latitude;
                    longitude = ipData.longitude;
                    console.log(`成功获取IP定位的经纬度: ${latitude}, ${longitude}`);
                  }
                } else if (ipData.error) {
                  console.warn('IP定位返回错误:', ipData.error);
                  throw new Error(ipData.error);
                } else {
                  throw new Error('IP定位未返回有效位置');
                }
              } else {
                throw new Error(`IP服务请求失败: ${ipResponse.status}`);
              }
            } catch (ipError) {
              console.log('IP定位失败，使用默认城市', ipError);
              // 使用默认城市
            }
          }
        }
      } else {
        // 如果是手动选择的城市，保存到localStorage
        if (city !== 'auto' && city !== defaultCity) {
          localStorage.setItem('weatherCity', city);
          setSavedCity(city);
        }
      }
      
      console.log(`使用${locationSource}获取天气: ${location}`);
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
      // 修复：使用城市名称获取空气质量
      if (location) {
        try {
          console.log(`尝试获取城市 ${location} 的空气质量数据`);
          
          // 如果有经纬度，优先使用经纬度，否则使用城市名
          let airUrl = latitude && longitude
            ? `/api/weather/air?lat=${latitude}&lon=${longitude}&city=${encodeURIComponent(location)}`
            : `/api/weather/air?city=${encodeURIComponent(location)}`;
          
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
              
              console.log('空气质量数据获取成功:', airData.aqi, airData.category);
            } else {
              console.warn('空气质量数据返回错误:', airData.error);
            }
          } else {
            console.warn('空气质量数据请求失败:', airResponse.status);
          }
        } catch (airError) {
          console.warn('获取空气质量数据出错:', airError);
          // 空气质量获取失败不影响天气显示
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

  useEffect(() => {
    fetchWeatherData('auto');
    
    // 每30分钟更新一次天气数据
    const intervalId = setInterval(() => fetchWeatherData('auto'), 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [defaultCity]);

  // 处理城市选择
  const handleCitySelect = () => {
    if (customCity.trim()) {
      fetchWeatherData(customCity.trim());
    }
  };

  // 重新获取位置
  const handleRefreshLocation = () => {
    fetchWeatherData('auto');
  };

  // 切换城市选择器显示状态
  const toggleCitySelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCitySelector(!showCitySelector);
  };

  // 获取空气质量的中文描述
  const getAqiCategoryChineseName = (category?: string) => {
    if (!category) return '良好';
    return aqiCategoryMap[category] || category;
  };

  // 加载状态
  if (loading && !isRefreshing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="weather-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[220px] h-[150px] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">获取天气信息...</p>
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
        className="weather-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[220px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
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

  // 辅助函数：渲染城市选择器弹窗
  function renderCitySelector() {
    if (!showCitySelector || !portalContainer) return null;

    // 计算弹窗位置
    const position = buttonRef.current?.getBoundingClientRect() || { left: 0, bottom: 0 };
    
    return createPortal(
      <div 
        ref={menuRef}
        className="fixed bg-card border border-border/40 rounded-md shadow-md z-[100] p-2 w-48"
        style={{
          left: position.left,
          top: position.bottom + 5,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-2">
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
                localStorage.removeItem('weatherCity');
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
                className="flex-1 text-xs p-1 border border-border/40 rounded bg-background/80 focus:outline-none focus:ring-1 focus:ring-primary"
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
                className="ml-1 p-1 text-xs bg-primary text-primary-foreground rounded focus:outline-none transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
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
  }
  
  // 正常显示天气
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="weather-widget p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm text-card-foreground w-[220px] h-[150px] flex flex-col justify-between relative overflow-hidden group"
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