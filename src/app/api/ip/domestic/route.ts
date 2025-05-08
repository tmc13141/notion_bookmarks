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
    console.error('本地开发环境检测到保留IP地址，使用备用IP:', ip);
  } else {
    console.error('用户IP地址:', ip);
  }

  // 使用 PC Online 的免费 IP 查询服务
  try {
    console.error('尝试获取IP信息...');
    const response = await fetch(`https://whois.pconline.com.cn/ipJson.jsp?ip=${encodeURIComponent(ip)}&json=true`, { 
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`服务响应错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 转换数据并返回
    const result = {
      ip: data.ip || ip,
      location: data.city ? `${data.city}${data.pro ? ', ' + data.pro : ''}` : '未知位置',
      country: '中国',
      region: data.pro || '未知地区'
    };
    
    console.error('成功获取IP信息:', result);
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('获取IP信息失败:', error);
    return NextResponse.json(
      { 
        error: `IP定位失败: ${(error as Error)?.message || '服务不可用'}`,
        ip: ip, 
        location: '未知位置' 
      },
      { status: 500 }
    );
  }
}