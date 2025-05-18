import { NextRequest, NextResponse } from 'next/server';

// 定义错误类型接口
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
    ip = '8.8.8.8';
  }

  // 尝试多个IP定位服务，提高可靠性
  const services = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      transform: (data: any) => ({
        ip: data.ip || ip,
        location: data.city ? `${data.city}` : '未知位置',
        country: data.country_name || '未知国家'
      })
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,query&lang=zh-CN`,
      transform: (data: any) => ({
        ip: data.query || ip,
        location: data.city || '未知位置',
        country: data.country || '未知国家'
      })
    }
  ];

  let lastError: ServiceError | null = null;

  // 依次尝试每个服务
  for (const service of services) {
    try {
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
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      lastError = error as ServiceError;
    }
  }

  // 所有服务都失败了
  console.error('IP定位接口异常:', lastError);
  return NextResponse.json(
    { 
      error: `IP定位失败: ${lastError?.message || '所有服务均不可用'}`, 
      location: '未知位置' 
    },
    { status: 500 }
  );
}