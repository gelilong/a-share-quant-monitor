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
    
    // 检测是否 ETF 资金流数据结构 (etf_flows 数组)
    let xData = [];
    let yData = [];
    let series = [];
    
    if (data.etf_flows && Array.isArray(data.etf_flows)) {
      // ETF 资金流：从 etf_flows 数组提取
      const labelField = config.barLabelField || 'sector';
      const valueField = config.barValueField || 'flow_indicator';
      xData = data.etf_flows.map(item => item[labelField] || '');
      yData = data.etf_flows.map(item => item[valueField] || 0);
      series = [{
        type: 'bar',
        data: yData.map(v => ({
          value: v,
          itemStyle: {
            color: v >= 0 ? '#52c41a' : '#ff4d4f',
            borderRadius: v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]
          }
        }))
      }];
    } else if (config.fields && config.fields.length > 0) {
      // 多柱模式
      xData = data.dates || data.labels || [];
      series = config.fields.map(f => ({
        name: f.label,
        type: 'bar',
        data: data[f.key] || [],
        itemStyle: { color: f.color, borderRadius: [4, 4, 0, 0] }
      }));
    } else {
      // 简单单柱模式
      xData = data.dates || data.labels || [];
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
    
    const isMultiBar = config.fields && config.fields.length > 0;
    const isEtfFlow = data.etf_flows && Array.isArray(data.etf_flows);

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
      legend: (isMultiBar && !isEtfFlow) ? {
        data: config.fields.map(f => f.label),
        bottom: 0
      } : undefined,
      grid: {
        left: '8%',
        right: '5%',
        top: '15%',
        bottom: isEtfFlow ? '5%' : (isMultiBar ? '12%' : '8%')
      },
      xAxis: {
        type: 'category',
        data: xData,
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

    const minVal = config.min || 0;
    const maxVal = config.max || 100;
    const range = maxVal - minVal;
    // 动态计算三段阈值位置（归一化到 0-1）
    const t1 = (0.3 * range + minVal - minVal) / range; // 30%处
    const t2 = (0.7 * range + minVal - minVal) / range; // 70%处
    
    // 如果 min 为负，反转颜色（低值=绿/正相关防御，高值=红/正相关风险）
    const colors = minVal < 0
      ? [[t1, '#ee6666'], [t2, '#faad14'], [1, '#52c41a']]
      : [[t1, '#52c41a'], [t2, '#faad14'], [1, '#ee6666']];
    
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
        min: minVal,
        max: maxVal,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: { width: 20, color: colors }
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
          formatter: config.formatter || function(v) {
            return v.toFixed(config.decimals || 0) + (config.unit || '');
          },
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
   * 渲染 DR007 象限分析图（时间序列 + 象限散点）
   * @param {string} tsContainerId - 时间序列图容器ID
   * @param {string} qdContainerId - 象限散点图容器ID
   * @param {object} data - DR007 数据
   * @param {object} config - 指标配置
   */
  renderDR007Quadrant(tsContainerId, qdContainerId, data, config) {
    const policyRate = config.policyRate || 1.50;

    // ── 1. 时间序列图 ──
    const tsContainer = document.getElementById(tsContainerId);
    if (tsContainer) {
      if (this.charts[tsContainerId]) this.charts[tsContainerId].dispose();
      const tsChart = echarts.init(tsContainer);
      this.charts[tsContainerId] = tsChart;

      const dates = data.dates || [];
      const n = dates.length;
      const dr007 = data.week_1 || [];
      const spreadData = data.spread || [];

      // 政策利率为常量水平线
      const policyLine = new Array(n).fill(policyRate);

      tsChart.setOption({
        backgroundColor: '#fff',
        title: {
          text: 'DR007 时间序列与利差',
          left: 'center',
          textStyle: { fontSize: 13, color: '#333' }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let html = params[0].axisValue + '<br/>';
            params.forEach(p => {
              html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:5px;"></span>`;
              html += `${p.seriesName}: ${p.value}${p.seriesIndex < 2 ? '%' : 'bp'}<br/>`;
            });
            return html;
          }
        },
        legend: {
          data: ['DR007', '政策利率(7D逆回购)', '利差'],
          bottom: 0
        },
        grid: { left: '8%', right: '12%', top: '15%', bottom: '14%' },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { rotate: 45, fontSize: 10 }
        },
        yAxis: [
          {
            type: 'value',
            name: '利率(%)',
            min: function(v) { return Math.floor(Math.min(v.min, policyRate - 0.3) * 10) / 10; },
            axisLabel: { fontSize: 10 },
            splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
          },
          {
            type: 'value',
            name: '利差(bp)',
            axisLabel: { fontSize: 10 },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: 'DR007',
            type: 'line',
            data: dr007,
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: { width: 2.5, color: '#ee6666' },
            itemStyle: { color: '#ee6666' },
            markLine: {
              silent: true,
              symbol: 'none',
              data: [{ yAxis: policyRate, label: { formatter: '政策利率 ' + policyRate + '%', position: 'end' }, lineStyle: { color: '#fc8452', type: 'dashed', width: 2 } }]
            }
          },
          {
            name: '政策利率(7D逆回购)',
            type: 'line',
            data: policyLine,
            symbol: 'none',
            lineStyle: { color: '#fc8452', type: 'dashed', width: 1.5, opacity: 0.6 },
            itemStyle: { color: '#fc8452' }
          },
          {
            name: '利差',
            type: 'bar',
            yAxisIndex: 1,
            data: spreadData,
            itemStyle: {
              color: function(params) {
                return params.value >= 0 ? '#ff4d4f' : '#52c41a';
              },
              borderRadius: [2, 2, 0, 0]
            }
          }
        ]
      });
    }

    // ── 2. 象限散点图 ──
    const qdContainer = document.getElementById(qdContainerId);
    if (qdContainer) {
      if (this.charts[qdContainerId]) this.charts[qdContainerId].dispose();
      const qdChart = echarts.init(qdContainer);
      this.charts[qdContainerId] = qdChart;

      const dr007Vals = data.week_1 || [];
      const spreadVals = data.spread || [];

      // 构建散点数据（最近N天的点）
      const scatterData = [];
      const len = Math.min(dr007Vals.length, spreadVals.length);
      for (let i = 0; i < len; i++) {
        scatterData.push([dr007Vals[i], spreadVals[i], dates[i] || '']);
      }

      // 确定轴范围
      const xMin = Math.min(policyRate - 0.5, Math.min(...dr007Vals));
      const xMax = Math.max(policyRate + 0.5, Math.max(...dr007Vals));
      const yAbsMax = Math.max(Math.abs(Math.min(...spreadVals)), Math.abs(Math.max(...spreadVals)), 20);

      qdChart.setOption({
        backgroundColor: '#fff',
        title: {
          text: '利差象限分析 (X=DR007绝对水平, Y=利差)',
          left: 'center',
          textStyle: { fontSize: 13, color: '#333' }
        },
        tooltip: {
          formatter: function(params) {
            const d = params.value;
            const quadrant = d[1] >= 0 ? (d[0] >= policyRate ? '右上：全面收紧⚠️' : '左上：结构性紧张') : (d[0] >= policyRate ? '右下：政策干预' : '左下：极度宽松✅');
            return `<b>${d[2] || ''}</b><br/>DR007: ${d[0].toFixed(2)}%<br/>利差: ${d[1]}bp<br/>象限: ${quadrant}`;
          }
        },
        grid: { left: '12%', right: '5%', top: '15%', bottom: '10%' },
        xAxis: {
          type: 'value',
          name: 'DR007(%)',
          min: Math.floor(xMin * 10) / 10,
          max: Math.ceil(xMax * 10) / 10,
          splitLine: { show: true, lineStyle: { color: '#f0f0f0', type: 'dashed' } },
          axisLabel: { fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          name: '利差(bp)',
          min: -Math.ceil(yAbsMax / 10) * 10,
          max: Math.ceil(yAbsMax / 10) * 10,
          splitLine: { show: true, lineStyle: { color: '#f0f0f0', type: 'dashed' } },
          axisLabel: { fontSize: 10 }
        },
        // 象限分割线（markLine 替代 annotation）
        series: [
          {
            type: 'scatter',
            data: scatterData,
            symbolSize: function(val) {
              // 最近的点更大
              const idx = scatterData.indexOf(val);
              return idx >= len - 1 ? 14 : idx >= len - 5 ? 10 : 6;
            },
            itemStyle: {
              color: function(params) {
                const v = params.value;
                // 左上: 低利率+正利差(橙), 右下: 高利率+负利差(蓝), 右上: 收紧(红), 左下: 宽松(绿)
                if (v[1] >= 0 && v[0] >= policyRate) return '#ff4d4f';    // 右上：收紧
                if (v[1] >= 0 && v[0] < policyRate) return '#faad14';     // 左上：结构性
                if (v[1] < 0 && v[0] >= policyRate) return '#5470c6';     // 右下：干预
                return '#52c41a';                                          // 左下：宽松
              },
              borderColor: '#fff',
              borderWidth: 1
            },
            markLine: {
              silent: true,
              symbol: 'none',
              data: [
                { xAxis: policyRate, label: { formatter: '政策利率', position: 'start' }, lineStyle: { color: '#fc8452', type: 'dashed', width: 1.5 } },
                { yAxis: 0, label: { formatter: '利差=0', position: 'start' }, lineStyle: { color: '#999', type: 'dashed', width: 1 } }
              ]
            },
            markArea: {
              silent: true,
              data: [
                [
                  { xAxis: xMin, yAxis: 0, itemStyle: { color: 'rgba(82,196,26,0.06)' } },
                  { xAxis: policyRate, yAxis: -yAbsMax }
                ],
                [
                  { xAxis: policyRate, yAxis: 0, itemStyle: { color: 'rgba(255,77,79,0.06)' } },
                  { xAxis: xMax, yAxis: yAbsMax }
                ],
                [
                  { xAxis: xMin, yAxis: 0, itemStyle: { color: 'rgba(250,173,20,0.04)' } },
                  { xAxis: policyRate, yAxis: yAbsMax }
                ],
                [
                  { xAxis: policyRate, yAxis: -yAbsMax, itemStyle: { color: 'rgba(84,112,198,0.04)' } },
                  { xAxis: xMax, yAxis: 0 }
                ]
              ]
            }
          }
        ]
      });
    }
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
