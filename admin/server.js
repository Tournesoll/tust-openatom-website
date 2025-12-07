const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const gitRoutes = require('./routes/git');
const tagsRoutes = require('./routes/tags');

const app = express();

// 加载配置文件
let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (error) {
  console.error('❌ 配置文件不存在！请复制 config.example.json 为 config.json 并填写配置');
  process.exit(1);
}

// 从配置文件读取端口，如果没有则使用 8888
const PORT = process.env.PORT || config.server?.port || 8888;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config.server.sessionSecret || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // 本地开发使用 http，设为 false
}));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 将 config 传递给路由
app.use((req, res, next) => {
  req.config = config;
  next();
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/git', gitRoutes);
app.use('/api/tags', tagsRoutes);

// 主页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 管理后台已启动！`);
  console.log(`📝 访问地址: http://localhost:${PORT}`);
  console.log(`📁 文章目录: ${path.resolve(__dirname, config.paths.postsDir)}`);
});

