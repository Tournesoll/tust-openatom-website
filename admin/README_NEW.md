# 本地 Jekyll 文章管理后台

## 📋 项目概述

这是一个**本地运行**的 Jekyll 文章管理后台，提供可视化界面来管理 GitHub 仓库中的文章。

## ✨ 核心功能

- ✅ **GitHub OAuth 登录**：使用 GitHub 账号登录
- ✅ **自动拉取文章**：从 GitHub 仓库拉取最新文章列表
- ✅ **可视化编辑**：Markdown 编辑器，实时预览
- ✅ **文章管理**：创建、编辑、删除文章
- ✅ **自动 Git 操作**：自动执行 `git add`, `git commit`, `git push`
- ✅ **本地运行**：不需要部署到 GitHub Pages

## 🏗️ 技术架构

```
前端界面 (HTML + JavaScript)
    ↓
Node.js + Express 后端
    ↓
GitHub API (获取/更新文章)
    ↓
本地 Git 仓库
    ↓
自动执行 Git 命令
    ↓
推送到 GitHub
```

## 📁 项目结构

```
admin/
├── server.js              # Node.js 后端服务器
├── routes/                # API 路由
│   ├── auth.js           # GitHub OAuth 认证
│   ├── posts.js          # 文章管理 API
│   └── git.js            # Git 操作 API
├── public/                # 前端静态文件
│   ├── index.html        # 管理界面
│   ├── css/
│   └── js/
├── config.json           # 配置文件
└── package.json          # 项目依赖
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 配置 GitHub OAuth

在 `config.json` 中配置：
```json
{
  "github": {
    "clientId": "你的 Client ID",
    "clientSecret": "你的 Client Secret",
    "repo": "Tournesoll/tust-openatom-website",
    "branch": "main"
  },
  "server": {
    "port": 3000
  }
}
```

### 3. 启动服务器

```bash
npm start
```

### 4. 访问管理后台

打开浏览器访问：`http://localhost:3000`

## 📝 功能说明

### 文章列表
- 显示所有 `_posts/` 目录下的文章
- 显示标题、日期、分类等信息
- 支持搜索和筛选

### 创建文章
- 填写文章信息（标题、日期、分类、标签等）
- Markdown 编辑器编写正文
- 实时预览效果
- 自动生成文件名：`YYYY-MM-DD-title.md`

### 编辑文章
- 修改文章内容
- 更新 Front Matter
- 实时预览

### 删除文章
- 删除文章文件
- 自动提交到 Git

### Git 操作
- **拉取更新**：`git pull origin main`
- **提交更改**：`git add .` → `git commit -m "消息"` → `git push origin main`
- **查看状态**：显示未提交的文件

## 🔒 安全说明

- OAuth token 存储在服务器端 session 中
- 所有 Git 操作在服务器端执行
- 前端只负责显示和交互

## 🎯 优势

- ✅ **完全本地运行**：不需要部署到 GitHub Pages
- ✅ **功能完整**：支持完整的增删改查
- ✅ **自动化**：自动执行 Git 命令
- ✅ **可视化**：友好的用户界面
- ✅ **实时预览**：编辑时实时查看效果

