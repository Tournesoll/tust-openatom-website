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

REM 检查配置文件（首次运行模式支持）
if not exist "config.json" (
    echo [提示] 未找到 config.json 配置文件
    echo [提示] 将启动首次运行向导，引导你完成配置
    echo.
)

REM 检查端口是否被占用
echo [信息] 检查端口 8888...
netstat -ano | findstr :8888 >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口 8888 可能被占用
    echo [提示] 如果启动失败，请运行 kill-port.bat 关闭占用端口的进程
    echo.
)

REM 启动 Electron 应用
echo [信息] 正在启动应用...
echo [提示] 如果端口被占用，应用会自动尝试关闭占用进程
echo.
call npm run electron

pause

