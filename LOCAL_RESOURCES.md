# 📦 本地资源说明

## 已本地化的资源

为了解决国内访问 CDN 慢的问题，所有外部资源已下载到本地 `assets/vendor/` 目录。

### ✅ 已下载的文件

#### CSS 文件
- ✅ `bulma.min.css` (207 KB) - Bulma CSS 框架
- ✅ `fontawesome.min.css` (102 KB) - Font Awesome 图标样式
- ✅ `prism-tomorrow.min.css` (1.3 KB) - Prism.js 代码高亮主题

#### JavaScript 文件
- ✅ `js/prism.min.js` (19 KB) - Prism.js 核心
- ✅ `js/prism-javascript.min.js` (4.6 KB) - JavaScript 语法支持
- ✅ `js/prism-python.min.js` (2.1 KB) - Python 语法支持
- ✅ `js/prism-css.min.js` (1.2 KB) - CSS 语法支持
- ✅ `js/prism-bash.min.js` (6.1 KB) - Bash 语法支持

#### 字体文件
- ✅ `webfonts/fa-solid-900.woff2` (150 KB) - Font Awesome 实心图标字体
- ✅ `webfonts/fa-regular-400.woff2` (25 KB) - Font Awesome 常规图标字体
- ✅ `webfonts/fa-brands-400.woff2` (108 KB) - Font Awesome 品牌图标字体

### 📁 文件结构

```
assets/vendor/
├── bulma.min.css
├── fontawesome.min.css
├── prism-tomorrow.min.css
├── js/
│   ├── prism.min.js
│   ├── prism-javascript.min.js
│   ├── prism-python.min.js
│   ├── prism-css.min.js
│   └── prism-bash.min.js
└── webfonts/
    ├── fa-solid-900.woff2
    ├── fa-regular-400.woff2
    └── fa-brands-400.woff2
```

### 🔧 引用方式

所有资源已在 `_layouts/default.html` 中更新为本地引用：

```html
<!-- CSS -->
<link rel="stylesheet" href="{{ '/assets/vendor/bulma.min.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/vendor/fontawesome.min.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/vendor/prism-tomorrow.min.css' | relative_url }}">

<!-- JavaScript -->
<script src="{{ '/assets/vendor/js/prism.min.js' | relative_url }}"></script>
<script src="{{ '/assets/vendor/js/prism-javascript.min.js' | relative_url }}"></script>
```

### ✨ 优势

1. **加载速度快** - 无需访问国外 CDN
2. **离线可用** - 完全本地化，无需网络
3. **稳定可靠** - 不受 CDN 服务影响
4. **版本锁定** - 避免 CDN 更新导致的兼容性问题

### 📦 总大小

所有本地资源总计约：**630 KB**

压缩后部署到 GitHub Pages 不会有明显影响。

### 🔄 更新资源

如果需要更新到新版本，重新运行以下命令：

```powershell
# 更新 Bulma
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" -OutFile "assets/vendor/bulma.min.css"

# 更新 Font Awesome
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" -OutFile "assets/vendor/fontawesome.min.css"

# 更新 Prism.js
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" -OutFile "assets/vendor/prism-tomorrow.min.css"
```

### ⚠️ 注意事项

1. Font Awesome CSS 中的字体路径已修改为相对路径
2. 所有资源已通过 Jekyll 的 `relative_url` 过滤器引用，确保在不同路径下都能正常工作
3. 如果添加新的代码语言高亮，需要下载对应的 `prism-<language>.min.js` 文件

---

✅ **本地化完成！现在网站完全不依赖外部 CDN，国内访问速度大幅提升！**
