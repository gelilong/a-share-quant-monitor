/**
 * A股量化监控系统 - 自选股管理模块
 * 支持添加/删除自选股，持久化存储至 localStorage
 */
class StockManager {
  constructor() {
    this.storageKey = 'a_share_watchlist';
    this.watchlist = this.load();
  }

  /**
   * 从 localStorage 加载自选股列表
   */
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('加载自选股失败:', e);
      return [];
    }
  }

  /**
   * 保存自选股列表到 localStorage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.watchlist));
    } catch (e) {
      console.error('保存自选股失败:', e);
    }
  }

  /**
   * 添加自选股
   * @param {string} code - 6位股票代码
   * @returns {object} { success, message }
   */
  add(code) {
    // 清理输入
    code = code.trim();
    
    // 验证格式：6位数字
    if (!/^\d{6}$/.test(code)) {
      return { success: false, message: '请输入6位数字股票代码' };
    }
    
    if (this.watchlist.includes(code)) {
      return { success: false, message: '该股票已在自选列表中' };
    }
    
    this.watchlist.push(code);
    this.save();
    return { success: true, message: `成功添加 ${code}` };
  }

  /**
   * 移除自选股
   * @param {string} code - 6位股票代码
   */
  remove(code) {
    this.watchlist = this.watchlist.filter(c => c !== code);
    this.save();
  }

  /**
   * 获取所有自选股
   */
  getAll() {
    return [...this.watchlist];
  }

  /**
   * 检查是否为自选股
   */
  isInWatchlist(code) {
    return this.watchlist.includes(code);
  }

  /**
   * 获取自选股数量
   */
  get count() {
    return this.watchlist.length;
  }

  /**
   * 渲染自选股管理面板
   */
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
      <div class="watchlist-panel">
        <div class="watchlist-header">
          <h3>⭐ 自选股管理 (${this.count}只)</h3>
          <div class="add-stock-form">
            <input type="text" id="stockCodeInput" placeholder="输入6位股票代码..." maxlength="6" />
            <button id="addStockBtn" class="btn btn-primary">添加</button>
          </div>
        </div>
        <div class="watchlist-items" id="watchlistItems">
    `;

    if (this.watchlist.length === 0) {
      html += '<div class="empty-state">暂无自选股，请添加关注的股票代码</div>';
    } else {
      this.watchlist.forEach(code => {
        html += `
          <div class="watchlist-item">
            <span class="watch-code">${code}</span>
            <button class="btn btn-danger btn-sm" onclick="stockManager.removeAndRefresh('${code}')">移除</button>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // 绑定添加事件
    const addBtn = document.getElementById('addStockBtn');
    const input = document.getElementById('stockCodeInput');
    if (addBtn && input) {
      addBtn.onclick = () => {
        const result = this.add(input.value);
        alert(result.message);
        if (result.success) {
          input.value = '';
          this.render(containerId);
          app.refreshAll();
        }
      };
      input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          addBtn.click();
        }
      };
    }
  }

  /**
   * 移除并刷新UI
   */
  removeAndRefresh(code) {
    this.remove(code);
    this.render('watchlistContainer');
    if (typeof app !== 'undefined') {
      app.refreshAll();
    }
  }
}

// 全局实例
const stockManager = new StockManager();
