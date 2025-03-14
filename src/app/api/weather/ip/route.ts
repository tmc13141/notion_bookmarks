import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 使用免费的IP定位服务
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('IP定位服务请求失败');
    }
    
    const data = await response.json();
    
    // 返回城市名称
    return NextResponse.json(
      { location: data.city || '未知位置' },
      { status: 200 }
    );
  } catch (error) {
    console.error('IP定位失败:', error);
    return NextResponse.json(
      { error: 'IP定位失败', location: '未知位置' },
      { status: 500 }
    );
  }
}