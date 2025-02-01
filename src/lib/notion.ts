import { Client } from "@notionhq/client";
import { 
    PageObjectResponse,
    TitlePropertyItemObjectResponse,
    RichTextPropertyItemObjectResponse,
    FilesPropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { WebsiteConfig } from "@/types/notion";
import { cache } from "react";

// 定义获取标题文本的辅助函数
const getTitleText = (titleProperty?: TitlePropertyItemObjectResponse | null): string => {
    if (!titleProperty?.title || !Array.isArray(titleProperty.title)) return '';
    return titleProperty.title[0]?.plain_text ?? '';
};

// 定义获取富文本内容的辅助函数
const getRichText = (richTextProperty?: RichTextPropertyItemObjectResponse | null): string => {
    if (!richTextProperty?.rich_text || !Array.isArray(richTextProperty.rich_text)) return '';
    return richTextProperty.rich_text[0]?.plain_text ?? '';
};

// 定义获取文件 URL 的辅助函数
export const getFileUrl = (fileProperty?: FilesPropertyItemObjectResponse | null): string => {
    if (!fileProperty?.files || !Array.isArray(fileProperty.files) || !fileProperty.files[0]) return '';
    const file = fileProperty.files[0];
    
    // 处理外部文件
    if (file.type === 'external' && file.external) {
        return file.external.url;
    }
    // 处理内部文件
    if (file.type === 'file' && file.file) {
        return file.file.url;
    }
    return '';
};

// 定义 Notion 数据库的属性结构
interface NotionProperties {
    Name: TitlePropertyItemObjectResponse;
    Value: RichTextPropertyItemObjectResponse;
}

type NotionPage = PageObjectResponse & {
    properties: NotionProperties;
}

import { envConfig } from '@/config';

export const notion = new Client({
    auth: envConfig.NOTION_TOKEN
});

// 添加获取图标URL的辅助函数
const getIconUrl = (page: any): string => {
    // 优先使用自定义图标链接
    if (page.properties.iconlink?.url) {
        return page.properties.iconlink.url;
    }
    
    // 其次使用上图标文件
    if (page.properties.iconfile?.files?.[0]) {
        const file = page.properties.iconfile.files[0];
        return file.type === 'external' ? file.external.url : file.file.url;
    }
    
    // 最后使用页面图标
    if (page.icon) {
        if (page.icon.type === 'emoji') {
            return page.icon.emoji;
        }
        if (page.icon.type === 'file') {
            return page.icon.file.url;
        }
        if (page.icon.type === 'external') {
            return page.icon.external.url;
        }
    }
    
    return ''; // 如果没有图标则返回空字符串
};

// 获取网址链接
export const getLinks = cache(async () => {
    const databaseId = envConfig.NOTION_LINKS_DB_ID!;
    
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    property: 'category1',
                    direction: 'ascending',
                },
                {
                    property: 'category2',
                    direction: 'ascending',
                },
            ],
        });

        const links = response.results.map((page: any) => ({
            id: page.id,
            name: page.properties.Name?.title[0]?.plain_text || '未命名',
            created: page.properties.Created?.created_time || '',
            desc: page.properties.desc?.rich_text[0]?.plain_text || '',
            url: page.properties.URL?.url || '#',
            category1: page.properties.category1?.select?.name || '未分类',
            category2: page.properties.category2?.select?.name || '默认',
            iconfile: page.properties.iconfile?.files?.[0]?.file?.url || '',
            iconlink: page.properties.iconlink?.url || '',
            tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
        }));

        // 对链接进行排序：先按是否置顶，再按创建时间
        links.sort((a, b) => {
            // 检查是否包含"力荐👍"标签
            const aIsTop = a.tags.includes('力荐👍');
            const bIsTop = b.tags.includes('力荐👍');
            
            // 如果置顶状态不同，置顶的排在前面
            if (aIsTop !== bIsTop) {
                return aIsTop ? -1 : 1;
            }
            
            // 如果置顶状态相同，按创建时间逆序排序
            return new Date(b.created).getTime() - new Date(a.created).getTime();
        });

        return links;
    } catch (error) {
        console.error('Error fetching links:', error);
        return [];
    }
});

// 获取网站配置
export const getWebsiteConfig = cache(async () => {
    try {
        const response = await notion.databases.query({
            database_id: envConfig.NOTION_WEBSITE_CONFIG_ID!,
        });

        const configMap: WebsiteConfig = {};

        response.results.forEach((page) => {
            const typedPage = page as NotionPage;
            const properties = typedPage.properties;
            
            // 使用辅助函数获取文本
            const name = getTitleText(properties.Name);
            const value = getRichText(properties.Value);

            if (name) {
                configMap[name.toUpperCase()] = value;
            }
        });

        // 获取配置数据库页面的图标作为网站图标
        const database = await notion.databases.retrieve({
            database_id: envConfig.NOTION_WEBSITE_CONFIG_ID!
        }) as any;
        let favicon = '/favicon.ico';

        if (database.icon) {
            if (database.icon.type === 'emoji') {
                // 如果是 emoji，生成 data URL
                favicon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${database.icon.emoji}</text></svg>`;
            } else if (database.icon.type === 'file') {
                favicon = database.icon.file.url;
            } else if (database.icon.type === 'external') {
                favicon = database.icon.external.url;
            }
        }

        // 返回基础配置
        // 将配置对象转换为 WebsiteConfig 类型
        const config: WebsiteConfig = {
            // 基础配置
            SITE_TITLE: configMap.SITE_TITLE ?? '我的导航',
            SITE_DESCRIPTION: configMap.SITE_DESCRIPTION ?? '个人导航网站',
            SITE_KEYWORDS: configMap.SITE_KEYWORDS ?? '导航,网址导航',
            SITE_AUTHOR: configMap.SITE_AUTHOR ?? '',
            SITE_FOOTER: configMap.SITE_FOOTER ?? '',
            SITE_FAVICON: favicon,
            // 主题配置
            // APPEARANCE: configMap.APPEARANCE ?? 'auto',

            // 社交媒体配置
            SOCIAL_GITHUB: configMap.SOCIAL_GITHUB ?? '',
            SOCIAL_BLOG: configMap.SOCIAL_BLOG ?? '',
            SOCIAL_X: configMap.SOCIAL_X ?? '',
            SOCIAL_JIKE: configMap.SOCIAL_JIKE ?? '',
            SOCIAL_WEIBO: configMap.SOCIAL_WEIBO ?? '',
            // 分析和统计
            CLARITY_ID: configMap.CLARITY_ID ?? '',
            GA_ID: configMap.GA_ID ?? '',
            // 缓存配置
            
        };

        return config;
    } catch (error) {
        console.error('获取网站配置失败:', error);
        throw new Error('获取网站配置失败');
    }
});

export const getCategories = cache(async () => {
  const databaseId = envConfig.NOTION_CATEGORIES_DB_ID;
  
  if (!databaseId) {
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Enabled',
        checkbox: {
          equals: true
        }
      },
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    });

    const categories = response.results.map((page: any) => ({
      id: page.id,
      name: getTitleText(page.properties.Name),
      iconName: getRichText(page.properties.IconName),
      order: page.properties.Order?.number || 0,
      enabled: page.properties.Enabled?.checkbox || false,
    }));

    return categories.sort((a, b) => a.order - b.order);
  } catch (error) {
    return [];
  }
});