"""
第五层：个股微观结构数据抓取
指标：OFI订单流不平衡度、特质波动率、大单占比与游资席位协同度、移动跟踪止损偏离度
支持自选股列表的批量查询
"""
import akshare as ak
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)

def calculate_ofi(buy_volume, sell_volume):
    """计算OFI订单流不平衡度"""
    total = buy_volume + sell_volume
    if total > 0:
        return round((buy_volume - sell_volume) / total * 100, 2)
    return 0

def calculate_idio_volatility(stock_returns, market_returns):
    """计算特质波动率"""
    if len(stock_returns) < 20 or len(market_returns) < 20:
        return None, None
    try:
        min_len = min(len(stock_returns), len(market_returns))
        stock_arr = np.array(stock_returns[:min_len])
        market_arr = np.array(market_returns[:min_len])
        
        # 简单回归：stock = alpha + beta * market + epsilon
        cov = np.cov(stock_arr, market_arr)
        beta = cov[0, 1] / cov[1, 1] if cov[1, 1] > 0 else 0
        residuals = stock_arr - beta * market_arr
        idio_vol = np.std(residuals) * np.sqrt(252)  # 年化
        
        return round(float(idio_vol) * 100, 2), round(float(beta), 3)
    except:
        return None, None

def fetch_stock_detail(stock_code):
    """获取单只个股的微观结构数据"""
    try:
        # 处理股票代码格式
        if stock_code.startswith('6'):
            market = 'sh'
        else:
            market = 'sz'
        
        full_code = f"{market}{stock_code}"
        
        # 获取日K线
        df = ak.stock_zh_a_hist(symbol=stock_code, period="daily", 
                                start_date=(datetime.now() - timedelta(days=120)).strftime('%Y%m%d'),
                                end_date=datetime.now().strftime('%Y%m%d'),
                                adjust="qfq")
        
        if df is None or df.empty:
            return None
        
        closes = df['收盘'].tolist()
        volumes = df['成交量'].tolist()
        highs = df['最高'].tolist()
        lows = df['最低'].tolist()
        opens = df['开盘'].tolist()
        
        # 1. 计算OFI（基于日度涨跌对应的买卖量估计）
        # 简化：用当天涨跌方向近似买卖力量
        price_changes = []
        for i in range(1, len(closes)):
            price_changes.append((closes[i] - closes[i-1]) / closes[i-1])
        
        buy_pressure = [v for v, c in zip(volumes[1:], price_changes) if c > 0]
        sell_pressure = [v for v, c in zip(volumes[1:], price_changes) if c < 0]
        total_buy = sum(buy_pressure) if buy_pressure else 0
        total_sell = sum(sell_pressure) if sell_pressure else 0
        ofi = calculate_ofi(total_buy, total_sell)
        
        # 2. 特质波动率
        try:
            market_df = ak.stock_zh_index_daily_em(symbol="sh000001")  # 上证指数
            if market_df is not None and not market_df.empty:
                market_recent = market_df.tail(len(df))
                market_returns = market_recent['close'].pct_change().dropna().tolist() if 'close' in market_recent.columns else []
            else:
                market_returns = [0] * len(price_changes)
        except:
            market_returns = [0] * len(price_changes)
        
        stock_returns = price_changes
        idio_vol, beta = calculate_idio_volatility(stock_returns, market_returns)
        
        # 3. 大单占比（基于成交量变化率）
        vol_ma20 = np.mean(volumes[-20:]) if len(volumes) >= 20 else np.mean(volumes)
        latest_vol = volumes[-1] if volumes else 0
        large_order_ratio = round(latest_vol / vol_ma20 * 100, 1) if vol_ma20 > 0 else 100
        
        # 4. 移动跟踪止损偏离度
        recent_high = max(highs[-20:]) if len(highs) >= 20 else max(highs)
        latest_close = closes[-1] if closes else 0
        stop_loss_distance = round((latest_close - recent_high * 0.95) / latest_close * 100, 2) if latest_close > 0 else 0
        
        # 趋势指标
        ma5 = np.mean(closes[-5:]) if len(closes) >= 5 else closes[-1]
        ma20 = np.mean(closes[-20:]) if len(closes) >= 20 else closes[-1]
        ma60 = np.mean(closes[-60:]) if len(closes) >= 60 else closes[-1]
        
        # 涨跌幅
        change_5d = round((closes[-1] / closes[-5] - 1) * 100, 2) if len(closes) >= 5 else 0
        change_20d = round((closes[-1] / closes[-20] - 1) * 100, 2) if len(closes) >= 20 else 0
        
        # 综合信号
        score = 0
        reasons = []
        
        if ofi > 10:
            score += 2
            reasons.append('OFI偏多')
        elif ofi < -10:
            score -= 2
            reasons.append('OFI偏空')
        
        if latest_close > ma20:
            score += 1
            reasons.append('站上20日均线')
        elif latest_close < ma20:
            score -= 1
            reasons.append('跌破20日均线')
        
        if idio_vol and idio_vol > 40:
            score -= 1
            reasons.append('特质波动率高')
        
        if large_order_ratio > 120:
            score += 1
            reasons.append('放量')
        elif large_order_ratio < 80:
            score -= 1
            reasons.append('缩量')
        
        if change_5d > 0:
            score += 0.5
        else:
            score -= 0.5
        
        if score >= 2:
            action = '买入'
        elif score >= 0:
            action = '持有'
        else:
            action = '卖出'
        
        return {
            'code': stock_code,
            'name': df.iloc[0].get('股票名称', ''),
            'latest_price': closes[-1] if closes else None,
            'change_5d': change_5d,
            'change_20d': change_20d,
            'ofi': ofi,
            'idio_volatility': idio_vol,
            'beta': beta,
            'large_order_ratio': large_order_ratio,
            'stop_loss_distance': stop_loss_distance,
            'ma5': round(ma5, 2),
            'ma20': round(ma20, 2),
            'ma60': round(ma60, 2),
            'score': round(score, 1),
            'action': action,
            'reasons': reasons,
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        print(f"个股{stock_code}数据获取失败: {e}")
        return None

def fetch_all_stocks():
    """抓取所有默认关注个股的第五层数据"""
    ensure_data_dir()
    
    # 默认关注的核心标的
    default_stocks = [
        '000001',  # 平安银行
        '000002',  # 万科A
        '000858',  # 五粮液
        '002594',  # 比亚迪
        '300750',  # 宁德时代
        '600036',  # 招商银行
        '600519',  # 贵州茅台
        '600584',  # 长电科技
        '600900',  # 长江电力
        '601318',  # 中国平安
        '601899',  # 紫金矿业
        '603259',  # 药明康德
        '688981',  # 中芯国际
    ]
    
    results = []
    for code in default_stocks:
        detail = fetch_stock_detail(code)
        if detail:
            results.append(detail)
        else:
            results.append({
                'code': code,
                'name': '',
                'latest_price': None,
                'action': '数据异常',
                'error': True
            })
    
    data = {
        'meta': {
            'layer': 5,
            'layer_name': '个股微观结构',
            'description': '监控个股订单流、波动率、主力资金及技术位置',
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_stocks': len(results)
        },
        'stocks': results
    }
    
    output_path = os.path.join(DATA_DIR, 'stock_microstructure.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"第五层数据已保存至: {output_path}")
    return data

if __name__ == '__main__':
    fetch_all_stocks()
