"""
第四层：行业板块轮动数据抓取
指标：申万行业拥挤度、行业相对强度RS、行业ETF净申购份额、PPI-CPI剪刀差
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

def fetch_sector_crowding():
    """获取申万一级行业成交额占比（行业拥挤度）"""
    try:
        # 获取行业板块行情
        df = ak.stock_sector_spot_indicator(symbol="申万一级")
        if df is not None and not df.empty:
            # 只取成交额最大的前10个行业
            df['成交额'] = pd.to_numeric(df.get('成交额', 0), errors='coerce')
            total_volume = df['成交额'].sum()
            
            sectors = []
            for _, row in df.head(15).iterrows():
                ratio = round(float(row['成交额']) / total_volume * 100, 2) if total_volume > 0 else 0
                sectors.append({
                    'name': row.get('板块名称', ''),
                    'volume': float(row['成交额']) if pd.notna(row.get('成交额')) else 0,
                    'ratio': ratio,
                    'change_pct': float(row.get('涨跌幅', 0)) if '涨跌幅' in row.index and pd.notna(row.get('涨跌幅')) else 0
                })
            
            # 找出最拥挤的行业
            max_ratio = max([s['ratio'] for s in sectors]) if sectors else 0
            max_sector = [s for s in sectors if s['ratio'] == max_ratio][0]['name'] if sectors else ''
            
            return {
                'total_volume': float(total_volume),
                'sectors': sectors,
                'max_crowding_ratio': max_ratio,
                'max_crowding_sector': max_sector,
                'warning': '⚠️ 行业过热' if max_ratio > 15 else '正常',
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"行业拥挤度数据获取失败: {e}")
    return {'sectors': [], 'max_crowding_ratio': 0, 'warning': '未知', 'update_time': ''}

def fetch_sector_rs():
    """计算行业相对强度RS"""
    try:
        # 获取多个行业指数近20日涨跌幅
        sectors_to_track = ['半导体', '银行', '食品饮料', '医药生物', '电力设备', '计算机', '汽车', '房地产', '国防军工', '传媒']
        sector_data = []
        
        for sector in sectors_to_track:
            try:
                hist = ak.stock_board_industry_hist_em(symbol=sector, period="日k", adjust="")
                if hist is not None and not hist.empty:
                    hist['收盘'] = pd.to_numeric(hist['收盘'], errors='coerce')
                    if len(hist) >= 20:
                        change_20d = round((hist['收盘'].iloc[-1] / hist['收盘'].iloc[-20] - 1) * 100, 2)
                        change_5d = round((hist['收盘'].iloc[-1] / hist['收盘'].iloc[-5] - 1) * 100, 2) if len(hist) >= 5 else 0
                        sector_data.append({
                            'name': sector,
                            'change_20d': change_20d,
                            'change_5d': change_5d,
                            'latest_price': float(hist['收盘'].iloc[-1])
                        })
            except:
                continue
        
        # 按20日涨跌幅排序，计算RS评分
        if sector_data:
            max_chg = max(s['change_20d'] for s in sector_data)
            min_chg = min(s['change_20d'] for s in sector_data)
            rng = max(abs(max_chg - min_chg), 1)
            for s in sector_data:
                s['rs_score'] = round((s['change_20d'] - min_chg) / rng * 100, 1)
            sector_data.sort(key=lambda x: x['rs_score'], reverse=True)
        
        return {
            'sectors': sector_data,
            'top_sector': sector_data[0]['name'] if sector_data else '',
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        print(f"行业RS数据获取失败: {e}")
    return {'sectors': [], 'top_sector': '', 'update_time': ''}

def fetch_etf_flow():
    """获取行业ETF净申购份额"""
    try:
        df = ak.fund_etf_fund_info_em()
        if df is not None and not df.empty:
            # 筛选行业ETF（基金名称包含行业的）
            sector_keywords = ['半导体', '芯片', '新能源', '医药', '消费', '银行', '证券', '军工', '计算机', 'AI', '人工智能']
            etf_flows = []
            
            for keyword in sector_keywords:
                matched = df[df['基金简称'].str.contains(keyword, na=False)]
                if not matched.empty:
                    total_net = matched['折价率'].sum() if '折价率' in matched.columns else 0
                    etf_flows.append({
                        'sector': keyword,
                        'count': len(matched),
                        'flow_indicator': float(total_net)
                    })
            
            return {
                'etf_flows': etf_flows,
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    except Exception as e:
        print(f"ETF数据获取失败: {e}")
    return {'etf_flows': [], 'update_time': ''}

def fetch_ppi_cpi_spread():
    """获取PPI-CPI利差剪刀差"""
    try:
        cpi_df = ak.macro_china_cpi_monthly()
        ppi_df = ak.macro_china_ppi_yearly()
        
        if cpi_df is not None and not cpi_df.empty:
            cpi_recent = cpi_df.tail(24)
            cpi_values = cpi_recent['全国-当月'].tolist() if '全国-当月' in cpi_recent.columns else []
            cpi_dates = cpi_recent['日期'].astype(str).tolist() if '日期' in cpi_recent.columns else []
        else:
            cpi_values = []
            cpi_dates = []
        
        if ppi_df is not None and not ppi_df.empty:
            ppi_recent = ppi_df.tail(24)
            ppi_values = ppi_recent['当月'].tolist() if '当月' in ppi_recent.columns else []
        else:
            ppi_values = []
        
        # 计算剪刀差
        min_len = min(len(cpi_values), len(ppi_values))
        spread = [round(ppi_values[i] - cpi_values[i], 2) for i in range(min_len)]
        
        latest_spread = spread[-1] if spread else None
        signal = '利好中游制造(剪刀差收窄)' if (latest_spread and latest_spread < 0) else '利好上游资源(剪刀差扩大)'
        
        return {
            'dates': cpi_dates[:min_len],
            'cpi': cpi_values[:min_len],
            'ppi': ppi_values[:min_len],
            'spread': spread,
            'latest_spread': latest_spread,
            'signal': signal,
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        print(f"PPI-CPI数据获取失败: {e}")
    return {'dates': [], 'cpi': [], 'ppi': [], 'spread': [], 'latest_spread': None, 'signal': '未知', 'update_time': ''}

def fetch_all_sector():
    """抓取所有第四层指标"""
    ensure_data_dir()
    data = {
        'meta': {
            'layer': 4,
            'layer_name': '行业板块轮动',
            'description': '监控行业拥挤度、相对强度、资金偏好及宏观产业结构',
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        },
        'indicators': {
            'sector_crowding': fetch_sector_crowding(),
            'sector_rs': fetch_sector_rs(),
            'etf_flow': fetch_etf_flow(),
            'ppi_cpi_spread': fetch_ppi_cpi_spread()
        }
    }
    
    output_path = os.path.join(DATA_DIR, 'sector_rotation.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"第四层数据已保存至: {output_path}")
    return data

if __name__ == '__main__':
    fetch_all_sector()
