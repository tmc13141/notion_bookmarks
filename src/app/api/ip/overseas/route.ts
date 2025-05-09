import { NextRequest, NextResponse } from 'next/server';

interface ServiceError extends Error {
  message: string;
}

export async function GET() {
  try {
    const res = await fetch('https://ipinfo.io/json');
    const data = await res.json();
    return NextResponse.json({
      ip: data.ip || '',
      location: [data.country, data.region, data.city].filter(Boolean).join(' ')
    });
  } catch (error) {
    return NextResponse.json({ ip: '', location: '', error: '获取失败' }, { status: 500 });
  }
}