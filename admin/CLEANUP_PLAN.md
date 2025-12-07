# 🧹 代码清理计划

## 📋 清理分类

### 1. 删除备份文件 ❌
- `config.json.backup` - 备份文件
- `config.json.old` - 旧配置文件

### 2. 删除不需要的文件 ❌
- `cloudflare-worker.js` - Sveltia CMS 相关，已不使用
- `config.yml` - admin 目录下的旧配置文件
- `index.html` - admin 目录下的旧文件（应该用 public/index.html）
- `assets/README.md` - 临时说明文件

### 3. 整理文档到 docs 目录 📁
将所有开发文档移到 `admin/docs/` 目录：

**开发指南类**：
- `BUILD_GUIDE.md` - 打包指南
- `ELECTRON_SETUP.md` - Electron 设置
- `QUICKSTART.md` - 快速开始
- `LOCAL_DEVELOPMENT.md` - 本地开发

**配置说明类**：
- `CONFIG_CHECKLIST.md` - 配置检查清单
- `TEST_WIZARD_GUIDE.md` - 向导测试指南

**故障排除类**：
- `DEPLOY_TROUBLESHOOTING.md` - 部署故障排除
- `TROUBLESHOOTING.md` - 通用故障排除

**功能说明类**：
- `WIZARD_GUIDE.md` - 向导功能说明
- `WIZARD_IMPLEMENTATION_STATUS.md` - 向导实现状态
- `PACKAGE_ANALYSIS.md` - 打包分析

**其他文档**：
- `DEPLOYMENT_SUMMARY.md` - 部署总结
- `NEXT_STEPS.md` - 下一步计划
- `SVELTIA_SETUP.md` - Sveltia CMS 设置（历史文档）
- `TEST_GUIDE.md` - 测试指南
- `README_NEW.md` - 新 README（可能重复）
- `README_ELECTRON.md` - Electron README（可能重复）

**保留在主目录**：
- `README.md` - 主 README（保留，但需要更新）

### 4. 保留的核心文件 ✅
- `main.js` - Electron 主进程
- `server.js` - Express 服务器
- `package.json` - 项目配置
- `package-lock.json` - 依赖锁定
- `config.example.json` - 配置示例
- `routes/` - API 路由
- `utils/` - 工具函数
- `public/` - 前端文件
- `start.bat` / `start.sh` - 启动脚本
- `build.bat` - 打包脚本
- `kill-port.bat` / `kill-port.sh` - 端口清理脚本

## 🎯 清理后的目录结构

```
admin/
├── docs/                    # 📁 文档目录（新建）
│   ├── BUILD_GUIDE.md
│   ├── ELECTRON_SETUP.md
│   ├── QUICKSTART.md
│   ├── LOCAL_DEVELOPMENT.md
│   ├── CONFIG_CHECKLIST.md
│   ├── TEST_WIZARD_GUIDE.md
│   ├── DEPLOY_TROUBLESHOOTING.md
│   ├── TROUBLESHOOTING.md
│   ├── WIZARD_GUIDE.md
│   ├── WIZARD_IMPLEMENTATION_STATUS.md
│   ├── PACKAGE_ANALYSIS.md
│   ├── DEPLOYMENT_SUMMARY.md
│   ├── NEXT_STEPS.md
│   ├── SVELTIA_SETUP.md
│   ├── TEST_GUIDE.md
│   ├── README_NEW.md
│   └── README_ELECTRON.md
├── assets/                  # 图标资源
├── public/                  # 前端文件
├── routes/                  # API 路由
├── utils/                   # 工具函数
├── main.js                  # ✅ 核心文件
├── server.js                # ✅ 核心文件
├── package.json             # ✅ 核心文件
├── package-lock.json        # ✅ 核心文件
├── config.example.json      # ✅ 核心文件
├── README.md                # ✅ 主文档
├── start.bat                # ✅ 启动脚本
├── start.sh                 # ✅ 启动脚本
├── build.bat                # ✅ 打包脚本
├── kill-port.bat            # ✅ 工具脚本
└── kill-port.sh             # ✅ 工具脚本
```

## 📝 执行步骤

1. 创建 `docs` 目录
2. 移动所有文档文件到 `docs/`
3. 删除备份文件和不需要的文件
4. 更新 `README.md`（添加文档索引）
5. 更新打包配置（排除 docs 目录）









