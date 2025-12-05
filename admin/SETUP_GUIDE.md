# Decap CMS 配置指南

## 📋 完整配置步骤

### 步骤 1：创建 GitHub OAuth App

#### 1.1 访问 GitHub 开发者设置

1. 打开浏览器，访问：https://github.com/settings/developers
2. 如果未登录，先登录你的 GitHub 账号
3. 在左侧菜单中找到 **"OAuth Apps"**，点击进入

#### 1.2 创建新的 OAuth App

1. 点击右上角的 **"New OAuth App"** 按钮（绿色按钮）
2. 填写以下信息：

   **Application name（应用名称）**
   ```
   TUST OpenAtom CMS
   ```
   *说明：这是显示给用户的应用名称，可以自定义*

   **Homepage URL（主页 URL）**
   ```
   https://tournesoll.github.io/tust-openatom-website
   ```
   *说明：你的网站地址*

   **Application description（应用描述）**（可选）
   ```
   天津科技大学开放原子开源协会内容管理后台
   ```

   **Authorization callback URL（授权回调 URL）**
   ```
   https://api.netlify.com/auth/done
   ```
   *⚠️ 重要：这个 URL 必须完全一致，不能有拼写错误*

3. 点击 **"Register application"** 按钮

#### 1.3 获取 Client ID

1. 创建成功后，会跳转到应用详情页
2. 在页面顶部可以看到 **"Client ID"**
3. **复制这个 Client ID**（是一串数字和字母的组合）
   - 例如：`a1b2c3d4e5f6g7h8i9j0`
4. ⚠️ **注意**：我们使用 PKCE 认证方式，**不需要 Client Secret**

#### 1.4 记录信息

将以下信息记录下来（稍后会用到）：
- Client ID: `你的 Client ID`
- 应用名称: `TUST OpenAtom CMS`

---

### 步骤 2：更新配置文件（可选）

**注意**：Decap CMS 使用 PKCE 认证，通常不需要在配置文件中填写 Client ID。但如果遇到问题，可以尝试添加。

如果需要，可以修改 `admin/config.yml`：

```yaml
backend:
  name: github
  repo: Tournesoll/tust-openatom-website
  branch: main
  base_url: https://api.github.com
  auth_type: pkce
  # 如果需要，可以添加以下配置（通常不需要）
  # app_id: 你的 Client ID
```

---

### 步骤 3：推送代码到 GitHub

#### 3.1 检查文件状态

在项目目录打开 PowerShell 或终端，执行：

```bash
git status
```

应该看到新增的文件：
- `admin/index.html`
- `admin/config.yml`
- `admin/README.md`
- `assets/images/uploads/.gitkeep`
- 修改的 `README.md` 和 `.gitignore`

#### 3.2 添加所有文件

```bash
git add .
```

#### 3.3 提交更改

```bash
git commit -m "feat: Add Decap CMS admin module"
```

#### 3.4 推送到 GitHub

```bash
git push
```

#### 3.5 等待 GitHub Pages 构建

1. 访问：https://github.com/Tournesoll/tust-openatom-website
2. 点击 **"Actions"** 标签页
3. 查看构建状态，等待显示绿色的 ✅（通常需要 1-2 分钟）

---

### 步骤 4：测试管理后台

#### 4.1 访问管理后台

1. 等待 GitHub Pages 构建完成后
2. 访问：https://tournesoll.github.io/tust-openatom-website/admin/
3. 应该看到 Decap CMS 的登录界面

#### 4.2 登录

1. 点击 **"Login with GitHub"** 或 **"使用 GitHub 登录"** 按钮
2. 会跳转到 GitHub 授权页面
3. 点击 **"Authorize"**（授权）按钮
4. 如果提示需要授权仓库访问，选择 **"Grant access"**（授予访问权限）

#### 4.3 首次使用可能遇到的问题

**问题 1：提示需要授权仓库**
- 说明：GitHub 需要你授权应用访问仓库
- 解决：点击 **"Grant access"** 或 **"授权访问"**

**问题 2：提示权限不足**
- 说明：你的 GitHub 账号没有仓库的写入权限
- 解决：确保你是仓库的 Owner 或 Collaborator，且有写入权限

**问题 3：404 错误**
- 说明：GitHub Pages 可能还在构建
- 解决：等待 1-2 分钟后再试，或检查 Actions 中的构建状态

---

### 步骤 5：测试创建文章

#### 5.1 进入文章管理界面

登录成功后，应该看到：
- 左侧菜单：**"技术文章"**
- 右侧：文章列表（如果有）或空列表

#### 5.2 创建新文章

1. 点击右上角的 **"New 技术文章"** 或 **"新建文章"** 按钮
2. 填写文章信息：

   **标题**
   ```
   测试文章：Decap CMS 使用指南
   ```

   **发布日期**
   - 点击日期选择器，选择今天的日期
   - 时间可以保持默认或调整

   **分类**
   - 下拉选择：**前端技术** / **后端技术** / **设计**
   - 选择 **"前端技术"**

   **标签**（可选）
   - 点击 **"Add 标签"**
   - 输入：`测试`、`CMS`、`Jekyll`

   **作者**（可选）
   ```
   技术社团
   ```

   **封面图**（可选）
   - 点击 **"Choose an image"**
   - 选择一张图片上传
   - 图片会自动保存到 `assets/images/uploads/`

   **摘要**（可选）
   ```
   这是一篇测试文章，用于验证 Decap CMS 功能。
   ```

   **正文**
   ```markdown
   # 测试文章

   这是一篇通过 Decap CMS 创建的文章。

   ## 功能测试

   - ✅ Markdown 编辑器
   - ✅ 实时预览
   - ✅ 图片上传
   - ✅ GitHub 同步

   ## 代码测试

   ```python
   def hello():
       print("Hello, Decap CMS!")
   ```

   ## 结语

   如果这篇文章成功发布，说明 Decap CMS 配置成功！
   ```

3. 点击右上角的 **"Save"**（保存）按钮
4. 等待保存完成（会显示保存成功提示）

#### 5.3 验证文章创建

1. 保存成功后，等待 1-2 分钟（GitHub Pages 重新构建）
2. 访问：https://tournesoll.github.io/tust-openatom-website/posts
3. 应该能看到新创建的文章出现在列表中
4. 点击文章查看详情，确认内容正确

#### 5.4 检查 GitHub 仓库

1. 访问：https://github.com/Tournesoll/tust-openatom-website
2. 进入 `_posts` 目录
3. 应该能看到新创建的文章文件（格式：`YYYY-MM-DD-title.md`）
4. 点击文件查看内容，确认格式正确

---

### 步骤 6：测试编辑和删除

#### 6.1 编辑文章

1. 在管理后台的文章列表中，找到刚创建的文章
2. 点击文章标题进入编辑模式
3. 修改内容（例如：添加一段文字）
4. 点击 **"Save"** 保存
5. 等待 GitHub Pages 重新构建后，检查网站上的文章是否更新

#### 6.2 删除文章

1. 在管理后台的文章列表中，找到要删除的文章
2. 点击文章右侧的 **"Delete"**（删除）按钮
3. 确认删除
4. 等待 GitHub Pages 重新构建后，检查网站上的文章是否已删除

---

## 🔧 常见问题排查

### 问题 1：无法登录

**症状**：点击登录按钮后没有反应，或提示错误

**排查步骤**：
1. 检查 OAuth App 的回调 URL 是否正确：`https://api.netlify.com/auth/done`
2. 检查 `admin/config.yml` 中的 `repo` 是否正确：`Tournesoll/tust-openatom-website`
3. 检查 GitHub Pages 是否已成功构建
4. 清除浏览器缓存后重试

### 问题 2：提示权限不足

**症状**：登录后提示 "You don't have permission to access this repository"

**解决方法**：
1. 确保你的 GitHub 账号是仓库的 Owner 或 Collaborator
2. 检查仓库 Settings → Collaborators，确认你的账号有写入权限
3. 如果是组织仓库，检查组织设置中的权限配置

### 问题 3：图片上传失败

**症状**：上传图片后提示错误

**排查步骤**：
1. 检查 `assets/images/uploads/` 目录是否存在
2. 检查 `.gitignore` 是否误忽略了 `assets/images/uploads/`
3. 检查 GitHub 仓库中是否有 `assets/images/uploads/` 目录

### 问题 4：文章保存后网站没有更新

**症状**：在后台保存文章后，网站上没有显示

**排查步骤**：
1. 检查 GitHub Actions 中的构建状态
2. 等待 1-2 分钟（GitHub Pages 需要时间重新构建）
3. 检查 `_posts` 目录中是否有新文件
4. 检查文件格式是否正确（Front Matter 格式）

---

## 📚 相关资源

- [Decap CMS 官方文档](https://decapcms.org/docs/intro/)
- [GitHub OAuth App 文档](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
- [Jekyll 文档](https://jekyllrb.com/docs/)

---

## ✅ 配置检查清单

完成以下所有步骤后，Decap CMS 应该可以正常使用：

- [ ] 创建了 GitHub OAuth App
- [ ] 设置了正确的回调 URL：`https://api.netlify.com/auth/done`
- [ ] 获取了 Client ID（已记录）
- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 构建成功
- [ ] 可以访问 `/admin/` 页面
- [ ] 可以使用 GitHub 账号登录
- [ ] 可以创建新文章
- [ ] 文章成功保存到 GitHub
- [ ] 文章在网站上正常显示
- [ ] 可以编辑已有文章
- [ ] 可以删除文章
- [ ] 可以上传图片

---

**配置完成后，你就可以像使用 Word 一样在线管理网站内容了！** 🎉



