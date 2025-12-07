# 故障排查指南

## 当前问题：页面无法加载，404 错误

### 可能的原因

1. **Sveltia CMS CDN 链接不正确**
   - 当前使用的链接：`https://unpkg.com/@sveltia/cms@latest/dist/sveltia-cms.js`
   - 这个链接可能不存在或路径不对

2. **Sveltia CMS 可能需要构建**
   - Sveltia CMS 可能不是直接通过 CDN 使用的
   - 可能需要从源码构建

### 解决方案

#### 方案 1：检查 CDN 链接

在浏览器中直接访问：
```
https://unpkg.com/@sveltia/cms@latest/dist/sveltia-cms.js
```

如果返回 404，说明链接不对。

#### 方案 2：使用其他 CMS

如果 Sveltia CMS 配置太复杂，可以考虑：

1. **继续使用 Decap CMS + OAuth 代理**
   - 我们已经配置好了 Cloudflare Workers
   - 只需要更新 Decap CMS 的配置

2. **使用简单的自定义界面**
   - 直接使用 GitHub API
   - 创建一个简单的管理界面

### 下一步

请告诉我：
1. 直接访问 CDN 链接是否返回 404？
2. 你更倾向于哪个方案？





