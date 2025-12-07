const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const configUtils = require('./utils/config');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const gitRoutes = require('./routes/git');
const tagsRoutes = require('./routes/tags');
const setupRoutes = require('./routes/setup');

const app = express();

// 加载配置文件（首次运行时不强制要求）
let config;
try {
  config = configUtils.readConfig() || configUtils.createDefaultConfig();
} catch (error) {
  console.log('⚠️  配置文件不存在，使用默认配置（首次运行模式）');
  config = configUtils.createDefaultConfig();
}

// 从配置文件读取端口，如果没有则使用 8888
const PORT = process.env.PORT || config.server?.port || 8888;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config?.server?.sessionSecret || configUtils.createDefaultConfig().server.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // 本地开发使用 http，设为 false
}));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 将 config 传递给路由（动态读取，支持配置更新）
app.use((req, res, next) => {
  req.config = configUtils.readConfig() || config;
  next();
});

// API 路由
app.use('/api/setup', setupRoutes); // 向导路由（首次运行）
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/git', gitRoutes);
app.use('/api/tags', tagsRoutes);

// 向导页面
app.get('/setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'setup-wizard.html'));
});

// 主页面（根据配置状态决定）
app.get('/', (req, res) => {
  // 如果首次运行，重定向到向导
  if (configUtils.isFirstRun()) {
    return res.redirect('/setup');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 管理后台已启动！`);
  console.log(`📝 访问地址: http://localhost:${PORT}`);

  if (configUtils.isFirstRun()) {
    console.log(`🎯 首次运行模式：请访问 http://localhost:${PORT}/setup 完成配置`);
  } else {
    console.log(`📁 文章目录: ${path.resolve(__dirname, config.paths.postsDir)}`);
  }
});

