import { Client } from "@notionhq/client";
import { 
    PageObjectResponse,
    TitlePropertyItemObjectResponse,
    CreatedTimePropertyItemObjectResponse,
    MultiSelectPropertyItemObjectResponse,
    UrlPropertyItemObjectResponse,
    SelectPropertyItemObjectResponse,
    RichTextPropertyItemObjectResponse,
    FilesPropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { Link, WebsiteConfig } from "@/types/notion";
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
const getFileUrl = (fileProperty?: FilesPropertyItemObjectResponse | null): string => {
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
    Created: CreatedTimePropertyItemObjectResponse;
    Tags: MultiSelectPropertyItemObjectResponse;
    URL: UrlPropertyItemObjectResponse;
    category1: SelectPropertyItemObjectResponse;
    category2: SelectPropertyItemObjectResponse;
    desc: RichTextPropertyItemObjectResponse;
    iconfile: FilesPropertyItemObjectResponse;
    iconlink: UrlPropertyItemObjectResponse;
}

type NotionPage = PageObjectResponse & {
    properties: NotionProperties;
}

export const notion = new Client({
    auth: process.env.NOTION_TOKEN
});

// 添加获取图标URL的辅助函数
const getIconUrl = (page: any): string => {
    // 优先使用自定义图标链接
    if (page.properties.iconlink?.url) {
        return page.properties.iconlink.url;
    }
    
    // 其次使用上�����图标文件
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
    const databaseId = process.env.NOTION_LINKS_DB_ID!;
    
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    property: 'category1',
                    direction: 'ascending',
                },
            ],
        });

        return response.results.map((page: any) => ({
            id: page.id,
            name: page.properties.Name?.title[0]?.plain_text || '未命名',
            desc: page.properties.desc?.rich_text[0]?.plain_text || '',
            url: page.properties.URL?.url || '#',
            category1: page.properties.category1?.select?.name || '未分类',
            category2: page.properties.category2?.select?.name || '默认',
            iconfile: page.properties.iconfile?.files?.[0]?.file?.url || '',
            iconlink: page.properties.iconlink?.url || '',
            tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
        }));
    } catch (error) {
        console.error('Error fetching links:', error);
        return [];
    }
});

// 获取网站配置
export const getWebsiteConfig = cache(async () => {
    try {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_WEBSITE_CONFIG_ID!,
        });

        const configMap: WebsiteConfig = {};

        response.results.forEach((page) => {
            const typedPage = page as NotionPage;
            const properties = typedPage.properties;
            
            // 使用辅助函数获取文本
            const name = getTitleText(properties.Name);
            const value = getRichText(properties.desc);

            if (name) {
                configMap[name.toUpperCase()] = value;
            }
        });

        return {
            ...configMap,
            APPEARANCE: configMap.APPEARANCE ?? 'auto',
            REVALIDATE: configMap.REVALIDATE ?? '120',
            LINK_CATEGORY_LEVELS: configMap.LINK_CATEGORY_LEVELS ?? 'category1,category2',
            LINK_PROPERTY_TITLE: configMap.LINK_PROPERTY_TITLE ?? 'Name',
            LINK_PROPERTY_URL: configMap.LINK_PROPERTY_URL ?? 'URL',
            LINK_PROPERTY_ICON_URL: configMap.LINK_PROPERTY_ICON_URL ?? 'iconlink',
            LINK_PROPERTY_ICON_FILE: configMap.LINK_PROPERTY_ICON_FILE ?? 'iconfile',
        } as WebsiteConfig;
    } catch (error) {
        console.error('获取网站配置失败:', error);
        throw new Error('获取网站配置失败');
    }
});

export const getCategories = cache(async () => {
  const databaseId = process.env.NOTION_CATEGORIES_DB_ID;
  
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