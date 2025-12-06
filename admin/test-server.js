// 快速测试服务器是否能正常启动
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 检查配置文件
try {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  console.log('✅ 配置文件加载成功');
  console.log('   GitHub Client ID:', config.github.clientId);
  console.log('   服务器端口:', config.server.port);
  console.log('   文章目录:', path.resolve(__dirname, config.paths.postsDir));
} catch (error) {
  console.error('❌ 配置文件错误:', error.message);
  process.exit(1);
}

// 检查依赖
try {
  require('express');
  require('express-session');
  require('axios');
  require('simple-git');
  require('front-matter');
  console.log('✅ 所有依赖已安装');
} catch (error) {
  console.error('❌ 依赖缺失:', error.message);
  process.exit(1);
}

// 检查路由文件
const routes = ['routes/auth.js', 'routes/posts.js', 'routes/git.js'];
let allRoutesExist = true;
routes.forEach(route => {
  const routePath = path.join(__dirname, route);
  if (!fs.existsSync(routePath)) {
    console.error(`❌ 路由文件不存在: ${route}`);
    allRoutesExist = false;
  }
});
if (allRoutesExist) {
  console.log('✅ 所有路由文件存在');
}

// 简单测试服务器
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 测试服务器启动成功！`);
  console.log(`📝 访问地址: http://localhost:${PORT}/test`);
  console.log(`\n如果看到这条消息，说明服务器可以正常启动。`);
  console.log(`现在可以运行: node server.js\n`);
  
  // 3秒后自动退出
  setTimeout(() => {
    console.log('测试完成，退出...');
    process.exit(0);
  }, 3000);
});

