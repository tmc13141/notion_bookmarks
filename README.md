# Notion Bookmarks

[English](#english) | [中文](#chinese)

<div id="english">

# Notion Bookmarks

## Overview
A personal navigation website using Notion as the database backend. This project allows you to manage your bookmarks and navigation links through Notion databases while presenting them in a clean, modern web interface.

## Features
- Uses Notion as the database
- Clean and modern web interface
- Multi-level category navigation
- Responsive design for desktop and mobile

## Project Structure
The project utilizes three Notion databases:
1. **Website Configuration**: Stores basic website information and settings
2. **Navigation Links**: Stores all bookmark entries
3. **Category Configuration**: Manages navigation categories

## Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fnotion-navigation)

## Configuration
### Environment Variables
```env
NOTION_TOKEN=your_notion_integration_token
NOTION_LINKS_DB_ID=your_links_database_id
NOTION_WEBSITE_CONFIG_ID=your_website_config_database_id
NOTION_CATEGORIES_DB_ID=your_categories_database_id
CLARITY_ID=optional_clarity_tracking_id
GA_ID=optional_google_analytics_id
```

### Notion Database Setup
1. Create a new Notion integration at [Notion Developers](https://www.notion.so/my-integrations)
2. Create three databases in your Notion workspace:
   - Website Configuration
   - Navigation Links
   - Category Configuration
3. Share each database with your integration
4. Copy the database IDs and add them to your environment variables

</div>

<div id="chinese">

# Notion 导航站

## 项目概述
这是一个使用 Notion 作为数据库后端的个人导航网站项目。通过 Notion 数据库管理书签和导航链接，并以清晰现代的网页界面呈现。

## 特性
- 使用 Notion 作为数据库
- 清晰现代的网页界面
- 支持多级分类导航
- 响应式设计，支持桌面和移动端

## 项目结构
项目使用了三个 Notion 数据库：
1. **网站配置**：存储网站基本信息和设置
2. **导航链接**：存储所有书签条目
3. **分类配置**：管理导航分类

## 快速部署
[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fnotion-navigation)

## 配置说明
### 环境变量
```env
NOTION_TOKEN=你的_notion_集成密钥
NOTION_LINKS_DB_ID=你的_链接数据库_id
NOTION_WEBSITE_CONFIG_ID=你的_网站配置数据库_id
NOTION_CATEGORIES_DB_ID=你的_分类数据库_id
CLARITY_ID=可选的_clarity_跟踪_id
GA_ID=可选的_google_分析_id
```

### Notion 数据库设置
1. 在 [Notion Developers](https://www.notion.so/my-integrations) 创建新的集成
2. 在你的 Notion 工作区创建三个数据库：
   - 网站配置
   - 导航链接
   - 分类配置
3. 将每个数据库与你的集成共享
4. 复制数据库 ID 并添加到环境变量中

</div>