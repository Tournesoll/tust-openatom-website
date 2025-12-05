# 我的 Jekyll 博客

这是使用 Jekyll 搭建的个人博客。

## 本地运行

1. 安装依赖：
```bash
bundle install
```

2. 启动本地服务器：
```bash
bundle exec jekyll serve
```

3. 访问 `http://localhost:4000` 查看博客

## 写文章

在 `_posts` 目录下创建新文件，文件名格式为：`YYYY-MM-DD-标题.md`

文件内容示例：
```markdown
---
layout: post
title: "文章标题"
date: 2025-12-04 22:30:00 +0800
categories: 分类
tags: [标签1, 标签2]
---

文章内容...
```

## 部署

可以部署到以下平台：
- GitHub Pages
- Netlify
- Vercel

## 技术栈

- Jekyll 4.4.0
- Minima 主题
- Markdown
