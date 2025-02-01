// links page config
export interface Link {
    id: string;
    name:string;
    created: string;
    tags: string[];
    url: string;
    category1: string;
    category2: string;
    desc?: string;
    iconfile?: string;
    iconlink?: string;
}

// 网站配置类型
export interface WebsiteConfig {
    [key: string]: string;
}

// 分类配置类型
export interface Category {
  id: string;
  name: string;
  iconName: string;
  order: number;
  enabled: boolean;
  subCategories?: {
    id: string;
    name: string;
  }[];
}