@echo off
chcp 65001 >nul
echo ========================================
echo   Jekyll 文章管理 - 打包桌面应用
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
    echo [提示] 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

echo [信息] 开始打包应用...
echo [提示] 这可能需要几分钟时间，请耐心等待...
echo.

REM 打包 Windows 应用
call npm run build:win

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   打包完成！
    echo ========================================
    echo.
    echo 打包文件位置: dist 目录
    echo.
    echo 生成的文件：
    echo   - Jekyll 文章管理.exe (便携版，可直接运行)
    echo   - Jekyll 文章管理 Setup x.x.x.exe (安装程序)
    echo.
    echo 你可以：
    echo   1. 直接运行 "Jekyll 文章管理.exe" 测试
    echo   2. 运行安装程序安装到系统
    echo   3. 将 "Jekyll 文章管理.exe" 发送给其他用户使用
    echo.
) else (
    echo.
    echo [错误] 打包失败，请查看上面的错误信息
    echo.
)

pause










