# Sveltia CMS 实现指南

## 📋 目录

1. [什么是 Sveltia CMS](#什么是-sveltia-cms)
2. [实现方式](#实现方式)
3. [详细步骤](#详细步骤)
4. [最终效果](#最终效果)
5. [常见问题](#常见问题)

---

## 什么是 Sveltia CMS

**Sveltia CMS** 是一个基于 Svelte 构建的现代化 Git 工作流内容管理系统，专为静态网站设计。

### 核心特点

- ✅ **完全免费**：开源项目，无任何费用
- ✅ **GitHub Pages 原生支持**：无需 Netlify，专为 GitHub Pages 设计
- ✅ **Jekyll 完美兼容**：支持 Jekyll 的 Front Matter 格式
- ✅ **现代化界面**：美观的 UI，支持移动端
- ✅ **Git 工作流**：所有更改直接提交到 GitHub 仓库
- ✅ **实时预览**：编辑时实时预览效果

---

## 实现方式

### 架构说明

```
用户浏览器
    ↓
Sveltia CMS 界面 (admin/index.html)
    ↓
Cloudflare Workers (OAuth 代理)
    ↓
GitHub OAuth API
    ↓
GitHub API (读写仓库)
    ↓
GitHub 仓库 (_posts/*.md)
    ↓
GitHub Pages (自动构建)
```

### 技术栈

- **前端**：Sveltia CMS (基于 Svelte)
- **认证**：GitHub OAuth + Cloudflare Workers 代理
- **存储**：GitHub 仓库
- **部署**：GitHub Pages（完全静态）

---

## 详细步骤

### 步骤 1：创建 GitHub OAuth App

1. **访问 GitHub 开发者设置**
   - 打开：https://github.com/settings/developers
   - 如果未登录，先登录 GitHub

2. **创建新的 OAuth App**
   - 点击左侧菜单的 **"OAuth Apps"**
   - 点击右上角的 **"New OAuth App"** 按钮

3. **填写应用信息**
   ```
   Application name: TUST OpenAtom CMS
   Homepage URL: https://tournesoll.github.io/tust-openatom-website
   Authorization callback URL: https://your-auth-worker.your-subdomain.workers.dev/callback
   ```
   ⚠️ **注意**：回调 URL 需要先部署 Cloudflare Workers 后才能确定，可以先填写一个临时地址，后续再更新。

4. **获取 Client ID 和 Client Secret**
   - 创建成功后，会显示 **Client ID** 和 **Client Secret**
   - **重要**：立即复制并保存这两个值，Client Secret 只显示一次！

---

### 步骤 2：部署 Cloudflare Workers OAuth 代理

Sveltia CMS 需要一个 OAuth 代理服务器来处理 GitHub 认证。我们使用 Cloudflare Workers（免费）来实现。

#### 2.1 注册 Cloudflare 账号

1. 访问：https://www.cloudflare.com/
2. 注册账号（免费）
3. 登录后进入 **Workers & Pages** 控制台

#### 2.2 创建 Worker

1. 点击 **"Create application"** → **"Create Worker"**
2. 给 Worker 起个名字，例如：`sveltia-cms-auth`
3. 点击 **"Deploy"** 创建

#### 2.3 配置 Worker 代码

1. 在 Worker 编辑器中，替换代码为以下内容：

```javascript
// Sveltia CMS GitHub OAuth 代理
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 处理 OAuth 回调
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }
      
      // 交换 access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return new Response(`Error: ${tokenData.error_description}`, { status: 400 });
      }
      
      // 返回 token 给前端
      return new Response(JSON.stringify({
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // 处理 OAuth 授权请求
    if (url.pathname === '/authorize') {
      const redirectUri = url.searchParams.get('redirect_uri');
      const state = url.searchParams.get('state');
      
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri || `${url.origin}/callback`);
      authUrl.searchParams.set('scope', 'repo');
      if (state) authUrl.searchParams.set('state', state);
      
      return Response.redirect(authUrl.toString(), 302);
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
```

#### 2.4 配置环境变量

1. 在 Worker 设置中，找到 **"Variables"** 或 **"Settings"** → **"Variables"**
2. 添加以下环境变量：
   - `GITHUB_CLIENT_ID`：你的 GitHub OAuth App 的 Client ID
   - `GITHUB_CLIENT_SECRET`：你的 GitHub OAuth App 的 Client Secret

#### 2.5 获取 Worker URL

1. 部署成功后，你会得到一个 Worker URL，格式类似：
   ```
   https://sveltia-cms-auth.your-subdomain.workers.dev
   ```
2. **复制这个 URL**，后续配置需要用到

#### 2.6 更新 GitHub OAuth App 回调 URL

1. 回到 GitHub OAuth App 设置页面
2. 更新 **Authorization callback URL** 为：
   ```
   https://your-worker-url.workers.dev/callback
   ```
3. 保存更改

---

### 步骤 3：配置 Sveltia CMS

#### 3.1 更新配置文件

编辑 `admin/config.yml`，更新 `auth_endpoint`：

```yaml
backend:
  name: github
  repo: Tournesoll/tust-openatom-website
  branch: main
  base_url: https://api.github.com
  auth_endpoint: https://your-worker-url.workers.dev  # 替换为你的 Worker URL
```

#### 3.2 更新 admin/index.html（如果需要）

确保 `admin/index.html` 中的配置正确：

```html
<script type="module">
  import { init } from 'https://cdn.jsdelivr.net/npm/@sveltia/cms@latest/dist/index.js';
  import config from './config.yml?url';

  init({
    config,
    basePath: '/tust-openatom-website/admin',
  });
</script>
```

---

### 步骤 4：推送到 GitHub

```bash
git add admin/
git commit -m "feat: Add Sveltia CMS admin interface"
git push origin main
```

---

### 步骤 5：测试

1. **等待 GitHub Pages 构建完成**（1-2 分钟）
2. **访问管理后台**：
   ```
   https://tournesoll.github.io/tust-openatom-website/admin/
   ```
3. **点击 "Login with GitHub"**
4. **授权访问仓库**
5. **开始管理内容！**

---

## 最终效果

### 界面展示

#### 1. **登录页面**
- 简洁的登录界面
- "Login with GitHub" 按钮
- 点击后跳转到 GitHub 授权页面

#### 2. **主界面**
- **左侧边栏**：内容集合列表（"技术文章"）
- **中间区域**：文章列表，显示所有已发布的文章
- **顶部工具栏**：搜索、筛选、新建文章按钮

#### 3. **文章列表**
- 显示文章标题、发布日期、分类、标签
- 可以点击文章进入编辑模式
- 可以删除文章
- 可以创建新文章

#### 4. **文章编辑界面**
- **左侧**：表单编辑器
  - 标题输入框
  - 日期选择器
  - 分类下拉选择
  - 标签多选/输入
  - 作者输入框
  - 封面图上传
  - 摘要文本框
  - Markdown 编辑器（带工具栏）
- **右侧**：实时预览
  - 实时显示文章最终效果
  - 支持代码高亮
  - 支持图片预览

#### 5. **功能特性**
- ✅ **创建文章**：点击 "New 技术文章"，填写信息，保存
- ✅ **编辑文章**：点击文章标题，修改内容，保存
- ✅ **删除文章**：点击删除按钮，确认删除
- ✅ **上传图片**：点击封面图上传，自动保存到 `assets/images/uploads/`
- ✅ **实时预览**：编辑时右侧实时显示效果
- ✅ **自动保存**：每 10 秒自动保存草稿
- ✅ **Git 提交**：所有更改自动提交到 GitHub 仓库

### 工作流程

1. **用户登录**
   ```
   访问 /admin/ → 点击 Login → GitHub 授权 → 返回管理界面
   ```

2. **创建文章**
   ```
   点击 "New 技术文章" → 填写表单 → 编辑 Markdown → 实时预览 → 点击 "Save" → 
   自动提交到 GitHub → GitHub Pages 自动构建 → 文章上线
   ```

3. **编辑文章**
   ```
   点击文章标题 → 修改内容 → 实时预览 → 点击 "Save" → 
   自动提交到 GitHub → GitHub Pages 自动构建 → 更新上线
   ```

4. **删除文章**
   ```
   点击删除按钮 → 确认删除 → 自动从 GitHub 删除文件 → 
   GitHub Pages 自动构建 → 文章下线
   ```

### 技术优势

- 🚀 **完全静态**：所有文件都是静态的，可以部署在任何地方
- 🔒 **安全认证**：通过 GitHub OAuth，只有授权用户才能访问
- 📝 **Git 工作流**：所有更改都通过 Git 提交，有完整的版本历史
- 🎨 **现代化 UI**：美观的界面，良好的用户体验
- 📱 **响应式设计**：支持手机、平板、电脑访问
- ⚡ **快速加载**：基于 Svelte，性能优秀

---

## 常见问题

### Q1: Cloudflare Workers 免费吗？
**A:** 是的，Cloudflare Workers 免费套餐提供：
- 每天 100,000 次请求（完全够用）
- 无服务器运行时间限制
- 全球 CDN 加速

### Q2: 需要服务器吗？
**A:** 不需要！所有内容都是静态的：
- Sveltia CMS 前端：静态 HTML/JS，托管在 GitHub Pages
- OAuth 代理：Cloudflare Workers（无服务器）
- 内容存储：GitHub 仓库
- 网站托管：GitHub Pages

### Q3: 可以多人协作吗？
**A:** 可以！只要：
- 所有协作者都有 GitHub 账号
- 所有协作者都被添加到仓库的 Collaborators
- 所有协作者都通过 GitHub OAuth 授权

### Q4: 数据安全吗？
**A:** 非常安全：
- 所有数据存储在 GitHub 仓库中
- 通过 GitHub OAuth 认证
- 所有更改都有 Git 版本历史
- 可以随时回滚

### Q5: 如果 Cloudflare Workers 出问题怎么办？
**A:** 可以：
- 使用其他 OAuth 代理服务
- 或者自己部署一个简单的 OAuth 代理（任何支持 Node.js 的平台都可以）

### Q6: 支持自定义字段吗？
**A:** 支持！在 `config.yml` 中可以自定义任何字段，完全匹配 Jekyll 的 Front Matter。

---

## 总结

Sveltia CMS 是一个完美的解决方案，可以让你：
- ✅ 通过网页界面管理 Jekyll 文章
- ✅ 实现完整的增删改查功能
- ✅ 完全免费，无需服务器
- ✅ 部署在 GitHub Pages 上
- ✅ 享受现代化的用户体验

按照本指南操作，你就能拥有一个功能完整的内容管理系统！

---

**需要帮助？** 如果遇到问题，可以：
1. 查看 Sveltia CMS 官方文档：https://sveltia-cms.sveltethemes.dev/
2. 查看 GitHub 仓库：https://github.com/sveltia/sveltia-cms
3. 检查浏览器控制台的错误信息



