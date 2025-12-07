# 🚀 Electron 桌面应用快速开始

## ✨ 功能特点

- ✅ **一键启动**：双击运行，无需命令行
- ✅ **自动启动服务器**：内置 Express 服务器，自动启动
- ✅ **跨平台**：支持 Windows、macOS、Linux
- ✅ **无需配置环境**：打包后包含所有依赖
- ✅ **原生体验**：真正的桌面应用，支持系统菜单和快捷键

## 📦 安装和使用

### 方式一：开发模式（需要 Node.js）

1. **安装依赖**
   ```bash
   cd admin
   npm install
   ```

2. **启动应用**
   - Windows: 双击 `start.bat`
   - Mac/Linux: 运行 `chmod +x start.sh && ./start.sh`
   - 或使用命令: `npm run electron`

### 方式二：打包后的应用（推荐，无需 Node.js）

1. **打包应用**
   ```bash
   npm run build:win    # Windows
   npm run build:mac     # macOS
   npm run build:linux   # Linux
   ```

2. **运行打包后的应用**
   - Windows: 双击 `dist/Jekyll 文章管理-1.0.0.exe`（便携版）
   - macOS: 打开 `dist/Jekyll 文章管理-1.0.0.dmg` 并安装
   - Linux: 运行 `dist/Jekyll 文章管理-1.0.0.AppImage`

## 🎯 使用流程

1. **首次启动**
   - 应用会自动启动内置服务器（等待 2-3 秒）
   - 应用窗口会自动打开
   - 使用 GitHub 账号登录

2. **管理文章**
   - 点击"新建文章"创建文章
   - 编辑文章内容（支持 Markdown）
   - 点击"保存并推送"发布到 GitHub

3. **关闭应用**
   - 关闭窗口时，服务器会自动停止
   - 无需手动关闭服务器进程

## ⚙️ 配置说明

确保 `config.json` 文件存在且配置正确：

```json
{
  "github": {
    "clientId": "你的 GitHub Client ID",
    "clientSecret": "你的 GitHub Client Secret",
    "repo": "用户名/仓库名",
    "branch": "main"
  },
  "server": {
    "port": 8888
  },
  "paths": {
    "postsDir": "../_posts",
    "imagesDir": "../assets/images/uploads"
  }
}
```

## 🔧 开发说明

### 项目结构

```
admin/
├── main.js              # Electron 主进程（创建窗口、启动服务器）
├── server.js            # Express 服务器
├── routes/              # API 路由
├── public/              # 前端界面
├── config.json          # 配置文件
├── package.json         # 项目配置和打包配置
└── start.bat/start.sh   # 快速启动脚本
```

### 修改代码

1. 修改前端：编辑 `public/` 目录下的文件
2. 修改后端：编辑 `server.js` 和 `routes/` 目录下的文件
3. 测试运行：`npm run electron:dev`（开发模式，会打开开发者工具）
4. 重新打包：`npm run build:win`

## 📝 快捷键

- `Ctrl/Cmd + N`: 新建文章
- `Ctrl/Cmd + Q`: 退出应用
- `F12`: 打开开发者工具（开发模式）
- `Ctrl/Cmd + R`: 重新加载页面

## ⚠️ 注意事项

1. **端口占用**：应用使用 8888 端口，确保未被占用
2. **首次打包**：首次打包会下载 Electron 二进制文件（约 100MB），需要网络连接
3. **文件大小**：打包后的应用约 100-150MB（包含 Node.js 运行时）
4. **配置文件**：打包时需要确保 `config.json` 存在

## 🐛 常见问题

### Q: 应用启动后显示"启动失败"
A: 检查：
- 端口 8888 是否被占用
- `config.json` 是否存在且格式正确
- Node.js 依赖是否已安装（开发模式）

### Q: 打包后的应用无法启动
A: 检查：
- 是否有杀毒软件拦截
- 系统权限是否足够
- 查看错误日志

### Q: 如何更新应用？
A: 重新打包新版本，或使用自动更新功能（需要配置）

## 📚 相关文档

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-builder 文档](https://www.electron.build/)
- [详细配置说明](./ELECTRON_SETUP.md)

