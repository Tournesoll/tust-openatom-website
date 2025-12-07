#!/bin/bash

echo "========================================"
echo "  Jekyll 文章管理 - Electron 桌面应用"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "[提示] 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
fi

# 检查配置文件
if [ ! -f "config.json" ]; then
    echo "[警告] 未找到 config.json 配置文件"
    echo "请复制 config.example.json 为 config.json 并填写配置"
    exit 1
fi

# 启动 Electron 应用
echo "[信息] 正在启动应用..."
echo ""
npm run electron

