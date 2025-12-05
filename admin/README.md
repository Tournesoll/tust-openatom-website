# 内容管理后台

这是 Decap CMS 管理后台模块，用于在线管理网站内容。

## 📁 目录结构

```
admin/
├── index.html      # 后台入口页面
├── config.yml      # CMS 配置文件
└── README.md       # 本说明文件
```

## 🚀 使用方法

### 访问后台

访问：`https://your-site.github.io/repo-name/admin/`

### 首次使用

1. 点击 "Login with GitHub"
2. 使用 GitHub 账号登录
3. 授权访问仓库权限
4. 开始管理内容

## ⚙️ 配置说明

### GitHub OAuth 配置

1. 访问：https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: `TUST OpenAtom CMS`
   - Homepage URL: `https://tournesoll.github.io/tust-openatom-website`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
4. 获取 Client ID（不需要 Client Secret，使用 PKCE）

### 本地开发

如需在本地测试，取消 `config.yml` 中的 `local_backend: true` 注释。

## 📝 功能说明

### 文章管理

- ✅ 创建新文章
- ✅ 编辑已有文章
- ✅ 删除文章
- ✅ 上传封面图
- ✅ Markdown 编辑器
- ✅ 实时预览

### 字段说明

- **标题**：文章标题（必填）
- **发布日期**：文章发布日期（必填）
- **分类**：选择文章分类（前端技术/后端技术/设计）
- **标签**：文章标签（可选，可多个）
- **作者**：文章作者（可选，默认：技术社团）
- **封面图**：文章封面图片（可选）
- **摘要**：文章摘要（可选，显示在列表中）
- **正文**：文章正文内容（必填，Markdown 格式）

## 🔒 权限说明

只有拥有仓库写入权限的 GitHub 用户才能使用管理后台。

## 📚 相关文档

- [Decap CMS 官方文档](https://decapcms.org/)
- [GitHub OAuth 配置指南](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)



