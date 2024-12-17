import { getLinks,getWebsiteConfig } from "@/lib/notion";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const links = await getLinks();
        const config = await getWebsiteConfig();
        
        return NextResponse.json({
          links: links,
          config: config
        })
      } catch (error) {
        console.error('API 测试错误:', error);
        return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
      }
}