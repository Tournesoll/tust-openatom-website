# Electron 桌面应用使用指南

## 📦 安装依赖

首先安装 Electron 相关依赖：

```bash
cd admin
npm install
```

## 🚀 开发模式运行

开发模式下运行（会打开开发者工具）：

```bash
npm run electron:dev
```

或者普通模式：

```bash
npm run electron
```

## 📦 打包应用

### Windows 打包

```bash
npm run build:win
```

打包完成后，在 `dist` 目录下会生成：
- `Jekyll 文章管理 Setup 1.0.0.exe` - 安装程序
- `Jekyll 文章管理-1.0.0.exe` - 便携版（无需安装）

### macOS 打包

```bash
npm run build:mac
```

### Linux 打包

```bash
npm run build:linux
```

### 全平台打包

```bash
npm run build
```

## 📝 使用说明

### 首次使用

1. 双击运行应用（或安装后启动）
2. 应用会自动启动内置的 Express 服务器
3. 等待 2 秒后，应用窗口会自动打开
4. 使用 GitHub 账号登录即可开始管理文章

### 功能特性

- ✅ 无需配置 Node.js 环境
- ✅ 一键启动，自动打开浏览器窗口
- ✅ 支持快捷键操作
- ✅ 自动启动/关闭服务器
- ✅ 跨平台支持（Windows/Mac/Linux）

## 🔧 配置说明

应用使用 `config.json` 配置文件，需要确保：
1. GitHub OAuth 配置正确
2. 文章目录路径正确（相对于 admin 目录）

## ⚠️ 注意事项

1. **首次打包**：首次打包会下载 Electron 二进制文件，可能需要一些时间
2. **文件大小**：打包后的应用约 100-150MB（包含 Node.js 运行时）
3. **端口占用**：应用使用 8888 端口，确保该端口未被占用
4. **配置文件**：打包时需要确保 `config.json` 存在且配置正确

## 🐛 故障排除

### 应用无法启动

1. 检查是否有其他程序占用 8888 端口
2. 检查 `config.json` 文件是否存在且格式正确
3. 查看控制台错误信息

### 服务器启动失败

1. 确保 Node.js 依赖已正确安装
2. 检查 `server.js` 和相关路由文件是否存在
3. 查看终端输出的错误信息

## 📚 开发说明

### 项目结构

```
admin/
├── main.js          # Electron 主进程
├── server.js        # Express 服务器
├── routes/          # API 路由
├── public/          # 前端静态文件
├── config.json      # 配置文件
└── package.json     # 项目配置
```

### 修改代码后重新打包

1. 修改代码
2. 测试运行：`npm run electron:dev`
3. 确认无误后打包：`npm run build:win`

