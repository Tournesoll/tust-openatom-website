---
layout: post
title: "前端开发基础指南"
date: 2025-01-02 14:30:00 +0800
categories: [frontend]
tags: [HTML, CSS, JavaScript]
author: 技术社团
---

## 前端三剑客

前端开发的三大核心技术：HTML、CSS、JavaScript。

### HTML - 网页结构

HTML（HyperText Markup Language）是网页的骨架：

```html
<!DOCTYPE html>
<html>
<head>
  <title>我的网页</title>
</head>
<body>
  <h1>欢迎</h1>
  <p>这是一个段落</p>
</body>
</html>
```

### CSS - 网页样式

CSS 让网页变得美观：

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
}

h1 {
  color: #2c3e50;
  text-align: center;
}
```

### JavaScript - 网页交互

JavaScript 让网页动起来：

```javascript
// 点击按钮弹出提示
document.querySelector('button').addEventListener('click', () => {
  alert('Hello, World!');
});
```

## 学习路径

1. 先学 HTML，掌握网页结构
2. 再学 CSS，美化页面
3. 最后学 JavaScript，添加交互
4. 进阶学习框架（React、Vue 等）

## 推荐资源

- MDN Web Docs
- freeCodeCamp
- W3Schools
