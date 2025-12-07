const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const net = require('net');

let mainWindow = null;
let serverProcess = null;

// 从配置文件读取端口
let PORT = 8888; // 默认端口
try {
  const config = JSON.parse(require('fs').readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  PORT = config.server?.port || 8888;
} catch (error) {
  console.log('无法读取配置文件，使用默认端口 8888');
}

// 检查端口是否被占用
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(true);
    });
  });
}

// 关闭占用端口的进程（Windows）
function killProcessOnPortWindows(port) {
  return new Promise((resolve, reject) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(false); // 没有找到占用端口的进程
        return;
      }

      // 提取 PID
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)\s*$/);
        if (match) {
          pids.add(match[1]);
        }
      });

      if (pids.size === 0) {
        resolve(false);
        return;
      }

      // 杀死所有占用端口的进程
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((resolveKill) => {
          exec(`taskkill /F /PID ${pid}`, (error) => {
            if (error) {
              console.log(`无法关闭进程 ${pid}: ${error.message}`);
            } else {
              console.log(`已关闭占用端口的进程: ${pid}`);
            }
            resolveKill();
          });
        });
      });

      Promise.all(killPromises).then(() => {
        // 等待一下让端口释放
        setTimeout(() => resolve(true), 500);
      });
    });
  });
}

// 关闭占用端口的进程（Mac/Linux）
function killProcessOnPortUnix(port) {
  return new Promise((resolve, reject) => {
    exec(`lsof -ti:${port}`, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(false);
        return;
      }

      const pids = stdout.trim().split('\n').filter(pid => pid);
      if (pids.length === 0) {
        resolve(false);
        return;
      }

      const killPromises = pids.map(pid => {
        return new Promise((resolveKill) => {
          exec(`kill -9 ${pid}`, (error) => {
            if (error) {
              console.log(`无法关闭进程 ${pid}: ${error.message}`);
            } else {
              console.log(`已关闭占用端口的进程: ${pid}`);
            }
            resolveKill();
          });
        });
      });

      Promise.all(killPromises).then(() => {
        setTimeout(() => resolve(true), 500);
      });
    });
  });
}

// 关闭占用端口的进程
async function killProcessOnPort(port) {
  if (process.platform === 'win32') {
    return await killProcessOnPortWindows(port);
  } else {
    return await killProcessOnPortUnix(port);
  }
}

// 启动 Express 服务器
async function startServer() {
  // 检查端口是否被占用
  const portInUse = await isPortInUse(PORT);
  
  if (portInUse) {
    console.log(`端口 ${PORT} 被占用，尝试关闭占用进程...`);
    const killed = await killProcessOnPort(PORT);
    
    if (killed) {
      console.log('已关闭占用端口的进程，等待端口释放...');
      // 再等待一下确保端口释放
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('无法自动关闭占用端口的进程，请手动关闭');
    }
    
    // 再次检查端口
    const stillInUse = await isPortInUse(PORT);
    if (stillInUse) {
      throw new Error(`端口 ${PORT} 仍被占用，请手动关闭占用该端口的程序`);
    }
  }

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
      const errorOutput = data.toString();
      console.error(errorOutput);
      
      // 检测端口占用错误
      if (errorOutput.includes('EADDRINUSE') || errorOutput.includes('address already in use')) {
        if (!serverReady) {
          reject(new Error(`端口 ${PORT} 被占用，请关闭其他使用该端口的程序`));
        }
      }
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
      mainWindow.loadURL(`http://localhost:${PORT}`);
      mainWindow.show();
      
      // 开发环境下打开开发者工具
      if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
      }
    })
    .catch((error) => {
      console.error('启动失败:', error);
      
      // 根据错误类型显示不同的提示
      let errorMessage = error.message;
      let suggestions = [];
      
      if (errorMessage.includes('EADDRINUSE') || errorMessage.includes('端口') || errorMessage.includes('被占用')) {
        suggestions = [
          `端口 ${PORT} 被占用，可能的原因：`,
          '1. 之前的应用实例仍在运行',
          '2. 其他程序正在使用该端口',
          '',
          '解决方法：',
          `• 关闭其他使用 ${PORT} 端口的程序`,
          '• 等待几秒后重试（系统会自动尝试关闭占用进程）',
          '• 在任务管理器中结束 node.exe 进程'
        ];
      } else if (errorMessage.includes('config.json')) {
        suggestions = [
          '配置文件问题：',
          '• 检查 config.json 文件是否存在',
          '• 检查配置文件格式是否正确（JSON 格式）',
          '• 复制 config.example.json 为 config.json'
        ];
      } else {
        suggestions = [
          '请检查：',
          '• Node.js 依赖是否已安装（运行 npm install）',
          '• 配置文件是否正确',
          '• 查看控制台获取详细错误信息'
        ];
      }
      
      // 显示错误信息
      mainWindow.loadURL(`data:text/html,<html><head><meta charset="UTF-8"></head><body style="font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 40px; background: #1f2937; color: #fff; line-height: 1.6;">
        <h1 style="color: #ef4444; margin-bottom: 20px;">❌ 启动失败</h1>
        <div style="background: rgba(239, 68, 68, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-weight: bold; margin-bottom: 10px;">错误信息：</p>
          <p style="margin: 0; color: #fca5a5;">${errorMessage}</p>
        </div>
        <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-weight: bold; margin-bottom: 10px;">建议：</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${suggestions.map(s => `<li style="margin: 5px 0;">${s}</li>`).join('')}
          </ul>
        </div>
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            🔄 重试
          </button>
        </div>
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
      console.log('正在关闭服务器进程...');
      // 使用 SIGTERM 优雅关闭，如果不行再用 SIGKILL
      serverProcess.kill('SIGTERM');
      
      // 如果 3 秒后还没关闭，强制关闭
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          console.log('强制关闭服务器进程...');
          serverProcess.kill('SIGKILL');
        }
      }, 3000);
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
      console.log('正在关闭服务器进程...');
      serverProcess.kill('SIGTERM');
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
        app.quit();
      }, 1000);
    } else {
      app.quit();
    }
  }
});

// 应用退出前清理
app.on('before-quit', (event) => {
  if (serverProcess && !serverProcess.killed) {
    event.preventDefault();
    console.log('正在关闭服务器进程...');
    serverProcess.kill('SIGTERM');
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
      app.quit();
    }, 1000);
  }
});

