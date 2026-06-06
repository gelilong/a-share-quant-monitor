"""
第一层：宏观流动性与货币政策数据抓取
指标：DR007、10年期国债收益率、央行OMO/MLF净投放、CNH汇率变动率
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

def fetch_dr007():
    """获取DR007银行间7天质押式回购利率及利差分析"""
    # 7天逆回购政策利率（央行公开市场7天期逆回购操作利率）
    POLICY_RATE = 1.50  # 当前政策利率，可根据实际调整
    
    try:
        # 使用Shibor隔夜和7天利率作为近似
        df = ak.macro_china_shibor_all()
        if df is not None and not df.empty:
            recent = df.tail(60)
            week1_vals = recent['1W-定价'].tolist() if '1W-定价' in recent.columns else []
            
            # 计算利差 (DR007 - 政策利率)，单位转换成bp
            spread_vals = [round((v - POLICY_RATE) * 100, 1) for v in week1_vals] if week1_vals else []
            
            latest_week1 = float(recent['1W-定价'].iloc[-1]) if '1W-定价' in recent.columns else None
            latest_spread = round((latest_week1 - POLICY_RATE) * 100, 1) if latest_week1 else None
            
            # 判断利差信号
            if latest_spread is not None:
                if latest_spread < -10:
                    spread_signal = '极度宽松'
                elif latest_spread <= 5:
                    spread_signal = '中性'
                else:
                    spread_signal = '偏紧收紧'
            else:
                spread_signal = '未知'
            
            return {
                'dates': recent['日期'].astype(str).tolist() if '日期' in recent.columns else [],
                'overnight': recent['O/N-定价'].tolist() if 'O/N-定价' in recent.columns else [],
                'week_1': week1_vals,
                'spread': spread_vals,
                'policy_rate': POLICY_RATE,
                'latest': latest_week1,
                'latest_spread': latest_spread,
                'spread_signal': spread_signal,
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"DR007数据获取失败: {e}")
    return {'dates': [], 'overnight': [], 'week_1': [], 'spread': [], 'policy_rate': POLICY_RATE, 'latest': None, 'latest_spread': None, 'spread_signal': '未知', 'update_time': ''}

def fetch_bond_yield():
    """获取10年期国债收益率"""
    try:
        df = ak.bond_china_yield()
        if df is not None and not df.empty:
            recent = df.tail(120)
            return {
                'dates': recent['日期'].astype(str).tolist() if '日期' in recent.columns else [],
                'yield_10y': recent['收益率'].tolist() if '收益率' in recent.columns else [],
                'latest': float(recent['收益率'].iloc[-1]) if '收益率' in recent.columns else None,
                'change_1m': float(recent['收益率'].iloc[-1] - recent['收益率'].iloc[-22]) if len(recent) >= 22 else None,
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"国债收益率数据获取失败: {e}")
    return {'dates': [], 'yield_10y': [], 'latest': None, 'change_1m': None, 'update_time': ''}

def fetch_omo_mlf():
    """获取央行公开市场操作(OMO/MLF)净投放"""
    try:
        # 使用央行公开市场操作数据
        df = ak.macro_china_pboc_operation()
        if df is not None and not df.empty:
            recent = df.tail(60)
            # 计算净投放（投放 - 回笼）
            net_inject = []
            for _, row in recent.iterrows():
                inject = float(row.get('投放量', 0) or 0)
                withdraw = float(row.get('回笼量', 0) or 0)
                net_inject.append(inject - withdraw)
            
            monthly_net = sum(net_inject[-22:])  # 近一个月净投放
            return {
                'dates': recent.iloc[:, 0].astype(str).tolist() if len(recent.columns) > 0 else [],
                'net_injection': net_inject,
                'monthly_net': monthly_net,
                'latest': net_inject[-1] if net_inject else None,
                'signal': '扩张' if monthly_net > 0 else '收缩',
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"OMO/MLF数据获取失败: {e}")
    return {'dates': [], 'net_injection': [], 'monthly_net': 0, 'latest': None, 'signal': '未知', 'update_time': ''}

def fetch_cnh():
    """获取CNH离岸人民币汇率变动率"""
    try:
        df = ak.currency_boc_sina(symbol="美元")
        if df is not None and not df.empty:
            recent = df.tail(60)
            rates = recent['美元_中间价'].tolist() if '美元_中间价' in recent.columns else []
            change_rates = []
            for i in range(1, len(rates)):
                if rates[i-1] and rates[i-1] != 0:
                    change_rates.append(round((rates[i] - rates[i-1]) / rates[i-1] * 100, 4))
            
            latest_rate = rates[-1] if rates else None
            return {
                'dates': recent['日期'].astype(str).tolist() if '日期' in recent.columns else [],
                'rates': rates,
                'change_rates': change_rates,
                'latest': latest_rate,
                'trend': '升值' if change_rates and sum(change_rates[-5:]) < 0 else '贬值',
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"CNH汇率数据获取失败: {e}")
    return {'dates': [], 'rates': [], 'change_rates': [], 'latest': None, 'trend': '未知', 'update_time': ''}

def fetch_all_macro():
    """抓取所有第一层指标"""
    ensure_data_dir()
    data = {
        'meta': {
            'layer': 1,
            'layer_name': '宏观流动性与货币政策',
            'description': '监控全市场流动性水位，央行政策态度及全球风险偏好',
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        },
        'indicators': {
            'dr007': fetch_dr007(),
            'bond_yield_10y': fetch_bond_yield(),
            'omo_mlf': fetch_omo_mlf(),
            'cnh_rate': fetch_cnh()
        }
    }
    
    output_path = os.path.join(DATA_DIR, 'macro_liquidity.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"第一层数据已保存至: {output_path}")
    return data

if __name__ == '__main__':
    fetch_all_macro()
