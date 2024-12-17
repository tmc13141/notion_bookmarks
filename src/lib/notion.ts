import { Client } from "@notionhq/client";
import { Link,WebsiteConfig }from "@/types/notion";
import { cache } from "react";

export const notion = new Client({
    auth: process.env.NOTION_TOKEN
});

// 获取网址链接
export const getLinks = cache(async ()=> {
    try{
        const response = await notion.databases.query({
            database_id: process.env.NOTION_LINKS_DB_ID!,
            sorts: [
                {
                  property: 'Created',
                  direction: 'descending',
                },
              ],
        });
    
        return response.results.map(page => {
            const properties = page.properties;
            
            return {
              id: page.id,
              name:properties.Name?.title[0].plain_text || '',
              created: properties.Created?.created_time || '',
              tags: properties.Tags?.multi_select?.map(tag => tag.name) || [],
              url: properties.URL?.url || '',
              category1: properties.category1?.select?.name || '',
              category2: properties.category2?.select?.name || '',
              desc: properties.desc?.rich_text[0]?.plain_text || '',
              iconfile: properties.iconfile?.files[0]?.file?.url || '',
              iconlink: properties.iconlink?.url || '',
            } as Link;
        });
    }catch (error){
        console.error('Failed to fetch links:', error);
        throw new Error('Failed to fetch links from Notion');
    }
});

// 获取网站配置
export const getWebsiteConfig = cache(async () => {
    try{
        const response = await notion.databases.query({
            database_id: process.env.NOTION_WEBSITE_CONFIG_ID!,
        });

        // 添加一些调试日志
        // console.log('Notion API 返回的原始数据：', JSON.stringify(response.results, null, 2));

        const configMap: WebsiteConfig = {};

        response.results.forEach((page: any) => {
            const name = page.properties.Name.title[0]?.plain_text || '';
            const value = page.properties.Value.rich_text[0]?.plain_text || '';

            // 添加调试日志
            // console.log(`处理配置项: ${name}, 值: ${value}`);
      
            // 只有当配置项名称存在时才添加到配置对象中
            if (name) {
                // console.log(name.toUpperCase(),value);
                configMap[name.toUpperCase()] = value;
            }
        });
        
        // 添加调试日志
        //  console.log('转换后的配置映射：', configMap);

         // 为没有设置的配置项提供默认值
         return {
            ...configMap,
            APPEARANCE: !configMap.APPEARANCE ? 'auto' : configMap.APPEARANCE,
            REVALIDATE: !configMap.REVALIDATE ? '120' : configMap.REVALIDATE,
            LINK_CATEGORY_LEVELS: !configMap.LINK_CATEGORY_LEVELS ? 'category1,category2' : configMap.LINK_CATEGORY_LEVELS,
            LINK_PROPERTY_TITLE: !configMap.LINK_PROPERTY_TITLE ? 'Name' : configMap.LINK_PROPERTY_TITLE,
            LINK_PROPERTY_URL: !configMap.LINK_PROPERTY_URL ? 'URL' : configMap.LINK_PROPERTY_URL,
            LINK_PROPERTY_ICON_URL: !configMap.LINK_PROPERTY_ICON_URL ? 'iconlink' : configMap.LINK_PROPERTY_ICON_URL,
            LINK_PROPERTY_ICON_FILE: !configMap.LINK_PROPERTY_ICON_FILE ? 'iconfile' : configMap.LINK_PROPERTY_ICON_FILE,
          } as WebsiteConfig;
    }catch (error){
        console.error('获取网站配置失败:', error);
        throw new Error('获取网站配置失败');
    }
  });