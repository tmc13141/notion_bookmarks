# Notion 导航站

[中文](#chinese) | [English](#english)

<div id="chinese">

## 项目预览
> 🔗 [在线演示](https://portal.ezho.top/)

![项目预览](public/preview.png)

## 项目简介
这是一个使用 Notion 作为数据库后端的个人导航网站项目。通过 Notion 数据库管理书签和导航链接，并以清晰现代的网页界面呈现。

### 主要特性
- 使用 Notion 作为数据库，无需部署数据库
- 清晰现代的网页界面
- 支持多级分类导航
- 响应式设计，支持桌面和移动端
- 一键部署到 Vercel

## 快速开始

### 1. 复制 Notion 模板
直接复制这个 [Notion 模板](https://lofty-spear-6f1.notion.site/NotionBookmarks-157a26d324f380c08811f044c8563d04) 到你的工作区。模板包含三个数据库：
- **网站配置**：存储网站基本信息和设置
- **导航链接**：存储所有书签条目
- **分类配置**：管理导航分类

### 2. 创建 Notion 集成
1. 访问 [Notion Developers](https://www.notion.so/my-integrations) 创建一个新的集成
2. 保存生成的集成密钥（下一步需要用到）
3. 将你复制的三个数据库与这个集成共享（点击数据库右上角的 Share，添加你的集成）

### 3. 一键部署
[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmoyuguy%2Fnotion_bookmarks)

点击上方按钮，一键部署到 Vercel：
1. 使用 GitHub 账号登录 Vercel
2. 设置环境变量（在部署配置页面）：
```env
NOTION_TOKEN=你的_notion_集成密钥
NOTION_LINKS_DB_ID=你的_链接数据库_id
NOTION_WEBSITE_CONFIG_ID=你的_网站配置数据库_id
NOTION_CATEGORIES_DB_ID=你的_分类数据库_id
NEXT_PUBLIC_CLARITY_ID=可选的_clarity_跟踪_id
GA_ID=可选的_google_分析_id
```



部署完成后，你就可以通过 Vercel 分配的域名访问你的导航站了！

</div>

<div id="english">

## Project Preview
> 🔗 [Live Demo](https://portal.ezho.top/)

![Project Preview](public/preview.png)

## Overview
A personal navigation website using Notion as the database backend. This project allows you to manage your bookmarks and navigation links through Notion databases while presenting them in a clean, modern web interface.

### Key Features
- Uses Notion as the database, no database deployment needed
- Clean and modern web interface
- Multi-level category navigation
- Responsive design for desktop and mobile
- One-click deployment to Vercel

## Quick Start

### 1. Copy Notion Template
Directly copy this [Notion template](https://lofty-spear-6f1.notion.site/NotionBookmarks-157a26d324f380c08811f044c8563d04) to your workspace. The template includes three databases:
- **Website Configuration**: Stores basic website information and settings
- **Navigation Links**: Stores all bookmark entries
- **Category Configuration**: Manages navigation categories

### 2. Create Notion Integration
1. Visit [Notion Developers](https://www.notion.so/my-integrations) to create a new integration
2. Save the generated integration token (needed in next step)
3. Share your copied databases with this integration (Click Share in the top right of each database and add your integration)

### 3. One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmoyuguy%2Fnotion_bookmarks)

Click the button above to deploy to Vercel:
1. Login to Vercel with your GitHub account
2. Set environment variables (in deployment configuration page):
```env
NOTION_TOKEN=your_notion_integration_token
NOTION_LINKS_DB_ID=your_links_database_id
NOTION_WEBSITE_CONFIG_ID=your_website_config_database_id
NOTION_CATEGORIES_DB_ID=your_categories_database_id
NEXT_PUBLIC_CLARITY_ID=optional_clarity_tracking_id
GA_ID=optional_google_analytics_id
```



Once deployed, you can access your navigation site through the domain assigned by Vercel!

</div>