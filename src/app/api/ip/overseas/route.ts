import { NextRequest, NextResponse } from 'next/server';

interface ServiceError extends Error {
  message: string;
}

export async function GET(req: NextRequest) {
  // 获取用户的真实IP地址
  let ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
           req.headers.get('x-real-ip') || 
           '未知IP';
  
  // 检查是否是本地开发环境中的保留IP地址
  const isReservedIP = ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '未知IP';
  
  // 如果是本地开发环境，使用备用公共IP进行测试
  if (isReservedIP && process.env.NODE_ENV === 'development') {
    // 使用一个公共IP作为开发环境中的备用方案（这里使用了谷歌的IP作为示例）
    ip = '8.8.8.8';
    console.error('本地开发环境检测到保留IP地址，使用备用IP:', ip);
  } else {
    console.error('用户IP地址:', ip);
  }

  // 尝试多个IP定位服务，提高可靠性
  const services = [
    {
      name: 'ipinfo.io',
      url: `https://ipinfo.io/${encodeURIComponent(ip)}/json`,
      transform: (data: any) => ({
        ip: data.ip || ip,
        location: data.city ? `${data.city}${data.region ? ', ' + data.region : ''}` : '未知位置',
        country: data.country || '未知国家',
        region: data.region || '未知地区',
        latitude: data.loc ? Number(data.loc.split(',')[0]) : null,
        longitude: data.loc ? Number(data.loc.split(',')[1]) : null
      })
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,query,lat,lon&lang=zh-CN`,
      transform: (data: any) => ({
        ip: data.query || ip,
        location: data.city ? `${data.city}${data.regionName ? ', ' + data.regionName : ''}` : '未知位置',
        country: data.country || '未知国家',
        region: data.regionName || '未知地区',
        latitude: data.lat,
        longitude: data.lon
      })
    }
  ];

  let lastError: ServiceError | null = null;

  // 依次尝试每个服务
  for (const service of services) {
    try {
      console.error(`尝试使用 ${service.name} 获取IP信息...`);
      const response = await fetch(service.url, { 
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        const statusText = response.statusText || '未知错误';
        throw new Error(`${service.name} 服务响应错误: ${response.status} ${statusText}`);
      }
      
      const data = await response.json();
      
      // 检查API特定的错误
      if (service.name === 'ip-api.com' && data.status === 'fail') {
        throw new Error(`${service.name} 返回错误: ${data.message}`);
      }
      
      // 转换数据并返回
      const result = service.transform(data);
      console.error(`成功使用 ${service.name} 获取IP信息:`, result);
      
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error(`使用 ${service.name} 获取IP信息失败:`, error);
      lastError = error as ServiceError;
      // 继续尝试下一个服务
    }
  }

  // 所有服务都失败了
  console.error('所有IP定位服务均失败');
  return NextResponse.json(
    { 
      error: `海外IP定位失败: ${lastError?.message || '所有服务均不可用'}`, 
      ip: ip, 
      location: '未知位置' 
    },
    { status: 500 }
  );
}