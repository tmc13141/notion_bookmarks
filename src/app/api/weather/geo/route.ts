import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  if (!lat || !lon) {
    return NextResponse.json(
      { error: '缺少经纬度参数' },
      { status: 400 }
    );
  }
  
  try {
    // 使用和风天气API的地理位置查询服务
    const apiKey = process.env.QWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('未配置和风天气API密钥');
    }
    
    const response = await fetch(
      `https://geoapi.qweather.com/v2/city/lookup?location=${lon},${lat}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('地理位置API请求失败');
    }
    
    const data = await response.json();
    
    if (data.code !== '200' || !data.location || data.location.length === 0) {
      return NextResponse.json(
        { location: '未知位置' },
        { status: 200 }
      );
    }
    
    // 返回城市名称
    return NextResponse.json(
      { location: data.location[0].name },
      { status: 200 }
    );
  } catch (error) {
    console.error('地理位置解析失败:', error);
    return NextResponse.json(
      { error: '地理位置解析失败', location: '未知位置' },
      { status: 500 }
    );
  }
}