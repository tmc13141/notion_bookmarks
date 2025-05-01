import { NextRequest, NextResponse } from 'next/server';

interface ServiceError extends Error {
  message: string;
}

interface IPInfo {
  ip: string;
  location: string;
}

interface IPResult {
  domestic: IPInfo;
  overseas: IPInfo;
}

export async function GET(req: NextRequest) {
  // 获取用户的真实IP地址
  let ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
           req.headers.get('x-real-ip') || 
           '未知IP';
  
  // 检查是否是本地开发环境中的保留IP地址
  const isReservedIP = ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || 
                      ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '未知IP';
  
  // 如果是本地开发环境，使用备用公共IP进行测试
  if (isReservedIP && process.env.NODE_ENV === 'development') {
    ip = '8.8.8.8';
    console.log('本地开发环境检测到保留IP地址，使用备用IP:', ip);
  }

  const services = {
    domestic: [
      {
        name: 'ip-api.com',
        url: `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,query&lang=zh-CN`,
        transform: (data: any): IPInfo => ({
          ip: data.query,
          location: data.city ? `${data.city}${data.regionName ? ', ' + data.regionName : ''}` : '未知位置'
        }),
        validate: (data: any) => data.status === 'success'
      },
      {
        name: 'pconline',
        url: `https://whois.pconline.com.cn/ipJson.jsp?ip=${encodeURIComponent(ip)}&json=true`,
        transform: (data: any): IPInfo => ({
          ip: data.ip,
          location: data.city ? `${data.city}${data.pro ? ', ' + data.pro : ''}` : '未知位置'
        }),
        validate: (data: any) => data.ip && (data.city || data.pro)
      }
    ],
    overseas: [
      {
        name: 'ipapi.co',
        url: 'https://ipapi.co/json/',
        transform: (data: any): IPInfo => ({
          ip: data.ip,
          location: data.city ? `${data.city}${data.region ? ', ' + data.region : ''}` : '未知位置'
        }),
        validate: (data: any) => data.ip && data.city
      },
      {
        name: 'ip-api.com',
        url: `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,query`,
        transform: (data: any): IPInfo => ({
          ip: data.query,
          location: data.city ? `${data.city}${data.region ? ', ' + data.region : ''}` : '未知位置'
        }),
        validate: (data: any) => data.status === 'success'
      }
    ]
  };

  const result: IPResult = {
    domestic: {
      ip: '未知IP',
      location: '未知位置'
    },
    overseas: {
      ip: '未知IP',
      location: '未知位置'
    }
  };

  try {
    // 并行查询所有服务
    const [domesticResults, overseasResults] = await Promise.all([
      Promise.allSettled(
        services.domestic.map(service => 
          fetch(service.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })
          .then(res => res.json())
          .then(data => {
            if (service.validate(data)) {
              return service.transform(data);
            }
            throw new Error(`${service.name} 返回的数据无效`);
          })
        )
      ),
      Promise.allSettled(
        services.overseas.map(service =>
          fetch(service.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })
          .then(res => res.json())
          .then(data => {
            if (service.validate(data)) {
              return service.transform(data);
            }
            throw new Error(`${service.name} 返回的数据无效`);
          })
        )
      )
    ]);

    // 处理国内IP结果
    const domesticSuccess = domesticResults.find(result => result.status === 'fulfilled');
    if (domesticSuccess && domesticSuccess.status === 'fulfilled') {
      result.domestic = domesticSuccess.value;
    }

    // 处理海外IP结果
    const overseasSuccess = overseasResults.find(result => result.status === 'fulfilled');
    if (overseasSuccess && overseasSuccess.status === 'fulfilled') {
      result.overseas = overseasSuccess.value;
    }

    // 如果所有服务都失败了
    if (!domesticSuccess && !overseasSuccess) {
      return NextResponse.json(
        { error: '所有IP查询服务均不可用' },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('IP查询失败:', error);
    return NextResponse.json(
      { error: '服务暂时不可用' },
      { status: 503 }
    );
  }
} 