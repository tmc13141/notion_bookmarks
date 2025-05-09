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

export async function GET() {
  try {
    const res = await fetch('https://api.ipcheck.ing/', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('ipcheck.ing 服务响应错误');
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'IP信息获取失败', detail: (error as Error).message }, { status: 500 });
  }
} 