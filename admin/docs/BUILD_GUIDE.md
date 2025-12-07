# 📦 打包桌面应用指南

## 🎯 打包成可执行文件

将应用打包成 `.exe` 文件，用户可以直接双击运行，无需安装 Node.js 或运行命令。

## 🚀 快速打包

### 方法 1：使用打包脚本（推荐）

直接双击运行：
```
build.bat
```

### 方法 2：使用命令行

```powershell
cd admin
npm run build:win
```

## 📁 打包输出

打包完成后，在 `admin/dist` 目录下会生成：

### 便携版（推荐）
- **Jekyll 文章管理.exe** - 可直接双击运行，无需安装
  - 适合：个人使用、快速测试
  - 优点：无需安装，直接运行
  - 缺点：文件较大（~100MB）

### 安装程序
- **Jekyll 文章管理 Setup x.x.x.exe** - 安装程序
  - 适合：正式分发、系统安装
  - 优点：可以创建桌面快捷方式、开始菜单项
  - 缺点：需要安装步骤

## 📋 打包前检查

1. **确保依赖已安装**
   ```powershell
   npm install
   ```

2. **测试应用是否正常运行**
   ```powershell
   npm run electron
   ```

3. **检查配置文件**
   - `config.json` 不会被包含在打包文件中（用户首次运行时会创建）
   - `config.example.json` 会被包含，作为示例

## 🎨 自定义图标（可选）

如果你想更换应用图标：

1. 准备图标文件：
   - Windows: `assets/icon.ico` (256x256 或更大)
   - Mac: `assets/icon.icns`
   - Linux: `assets/icon.png` (512x512)

2. 将图标文件放在 `admin/assets/` 目录下

3. 重新打包

## 📦 打包配置说明

打包配置在 `package.json` 的 `build` 字段中：

```json
{
  "build": {
    "appId": "com.jekyll.admin",
    "productName": "Jekyll 文章管理",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": [
        {
          "target": "portable",  // 便携版
          "arch": ["x64"]
        },
        {
          "target": "nsis",      // 安装程序
          "arch": ["x64"]
        }
      ]
    }
  }
}
```

## 🚀 分发应用

### 便携版分发

1. 打包后，将 `dist/Jekyll 文章管理.exe` 复制出来
2. 可以放在任何位置运行
3. 首次运行会在同目录下创建 `config.json`

### 安装程序分发

1. 打包后，将 `dist/Jekyll 文章管理 Setup x.x.x.exe` 分发给用户
2. 用户双击安装程序，按提示安装
3. 安装后可以从开始菜单或桌面快捷方式启动

## ⚠️ 注意事项

1. **首次运行**
   - 打包后的应用首次运行会自动检测配置
   - 如果没有 `config.json`，会打开向导页面

2. **配置文件位置**
   - 便携版：与 `.exe` 文件同目录
   - 安装版：在用户数据目录（通常是 `%APPDATA%\Jekyll 文章管理`）

3. **文件大小**
   - 打包后的应用约 100-150MB（包含 Node.js 运行时）
   - 这是正常的，因为包含了完整的运行环境

4. **杀毒软件**
   - 某些杀毒软件可能会误报（因为包含 Node.js 运行时）
   - 这是正常现象，可以添加到白名单

## 🔧 故障排除

### 打包失败

1. **检查 Node.js 版本**
   ```powershell
   node --version
   ```
   建议使用 Node.js 16+ 版本

2. **清理缓存**
   ```powershell
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

3. **检查磁盘空间**
   - 打包需要至少 500MB 可用空间

### 打包后的应用无法运行

1. **检查是否被杀毒软件拦截**
2. **检查 Windows 版本**（需要 Windows 7+）
3. **查看错误日志**（如果有的话）

## 📝 版本更新

更新版本号：
```json
{
  "version": "1.0.1"  // 修改这里
}
```

然后重新打包。

## 🎉 完成

打包完成后，你就有了一个真正的桌面应用，用户可以：
- ✅ 双击运行，无需安装 Node.js
- ✅ 无需命令行操作
- ✅ 像普通软件一样使用

享受你的桌面应用吧！🚀

