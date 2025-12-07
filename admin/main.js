const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;

// 启动 Express 服务器
function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'server.js');
    serverProcess = spawn('node', [serverPath], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let serverReady = false;

    // 监听服务器输出，检测启动成功
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes('管理后台已启动') && !serverReady) {
        serverReady = true;
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    serverProcess.on('error', (error) => {
      console.error('服务器启动失败:', error);
      if (!serverReady) {
        reject(error);
      }
    });

    serverProcess.on('exit', (code) => {
      console.log(`服务器进程退出，代码: ${code}`);
      if (code !== 0 && !serverReady) {
        reject(new Error(`服务器启动失败，退出代码: ${code}`));
      }
    });

    // 超时处理（10秒）
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('服务器启动超时'));
      }
    }, 10000);
  });
}

// 创建应用窗口
function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const iconExists = require('fs').existsSync(iconPath);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: iconExists ? iconPath : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    show: false, // 先不显示，等服务器启动后再显示
    titleBarStyle: 'default',
    backgroundColor: '#1f2937' // 深色背景
  });

  // 等待服务器启动后加载页面
  startServer()
    .then(() => {
      // 服务器启动成功，加载页面
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.show();
      
      // 开发环境下打开开发者工具
      if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
      }
    })
    .catch((error) => {
      console.error('启动失败:', error);
      // 显示错误信息
      mainWindow.loadURL(`data:text/html,<html><body style="font-family: Arial; padding: 20px; background: #1f2937; color: #fff;">
        <h1>❌ 启动失败</h1>
        <p>服务器启动失败，请检查：</p>
        <ul>
          <li>端口 3000 是否被占用</li>
          <li>config.json 配置文件是否存在</li>
          <li>Node.js 依赖是否已安装</li>
        </ul>
        <p style="color: #ef4444;">错误信息: ${error.message}</p>
      </body></html>`);
      mainWindow.show();
    });

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理窗口关闭
  mainWindow.on('close', (event) => {
    // 关闭服务器进程
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建文章',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                if (typeof window !== 'undefined' && document.getElementById('new-post-btn')) {
                  document.getElementById('new-post-btn').click();
                }
              `);
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            // 可以显示关于对话框
          }
        }
      ]
    }
  ];

  // macOS 特殊处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: '关于' },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏' },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 应用准备就绪
app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

