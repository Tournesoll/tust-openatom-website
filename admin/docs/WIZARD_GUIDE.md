# 🎯 首次运行向导功能说明

## ✨ 功能概述

首次运行向导是一个完全可视化的配置系统，让非计算机专业用户也能轻松完成系统配置和部署。

## 📁 文件结构

```
admin/
├── utils/                    # 工具函数目录
│   ├── config.js            # 配置管理（读取、验证、保存）
│   ├── github.js            # GitHub API 封装
│   └── deploy.js            # 自动化部署功能
├── routes/
│   └── setup.js             # 向导路由 API
├── public/
│   ├── setup-wizard.html    # 向导页面
│   ├── css/
│   │   └── setup-wizard.css # 向导样式
│   └── js/
│       └── setup-wizard.js  # 向导前端逻辑
├── main.js                  # Electron 主进程（已添加首次运行检测）
└── server.js                # Express 服务器（已集成向导路由）
```

## 🎯 向导流程（6 步）

### 步骤 1：欢迎页面
- 系统功能介绍
- 需要准备的内容清单
- 功能特性展示

### 步骤 2：GitHub OAuth App 配置
- 详细的图文教程（可展开/收起）
- 表单输入：Client ID 和 Client Secret
- 实时验证和保存

### 步骤 3：GitHub 仓库配置
- 输入 GitHub 用户名和仓库名
- 检查仓库是否存在
- 创建新仓库（需要 GitHub Token）
- 自动保存配置

### 步骤 4：网站信息配置
- 网站标题
- 网站描述
- 作者信息
- 实时预览

### 步骤 5：自动部署
- 自动修改 `_config.yml`
- 自动初始化 Git 仓库
- 自动推送代码到 GitHub
- 实时显示部署进度和日志

### 步骤 6：完成
- 显示网站地址
- 显示管理后台地址
- 使用说明
- 开始使用按钮

## 🔧 技术实现

### 1. 首次运行检测

**位置**：`main.js` 和 `server.js`

```javascript
// 检测是否首次运行
const isFirstRun = configUtils.isFirstRun();

// 根据状态加载不同页面
const url = isFirstRun 
  ? `http://localhost:${PORT}/setup` 
  : `http://localhost:${PORT}`;
```

### 2. 配置管理

**位置**：`utils/config.js`

- `isFirstRun()` - 检测是否首次运行
- `readConfig()` - 读取配置
- `saveConfig()` - 保存配置
- `isConfigValid()` - 验证配置完整性
- `updateConfig()` - 部分更新配置

### 3. GitHub API 封装

**位置**：`utils/github.js`

- `checkRepository()` - 检查仓库是否存在
- `createRepository()` - 创建新仓库
- `verifyOAuthApp()` - 验证 OAuth App
- `enablePages()` - 检查/启用 GitHub Pages

### 4. 自动化部署

**位置**：`utils/deploy.js`

- `updateJekyllConfig()` - 自动修改 `_config.yml`
- `initGitRepo()` - 初始化 Git 仓库
- `addRemote()` - 添加远程仓库
- `commitAndPush()` - 提交并推送代码
- `deploy()` - 完整部署流程

### 5. 向导 API

**位置**：`routes/setup.js`

- `GET /api/setup/status` - 获取配置状态
- `POST /api/setup/verify-oauth` - 验证 OAuth App
- `POST /api/setup/check-repo` - 检查仓库
- `POST /api/setup/create-repo` - 创建仓库
- `POST /api/setup/save-repo` - 保存仓库配置
- `POST /api/setup/save-site-info` - 保存网站信息
- `POST /api/setup/deploy` - 执行自动部署
- `POST /api/setup/complete` - 完成配置

## 🎨 UI 设计特点

1. **专业的视觉设计**
   - 深色主题，护眼舒适
   - 渐变背景，现代感强
   - 清晰的步骤指示

2. **友好的用户体验**
   - 进度条显示当前步骤
   - 表单验证和实时反馈
   - 详细的教程和提示

3. **响应式布局**
   - 适配不同屏幕尺寸
   - 移动端友好

## 📝 使用流程

### 用户操作流程

1. **下载并启动应用**
   - 解压应用包
   - 双击运行
   - 自动打开向导页面

2. **完成配置**
   - 按照向导提示操作
   - 创建 GitHub OAuth App（有详细教程）
   - 填写配置信息
   - 点击"开始部署"

3. **等待部署完成**
   - 查看部署进度
   - 获取网站地址

4. **开始使用**
   - 点击"开始使用"
   - 进入管理后台
   - 创建第一篇文章

## 🔒 安全性

1. **配置验证**
   - 所有配置项都有格式验证
   - OAuth App 配置在首次登录时验证

2. **错误处理**
   - 完善的错误提示
   - 友好的错误信息

3. **数据保护**
   - 敏感信息（如 Token）使用密码输入框
   - 配置保存在本地文件

## 🚀 未来优化

1. **配置导入/导出**
   - 支持配置备份和恢复
   - 支持配置迁移

2. **更多自动化**
   - 自动启用 GitHub Pages
   - 自动配置域名

3. **更好的教程**
   - 添加截图和视频教程
   - 交互式指导

## 📚 相关文档

- [Electron 设置指南](./ELECTRON_SETUP.md)
- [快速开始](./QUICKSTART.md)
- [测试指南](./TEST_GUIDE.md)


