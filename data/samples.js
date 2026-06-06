// 内嵌样本数据
const SAMPLE_DATA = {
  "macro": {
    "meta": {
      "layer": 1,
      "layer_name": "宏观流动性与货币政策",
      "description": "监控全市场流动性水位，央行政策态度及全球风险偏好",
      "update_time": "2026-06-06 13:30:00"
    },
    "indicators": {
      "dr007": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "overnight": [
          1.45,
          1.42,
          1.48,
          1.5,
          1.47,
          1.44,
          1.46,
          1.43,
          1.41,
          1.45
        ],
        "week_1": [
          1.52,
          1.5,
          1.55,
          1.58,
          1.53,
          1.51,
          1.54,
          1.5,
          1.48,
          1.52
        ],
        "spread": [
          2,
          0,
          5,
          8,
          3,
          1,
          4,
          0,
          -2,
          2
        ],
        "policy_rate": 1.5,
        "latest": 1.52,
        "latest_spread": 2,
        "spread_signal": "略偏紧(利差+2bp)",
        "update_time": "2026-06-06 13:30:00"
      },
      "bond_yield_10y": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "yield_10y": [
          2.35,
          2.33,
          2.31,
          2.28,
          2.3,
          2.32,
          2.29,
          2.27,
          2.25,
          2.26
        ],
        "latest": 2.26,
        "change_1m": -0.12,
        "update_time": "2026-06-06 13:30:00"
      },
      "omo_mlf": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "net_injection": [
          500,
          300,
          -200,
          800,
          1000,
          600,
          -100,
          400,
          700,
          500
        ],
        "monthly_net": 3500,
        "latest": 500,
        "signal": "扩张",
        "update_time": "2026-06-06 13:30:00"
      },
      "cnh_rate": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "rates": [
          7.12,
          7.11,
          7.1,
          7.08,
          7.09,
          7.07,
          7.05,
          7.04,
          7.03,
          7.02
        ],
        "change_rates": [
          -0.08,
          -0.09,
          -0.18,
          -0.09,
          0.09,
          -0.18,
          -0.18,
          -0.09,
          -0.09,
          -0.09
        ],
        "latest": 7.02,
        "trend": "升值",
        "update_time": "2026-06-06 13:30:00"
      }
    }
  },
  "capital": {
    "meta": {
      "layer": 2,
      "layer_name": "大盘资金面与风险溢价",
      "description": "监控资金流向、杠杆情绪、外资动向及风险偏好",
      "update_time": "2026-06-06 13:30:00"
    },
    "indicators": {
      "erp": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "erp_values": [
          5.2,
          5.5,
          5.8,
          6.0,
          6.3,
          6.1,
          5.9,
          6.2,
          6.5,
          6.4
        ],
        "latest_erp": 6.4,
        "mean_erp": 4.5,
        "std_erp": 1.2,
        "sigma_position": 1.58,
        "signal": "合理偏低",
        "update_time": "2026-06-06 13:30:00"
      },
      "margin_trade": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "margin_balance": [
          15200,
          15180,
          15150,
          15230,
          15280,
          15300,
          15250,
          15320,
          15360,
          15340
        ],
        "margin_buy_amount": [
          680,
          650,
          620,
          710,
          750,
          730,
          680,
          740,
          770,
          760
        ],
        "margin_ratio": [
          7.8,
          7.5,
          7.2,
          8.1,
          8.5,
          8.3,
          7.6,
          8.4,
          8.7,
          8.6
        ],
        "latest_balance": 15340,
        "latest_ratio": 8.6,
        "signal": "中性",
        "update_time": "2026-06-06 13:30:00"
      },
      "northbound": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "net_flow": [
          45,
          32,
          -18,
          58,
          72,
          55,
          28,
          65,
          80,
          70
        ],
        "cumulative_flow": [
          45,
          77,
          59,
          117,
          189,
          244,
          272,
          337,
          417,
          487
        ],
        "flow_5d": 298,
        "flow_20d": 487,
        "latest": 70,
        "trend": "持续流入",
        "update_time": "2026-06-06 13:30:00"
      },
      "market_volume": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "volume": [
          9200,
          8800,
          8500,
          9800,
          10500,
          10200,
          9500,
          10800,
          11200,
          11000
        ],
        "turnover_rate": [
          1.8,
          1.7,
          1.6,
          1.9,
          2.1,
          2.0,
          1.8,
          2.1,
          2.2,
          2.15
        ],
        "latest_volume": 11000,
        "latest_turnover": 2.15,
        "volume_level": "适中",
        "ma20_volume": 9800,
        "update_time": "2026-06-06 13:30:00"
      }
    }
  },
  "microstructure": {
    "meta": {
      "layer": 3,
      "layer_name": "大盘微观结构与情绪",
      "description": "从衍生品、市场宽度和情绪指标推断市场真实强弱",
      "update_time": "2026-06-06 13:30:00"
    },
    "indicators": {
      "option_sentiment": {
        "dates": [
          "05-26",
          "05-27",
          "05-28",
          "05-29",
          "05-30",
          "06-02",
          "06-03",
          "06-04",
          "06-05",
          "06-06"
        ],
        "pcr": [
          1.05,
          1.1,
          1.15,
          1.08,
          1.02,
          0.98,
          1.05,
          1.0,
          0.95,
          0.92
        ],
        "latest_pcr": 0.92,
        "signal": "谨慎",
        "update_time": "2026-06-06 13:30:00"
      },
      "market_breadth": {
        "total_stocks": 5200,
        "above_ma20_ratio": 48.5,
        "above_ma60_ratio": 35.2,
        "signal": "中性",
        "update_time": "2026-06-06 13:30:00"
      },
      "limit_stocks": {
        "limit_up_count": 68,
        "limit_down_count": 12,
        "ratio": 5.67,
        "consecutive_count": 18,
        "promote_rate": 26.5,
        "sentiment": "活跃",
        "update_time": "2026-06-06 13:30:00"
      },
      "correlation_index": {
        "correlation": -0.35,
        "signal": "跷跷板效应强(股债负相关)",
        "update_time": "2026-06-06 13:30:00"
      }
    }
  },
  "sector": {
    "meta": {
      "layer": 4,
      "layer_name": "行业板块轮动",
      "description": "监控行业拥挤度、相对强度、资金偏好及宏观产业结构",
      "update_time": "2026-06-06 13:30:00"
    },
    "indicators": {
      "sector_crowding": {
        "total_volume": 11000,
        "sectors": [
          {
            "name": "电子",
            "volume": 1450,
            "ratio": 13.2,
            "change_pct": 2.5
          },
          {
            "name": "计算机",
            "volume": 1200,
            "ratio": 10.9,
            "change_pct": 3.1
          },
          {
            "name": "医药生物",
            "volume": 980,
            "ratio": 8.9,
            "change_pct": 1.2
          },
          {
            "name": "电力设备",
            "volume": 950,
            "ratio": 8.6,
            "change_pct": 1.8
          },
          {
            "name": "食品饮料",
            "volume": 820,
            "ratio": 7.5,
            "change_pct": -0.5
          },
          {
            "name": "银行",
            "volume": 780,
            "ratio": 7.1,
            "change_pct": 0.3
          },
          {
            "name": "汽车",
            "volume": 720,
            "ratio": 6.5,
            "change_pct": 2.2
          },
          {
            "name": "传媒",
            "volume": 680,
            "ratio": 6.2,
            "change_pct": 4.1
          },
          {
            "name": "国防军工",
            "volume": 620,
            "ratio": 5.6,
            "change_pct": 1.5
          },
          {
            "name": "房地产",
            "volume": 550,
            "ratio": 5.0,
            "change_pct": -1.2
          }
        ],
        "max_crowding_ratio": 13.2,
        "max_crowding_sector": "电子",
        "warning": "正常",
        "update_time": "2026-06-06 13:30:00"
      },
      "sector_rs": {
        "sectors": [
          {
            "name": "传媒",
            "change_20d": 12.5,
            "change_5d": 4.1,
            "latest_price": 2580.0,
            "rs_score": 100.0
          },
          {
            "name": "计算机",
            "change_20d": 10.8,
            "change_5d": 3.1,
            "latest_price": 5120.0,
            "rs_score": 88.0
          },
          {
            "name": "电子",
            "change_20d": 9.2,
            "change_5d": 2.5,
            "latest_price": 4580.0,
            "rs_score": 75.2
          },
          {
            "name": "电力设备",
            "change_20d": 6.5,
            "change_5d": 1.8,
            "latest_price": 7200.0,
            "rs_score": 53.6
          },
          {
            "name": "医药生物",
            "change_20d": 4.8,
            "change_5d": 1.2,
            "latest_price": 8900.0,
            "rs_score": 40.0
          },
          {
            "name": "银行",
            "change_20d": 3.2,
            "change_5d": 0.3,
            "latest_price": 3250.0,
            "rs_score": 27.2
          },
          {
            "name": "食品饮料",
            "change_20d": -1.5,
            "change_5d": -0.5,
            "latest_price": 16800.0,
            "rs_score": 0
          },
          {
            "name": "房地产",
            "change_20d": -3.2,
            "change_5d": -1.2,
            "latest_price": 1850.0,
            "rs_score": 0
          }
        ],
        "top_sector": "传媒",
        "update_time": "2026-06-06 13:30:00"
      },
      "etf_flow": {
        "etf_flows": [
          {
            "sector": "半导体",
            "count": 8,
            "flow_indicator": 35.2
          },
          {
            "sector": "芯片",
            "count": 6,
            "flow_indicator": 28.5
          },
          {
            "sector": "医药",
            "count": 12,
            "flow_indicator": -12.3
          },
          {
            "sector": "消费",
            "count": 10,
            "flow_indicator": 5.8
          },
          {
            "sector": "证券",
            "count": 5,
            "flow_indicator": 18.6
          },
          {
            "sector": "军工",
            "count": 4,
            "flow_indicator": 8.2
          },
          {
            "sector": "计算机",
            "count": 7,
            "flow_indicator": 22.1
          },
          {
            "sector": "AI",
            "count": 5,
            "flow_indicator": 42.8
          },
          {
            "sector": "人工智能",
            "count": 4,
            "flow_indicator": 32.5
          }
        ],
        "update_time": "2026-06-06 13:30:00"
      },
      "ppi_cpi_spread": {
        "dates": [
          "2025-12",
          "2026-01",
          "2026-02",
          "2026-03",
          "2026-04",
          "2026-05"
        ],
        "cpi": [
          0.3,
          0.5,
          0.2,
          0.1,
          0.0,
          -0.1
        ],
        "ppi": [
          -2.5,
          -2.3,
          -2.0,
          -1.8,
          -1.5,
          -1.2
        ],
        "spread": [
          -2.8,
          -2.8,
          -2.2,
          -1.9,
          -1.5,
          -1.1
        ],
        "latest_spread": -1.1,
        "signal": "利好中游制造(剪刀差收窄)",
        "update_time": "2026-06-06 13:30:00"
      }
    }
  },
  "stocks": {
    "meta": {
      "layer": 5,
      "layer_name": "个股微观结构",
      "description": "监控个股订单流、波动率、主力资金及技术位置",
      "update_time": "2026-06-06 13:30:00",
      "total_stocks": 13
    },
    "stocks": [
      {
        "code": "600519",
        "name": "贵州茅台",
        "latest_price": 1680.5,
        "change_5d": 2.3,
        "change_20d": 5.8,
        "ofi": 12.5,
        "idio_volatility": 18.3,
        "beta": 0.85,
        "large_order_ratio": 115.0,
        "stop_loss_distance": 6.2,
        "ma5": 1665.0,
        "ma20": 1620.0,
        "ma60": 1580.0,
        "score": 3.0,
        "action": "买入",
        "reasons": [
          "OFI偏多",
          "站上20日均线",
          "放量"
        ]
      },
      {
        "code": "600584",
        "name": "长电科技",
        "latest_price": 38.5,
        "change_5d": 5.2,
        "change_20d": 12.8,
        "ofi": 16.5,
        "idio_volatility": 32.5,
        "beta": 1.42,
        "large_order_ratio": 138.0,
        "stop_loss_distance": 7.8,
        "ma5": 37.5,
        "ma20": 35.0,
        "ma60": 33.0,
        "score": 3.5,
        "action": "买入",
        "reasons": [
          "OFI偏多",
          "站上20日均线",
          "放量"
        ]
      },
      {
        "code": "300750",
        "name": "宁德时代",
        "latest_price": 245.3,
        "change_5d": -1.2,
        "change_20d": 8.5,
        "ofi": -5.3,
        "idio_volatility": 28.6,
        "beta": 1.35,
        "large_order_ratio": 95.0,
        "stop_loss_distance": 4.8,
        "ma5": 248.0,
        "ma20": 235.0,
        "ma60": 220.0,
        "score": 0.5,
        "action": "持有",
        "reasons": [
          "站上20日均线",
          "缩量"
        ]
      },
      {
        "code": "002594",
        "name": "比亚迪",
        "latest_price": 312.8,
        "change_5d": 4.5,
        "change_20d": 15.2,
        "ofi": 18.2,
        "idio_volatility": 32.1,
        "beta": 1.15,
        "large_order_ratio": 135.0,
        "stop_loss_distance": 7.5,
        "ma5": 305.0,
        "ma20": 285.0,
        "ma60": 270.0,
        "score": 4.0,
        "action": "买入",
        "reasons": [
          "OFI偏多",
          "站上20日均线",
          "放量"
        ]
      },
      {
        "code": "601318",
        "name": "中国平安",
        "latest_price": 52.6,
        "change_5d": 1.8,
        "change_20d": 3.2,
        "ofi": 8.5,
        "idio_volatility": 15.2,
        "beta": 0.72,
        "large_order_ratio": 108.0,
        "stop_loss_distance": 5.5,
        "ma5": 52.0,
        "ma20": 51.0,
        "ma60": 49.5,
        "score": 2.5,
        "action": "买入",
        "reasons": [
          "OFI偏多",
          "站上20日均线"
        ]
      },
      {
        "code": "000858",
        "name": "五粮液",
        "latest_price": 158.2,
        "change_5d": -0.8,
        "change_20d": 2.5,
        "ofi": -3.2,
        "idio_volatility": 22.5,
        "beta": 0.92,
        "large_order_ratio": 88.0,
        "stop_loss_distance": 3.2,
        "ma5": 159.0,
        "ma20": 155.0,
        "ma60": 152.0,
        "score": 0.5,
        "action": "持有",
        "reasons": [
          "站上20日均线",
          "缩量"
        ]
      },
      {
        "code": "600036",
        "name": "招商银行",
        "latest_price": 42.8,
        "change_5d": 0.5,
        "change_20d": 6.8,
        "ofi": 5.8,
        "idio_volatility": 16.8,
        "beta": 0.65,
        "large_order_ratio": 105.0,
        "stop_loss_distance": 4.5,
        "ma5": 42.5,
        "ma20": 40.5,
        "ma60": 38.0,
        "score": 2.0,
        "action": "买入",
        "reasons": [
          "OFI偏多",
          "站上20日均线"
        ]
      },
      {
        "code": "000001",
        "name": "平安银行",
        "latest_price": 12.35,
        "change_5d": -2.5,
        "change_20d": -1.2,
        "ofi": -12.3,
        "idio_volatility": 25.8,
        "beta": 0.55,
        "large_order_ratio": 78.0,
        "stop_loss_distance": 2.8,
        "ma5": 12.5,
        "ma20": 12.5,
        "ma60": 12.8,
        "score": -2.0,
        "action": "卖出",
        "reasons": [
          "OFI偏空",
          "缩量"
        ]
      },
      {
        "code": "000002",
        "name": "万科A",
        "latest_price": 8.52,
        "change_5d": -4.2,
        "change_20d": -8.5,
        "ofi": -18.5,
        "idio_volatility": 38.5,
        "beta": 0.95,
        "large_order_ratio": 72.0,
        "stop_loss_distance": 1.5,
        "ma5": 8.8,
        "ma20": 9.2,
        "ma60": 9.5,
        "score": -4.0,
        "action": "卖出",
        "reasons": [
          "OFI偏空",
          "跌破20日均线",
          "特质波动率高",
          "缩量"
        ]
      },
      {
        "code": "601899",
        "name": "紫金矿业",
        "latest_price": 18.25,
        "change_5d": 6.2,
        "change_20d": 12.8,
        "ofi": 15.8,
        "idio_volatility": 35.2,
        "beta": 1.25,
        "large_order_ratio": 142.0,
        "stop_loss_distance": 8.5,
        "ma5": 17.5,
        "ma20": 16.5,
        "ma60": 15.8,
        "score": 3.5,
        "action": "买入",
        "reasons": [
          "OFI偏多",
          "站上20日均线",
          "放量"
        ]
      },
      {
        "code": "603259",
        "name": "药明康德",
        "latest_price": 62.3,
        "change_5d": -3.5,
        "change_20d": -5.8,
        "ofi": -15.2,
        "idio_volatility": 42.5,
        "beta": 1.45,
        "large_order_ratio": 68.0,
        "stop_loss_distance": 2.2,
        "ma5": 63.5,
        "ma20": 65.0,
        "ma60": 68.0,
        "score": -4.5,
        "action": "卖出",
        "reasons": [
          "OFI偏空",
          "跌破20日均线",
          "特质波动率高",
          "缩量"
        ]
      },
      {
        "code": "600900",
        "name": "长江电力",
        "latest_price": 28.5,
        "change_5d": 0.8,
        "change_20d": 2.2,
        "ofi": 4.5,
        "idio_volatility": 12.5,
        "beta": 0.38,
        "large_order_ratio": 98.0,
        "stop_loss_distance": 4.2,
        "ma5": 28.3,
        "ma20": 28.0,
        "ma60": 27.5,
        "score": 1.5,
        "action": "持有",
        "reasons": [
          "站上20日均线"
        ]
      },
      {
        "code": "688981",
        "name": "中芯国际",
        "latest_price": 72.5,
        "change_5d": 8.5,
        "change_20d": 18.2,
        "ofi": 22.3,
        "idio_volatility": 45.8,
        "beta": 1.85,
        "large_order_ratio": 165.0,
        "stop_loss_distance": 9.5,
        "ma5": 68.0,
        "ma20": 62.0,
        "ma60": 58.0,
        "score": 4.5,
        "action": "买入",
        "reasons": [
          "OFI偏多",
          "站上20日均线",
          "放量"
        ]
      }
    ]
  },
  "summary": {
    "update_time": "2026-06-06 13:30:00",
    "overall_signal": "🟡 中性偏多",
    "risk_level": "中低",
    "trading_advice": "市场整体偏积极，建议维持5-6成仓位。关注行业轮动机会，优选相对强度领先的板块。当前传媒、计算机、电子板块RS评分领先，半导体ETF持续获净申购，科技成长风格占优。",
    "score": 2.0,
    "key_observations": [
      "央行连续净投放，OMO月净投放3500亿，宏观流动性偏宽松",
      "ERP处于+1.58σ低估区域，中长期配置价值较高",
      "北向资金20日净流入487亿，外资持续增配A股",
      "人民币升值趋势确立，CNH从7.12下行至7.02",
      "传媒、计算机、电子板块RS评分居前，科技成长为主线"
    ],
    "signals": {
      "macro": "DR007: 1.52% | 10Y国债: 2.26% | 央行态度: 扩张 | CNH: 升值",
      "capital": "ERP: 合理偏低(1.58σ) | 两融: 中性 | 北向: 持续流入 | 成交: 适中(11000亿)",
      "microstructure": "PCR: 谨慎 | 宽度: 中性 | 情绪: 活跃(晋级率26.5%) | 股债: 跷跷板效应强(股债负相关)",
      "sector": "拥挤度: 正常 | 最强: 传媒 | PPI-CPI: 利好中游制造(剪刀差收窄)",
      "stocks": "买入6只 / 持有3只 / 卖出3只"
    }
  }
};
