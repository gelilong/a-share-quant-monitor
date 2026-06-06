"""
A股量化监控系统 — 本地服务器
- 静态文件托管 (index.html + css/js/data)
- 后台数据抓取线程（可前台开关控制）
- REST API 端点
"""
import sys
import os
import json
import time
import threading
import logging
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

# ── 配置 ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = BASE_DIR / 'scripts'
DATA_DIR = BASE_DIR / 'data'

sys.path.insert(0, str(SCRIPTS_DIR))

# 日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('quant-monitor')

# ── Flask App ─────────────────────────────────────────
app = Flask(
    __name__,
    static_folder=str(BASE_DIR),
    static_url_path=''
)

# ── 后台状态 ──────────────────────────────────────────
class BackendState:
    """后台抓取线程状态（线程安全）"""
    def __init__(self):
        self._lock = threading.Lock()
        self._running = False
        self._thread = None
        self._last_fetch_time = None
        self._last_error = None
        self._fetch_count = 0
        self._current_status = 'idle'  # idle / fetching / error

    @property
    def running(self):
        with self._lock:
            return self._running

    @running.setter
    def running(self, value):
        with self._lock:
            self._running = value

    @property
    def status(self):
        with self._lock:
            return {
                'running': self._running,
                'last_fetch_time': self._last_fetch_time,
                'last_error': self._last_error,
                'fetch_count': self._fetch_count,
                'current_status': self._current_status
            }

    def update(self, **kwargs):
        with self._lock:
            for k, v in kwargs.items():
                setattr(self, f'_{k}', v)

state = BackendState()

# ── 数据抓取 ──────────────────────────────────────────
def run_fetch_all():
    """执行完整的数据抓取流程"""
    from fetch_all import main as fetch_main
    try:
        state.update(current_status='fetching')
        logger.info("开始数据抓取...")
        fetch_main()
        state.update(
            last_fetch_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            last_error=None,
            fetch_count=state.status['fetch_count'] + 1,
            current_status='idle'
        )
        logger.info("数据抓取完成")
    except Exception as e:
        logger.error(f"数据抓取失败: {e}")
        state.update(
            last_error=str(e),
            current_status='error'
        )


def background_loop(interval_seconds=3600):
    """后台抓取循环"""
    logger.info(f"后台抓取线程启动，间隔 {interval_seconds} 秒")
    # 首次立即抓取
    run_fetch_all()
    while state.running:
        time.sleep(interval_seconds)
        if not state.running:
            break
        run_fetch_all()
    logger.info("后台抓取线程已停止")


def start_background():
    """启动后台抓取"""
    if state.running:
        return False, '后台已在运行中'
    state.update(running=True, current_status='idle')
    t = threading.Thread(target=background_loop, args=(3600,), daemon=True, name='fetch-worker')
    t.start()
    state.update(_thread=t)
    logger.info("后台抓取已启动")
    return True, '后台抓取已启动，每小时自动更新'


def stop_background():
    """停止后台抓取"""
    if not state.running:
        return False, '后台未在运行'
    state.update(running=False)
    logger.info("后台抓取已停止")
    return True, '后台抓取已停止'


# ── HTML 首页 ─────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory(str(BASE_DIR), 'index.html')


# ── 静态文件 ──────────────────────────────────────────
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(str(BASE_DIR), path)


# ── API 端点 ──────────────────────────────────────────

@app.route('/api/status')
def api_status():
    """获取后台状态"""
    st = state.status
    return jsonify({
        'running': st['running'],
        'last_fetch_time': st['last_fetch_time'],
        'last_error': st['last_error'],
        'fetch_count': st['fetch_count'],
        'current_status': st['current_status'],
        'server_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })


@app.route('/api/start', methods=['POST'])
def api_start():
    """启动后台抓取"""
    ok, msg = start_background()
    return jsonify({'success': ok, 'message': msg})


@app.route('/api/stop', methods=['POST'])
def api_stop():
    """停止后台抓取"""
    ok, msg = stop_background()
    return jsonify({'success': ok, 'message': msg})


@app.route('/api/refresh', methods=['POST'])
def api_refresh():
    """手动触发一次刷新"""
    if state.status['current_status'] == 'fetching':
        return jsonify({'success': False, 'message': '正在抓取中，请稍后再试'})
    t = threading.Thread(target=run_fetch_all, daemon=True, name='manual-refresh')
    t.start()
    return jsonify({'success': True, 'message': '刷新已触发，请稍后查看结果'})


@app.route('/api/data/<path:name>')
def api_data(name):
    """读取数据文件"""
    # 映射: macro → macro_liquidity.json
    file_map = {
        'macro': 'macro_liquidity.json',
        'capital': 'market_capital.json',
        'microstructure': 'market_microstructure.json',
        'sector': 'sector_rotation.json',
        'stocks': 'stock_microstructure.json',
        'summary': 'summary.json'
    }
    filename = file_map.get(name, name)
    filepath = DATA_DIR / filename
    if filepath.exists():
        return send_from_directory(str(DATA_DIR), filename)
    return jsonify({'error': f'{name} 数据不存在'}), 404


# ── 启动 ──────────────────────────────────────────────
def main():
    import argparse
    parser = argparse.ArgumentParser(description='A股量化监控系统 - 本地服务器')
    parser.add_argument('--port', type=int, default=8080, help='服务端口 (默认 8080)')
    parser.add_argument('--no-auto-start', action='store_true', help='不自动启动后台抓取')
    parser.add_argument('--interval', type=int, default=3600, help='抓取间隔秒数 (默认 3600)')
    args = parser.parse_args()

    # 确保数据目录存在
    DATA_DIR.mkdir(exist_ok=True)

    print("""
╔══════════════════════════════════════════════════════╗
║        📊 A股量化监控系统 — 本地服务器版              ║
║                                                      ║
║   前端:  http://localhost:{port}                      ║
║   API:   http://localhost:{port}/api/                 ║
║                                                      ║
║   状态:  /api/status                                  ║
║   启动:  POST /api/start                              ║
║   停止:  POST /api/stop                               ║
║   刷新:  POST /api/refresh                            ║
║   数据:  GET /api/data/<macro|capital|...>            ║
╚══════════════════════════════════════════════════════╝
    """.format(port=args.port))

    if not args.no_auto_start:
        start_background()
        print("✅ 后台数据抓取已自动启动 (每小时更新)")
    else:
        print("⏸️  后台未启动，可通过前端面板手动开启")

    print(f"\n🌐 浏览器打开: http://localhost:{args.port}\n")

    app.run(host='0.0.0.0', port=args.port, debug=False, threaded=True)


if __name__ == '__main__':
    main()
