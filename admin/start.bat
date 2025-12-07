@echo off
chcp 65001 >nul
echo ========================================
echo   Jekyll 文章管理 - Electron 桌面应用
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查配置文件
if not exist "config.json" (
    echo [警告] 未找到 config.json 配置文件
    echo 请复制 config.example.json 为 config.json 并填写配置
    pause
    exit /b 1
)

REM 启动 Electron 应用
echo [信息] 正在启动应用...
echo.
call npm run electron

pause

