/**
 * A股量化监控系统 - 图表渲染模块
 * 基于 ECharts 5.x，支持折线图、柱状图、仪表盘、热力图等
 */
class ChartRenderer {
  constructor() {
    this.charts = {};
    this.theme = {
      textColor: '#333',
      axisColor: '#e0e0e0',
      bgColor: '#fff'
    };
  }

  /**
   * 渲染折线图
   */
  renderLineChart(containerId, data, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (this.charts[containerId]) {
      this.charts[containerId].dispose();
    }
    
    const chart = echarts.init(container);
    this.charts[containerId] = chart;
    
    const option = {
      backgroundColor: '#fff',
      title: {
        text: config.name || '',
        subtext: config.subtitle || '',
        left: 'center',
        textStyle: { fontSize: 14, color: '#333' },
        subtextStyle: { fontSize: 11, color: '#999' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: config.fields.filter(f => f.type === 'y' || f.type === 'y2').map(f => f.label),
        bottom: 0
      },
      grid: {
        left: '8%',
        right: config.fields.some(f => f.type === 'y2') ? '12%' : '5%',
        top: '15%',
        bottom: '12%'
      },
      xAxis: {
        type: 'category',
        data: data.dates || [],
        axisLabel: { rotate: 45, fontSize: 10 },
        axisLine: { lineStyle: { color: '#e0e0e0' } }
      },
      yAxis: [
        {
          type: 'value',
          name: config.yAxisName || '',
          axisLabel: { fontSize: 10 },
          splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
        }
      ],
      series: config.fields
        .filter(f => f.type === 'y' || f.type === 'y2')
        .map((field, idx) => {
          const key = field.key.replace('_y2', '');
          const seriesConfig = {
            name: field.label,
            type: 'line',
            data: data[key] || [],
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2, color: field.color },
            itemStyle: { color: field.color }
          };
          
          if (field.type === 'y2') {
            seriesConfig.yAxisIndex = 1;
          }
          
          return seriesConfig;
        })
    };
    
    // 如果需要双Y轴
    if (config.fields.some(f => f.type === 'y2')) {
      option.yAxis.push({
        type: 'value',
        name: config.y2AxisName || '',
        axisLabel: { fontSize: 10 },
        splitLine: { show: false }
      });
    }
    
    // 添加阈值线
    if (config.thresholds) {
      config.thresholds.forEach(t => {
        option.series.push({
          name: t.label,
          type: 'line',
          markLine: {
            silent: true,
            data: [{ yAxis: t.value, label: { formatter: t.label }, lineStyle: { color: t.color, type: 'dashed' } }]
          },
          data: []
        });
      });
    }
    
    chart.setOption(option);
    return chart;
  }

  /**
   * 渲染柱状图
   */
  renderBarChart(containerId, data, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (this.charts[containerId]) {
      this.charts[containerId].dispose();
    }
    
    const chart = echarts.init(container);
    this.charts[containerId] = chart;
    
    // 判断数据格式
    const isMultiBar = config.fields && config.fields.length > 0;
    
    let series = [];
    if (isMultiBar) {
      series = config.fields.map(f => ({
        name: f.label,
        type: 'bar',
        data: data[f.key] || [],
        itemStyle: { color: f.color, borderRadius: [4, 4, 0, 0] }
      }));
    } else {
      series = [{
        type: 'bar',
        data: data.values || [],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#5470c6' },
            { offset: 1, color: '#91cc75' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }];
    }
    
    const option = {
      backgroundColor: '#fff',
      title: {
        text: config.name || '',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: isMultiBar ? {
        data: config.fields.map(f => f.label),
        bottom: 0
      } : undefined,
      grid: {
        left: '8%',
        right: '5%',
        top: '15%',
        bottom: isMultiBar ? '12%' : '8%'
      },
      xAxis: {
        type: 'category',
        data: data.dates || data.labels || [],
        axisLabel: { rotate: 45, fontSize: 9 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
      },
      series: series
    };
    
    chart.setOption(option);
    return chart;
  }

  /**
   * 渲染仪表盘
   */
  renderGaugeChart(containerId, value, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (this.charts[containerId]) {
      this.charts[containerId].dispose();
    }
    
    const chart = echarts.init(container);
    this.charts[containerId] = chart;
    
    const option = {
      backgroundColor: '#fff',
      title: {
        text: config.name || '',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      series: [{
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        center: ['50%', '60%'],
        radius: '85%',
        min: config.min || 0,
        max: config.max || 100,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#52c41a'],
              [0.7, '#faad14'],
              [1, '#ee6666']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 8,
          itemStyle: { color: 'auto' }
        },
        axisTick: { distance: -20, length: 6, lineStyle: { width: 1 } },
        splitLine: { distance: -25, length: 16, lineStyle: { width: 2 } },
        axisLabel: { distance: 35, fontSize: 10 },
        detail: {
          valueAnimation: true,
          formatter: config.formatter || '{value}' + (config.unit || ''),
          fontSize: 24,
          offsetCenter: [0, '70%']
        },
        data: [{ value: value, name: config.subtitle || '' }]
      }]
    };
    
    chart.setOption(option);
    return chart;
  }

  /**
   * 渲染热力图（行业拥挤度、RS排名）
   */
  renderHeatmapChart(containerId, sectorData, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (this.charts[containerId]) {
      this.charts[containerId].dispose();
    }
    
    const chart = echarts.init(container);
    this.charts[containerId] = chart;
    
    // 构建热力图数据
    let heatData = [];
    let yLabels = [];
    
    if (config.type === 'crowding') {
      // 行业拥挤度
      const sectors = sectorData.sectors || [];
      sectors.forEach((s, i) => {
        heatData.push([0, i, s.ratio || 0]);
        yLabels.push(s.name);
      });
    } else if (config.type === 'rs') {
      // RS排名
      const sectors = sectorData.sectors || [];
      sectors.forEach((s, i) => {
        heatData.push([0, i, s.rs_score || 0]);
        heatData.push([1, i, s.change_5d || 0]);
        heatData.push([2, i, s.change_20d || 0]);
        yLabels.push(s.name);
      });
    }
    
    const option = {
      backgroundColor: '#fff',
      title: {
        text: config.name || '',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        formatter: function(params) {
          const sector = yLabels[params.value[1]];
          const val = params.value[2].toFixed(1);
          if (config.type === 'crowding') {
            return `${sector}<br/>成交额占比: ${val}%`;
          } else {
            const labels = ['RS评分', '5日涨幅', '20日涨幅'];
            return `${sector}<br/>${labels[params.value[0]]}: ${val}${params.value[0] > 0 ? '%' : ''}`;
          }
        }
      },
      grid: { left: '15%', right: '10%', top: '12%', bottom: '5%' },
      xAxis: {
        type: 'category',
        data: config.type === 'crowding' ? ['成交占比'] : ['RS评分', '5日涨跌', '20日涨跌'],
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: yLabels,
        splitArea: { show: true },
        axisLabel: { fontSize: 10 }
      },
      visualMap: {
        min: config.type === 'crowding' ? 0 : 0,
        max: config.type === 'crowding' ? 20 : 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#52c41a', '#faad14', '#ee6666']
        }
      },
      series: [{
        type: 'heatmap',
        data: heatData,
        label: {
          show: true,
          fontSize: 10
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
    
    chart.setOption(option);
    return chart;
  }

  /**
   * 渲染个股综合卡片
   */
  renderStockCards(containerId, stocks, watchlist) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (stocks.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无个股数据</div>';
      return;
    }
    
    const actionColors = {
      '买入': { bg: '#f6ffed', border: '#52c41a', text: '#52c41a' },
      '持有': { bg: '#fffbe6', border: '#faad14', text: '#d48806' },
      '卖出': { bg: '#fff2f0', border: '#ff4d4f', text: '#ff4d4f' },
      '数据异常': { bg: '#f5f5f5', border: '#d9d9d9', text: '#999' }
    };
    
    let html = '';
    stocks.forEach(stock => {
      if (stock.error) return;
      const colors = actionColors[stock.action] || actionColors['数据异常'];
      const inWatchlist = watchlist.includes(stock.code);
      
      html += `
        <div class="stock-card" style="border-left: 4px solid ${colors.border}; background: ${colors.bg}">
          <div class="stock-card-header">
            <div class="stock-name">
              <strong>${stock.name || stock.code}</strong>
              <span class="stock-code">${stock.code}</span>
              ${inWatchlist ? '<span class="watch-badge">⭐ 自选</span>' : ''}
            </div>
            <div class="stock-action" style="color: ${colors.text}; background: ${colors.bg}; border: 1px solid ${colors.border}; padding: 4px 12px; border-radius: 12px; font-weight: bold;">
              ${stock.action}
            </div>
          </div>
          <div class="stock-card-body">
            <div class="stock-metrics">
              <div class="metric">
                <span class="metric-label">最新价</span>
                <span class="metric-value">${stock.latest_price ? stock.latest_price.toFixed(2) : '-'}</span>
              </div>
              <div class="metric">
                <span class="metric-label">5日涨跌</span>
                <span class="metric-value ${stock.change_5d > 0 ? 'up' : 'down'}">${stock.change_5d ? stock.change_5d.toFixed(2)+'%' : '-'}</span>
              </div>
              <div class="metric">
                <span class="metric-label">20日涨跌</span>
                <span class="metric-value ${stock.change_20d > 0 ? 'up' : 'down'}">${stock.change_20d ? stock.change_20d.toFixed(2)+'%' : '-'}</span>
              </div>
              <div class="metric">
                <span class="metric-label">OFI</span>
                <span class="metric-value">${stock.ofi != null ? stock.ofi : '-'}</span>
              </div>
              <div class="metric">
                <span class="metric-label">特质波动</span>
                <span class="metric-value">${stock.idio_volatility != null ? stock.idio_volatility+'%' : '-'}</span>
              </div>
              <div class="metric">
                <span class="metric-label">量比</span>
                <span class="metric-value">${stock.large_order_ratio != null ? stock.large_order_ratio+'%' : '-'}</span>
              </div>
            </div>
            ${stock.reasons && stock.reasons.length > 0 ? `
              <div class="stock-reasons">
                ${stock.reasons.map(r => `<span class="reason-tag">${r}</span>`).join('')}
              </div>
            ` : ''}
            <div class="stock-technicals">
              <span>MA5: ${stock.ma5 || '-'}</span>
              <span>MA20: ${stock.ma20 || '-'}</span>
              <span>MA60: ${stock.ma60 || '-'}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }

  /**
   * 渲染综合汇总面板
   */
  renderSummary(containerId, summary) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const signalColors = {
      '🟢 积极看多': '#52c41a',
      '🟡 中性偏多': '#91cc75',
      '⚪ 震荡观望': '#faad14',
      '🟠 谨慎偏空': '#ff7a45',
      '🔴 防御为主': '#ff4d4f'
    };
    
    const signalColor = signalColors[summary.overall_signal] || '#999';
    
    let html = `
      <div class="summary-panel" style="border: 2px solid ${signalColor}">
        <div class="summary-header">
          <div class="summary-signal" style="color: ${signalColor}">
            <span class="signal-icon">${summary.overall_signal}</span>
            <span class="risk-level">风险等级: <b>${summary.risk_level}</b></span>
            <span class="summary-score">综合评分: <b>${summary.score}</b></span>
          </div>
          <div class="summary-time">更新: ${summary.update_time}</div>
        </div>
        
        <div class="summary-advice">
          <strong>📋 交易建议：</strong>${summary.trading_advice}
        </div>
        
        ${summary.key_observations && summary.key_observations.length > 0 ? `
          <div class="summary-observations">
            <strong>🔍 关键观察：</strong>
            <ul>
              ${summary.key_observations.map(o => `<li>${o}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${summary.signals ? `
          <div class="summary-layers">
            <strong>📊 各层信号：</strong>
            ${Object.entries(summary.signals).map(([key, val]) => `
              <div class="layer-signal">
                <span class="layer-tag layer-${key}">${key}</span>
                <span class="layer-text">${val}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    container.innerHTML = html;
  }

  /**
   * 响应式调整所有图表
   */
  resizeAll() {
    Object.values(this.charts).forEach(chart => {
      if (chart && !chart.isDisposed()) {
        chart.resize();
      }
    });
  }

  /**
   * 销毁所有图表
   */
  disposeAll() {
    Object.values(this.charts).forEach(chart => {
      if (chart && !chart.isDisposed()) {
        chart.dispose();
      }
    });
    this.charts = {};
  }
}

// 全局图表渲染器实例
const chartRenderer = new ChartRenderer();
