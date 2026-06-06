"""
第二层：大盘资金面与风险溢价数据抓取
指标：ERP股债风险溢价、两融余额及占比、北向资金净买入、全市场成交额与换手率
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

def fetch_margin_trade():
    """获取两融余额及两融买入额占比"""
    try:
        df = ak.stock_margin_sse(start_date='20240101')
        if df is not None and not df.empty:
            recent = df.tail(60)
            margin_balance = recent['融资余额'].tolist() if '融资余额' in recent.columns else []
            margin_buy = recent['融资买入额'].tolist() if '融资买入额' in recent.columns else []
            
            # 尝试获取全市场成交额来计算占比
            try:
                market_df = ak.stock_sse_deal_daily()
                if market_df is not None and not market_df.empty:
                    market_recent = market_df.tail(60)
                    total_volume = market_recent['成交金额'].tolist() if '成交金额' in market_recent.columns else []
                    if margin_buy and total_volume:
                        ratio = [round(m/t*100, 2) if t and t>0 else 0 for m, t in zip(margin_buy, total_volume)]
                    else:
                        ratio = []
                else:
                    ratio = []
            except:
                ratio = []
            
            return {
                'dates': recent['信用交易日期'].astype(str).tolist() if '信用交易日期' in recent.columns else [],
                'margin_balance': margin_balance,
                'margin_buy_amount': margin_buy,
                'margin_ratio': ratio,
                'latest_balance': margin_balance[-1] if margin_balance else None,
                'latest_ratio': ratio[-1] if ratio else None,
                'signal': '冰点' if (ratio and ratio[-1] < 6) else ('过热' if (ratio and ratio[-1] > 11) else '中性'),
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"两融数据获取失败: {e}")
    return {'dates': [], 'margin_balance': [], 'margin_buy_amount': [], 'margin_ratio': [], 
            'latest_balance': None, 'latest_ratio': None, 'signal': '未知', 'update_time': ''}

def fetch_northbound():
    """获取北向资金净主动买入"""
    try:
        df = ak.stock_hsgt_north_net_flow_in_em(symbol="北上")
        if df is not None and not df.empty:
            recent = df.tail(60)
            net_flow = recent['净流入'].tolist() if '净流入' in recent.columns else []
            cumulative = np.cumsum(net_flow).tolist() if net_flow else []
            
            # 计算近5日、20日累计
            flow_5d = sum(net_flow[-5:]) if len(net_flow) >= 5 else 0
            flow_20d = sum(net_flow[-20:]) if len(net_flow) >= 20 else 0
            
            return {
                'dates': recent['日期'].astype(str).tolist() if '日期' in recent.columns else [],
                'net_flow': net_flow,
                'cumulative_flow': cumulative,
                'flow_5d': flow_5d,
                'flow_20d': flow_20d,
                'latest': net_flow[-1] if net_flow else None,
                'trend': '持续流入' if flow_20d > 0 else '持续流出',
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"北向资金数据获取失败: {e}")
    return {'dates': [], 'net_flow': [], 'cumulative_flow': [], 'flow_5d': 0, 'flow_20d': 0, 
            'latest': None, 'trend': '未知', 'update_time': ''}

def fetch_market_volume():
    """获取全市场成交额与换手率"""
    try:
        df = ak.stock_sse_deal_daily()
        if df is not None and not df.empty:
            recent = df.tail(120)
            volume = recent['成交金额'].tolist() if '成交金额' in recent.columns else []
            # 换手率（如果有的话）
            turnover = recent['换手率'].tolist() if '换手率' in recent.columns else []
            
            # 量能级别判断
            latest_vol = volume[-1] if volume else 0
            if latest_vol > 15000:
                level = '放量'
            elif latest_vol > 8000:
                level = '适中'
            else:
                level = '缩量'
            
            return {
                'dates': recent['日期'].astype(str).tolist() if '日期' in recent.columns else [],
                'volume': volume,
                'turnover_rate': turnover,
                'latest_volume': latest_vol,
                'latest_turnover': turnover[-1] if turnover else None,
                'volume_level': level,
                'ma20_volume': np.mean(volume[-20:]) if len(volume)>=20 else 0,
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"市场成交数据获取失败: {e}")
    return {'dates': [], 'volume': [], 'turnover_rate': [], 'latest_volume': 0, 
            'latest_turnover': None, 'volume_level': '未知', 'update_time': ''}

def fetch_erp():
    """计算ERP股债风险溢价 = 1/PE - 10年期国债收益率"""
    try:
        # 获取全市场PE
        pe_df = ak.stock_a_pe(symbol="上证")
        if pe_df is not None and not pe_df.empty:
            pe_recent = pe_df.tail(60)
            pe_values = pe_recent['平均市盈率'].tolist() if '平均市盈率' in pe_recent.columns else []
            dates = pe_recent['日期'].astype(str).tolist() if '日期' in pe_recent.columns else []
            
            # 获取10年期国债收益率
            try:
                bond_df = ak.bond_china_yield()
                bond_recent = bond_df.tail(60)
                bond_yields = bond_recent['收益率'].tolist() if '收益率' in bond_recent.columns else []
            except:
                bond_yields = [2.5] * len(pe_values)
            
            # 计算ERP
            erp_values = []
            for pe, bond in zip(pe_values, bond_yields[:len(pe_values)]):
                if pe and pe > 0:
                    earnings_yield = (1 / pe) * 100
                    erp_values.append(round(earnings_yield - bond, 2))
                else:
                    erp_values.append(None)
            
            erp_clean = [x for x in erp_values if x is not None]
            if erp_clean:
                mean_erp = np.mean(erp_clean)
                std_erp = np.std(erp_clean)
                latest_erp = erp_clean[-1]
                # 计算当前ERP处于几个标准差
                sigma = round((latest_erp - mean_erp) / std_erp, 2) if std_erp > 0 else 0
            else:
                mean_erp, std_erp, latest_erp, sigma = 0, 0, 0, 0
            
            return {
                'dates': dates,
                'erp_values': erp_values,
                'latest_erp': latest_erp,
                'mean_erp': round(mean_erp, 2),
                'std_erp': round(std_erp, 2),
                'sigma_position': sigma,
                'signal': '极度低估' if sigma > 2 else ('合理偏低' if sigma > 1 else ('合理' if sigma > -1 else '高估')),
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"ERP数据获取失败: {e}")
    return {'dates': [], 'erp_values': [], 'latest_erp': None, 'sigma_position': 0, 
            'signal': '未知', 'update_time': ''}

def fetch_all_capital():
    """抓取所有第二层指标"""
    ensure_data_dir()
    data = {
        'meta': {
            'layer': 2,
            'layer_name': '大盘资金面与风险溢价',
            'description': '监控资金流向、杠杆情绪、外资动向及风险偏好',
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        },
        'indicators': {
            'erp': fetch_erp(),
            'margin_trade': fetch_margin_trade(),
            'northbound': fetch_northbound(),
            'market_volume': fetch_market_volume()
        }
    }
    
    output_path = os.path.join(DATA_DIR, 'market_capital.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"第二层数据已保存至: {output_path}")
    return data

if __name__ == '__main__':
    fetch_all_capital()
