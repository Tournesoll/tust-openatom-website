# Sveltia CMS 配置检查清单

## 📝 配置步骤

### ✅ 步骤 1：创建 GitHub OAuth App

**状态：** ⬜ 未完成

**操作：**
1. 访问：https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: `TUST OpenAtom CMS`
   - Homepage URL: `https://tournesoll.github.io/tust-openatom-website`
   - Authorization callback URL: `https://临时地址/callback`（先填临时地址，部署 Worker 后更新）

**完成后记录：**
- [ ] Client ID: `_________________`
- [ ] Client Secret: `_________________`

---

### ✅ 步骤 2：部署 Cloudflare Workers OAuth 代理

**状态：** ⬜ 未完成

**操作：**
1. 注册 Cloudflare 账号：https://www.cloudflare.com/
2. 进入 Workers & Pages 控制台
3. 创建 Worker，名称：`sveltia-cms-auth`
4. 复制 Worker 代码（见下方）
5. 配置环境变量：
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
6. 部署并获取 Worker URL

**完成后记录：**
- [ ] Worker URL: `https://_________________.workers.dev`

---

### ✅ 步骤 3：更新 GitHub OAuth App 回调 URL

**状态：** ⬜ 未完成

**操作：**
1. 回到 GitHub OAuth App 设置
2. 更新 Authorization callback URL 为：`https://你的WorkerURL/callback`
3. 保存更改

---

### ✅ 步骤 4：更新配置文件

**状态：** ⬜ 未完成

**操作：**
1. 编辑 `admin/config.yml`
2. 更新 `auth_endpoint` 为你的 Worker URL
3. 保存文件

---

### ✅ 步骤 5：推送到 GitHub

**状态：** ⬜ 未完成

**操作：**
```bash
git add admin/
git commit -m "feat: Add Sveltia CMS configuration"
git push origin main
```

---

### ✅ 步骤 6：测试

**状态：** ⬜ 未完成

**操作：**
1. 等待 GitHub Pages 构建完成（1-2 分钟）
2. 访问：https://tournesoll.github.io/tust-openatom-website/admin/
3. 点击 "Login with GitHub"
4. 授权并测试功能

---

## 🎉 完成！

所有步骤完成后，你就可以通过网页界面管理 Jekyll 文章了！




