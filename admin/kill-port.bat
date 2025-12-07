@echo off
chcp 65001 >nul
echo ========================================
echo   关闭占用 8888 端口的进程
echo ========================================
echo.

echo 正在查找占用 8888 端口的进程...
netstat -ano | findstr :8888

echo.
echo 正在关闭占用端口的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8888') do (
    echo 关闭进程 PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo 完成！端口 8888 已释放。
echo.
pause

