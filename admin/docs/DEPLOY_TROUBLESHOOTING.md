# 🔧 部署失败故障排除指南

## 常见错误和解决方案

### 1. 推送失败：需要 GitHub 认证

**错误信息**：
- `推送失败：需要 GitHub 认证`
- `Authentication failed`
- `permission denied`
- `401` 或 `403` 错误

**原因**：
Git 推送代码到 GitHub 需要身份验证，但系统没有配置认证信息。

**解决方案**：

#### 方法 1：配置 Git 凭据（推荐）

在命令行中运行：

```bash
# 配置 Git 凭据存储
git config --global credential.helper store

# 配置 Git 用户信息（如果还没有）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

然后手动推送一次，输入 GitHub 用户名和 Personal Access Token（不是密码）：

```bash
cd F:\前端学习\jekyll尝试
git push origin main
```

输入凭据后，Git 会保存凭据，之后自动部署就能正常工作了。

#### 方法 2：使用 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo`（完整仓库权限）
4. 生成 Token 并复制
5. 在 Git 推送时，用户名输入你的 GitHub 用户名，密码输入 Token

#### 方法 3：手动推送代码

如果自动部署失败，可以手动推送：

```bash
cd F:\前端学习\jekyll尝试

# 检查 Git 状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "Initial setup via Jekyll Admin"

# 推送到 GitHub
git push origin main
```

### 2. 配置文件不存在

**错误信息**：
- `配置文件不存在: ...\_config.yml`

**原因**：
`_config.yml` 文件不在预期位置。

**解决方案**：
确保 `_config.yml` 文件在项目根目录（`F:\前端学习\jekyll尝试\_config.yml`）。

### 3. Git 未安装

**错误信息**：
- `git is not recognized`
- `command not found: git`

**解决方案**：
1. 下载并安装 Git：https://git-scm.com/download/win
2. 安装后重启应用
3. 验证安装：在命令行运行 `git --version`

### 4. 没有推送权限

**错误信息**：
- `permission denied`
- `403 Forbidden`

**原因**：
- 仓库不存在
- 没有推送权限
- Token 权限不足

**解决方案**：
1. 确认仓库存在：访问 `https://github.com/Tournesoll/tust-openatom-website`
2. 确认你有推送权限
3. 如果使用 Token，确保 Token 有 `repo` 权限

### 5. 远程仓库已存在但无法推送

**错误信息**：
- `Updates were rejected`
- `failed to push some refs`

**原因**：
远程仓库已有代码，本地仓库和远程仓库历史不一致。

**解决方案**：

#### 方法 1：拉取远程代码后推送

```bash
cd F:\前端学习\jekyll尝试

# 拉取远程代码
git pull origin main --allow-unrelated-histories

# 解决冲突（如果有）
# 然后推送
git push origin main
```

#### 方法 2：强制推送（谨慎使用）

```bash
git push origin main --force
```

⚠️ **注意**：强制推送会覆盖远程仓库的代码，请确保远程仓库没有重要内容。

### 6. 端口被占用

**错误信息**：
- `端口 8888 被占用`
- `EADDRINUSE`

**解决方案**：
1. 运行 `kill-port.bat` 关闭占用端口的进程
2. 或者修改 `config.json` 中的端口号

## 调试步骤

### 1. 查看详细错误信息

部署失败时，查看：
- 浏览器控制台（F12）
- 应用日志输出
- 部署日志区域

### 2. 检查配置

确认 `config.json` 中的配置正确：
```json
{
  "github": {
    "owner": "Tournesoll",
    "repoName": "tust-openatom-website",
    "repo": "Tournesoll/tust-openatom-website"
  }
}
```

### 3. 手动测试 Git 操作

在命令行中测试：

```bash
cd F:\前端学习\jekyll尝试

# 检查 Git 状态
git status

# 检查远程仓库
git remote -v

# 测试推送
git push origin main
```

### 4. 检查文件权限

确保：
- 项目目录有读写权限
- `_config.yml` 文件可写
- `.git` 目录存在且可访问

## 快速修复流程

1. **检查 Git 是否安装**
   ```bash
   git --version
   ```

2. **配置 Git 凭据**
   ```bash
   git config --global credential.helper store
   ```

3. **手动推送一次**（输入 GitHub 用户名和 Token）
   ```bash
   cd F:\前端学习\jekyll尝试
   git push origin main
   ```

4. **重新运行向导部署**

## 如果问题仍然存在

1. 查看浏览器控制台的详细错误信息
2. 检查服务器日志（如果应用在运行）
3. 尝试手动完成 Git 操作
4. 检查 GitHub 仓库设置和权限

## 联系支持

如果以上方法都无法解决问题，请提供：
- 完整的错误信息
- 浏览器控制台截图
- Git 版本信息
- 操作系统信息

