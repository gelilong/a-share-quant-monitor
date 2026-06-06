/**
 * A股量化监控系统 - 主应用逻辑
 * 负责数据加载、页面渲染、5层导航切换、自动汇总
 */
class App {
  constructor() {
    this.currentLayer = 'layer1';
    this.data = {};
    this.loading = false;
    this.dataPath = 'data/';  // GitHub Pages上的数据路径
  }

  /**
   * 初始化应用
   */
  async init() {
    // 渲染导航
    this.renderNav();
    
    // 渲染自选股管理
    stockManager.render('watchlistContainer');
    
    // 加载数据
    await this.loadAllData();
    
    // 渲染首页（第一层）
    this.switchLayer('layer1');
    
    // 启动定时刷新（每小时）
    this.startAutoRefresh();
    
    // 响应式处理
    window.addEventListener('resize', () => {
      chartRenderer.resizeAll();
    });
    
    console.log('A股量化监控系统初始化完成');
  }

  /**
   * 渲染五层导航
   */
  renderNav() {
    const layers = [
      { id: 'layer1', name: INDICATOR_CONFIG.layer1.name, icon: INDICATOR_CONFIG.layer1.icon, subtitle: INDICATOR_CONFIG.layer1.subtitle },
      { id: 'layer2', name: INDICATOR_CONFIG.layer2.name, icon: INDICATOR_CONFIG.layer2.icon, subtitle: INDICATOR_CONFIG.layer2.subtitle },
      { id: 'layer3', name: INDICATOR_CONFIG.layer3.name, icon: INDICATOR_CONFIG.layer3.icon, subtitle: INDICATOR_CONFIG.layer3.subtitle },
      { id: 'layer4', name: INDICATOR_CONFIG.layer4.name, icon: INDICATOR_CONFIG.layer4.icon, subtitle: INDICATOR_CONFIG.layer4.subtitle },
      { id: 'layer5', name: INDICATOR_CONFIG.layer5.name, icon: INDICATOR_CONFIG.layer5.icon, subtitle: INDICATOR_CONFIG.layer5.subtitle }
    ];
    
    const navContainer = document.getElementById('layerNav');
    if (!navContainer) return;
    
    let html = '';
    layers.forEach((layer, idx) => {
      html += `
        <div class="layer-nav-item" data-layer="${layer.id}" onclick="app.switchLayer('${layer.id}')">
          <div class="layer-number">第${idx + 1}层</div>
          <div class="layer-icon">${layer.icon}</div>
          <div class="layer-name">${layer.name}</div>
          <div class="layer-subtitle">${layer.subtitle}</div>
        </div>
      `;
    });
    
    navContainer.innerHTML = html;
    
    // 综合汇总 tab
    const summaryTab = `
      <div class="layer-nav-item summary-tab" data-layer="summary" onclick="app.showSummary()">
        <div class="layer-icon">📋</div>
        <div class="layer-name">综合汇总</div>
        <div class="layer-subtitle">自动研判</div>
      </div>
    `;
    navContainer.innerHTML += summaryTab;
  }

  /**
   * 加载所有层级数据
   */
  async loadAllData() {
    this.loading = true;
    this.showLoading(true);
    
    const dataFiles = {
      macro: `${this.dataPath}macro_liquidity.json`,
      capital: `${this.dataPath}market_capital.json`,
      microstructure: `${this.dataPath}market_microstructure.json`,
      sector: `${this.dataPath}sector_rotation.json`,
      stocks: `${this.dataPath}stock_microstructure.json`,
      summary: `${this.dataPath}summary.json`
    };
    
    const promises = Object.entries(dataFiles).map(async ([key, path]) => {
      try {
        const resp = await fetch(path);
        if (resp.ok) {
          this.data[key] = await resp.json();
        } else {
          console.warn(`数据加载失败: ${path}`);
          this.data[key] = null;
        }
      } catch (e) {
        console.warn(`数据加载异常: ${path}`, e);
        this.data[key] = null;
      }
    });
    
    await Promise.all(promises);
    this.loading = false;
    this.showLoading(false);
    
    // 更新最后更新时间
    this.updateLastUpdateTime();
  }

  /**
   * 切换层级
   */
  switchLayer(layerId) {
    this.currentLayer = layerId;
    
    // 更新导航高亮
    document.querySelectorAll('.layer-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.layer === layerId);
    });
    
    // 渲染指标面板
    this.renderLayer(layerId);
    
    // 滚动到内容区
    document.getElementById('layerContent').scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * 渲染指定层级的所有指标
   */
  renderLayer(layerId) {
    const contentContainer = document.getElementById('layerContent');
    if (!contentContainer) return;
    
    // 找到对应配置
    let layerConfig = null;
    for (const key of ['layer1', 'layer2', 'layer3', 'layer4', 'layer5']) {
      if (INDICATOR_CONFIG[key].id === layerId) {
        layerConfig = INDICATOR_CONFIG[key];
        break;
      }
    }
    
    if (!layerConfig) return;
    
    // 获取对应数据
    const dataKeyMap = {
      'layer1': 'macro',
      'layer2': 'capital',
      'layer3': 'microstructure',
      'layer4': 'sector',
      'layer5': null
    };
    const dataKey = dataKeyMap[layerId];
    
    // 构建HTML
    let html = `
      <div class="layer-header">
        <h2>${layerConfig.icon} ${layerConfig.name}</h2>
        <p class="layer-desc">${layerConfig.description}</p>
      </div>
    `;
    
    if (layerId === 'layer5') {
      // 第五层：个股微观结构 - 特殊处理
      html += this.renderStockLayer(layerConfig);
    } else {
      // 其他层：遍历指标
      layerConfig.indicators.forEach((indicator, idx) => {
        html += this.renderIndicatorCard(indicator, dataKey, idx);
      });
    }
    
    contentContainer.innerHTML = html;
    
    // 渲染图表
    this.renderChartsForLayer(layerId, dataKey);
  }

  /**
   * 渲染指标卡片
   */
  renderIndicatorCard(indicator, dataKey, idx) {
    const chartId = `chart_${indicator.id}_${idx}`;
    
    return `
      <div class="indicator-card">
        <div class="indicator-card-header">
          <h3 class="indicator-name">${indicator.name}</h3>
          <span class="indicator-fullname">${indicator.fullName}</span>
        </div>
        <div class="indicator-card-body">
          <div class="chart-container" id="${chartId}"></div>
          <div class="indicator-info">
            <div class="indicator-desc">
              <h4>📖 指标说明</h4>
              <div class="desc-content">${indicator.description}</div>
            </div>
            ${indicator.signals && indicator.signals.length > 0 ? `
              <div class="indicator-signals">
                <h4>🎯 信号解读</h4>
                ${indicator.signals.map(s => `
                  <div class="signal-item" style="border-left: 3px solid ${s.color}">
                    <span class="signal-condition">${s.condition}</span>
                    <span class="signal-level" style="color: ${s.color}">→ ${s.level}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染个股层
   */
  renderStockLayer(layerConfig) {
    let html = `
      <div class="layer-header">
        <h2>${layerConfig.icon} ${layerConfig.name}</h2>
        <p class="layer-desc">${layerConfig.description}</p>
      </div>
      
      <div class="stock-dashboard">
        <div class="stock-cards-header">
          <h3>📈 核心标的综合研判</h3>
          <span class="stock-count" id="stockCount"></span>
        </div>
        <div class="stock-cards" id="stockCards"></div>
      </div>
      
      <div class="stock-indicators-detail">
        <h3>🔬 微观结构指标详解</h3>
    `;
    
    layerConfig.indicators.forEach((indicator) => {
      html += `
        <div class="indicator-card">
          <div class="indicator-card-header">
            <h3 class="indicator-name">${indicator.name}</h3>
            <span class="indicator-fullname">${indicator.fullName}</span>
          </div>
          <div class="indicator-card-body">
            <div class="indicator-info">
              <div class="indicator-desc">
                <h4>📖 指标说明</h4>
                <div class="desc-content">${indicator.description}</div>
              </div>
              ${indicator.signals && indicator.signals.length > 0 ? `
                <div class="indicator-signals">
                  <h4>🎯 信号解读</h4>
                  ${indicator.signals.map(s => `
                    <div class="signal-item" style="border-left: 3px solid ${s.color}">
                      <span class="signal-condition">${s.condition}</span>
                      <span class="signal-level" style="color: ${s.color}">→ ${s.level}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  /**
   * 渲染指定层的所有图表
   */
  renderChartsForLayer(layerId, dataKey) {
    if (!dataKey || !this.data[dataKey]) return;
    
    const data = this.data[dataKey];
    const indicators = data.indicators || {};
    
    // 找到层配置
    let layerConfig = null;
    for (const key of ['layer1', 'layer2', 'layer3', 'layer4', 'layer5']) {
      if (INDICATOR_CONFIG[key].id === layerId) {
        layerConfig = INDICATOR_CONFIG[key];
        break;
      }
    }
    
    if (!layerConfig) return;
    
    if (layerId === 'layer5') {
      // 个股层：渲染卡片
      const stocks = this.data.stocks?.stocks || [];
      document.getElementById('stockCount') && (document.getElementById('stockCount').textContent = `共 ${stocks.length} 只`);
      chartRenderer.renderStockCards('stockCards', stocks, stockManager.getAll());
    } else {
      // 其他层：渲染图表
      layerConfig.indicators.forEach((indicator, idx) => {
        const chartId = `chart_${indicator.id}_${idx}`;
        const indicatorData = indicators[indicator.id];
        
        if (!indicatorData) return;
        
        switch (indicator.chartType) {
          case 'line':
            chartRenderer.renderLineChart(chartId, indicatorData, {
              name: indicator.name,
              subtitle: indicator.fullName,
              fields: indicator.fields,
              thresholds: indicator.thresholds
            });
            break;
          case 'bar':
            chartRenderer.renderBarChart(chartId, indicatorData, {
              name: indicator.name,
              fields: indicator.fields
            });
            break;
          case 'gauge':
            const gaugeValue = this.extractGaugeValue(indicatorData, indicator.id);
            chartRenderer.renderGaugeChart(chartId, gaugeValue, {
              name: indicator.name,
              subtitle: indicator.fullName,
              min: indicator.gaugeMin || 0,
              max: indicator.gaugeMax || 100,
              unit: indicator.gaugeUnit || '%'
            });
            break;
          case 'heatmap':
            chartRenderer.renderHeatmapChart(chartId, indicatorData, {
              name: indicator.name,
              type: indicator.id === 'sector_rs' ? 'rs' : 'crowding'
            });
            break;
        }
      });
    }
  }

  /**
   * 提取仪表盘显示值
   */
  extractGaugeValue(data, indicatorId) {
    switch (indicatorId) {
      case 'market_breadth':
        return data.above_ma20_ratio || 0;
      case 'correlation_index':
        return ((data.correlation || 0) + 1) * 50;  // -1~1 映射到 0~100
      case 'erp':
        return ((data.sigma_position || 0) + 3) * (100 / 6); // -3~3 映射到 0~100
      default:
        return data.latest || data.value || 50;
    }
  }

  /**
   * 显示综合汇总
   */
  showSummary() {
    this.currentLayer = 'summary';
    
    document.querySelectorAll('.layer-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.layer === 'summary');
    });
    
    const container = document.getElementById('layerContent');
    if (!container) return;
    
    // 渲染汇总面板
    let html = '<div class="summary-page">';
    
    // 每层摘要
    const layerMeta = [
      { id: 'layer1', label: '第一层：宏观流动性与货币政策', data: this.data.macro },
      { id: 'layer2', label: '第二层：大盘资金面与风险溢价', data: this.data.capital },
      { id: 'layer3', label: '第三层：大盘微观结构与情绪', data: this.data.microstructure },
      { id: 'layer4', label: '第四层：行业板块轮动', data: this.data.sector },
      { id: 'layer5', label: '第五层：个股微观结构', data: this.data.stocks }
    ];
    
    html += '<div class="summary-grid">';
    
    layerMeta.forEach(layer => {
      if (!layer.data || !layer.data.indicators) return;
      const inds = layer.data.indicators;
      
      html += `
        <div class="summary-card">
          <h3>${layer.label}</h3>
          <div class="summary-card-body">
      `;
      
      // 提取每个指标的关键值
      Object.entries(inds).forEach(([key, val]) => {
        const name = this.getIndicatorShortName(layer.id, key);
        const signal = val.signal || val.sentiment || val.warning || val.trend || val.volume_level || '';
        const latest = val.latest || val.latest_volume || val.latest_erp || val.latest_rate || val.latest_pcr || '';
        const displayVal = latest !== '' && latest !== null && latest !== undefined 
          ? (typeof latest === 'number' ? latest.toFixed(2) : latest)
          : '';
        
        html += `
          <div class="summary-indicator">
            <span class="sum-name">${name}</span>
            <span class="sum-value">${displayVal}</span>
            <span class="sum-signal">${signal}</span>
          </div>
        `;
      });
      
      html += '</div></div>';
    });
    
    html += '</div>';
    
    // 综合研判
    if (this.data.summary) {
      html += '<div id="summaryPanel" class="summary-judgement"></div>';
    }
    
    // 个股综合
    if (this.data.stocks && this.data.stocks.stocks) {
      const stocks = this.data.stocks.stocks;
      const buyCount = stocks.filter(s => s.action === '买入').length;
      const holdCount = stocks.filter(s => s.action === '持有').length;
      const sellCount = stocks.filter(s => s.action === '卖出').length;
      
      html += `
        <div class="stock-summary">
          <h3>📈 个股综合研判</h3>
          <div class="stock-summary-stats">
            <div class="stat buy"><span class="stat-num">${buyCount}</span><span class="stat-label">买入</span></div>
            <div class="stat hold"><span class="stat-num">${holdCount}</span><span class="stat-label">持有</span></div>
            <div class="stat sell"><span class="stat-num">${sellCount}</span><span class="stat-label">卖出</span></div>
          </div>
          <div id="summaryStockCards" class="stock-cards"></div>
        </div>
      `;
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // 渲染汇总面板
    if (this.data.summary) {
      chartRenderer.renderSummary('summaryPanel', this.data.summary);
    }
    
    // 渲染个股卡片
    if (this.data.stocks && this.data.stocks.stocks) {
      chartRenderer.renderStockCards('summaryStockCards', this.data.stocks.stocks, stockManager.getAll());
    }
    
    container.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * 获取指标简称
   */
  getIndicatorShortName(layerId, key) {
    const nameMap = {
      'dr007': 'DR007',
      'bond_yield_10y': '10Y国债',
      'omo_mlf': 'OMO/MLF',
      'cnh_rate': 'CNH汇率',
      'erp': 'ERP溢价',
      'margin_trade': '两融',
      'northbound': '北向资金',
      'market_volume': '成交额',
      'option_sentiment': '期权PCR',
      'market_breadth': '市场宽度',
      'limit_stocks': '涨跌停',
      'correlation_index': '股债相关',
      'sector_crowding': '拥挤度',
      'sector_rs': '行业RS',
      'etf_flow': 'ETF资金',
      'ppi_cpi_spread': 'PPI-CPI'
    };
    return nameMap[key] || key;
  }

  /**
   * 显示/隐藏加载状态
   */
  showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * 更新最后更新时间
   */
  updateLastUpdateTime() {
    const el = document.getElementById('lastUpdateTime');
    if (!el) return;
    
    const summary = this.data.summary;
    if (summary && summary.update_time) {
      el.textContent = `数据更新: ${summary.update_time}`;
    } else {
      el.textContent = `数据更新: ${new Date().toLocaleString()}`;
    }
  }

  /**
   * 刷新所有数据
   */
  async refreshAll() {
    await this.loadAllData();
    
    if (this.currentLayer === 'summary') {
      this.showSummary();
    } else {
      this.switchLayer(this.currentLayer);
    }
  }

  /**
   * 启动定时自动刷新
   */
  startAutoRefresh() {
    // 每小时刷新一次
    setInterval(() => {
      console.log('自动刷新数据...');
      this.refreshAll();
    }, 3600000); // 1小时 = 3600000ms
  }
}

// 全局app实例
const app = new App();

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
