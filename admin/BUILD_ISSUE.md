# ⚠️ 打包问题说明

## 问题

打包时遇到代码签名工具权限问题：
- 错误：`Cannot create symbolic link : 客户端没有所需的特权`
- 原因：Windows 需要管理员权限来创建符号链接

## 解决方案

### 方案 1：以管理员权限运行（推荐）

1. **右键点击 PowerShell 或命令提示符**
2. **选择"以管理员身份运行"**
3. **切换到项目目录**：
   ```powershell
   cd F:\前端学习\jekyll尝试\admin
   ```
4. **执行打包**：
   ```powershell
   npm run build:win
   ```

### 方案 2：清理缓存后重试

```powershell
# 清理 electron-builder 缓存
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -ErrorAction SilentlyContinue

# 重新打包
npm run build:win
```

### 方案 3：手动删除缓存目录

1. 打开：`C:\Users\你的用户名\AppData\Local\electron-builder\Cache\winCodeSign`
2. 删除整个 `winCodeSign` 文件夹
3. 重新运行打包命令

## 注意

这个错误不影响打包功能，只是代码签名工具的问题。如果打包成功，会在 `dist/` 目录下生成：
- `Jekyll 文章管理.exe` - 便携版应用

## 验证打包结果

打包成功后，检查：
```powershell
Get-ChildItem dist -Recurse | Where-Object { $_.Name -like "*.exe" }
```

应该能看到 `Jekyll 文章管理.exe` 文件。









