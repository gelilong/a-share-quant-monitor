#!/bin/bash
# A股量化监控系统 — 启动脚本
# 使用方法: bash start.sh

cd "$(dirname "$0")"

echo "========================================="
echo "  📊 A股量化监控系统 v2.0"
echo "  正在启动本地服务器..."
echo "========================================="

# 检查 Python 环境
PYTHON=/Users/lilongge/.workbuddy/binaries/python/envs/quant-monitor/bin/python3
if [ ! -f "$PYTHON" ]; then
    echo "正在安装依赖..."
    /Users/lilongge/.workbuddy/binaries/python/versions/3.13.12/bin/python3 -m venv /Users/lilongge/.workbuddy/binaries/python/envs/quant-monitor
    /Users/lilongge/.workbuddy/binaries/python/envs/quant-monitor/bin/pip install flask pandas numpy akshare requests -q
fi

# 启动服务器
$PYTHON server.py --port 8080
