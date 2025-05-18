import { NextRequest, NextResponse } from 'next/server';

// 定义错误类型接口
interface ServiceError extends Error {
  message: string;
}

interface IPInfo {
  ip: string;
  location: string;
}

// 检查是否是内网IP
function isPrivateIP(ip: string): boolean {
  return ip === '::1' || 
         ip === '127.0.0.1' || 
         ip === 'localhost' || 
         ip.startsWith('192.168.') || 
         ip.startsWith('10.') || 
         ip.startsWith('172.16.') ||
         ip.startsWith('172.17.') ||
         ip.startsWith('172.18.') ||
         ip.startsWith('172.19.') ||
         ip.startsWith('172.20.') ||
         ip.startsWith('172.21.') ||
         ip.startsWith('172.22.') ||
         ip.startsWith('172.23.') ||
         ip.startsWith('172.24.') ||
         ip.startsWith('172.25.') ||
         ip.startsWith('172.26.') ||
         ip.startsWith('172.27.') ||
         ip.startsWith('172.28.') ||
         ip.startsWith('172.29.') ||
         ip.startsWith('172.30.') ||
         ip.startsWith('172.31.');
}

async function tryChinaz(ip: string): Promise<IPInfo | null> {
  try {
    const response = await fetch(`https://ip.chinaz.com/getip.aspx?ip=${ip}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const text = await response.text();
    const jsonStr = text.replace(/^callback\((.*)\)$/, '$1');
    const data = JSON.parse(jsonStr);

    if (data.state === 1 && data.data) {
      return {
        ip: data.data.ip || ip,
        location: [data.data.province, data.data.city].filter(Boolean).join(' ')
      };
    }
  } catch (error) {
    console.error('Chinaz service failed:', error);
  }
  return null;
}

async function tryTaobao(ip: string): Promise<IPInfo | null> {
  try {
    const response = await fetch(`https://ip.taobao.com/outGetIpInfo?ip=${ip}&accessKey=alibaba-inc`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.data) {
      return {
        ip: data.data.ip,
        location: [data.data.country, data.data.region, data.data.city].filter(Boolean).join(' ')
      };
    }
  } catch (error) {
    console.error('Taobao service failed:', error);
  }
  return null;
}

async function tryUserAgentInfo(ip: string): Promise<IPInfo | null> {
  try {
    const response = await fetch(`https://ip.useragentinfo.com/json?ip=${ip}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.province) {
      return {
        ip: data.ip,
        location: [data.province, data.city, data.isp].filter(Boolean).join(' ')
      };
    }
  } catch (error) {
    console.error('UserAgentInfo service failed:', error);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    // 获取用户的真实IP地址
    let ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             '未知IP';

    // 检查是否是内网IP
    if (isPrivateIP(ip)) {
      if (process.env.NODE_ENV === 'development') {
        // 在开发环境中使用一个公共IP进行测试
        ip = '8.8.8.8';
      } else {
        // 在生产环境中返回内网IP信息
        return NextResponse.json({
          ip: ip,
          location: '内网IP'
        });
      }
    }

    // 尝试所有可用的服务
    const services = [
      tryChinaz,
      tryTaobao,
      tryUserAgentInfo
    ];

    for (const service of services) {
      const result = await service(ip);
      if (result) {
        return NextResponse.json(result);
      }
    }

    // 如果所有服务都失败，返回错误
    throw new Error('所有IP查询服务均失败');
  } catch (error) {
    console.error('IP查询失败:', error);
    return NextResponse.json({
      ip: '',
      location: '',
      error: '获取失败'
    }, { status: 500 });
  }
}