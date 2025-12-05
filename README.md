# 天津科技大学开放原子开源协会官网

> 开源技术实践与分享平台 - 聚焦 Linux/Git/开源项目开发，连接开放原子生态

这是使用 Jekyll 4.4 构建的静态网站，采用苹果风格设计，支持响应式布局，已部署在 GitHub Pages。

## ✨ 特性

- 🎨 **苹果风格设计** - 极简、优雅、现代化的视觉体验
- 📱 **响应式布局** - 完美适配手机、平板、电脑
- 🚀 **快速加载** - 静态站点，CDN 加速，访问速度快
- 📝 **Markdown 写作** - 使用 Markdown 编写文章，简单高效
- 🎯 **代码高亮** - 支持多种编程语言的语法高亮
- 🔍 **分类筛选** - 按技术分类浏览文章
- 📊 **自动生成** - 自动生成文章目录、相关推荐等

## 🚀 快速开始

### 环境要求

- Ruby 3.4+
- Bundler

### 安装依赖

```bash
bundle install
```

### 本地运行

```bash
bundle exec jekyll serve
```

访问 `http://localhost:4000` 查看网站。

### 停止服务器

按 `Ctrl + C` 停止本地服务器。

## 📝 写文章

### 方式一：在线管理后台（推荐）

使用 Decap CMS 在线管理后台，无需编写代码：

1. 访问：`https://your-site.github.io/repo-name/admin/`
2. 使用 GitHub 账号登录
3. 点击 "新建文章" 开始写作
4. 支持 Markdown 编辑器、实时预览、图片上传

详细说明请查看：[admin/README.md](admin/README.md)

### 方式二：手动创建文件

在 `_posts` 目录下创建新文件，文件名格式为：`YYYY-MM-DD-标题.md`

### 文章模板

```markdown
---
layout: post
title: "文章标题"
date: 2025-01-01 10:00:00 +0800
categories: [前端技术, 后端技术, 设计]
tags: [标签1, 标签2]
author: 作者名（可选）
---

文章内容使用 Markdown 编写...
```

### 分类说明

- `frontend` - 前端技术
- `backend` - 后端技术
- `design` - 设计

## 🌐 部署

### GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库 Settings → Pages 中启用 GitHub Pages
3. 选择 `main` 分支和 `/ (root)` 目录
4. 等待构建完成，访问 `https://username.github.io/repo-name/`

### 自定义域名

1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名
2. 在域名 DNS 中添加 CNAME 记录指向 GitHub Pages
3. 在 GitHub Pages 设置中启用自定义域名

## 🛠️ 技术栈

- **Jekyll 4.4.0** - 静态网站生成器
- **Decap CMS** - 内容管理后台
- **Bulma CSS** - CSS 框架
- **Font Awesome** - 图标库
- **Prism.js** - 代码高亮
- **GitHub Pages** - 免费托管

## 📁 项目结构

```
.
├── _config.yml          # 站点配置
├── _layouts/            # 布局模板
│   ├── default.html     # 基础布局
│   ├── home.html        # 首页布局
│   └── post.html        # 文章布局
├── _includes/           # 可复用组件
│   ├── header.html      # 导航栏
│   ├── footer.html      # 页脚
│   └── post-card.html   # 文章卡片
├── _posts/              # 文章目录
├── admin/               # 内容管理后台（Decap CMS）
│   ├── index.html       # 后台入口页
│   ├── config.yml       # CMS 配置
│   └── README.md        # 使用说明
├── assets/               # 静态资源
│   ├── css/             # 样式文件
│   ├── vendor/          # 第三方库
│   └── images/          # 图片资源
│       └── uploads/     # 上传的图片
├── index.md              # 首页
├── about.md              # 关于页面
├── intro.md              # 社团简介
└── posts.html           # 文章列表页
```

## 📚 文档

- [实现思路.md](实现思路.md) - 完整的项目规划文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 📮 联系方式

- 邮箱：contact@tustosc.com
- GitHub：[@TUST-OpenAtom](https://github.com/TUST-OpenAtom)

---

**指导单位**：天津科技大学人工智能学院  
**指导教师**：王嫄（博士、副教授、硕士生导师、双创中心主任）
