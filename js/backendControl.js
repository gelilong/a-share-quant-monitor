/**
 * A股量化监控系统 — 后台控制模块
 * 负责前端与本地服务器的启停通信
 */
class BackendControl {
  constructor() {
    // 检测是否在本地服务器模式下运行
    this.isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    this.pollTimer = null;
  }

  /**
   * 初始化
   */
  async init() {
    if (!this.isLocal) {
      // 非本地模式，隐藏控制面板
      const panel = document.getElementById('backendControl');
      if (panel) panel.style.display = 'none';
      return;
    }

    // 查询初始状态
    await this.checkStatus();

    // 定期轮询状态（每 10 秒）
    this.pollTimer = setInterval(() => this.checkStatus(), 10000);

    console.log('后台控制模块初始化完成 (本地模式)');
  }

  /**
   * 查询后台状态
   */
  async checkStatus() {
    try {
      const resp = await fetch('/api/status');
      const data = await resp.json();
      this.updateUI(data);
      return data;
    } catch (e) {
      console.warn('后台连接失败', e);
      this.setDisconnected();
      return null;
    }
  }

  /**
   * 更新前端UI
   */
  updateUI(data) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const toggle = document.getElementById('backendToggle');
    const meta = document.getElementById('backendMeta');

    if (!dot || !text || !toggle) return;

    if (data.running) {
      dot.className = 'status-dot running';
      text.textContent = '运行中';
      text.style.color = '#52c41a';
      toggle.textContent = '⏸ 停止后台';
      toggle.className = 'btn backend-toggle stop';
    } else {
      dot.className = 'status-dot stopped';
      text.textContent = '已停止';
      text.style.color = '#ff4d4f';
      toggle.textContent = '▶ 启动后台';
      toggle.className = 'btn backend-toggle start';
    }

    // 显示额外信息
    let metaParts = [];
    if (data.fetch_count > 0) {
      metaParts.push(`已抓取 ${data.fetch_count} 次`);
    }
    if (data.last_fetch_time) {
      metaParts.push(`上次: ${data.last_fetch_time}`);
    }
    if (data.current_status === 'fetching') {
      metaParts.push('⏳ 抓取中...');
    }
    if (meta) {
      meta.textContent = metaParts.join(' | ');
    }
  }

  /**
   * 设置断开连接状态
   */
  setDisconnected() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (dot) dot.className = 'status-dot disconnected';
    if (text) {
      text.textContent = '未连接';
      text.style.color = '#999';
    }
  }

  /**
   * 切换后台启停
   */
  async toggle() {
    const text = document.getElementById('statusText');
    const isRunning = text && text.textContent === '运行中';

    try {
      const endpoint = isRunning ? '/api/stop' : '/api/start';
      const resp = await fetch(endpoint, { method: 'POST' });
      const data = await resp.json();

      if (data.success) {
        // 短暂延迟后刷新状态
        setTimeout(() => this.checkStatus(), 500);
        this.showToast(data.message);
      } else {
        this.showToast(data.message, 'error');
      }
    } catch (e) {
      this.showToast('操作失败，请检查后台服务器是否已启动', 'error');
    }
  }

  /**
   * Toast 提示
   */
  showToast(message, type = 'success') {
    // 移除已有 toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#ff4d4f' : '#52c41a'};
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: toastIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}

// 全局实例
const backendControl = new BackendControl();
