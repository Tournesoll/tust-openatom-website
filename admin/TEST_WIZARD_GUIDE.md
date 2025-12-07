# 🧪 测试首次运行向导指南

## 📍 config.json 位置

`config.json` 位于：`admin/config.json`

当前你的配置文件已经存在并包含：
- ✅ GitHub OAuth App 配置（Client ID 和 Secret）
- ✅ GitHub 仓库配置（`Tournesoll/tust-openatom-website`）
- ✅ 服务器配置

## 🎯 测试首次运行向导

### 方法 1：备份并重命名（推荐）

如果你想保留当前配置，可以备份它：

```bash
# 在 admin 目录下
# Windows PowerShell:
Copy-Item config.json config.json.backup

# 或者重命名：
Rename-Item config.json config.json.backup
```

然后删除或重命名 `config.json`，这样系统会检测到首次运行。

### 方法 2：直接删除（如果不需要保留）

```bash
# 在 admin 目录下
# Windows PowerShell:
Remove-Item config.json
```

### 方法 3：临时移动（最安全）

```bash
# 在 admin 目录下
# Windows PowerShell:
Move-Item config.json config.json.old
```

测试完成后可以恢复：
```bash
Move-Item config.json.old config.json
```

## ⚠️ 关于 GitHub 仓库

**重要：你不需要删除 GitHub 上的仓库！**

向导会：
1. **检测现有仓库** - 如果仓库已存在，向导会检测到并直接使用
2. **创建新仓库** - 如果仓库不存在，向导可以帮你创建

### 测试场景

#### 场景 1：使用现有仓库（推荐）
- 保持 GitHub 上的仓库不变
- 删除 `config.json`
- 运行向导
- 在步骤 3 中，输入你现有的仓库信息：
  - GitHub 用户名：`Tournesoll`
  - 仓库名：`tust-openatom-website`
- 点击"检查仓库"，向导会检测到仓库已存在

#### 场景 2：创建新仓库测试
- 如果想测试创建新仓库功能
- 在步骤 3 中输入一个新的仓库名（确保不存在）
- 向导会帮你创建新仓库

## 📝 完整测试步骤

### 1. 备份当前配置
```powershell
cd admin
Copy-Item config.json config.json.backup
```

### 2. 删除或重命名 config.json
```powershell
# 方法 A：重命名（推荐）
Rename-Item config.json config.json.old

# 方法 B：删除
# Remove-Item config.json
```

### 3. 启动应用
```powershell
npm run electron
```

### 4. 测试向导流程

**步骤 1：欢迎页面**
- 查看功能介绍
- 点击"下一步"

**步骤 2：GitHub OAuth App**
- 你可以：
  - **选项 A**：使用现有的 OAuth App（输入已有的 Client ID 和 Secret）
  - **选项 B**：创建新的 OAuth App（按教程操作）
- 输入 Client ID 和 Client Secret
- 点击"验证并保存"

**步骤 3：GitHub 仓库**
- 输入 GitHub 用户名：`Tournesoll`
- 输入仓库名：`tust-openatom-website`
- 点击"检查仓库"
- 如果仓库存在，会显示"仓库已存在"
- 如果仓库不存在，可以点击"创建仓库"

**步骤 4：网站信息**
- 填写网站标题、描述、作者
- 点击"下一步"

**步骤 5：自动部署**
- 点击"开始部署"
- 观察部署进度和日志
- 等待部署完成

**步骤 6：完成**
- 查看网站地址和管理后台地址
- 点击"开始使用"

### 5. 恢复配置（如果需要）

测试完成后，如果想恢复原来的配置：
```powershell
# 如果之前是重命名的
Rename-Item config.json.old config.json

# 如果之前是备份的
Copy-Item config.json.backup config.json
```

## 🔍 验证向导是否正常工作

### 检查点

1. **首次运行检测**
   - 删除 `config.json` 后启动应用
   - 应该自动打开向导页面（`/setup`）
   - 而不是管理后台（`/`）

2. **配置保存**
   - 完成向导后
   - 检查 `config.json` 是否已创建
   - 检查配置内容是否正确

3. **自动跳转**
   - 完成向导后
   - 点击"开始使用"
   - 应该跳转到管理后台（`/`）

## 💡 提示

### 如果向导没有自动打开

检查 `main.js` 中的首次运行检测逻辑：
```javascript
const isFirstRun = configUtils.isFirstRun();
const url = isFirstRun
    ? `http://localhost:${PORT}/setup`
    : `http://localhost:${PORT}`;
```

### 如果配置验证失败

检查 `utils/config.js` 中的验证逻辑：
- 需要 `github.clientId`
- 需要 `github.clientSecret`
- 需要 `github.repo`

### 如果部署失败

- 检查 Git 是否已安装
- 检查是否有推送权限
- 查看部署日志中的错误信息

## 🎉 测试完成

测试完成后，你可以：
1. 恢复原来的配置（如果备份了）
2. 或者使用向导生成的新配置
3. 继续正常使用管理后台

---

**注意**：测试向导不会影响你现有的 GitHub 仓库和 OAuth App，只是重新配置本地应用。

