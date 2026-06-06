/**
 * A股量化监控系统 - 指标定义与说明
 * 五种层级、20+指标的配置信息
 */
const INDICATOR_CONFIG = {
  // ========== 第一层：宏观流动性与货币政策 ==========
  layer1: {
    id: 'layer1',
    name: '宏观流动性与货币政策',
    icon: '🌊',
    subtitle: '大盘的"水温"',
    description: '解决"全市场有没有钱"的问题。A股是典型的流动性驱动市场，宏观指标具有最强的左侧拐点前瞻性。',
    indicators: [
      {
        id: 'dr007',
        name: 'DR007 · 利差象限分析',
        fullName: '银行间7天质押式回购利率 vs 政策利率',
        dataKey: 'macro.dr007',
        chartType: 'dr007_quadrant',
        chartHeight: 420,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'week_1', label: 'DR007(%)', type: 'y', color: '#ee6666' },
          { key: 'policy_rate_line', label: '7天逆回购(政策利率)', type: 'y', color: '#fc8452', dashed: true },
          { key: 'spread', label: '利差(bp)', type: 'y2', color: '#91cc75' }
        ],
        y2AxisName: '利差(bp)',
        policyRate: 1.50,
        description: `央行观察流动性最核心的锚。DR007是银行间市场7天期质押式回购的加权平均利率，反映银行体系流动性的真实松紧程度。

<b>象限分析：</b> X轴 = DR007绝对值，Y轴 = 利差(DR007-政策利率)
• <b>左下象限(低利率+负利差)：</b>极度宽松，流动性泛滥，最利好股市
• <b>左上象限(低利率+正利差)：</b>结构性紧张，短期冲击但基本面宽松
• <b>右下象限(高利率+负利差)：</b>政策干预压制利率，需观察持续性
• <b>右上象限(高利率+正利差)：</b>全面收紧，资金成本高企，利空股市

<b>监控逻辑：</b>
• 利差持续为负 → 银行间资金极度充裕，水早晚漫向股市
• 利差由负转正 → 流动性边际收紧的早期预警信号
• DR007飙升+利差扩大 → 现货市场承压，估值面临压缩`,
        signals: [
          { condition: '利差 < -10bp', level: '极度宽松', color: '#52c41a' },
          { condition: '-10bp ~ +5bp', level: '中性', color: '#faad14' },
          { condition: '利差 > +5bp', level: '偏紧收紧', color: '#ff4d4f' }
        ]
      },
      {
        id: 'bond_yield_10y',
        name: '10年期国债收益率',
        fullName: '中国10年期国债到期收益率',
        dataKey: 'macro.bond_yield_10y',
        chartType: 'line',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'yield_10y', label: '收益率(%)', type: 'y', color: '#fc8452' }
        ],
        description: `资产定价的无风险利率锚。10年期国债收益率是所有风险资产定价的基准，其变动方向直接影响股票估值。

<b>监控逻辑：</b>
• 国债收益率在低位构筑双底或开始回升，往往伴随经济复苏预期，是资金从债市向股市轮动的信号
• 收益率快速下行破新低，反映避险情绪浓厚，短期压制风险偏好
• 股债跷跷板：当国债收益率见底回升时，往往对应A股阶段性底部`,
        signals: [
          { condition: '低于2.3%', level: '流动性充裕', color: '#52c41a' },
          { condition: '2.3%-2.8%', level: '正常区间', color: '#faad14' },
          { condition: '高于2.8%', level: '资金偏紧', color: '#ff4d4f' }
        ]
      },
      {
        id: 'omo_mlf',
        name: '央行OMO/MLF净投放',
        fullName: '央行公开市场操作与中期借贷便利净投放',
        dataKey: 'macro.omo_mlf',
        chartType: 'bar',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'net_injection', label: '净投放(亿元)', type: 'y', color: '#91cc75' }
        ],
        description: `监控央行实际的缩表或扩表态度。OMO（公开市场操作）和MLF（中期借贷便利）是央行调控市场流动性的主要工具。

<b>监控逻辑：</b>
• 若连续几个月超额续做MLF并加大OMO净投放，说明央行在主动扩表，市场宏观流动性的系统性风险几乎归零
• MLF利率调整是政策利率变动的直接信号，降息对股市形成强力支撑
• 净回笼持续则需警惕流动性边际收紧`,
        signals: [
          { condition: '月净投放>0', level: '扩张', color: '#52c41a' },
          { condition: '月净投放=0', level: '中性', color: '#faad14' },
          { condition: '月净投放<0', level: '收缩', color: '#ff4d4f' }
        ]
      },
      {
        id: 'cnh_rate',
        name: 'CNH汇率变动率',
        fullName: '离岸人民币兑美元汇率及变动率',
        dataKey: 'macro.cnh_rate',
        chartType: 'line',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'rates', label: 'CNH汇率', type: 'y', color: '#5470c6' }
        ],
        description: `衡量全球风险偏好及外资回流斜率。离岸人民币（CNH）汇率是外资配置A股的重要先行指标。

<b>监控逻辑：</b>
• 人民币升值斜率陡峭时，大盘蓝筹通常具备极强的估值支撑，外资加速流入
• 快速贬值需防范外资流出带来的权重股抛压
• CNH与北向资金高度正相关，汇率企稳往往是外资回流的领先信号`,
        signals: [
          { condition: '升值斜率>0', level: '升值周期', color: '#52c41a' },
          { condition: '横盘波动', level: '震荡', color: '#faad14' },
          { condition: '贬值斜率>0', level: '贬值压力', color: '#ff4d4f' }
        ]
      }
    ]
  },

  // ========== 第二层：大盘资金面与风险溢价 ==========
  layer2: {
    id: 'layer2',
    name: '大盘资金面与风险溢价',
    icon: '💰',
    subtitle: '资金的"博弈"',
    description: '解决"资金愿意去哪里，愿意承担多大风险"的问题。',
    indicators: [
      {
        id: 'erp',
        name: 'ERP股债风险溢价',
        fullName: 'Equity Risk Premium — 股债风险溢价',
        dataKey: 'capital.erp',
        chartType: 'gauge',
        chartHeight: 350,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'erp_values', label: 'ERP(%)', type: 'y', color: '#ee6666' }
        ],
        description: `评估股票资产相对债券的性价比。ERP = (1/全市场PE) - 10年期国债收益率，是判断市场中长期顶底的黄金指标。

<b>监控逻辑：</b>
• 当ERP达到历史五年的+2σ以上时，属于客观的绝对底部区域，是中长期配置的黄金窗口
• ERP<0说明股票收益率还不如无风险利率，市场极度高估
• 该指标具有极强的均值回归特性，是左侧交易者最重要的参考`,
        signals: [
          { condition: '>+2σ', level: '极度低估', color: '#52c41a' },
          { condition: '+1σ~+2σ', level: '合理偏低', color: '#91cc75' },
          { condition: '-1σ~+1σ', level: '合理', color: '#faad14' },
          { condition: '<-1σ', level: '高估', color: '#ff4d4f' }
        ]
      },
      {
        id: 'margin_trade',
        name: '两融余额及买入占比',
        fullName: '融资融券余额与融资买入额占成交额比例',
        dataKey: 'capital.margin_trade',
        chartType: 'line',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'margin_balance', label: '两融余额(亿)', type: 'y', color: '#5470c6' },
          { key: 'margin_ratio', label: '买入占比(%)', type: 'y2', color: '#ee6666' }
        ],
        description: `代表高风险偏好本土趋势资金的态度，是A股市场最重要的情绪温度计之一。

<b>监控逻辑：</b>
• 两融买入额占全市场成交额比例降至6%以下 → 情绪极度冰点，离反转不远
• 占比突破11% → 需防范杠杆资金过热带来的踩踏风险
• 两融余额变动方向与指数走势高度同步，可作为趋势确认指标`,
        signals: [
          { condition: '占比<6%', level: '冰点', color: '#52c41a' },
          { condition: '6%-11%', level: '中性', color: '#faad14' },
          { condition: '占比>11%', level: '过热', color: '#ff4d4f' }
        ]
      },
      {
        id: 'northbound',
        name: '北向资金净买入',
        fullName: '沪深港通北向资金净主动买入流向',
        dataKey: 'capital.northbound',
        chartType: 'line',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'net_flow', label: '净流入(亿)', type: 'y', color: '#91cc75' },
          { key: 'cumulative_flow', label: '累计净流入(亿)', type: 'y2', color: '#5470c6' }
        ],
        description: `捕捉"聪明钱"的左侧建仓迹象。北向资金是境外机构配置A股的核心通道，其动向对权重板块有显著影响。

<b>监控逻辑：</b>
• 大盘下跌但北向持续净买入 → 聪明钱左侧抄底信号
• 大盘上涨但北向持续净卖出 → 外资获利了结，警示信号
• 关注5日/20日累计净买入额的拐点方向变化`,
        signals: [
          { condition: '20日净流入>0', level: '持续流入', color: '#52c41a' },
          { condition: '流入流出交替', level: '震荡', color: '#faad14' },
          { condition: '20日净流出>0', level: '持续流出', color: '#ff4d4f' }
        ]
      },
      {
        id: 'market_volume',
        name: '成交额与换手率',
        fullName: '全市场日成交额绝对值与换手率',
        dataKey: 'capital.market_volume',
        chartType: 'bar',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'volume', label: '成交额(亿元)', type: 'y', color: '#3ba272' }
        ],
        description: `市场的容量过滤器。成交额是A股行情级别的最直观标尺，量能决定策略的适用性。

<b>监控逻辑：</b>
• 全市场成交额低于8000亿 → 只适合局部震荡策略，不宜追高
• 成交额突破1.5万亿 → 趋势策略全面开仓的信号
• 缩量阴跌 + 地量见地价 → 底部特征
• 放量滞涨 → 顶部警示`,
        signals: [
          { condition: '>1.5万亿', level: '放量', color: '#52c41a' },
          { condition: '0.8-1.5万亿', level: '适中', color: '#faad14' },
          { condition: '<0.8万亿', level: '缩量', color: '#ff4d4f' }
        ]
      }
    ]
  },

  // ========== 第三层：大盘微观结构与情绪 ==========
  layer3: {
    id: 'layer3',
    name: '大盘微观结构与情绪',
    icon: '📊',
    subtitle: '趋势的"健康度"',
    description: '利用衍生品和市场宽度数据，在K线金叉前推测市场真实强弱。',
    indicators: [
      {
        id: 'option_sentiment',
        name: '期权PCR情绪',
        fullName: 'Put/Call Ratio — 期权看跌看涨比率',
        dataKey: 'microstructure.option_sentiment',
        chartType: 'line',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'pcr', label: 'PCR', type: 'y', color: '#ee6666' }
        ],
        description: `观察50ETF/300ETF股指期权的Put/Call持仓量比率。衍生品市场往往领先现货市场2-3个交易日。

<b>监控逻辑：</b>
• PCR达到历史极高值（>1.2）且隐含波动率IV开始回落 → 机构对冲保护盘已买足，现货市场随时可能见底
• PCR极低（<0.6）→ 市场过度乐观，需警惕回调
• PCR从高位快速回落是反弹的强力确认信号`,
        signals: [
          { condition: 'PCR>1.2', level: '恐慌超卖', color: '#52c41a' },
          { condition: '0.7-1.2', level: '正常', color: '#faad14' },
          { condition: 'PCR<0.7', level: '过度乐观', color: '#ff4d4f' }
        ]
      },
      {
        id: 'market_breadth',
        name: '市场宽度',
        fullName: '全市场股票站上20日/60日均线的比例',
        dataKey: 'microstructure.market_breadth',
        chartType: 'gauge',
        chartHeight: 350,
        fields: [],
        description: `极其重要的前瞻性反指。即使大盘指数还在跌（被权重股拖累），但如果站上均线的个股比例开始回升，说明赚钱效应已提前复苏。

<b>监控逻辑：</b>
• 指数下跌 + 站上20日线比例上升 → 底背离，积极信号
• 指数上涨 + 站上20日线比例下降 → 顶背离，警示信号
• 比例>70% → 市场过热，短期可能调整
• 比例<20% → 极度超卖，反弹概率大`,
        signals: [
          { condition: '>60%', level: '强势', color: '#52c41a' },
          { condition: '35%-60%', level: '中性', color: '#faad14' },
          { condition: '<35%', level: '弱势', color: '#ff4d4f' }
        ]
      },
      {
        id: 'limit_stocks',
        name: '涨跌停与连板',
        fullName: '每日涨跌停家数比与连板晋级率',
        dataKey: 'microstructure.limit_stocks',
        chartType: 'bar',
        chartHeight: 300,
        fields: [
          { key: 'limit_up_count', label: '涨停', type: 'bar', color: '#ee6666' },
          { key: 'limit_down_count', label: '跌停', type: 'bar', color: '#73c0de' }
        ],
        description: `监控本土短线活跃游资的情绪温度。游资是A股市场情绪最敏感的群体，其行为模式具有高度周期性。

<b>监控逻辑：</b>
• 连板晋级率持续低位（<15%）→ 短线情绪冰点，往往对应指数阶段性拐点
• 涨停家数>100家 + 晋级率>30% → 短线赚钱效应强，趋势策略可积极
• 炸板率飙升 + 高位股集体大跌 → 情绪退潮信号`,
        signals: [
          { condition: '晋级率>25%', level: '活跃', color: '#52c41a' },
          { condition: '15%-25%', level: '中性', color: '#faad14' },
          { condition: '晋级率<15%', level: '冰点', color: '#52c41a' }
        ]
      },
      {
        id: 'correlation_index',
        name: '股债相关性',
        fullName: '股债相关性轮动指数',
        dataKey: 'microstructure.correlation_index',
        chartType: 'gauge',
        chartHeight: 300,
        fields: [],
        description: `监控股债"跷跷板"效应的强度和方向。大类资产配置资金的流动往往在股债相关性变化中提前反映。

<b>监控逻辑：</b>
• 深度负相关（<-0.3）→ 跷跷板效应强，股债轮动策略有效
• 相关性向正方向修正 → 大类资产配置资金正在发生系统性移位，可能是大级别拐点
• 正相关性持续 → 通常出现在流动性危机或系统性风险时期`,
        signals: [
          { condition: '<-0.3', level: '跷跷板效应强', color: '#52c41a' },
          { condition: '-0.3~0.2', level: '弱相关过渡期', color: '#faad14' },
          { condition: '>0.2', level: '正相关防御', color: '#ff4d4f' }
        ]
      }
    ]
  },

  // ========== 第四层：行业板块轮动 ==========
  layer4: {
    id: 'layer4',
    name: '行业板块轮动',
    icon: '🔄',
    subtitle: '资金的"主攻方向"',
    description: '解决"买什么板块"的问题，防止买在趋势回撤的顶部。',
    indicators: [
      {
        id: 'sector_crowding',
        name: '行业拥挤度',
        fullName: '申万一级行业成交额占比',
        dataKey: 'sector.sector_crowding',
        chartType: 'heatmap',
        chartHeight: 400,
        fields: [],
        description: `前瞻性逃顶指标。单一热门行业成交额占比过高意味着买盘即将耗尽。

<b>监控逻辑：</b>
• 单一行业成交额占全市场>15% → 无论技术指标多好，右侧必然面临剧烈回撤
• 拥挤度从高位快速回落+指数企稳 → 调整到位可重新关注
• 冷门行业(占比<2%)成交突然放大 → 关注风格切换可能`,
        signals: [
          { condition: '>15%', level: '⚠️过热', color: '#ff4d4f' },
          { condition: '8%-15%', level: '关注', color: '#faad14' },
          { condition: '<8%', level: '正常', color: '#52c41a' }
        ]
      },
      {
        id: 'sector_rs',
        name: '行业相对强度RS',
        fullName: '申万一级行业相对强度排名',
        dataKey: 'sector.sector_rs',
        chartType: 'heatmap',
        chartHeight: 400,
        fields: [],
        description: `动量策略的核心指标。比较各行业近20日涨跌幅并进行标准化排名，识别当前市场的领涨和领跌板块。

<b>监控逻辑：</b>
• RS持续排名前3的行业是当前市场主线
• 关注RS排名从底部大幅跃升的行业 → 潜在风格切换信号
• 持续领涨行业RS开始下滑 → 减仓信号`,
        signals: []
      },
      {
        id: 'etf_flow',
        name: '行业ETF资金流',
        fullName: '行业ETF净申购份额变动',
        dataKey: 'sector.etf_flow',
        chartType: 'bar',
        chartHeight: 300,
        fields: [],
        description: `机构资金通过ETF进行行业配置的痕迹。行业ETF份额变动反映了专业投资者的行业偏好。

<b>监控逻辑：</b>
• 行业ETF持续获净申购 → 机构看好该行业中期表现
• 行业下跌但ETF份额增加 → 左侧抄底信号
• 行业大涨但ETF份额减少 → 机构获利了结`,
        signals: []
      },
      {
        id: 'ppi_cpi_spread',
        name: 'PPI-CPI剪刀差',
        fullName: '工业品出厂价格指数与居民消费价格指数利差',
        dataKey: 'sector.ppi_cpi_spread',
        chartType: 'line',
        chartHeight: 300,
        fields: [
          { key: 'dates', label: '日期', type: 'x' },
          { key: 'cpi', label: 'CPI(%)', type: 'y', color: '#5470c6' },
          { key: 'ppi', label: 'PPI(%)', type: 'y', color: '#ee6666' },
          { key: 'spread', label: '剪刀差(%)', type: 'y', color: '#91cc75' }
        ],
        description: `宏观产业结构指标。PPI-CPI剪刀差反映了上下游利润分配格局，是行业配置的宏观指南针。

<b>监控逻辑：</b>
• 剪刀差扩大（PPI>CPI）→ 利好上游资源品（煤炭、有色、钢铁）
• 剪刀差收窄（PPI下行）→ 利好中游制造（机械设备、汽车）
• CPI上行+PPI横盘 → 利好下游消费（食品饮料、医药）`,
        signals: [
          { condition: '>0且扩大', level: '利好上游', color: '#faad14' },
          { condition: '收窄中', level: '利好中游', color: '#52c41a' },
          { condition: '<0', level: '利好下游', color: '#91cc75' }
        ]
      }
    ]
  },

  // ========== 第五层：个股微观结构 ==========
  layer5: {
    id: 'layer5',
    name: '个股微观结构',
    icon: '🎯',
    subtitle: '下单前的最后确认',
    description: '从订单流、波动率、主力行为和止损位置四个维度对个股进行精细化分析。',
    indicators: [
      {
        id: 'ofi',
        name: 'OFI订单流不平衡',
        fullName: 'Order Flow Imbalance — 订单流不平衡度',
        dataKey: 'stocks',
        chartType: 'stock',
        chartHeight: 400,
        fields: [],
        description: `从主动买卖单的微观结构判断多空力量对比。OFI = (主动买入量 - 主动卖出量) / 总成交量。

<b>监控逻辑：</b>
• OFI持续正值 → 主动买盘占优，股价有向上动能
• OFI从负转正 → 空方力量衰竭信号
• 股价上涨+OFI背离下降 → 警惕诱多陷阱`,
        signals: [
          { condition: 'OFI>10', level: '偏多', color: '#52c41a' },
          { condition: '-10~10', level: '平衡', color: '#faad14' },
          { condition: 'OFI<-10', level: '偏空', color: '#ff4d4f' }
        ]
      },
      {
        id: 'idio_vol',
        name: '特质波动率',
        fullName: 'Idiosyncratic Volatility — 剔除市场因素后的个股波动',
        dataKey: 'stocks',
        chartType: 'stock',
        chartHeight: 300,
        fields: [],
        description: `剔除大盘beta影响后的个股独立波动率，反映个股自身的风险特征。

<b>监控逻辑：</b>
• 特质波动率异常升高 → 个股面临独立风险事件，需排查原因
• 特质波动率处于历史低位 → 个股定价充分，但需警惕波动率回归
• A股存在特质波动率异象：低特质波动的股票长期收益反而更好`,
        signals: [
          { condition: '<20%', level: '低波动', color: '#52c41a' },
          { condition: '20%-40%', level: '中等', color: '#faad14' },
          { condition: '>40%', level: '高波动', color: '#ff4d4f' }
        ]
      },
      {
        id: 'large_order',
        name: '大单与游资协同',
        fullName: '大单成交占比与游资席位协同度',
        dataKey: 'stocks',
        chartType: 'stock',
        chartHeight: 300,
        fields: [],
        description: `从成交结构判断主力资金动向。大单占比和游资席位协同度是短线择时的重要参考。

<b>监控逻辑：</b>
• 大单净买入占比持续上升 → 主力建仓信号
• 多个知名游资席位同日买入同一标的 → 板块协同效应强
• 大单占比极端值(>40%) → 需结合位置判断是吸筹还是出货`,
        signals: [
          { condition: '放量(>120%)', level: '放量', color: '#52c41a' },
          { condition: '80%-120%', level: '正常', color: '#faad14' },
          { condition: '缩量(<80%)', level: '缩量', color: '#ff4d4f' }
        ]
      },
      {
        id: 'stop_loss',
        name: '移动止损偏离',
        fullName: '移动跟踪止损偏离度',
        dataKey: 'stocks',
        chartType: 'stock',
        chartHeight: 300,
        fields: [],
        description: `基于近期高点的动态止损位置与当前价格的偏离度，是风险管理和仓位控制的量化工具。

<b>监控逻辑：</b>
• 偏离度>5% → 安全空间充足，可正常持有
• 偏离度<2% → 接近止损位，需密切关注
• 跌破移动止损线 → 纪律性减仓或离场`,
        signals: [
          { condition: '>5%', level: '安全', color: '#52c41a' },
          { condition: '2%-5%', level: '关注', color: '#faad14' },
          { condition: '<2%', level: '危险', color: '#ff4d4f' }
        ]
      }
    ]
  }
};
