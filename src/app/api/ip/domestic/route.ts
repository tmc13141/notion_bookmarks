import { NextRequest, NextResponse } from 'next/server';
import iconv from 'iconv-lite';
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

  // 使用 PC Online 的免费 IP 查询服务
  try {
    const res = await fetch('https://whois.pconline.com.cn/ipJson.jsp?json=true');
    const buffer = await res.arrayBuffer();
    const text = iconv.decode(Buffer.from(buffer), 'gb2312');
    const data = JSON.parse(text);
    return NextResponse.json({
      ip: data.ip || '',
      location: [data.pro, data.city].filter(Boolean).join(' ')
    });
  } catch (error) {
    console.error('IP接口异常:', error);
    return NextResponse.json({ ip: '', location: '', error: '获取失败' }, { status: 500 });
  }
}