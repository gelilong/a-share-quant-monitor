"""
A股量化监控系统 - 主数据抓取调度器
按层依次抓取所有指标数据，并生成综合汇总JSON
适用于GitHub Actions定时执行
"""
import sys
import os
import json
from datetime import datetime

# 添加脚本目录到路径
sys.path.insert(0, os.path.dirname(__file__))

from fetch_macro import fetch_all_macro
from fetch_capital import fetch_all_capital
from fetch_microstructure import fetch_all_microstructure
from fetch_sector import fetch_all_sector
from fetch_stock import fetch_all_stocks

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')


def generate_overall_summary(all_data):
    """基于所有层级数据，生成综合文字总结和信号判断"""
    summary = {
        'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'overall_signal': '',
        'layer_summaries': {},
        'trading_advice': '',
        'risk_level': '',
        'key_observations': []
    }
    
    # 汇总各层信号
    signals = {}
    
    # Layer 1: Macro
    macro = all_data.get('macro', {}).get('indicators', {})
    macro_signals = []
    
    dr007 = macro.get('dr007', {})
    if dr007.get('latest'):
        macro_signals.append(f"DR007: {dr007['latest']:.2f}%")
    
    bond = macro.get('bond_yield_10y', {})
    if bond.get('latest'):
        macro_signals.append(f"10Y国债: {bond['latest']:.2f}%")
    
    omo = macro.get('omo_mlf', {})
    macro_signals.append(f"央行态度: {omo.get('signal', '未知')}")
    
    cnh = macro.get('cnh_rate', {})
    macro_signals.append(f"CNH: {cnh.get('trend', '未知')}")
    
    signals['macro'] = ' | '.join(macro_signals)
    
    # Layer 2: Capital
    capital = all_data.get('capital', {}).get('indicators', {})
    capital_signals = []
    
    erp = capital.get('erp', {})
    capital_signals.append(f"ERP: {erp.get('signal', '未知')}({erp.get('sigma_position', 0)}σ)")
    
    margin = capital.get('margin_trade', {})
    capital_signals.append(f"两融: {margin.get('signal', '未知')}")
    
    nb = capital.get('northbound', {})
    capital_signals.append(f"北向: {nb.get('trend', '未知')}")
    
    vol = capital.get('market_volume', {})
    capital_signals.append(f"成交: {vol.get('volume_level', '未知')}({vol.get('latest_volume', 0):.0f}亿)")
    
    signals['capital'] = ' | '.join(capital_signals)
    
    # Layer 3: Microstructure
    micro = all_data.get('microstructure', {}).get('indicators', {})
    micro_signals = []
    
    opt = micro.get('option_sentiment', {})
    micro_signals.append(f"PCR: {opt.get('signal', '未知')}")
    
    breadth = micro.get('market_breadth', {})
    micro_signals.append(f"宽度: {breadth.get('signal', '未知')}")
    
    limit = micro.get('limit_stocks', {})
    micro_signals.append(f"情绪: {limit.get('sentiment', '未知')}(晋级率{limit.get('promote_rate', 0)}%)")
    
    corr = micro.get('correlation_index', {})
    micro_signals.append(f"股债: {corr.get('signal', '未知')}")
    
    signals['microstructure'] = ' | '.join(micro_signals)
    
    # Layer 4: Sector
    sector = all_data.get('sector', {}).get('indicators', {})
    sector_signals = []
    
    crowding = sector.get('sector_crowding', {})
    sector_signals.append(f"拥挤度: {crowding.get('warning', '正常')}")
    
    rs = sector.get('sector_rs', {})
    sector_signals.append(f"最强: {rs.get('top_sector', '未知')}")
    
    spread = sector.get('ppi_cpi_spread', {})
    sector_signals.append(f"PPI-CPI: {spread.get('signal', '未知')}")
    
    signals['sector'] = ' | '.join(sector_signals)
    
    # Layer 5: Stocks
    stocks = all_data.get('stocks', {}).get('stocks', [])
    buy_stocks = [s for s in stocks if s.get('action') == '买入']
    hold_stocks = [s for s in stocks if s.get('action') == '持有']
    sell_stocks = [s for s in stocks if s.get('action') == '卖出']
    
    stock_summary = f"买入{len(buy_stocks)}只 / 持有{len(hold_stocks)}只 / 卖出{len(sell_stocks)}只"
    signals['stocks'] = stock_summary
    
    # 整体信号判断
    positive_count = 0
    negative_count = 0
    
    # 量化打分
    score = 0
    observations = []
    
    # 宏观打分
    if omo.get('signal') == '扩张':
        score += 1
    elif omo.get('signal') == '收缩':
        score -= 0.5
    
    if bond.get('latest') and bond['latest'] < 2.5:
        score += 0.5
        observations.append('10年期国债收益率低于2.5%，流动性充裕')
    
    if cnh.get('trend') == '升值':
        score += 1
        observations.append('人民币升值趋势，利好A股核心资产')
    elif cnh.get('trend') == '贬值':
        score -= 0.5
        observations.append('人民币贬值，需关注外资流出风险')
    
    # 资金面打分
    if erp.get('sigma_position', 0) > 2:
        score += 2
        observations.append('ERP处于+2σ极度低估区域，中长期配置价值凸显')
    elif erp.get('sigma_position', 0) > 1:
        score += 1
        observations.append('ERP处于+1σ低估区域')
    elif erp.get('sigma_position', 0) < -1:
        score -= 1
    
    if margin.get('signal') == '冰点':
        score += 1
        observations.append('两融情绪处于冰点，往往对应市场底部')
    elif margin.get('signal') == '过热':
        score -= 1
        observations.append('两融情绪过热，注意短期回调风险')
    
    # 微观结构打分
    if bread.get('signal') == '强势':
        score += 1
    elif bread.get('signal') == '弱势':
        score -= 1
    
    if limit.get('sentiment') == '冰点':
        observations.append('短线情绪冰点，反弹概率增大')
    
    # 行业打分
    if crowding.get('max_crowding_ratio', 0) > 15:
        score -= 0.5
        observations.append(f"行业拥挤度偏高({crowding.get('max_crowding_sector','')})，注意追高风险")
    
    # 综合判断
    if score >= 3:
        summary['overall_signal'] = '🟢 积极看多'
        summary['risk_level'] = '低'
        summary['trading_advice'] = '建议积极配置，重点关注ERP低估+资金面改善的窗口期。可适度增加仓位至7-8成。'
    elif score >= 1:
        summary['overall_signal'] = '🟡 中性偏多'
        summary['risk_level'] = '中低'
        summary['trading_advice'] = '市场整体偏积极，建议维持5-6成仓位。关注行业轮动机会，优选相对强度领先的板块。'
    elif score >= -1:
        summary['overall_signal'] = '⚪ 震荡观望'
        summary['risk_level'] = '中'
        summary['trading_advice'] = '市场处于方向选择期，建议维持3-5成仓位。减少追涨操作，关注回踩支撑位的低吸机会。'
    elif score >= -3:
        summary['overall_signal'] = '🟠 谨慎偏空'
        summary['risk_level'] = '中高'
        summary['trading_advice'] = '市场风险偏好下降，建议降低仓位至2-3成。仅持有基本面过硬的核心标的，设置严格止损。'
    else:
        summary['overall_signal'] = '🔴 防御为主'
        summary['risk_level'] = '高'
        summary['trading_advice'] = '系统性风险较高，建议仓位控制在1-2成或空仓。等待宏观信号企稳后再考虑入场。'
    
    summary['signals'] = signals
    summary['score'] = round(score, 1)
    summary['key_observations'] = observations[:5]
    
    return summary


def main():
    """主执行函数"""
    print("=" * 60)
    print("A股量化监控系统 - 数据抓取开始")
    print(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    all_data = {}
    errors = []
    
    # Layer 1: 宏观流动性
    print("\n[1/5] 抓取第一层：宏观流动性与货币政策...")
    try:
        all_data['macro'] = fetch_all_macro()
        print("   ✓ 第一层完成")
    except Exception as e:
        errors.append(f"Layer1: {e}")
        print(f"   ✗ 第一层失败: {e}")
    
    # Layer 2: 大盘资金面
    print("\n[2/5] 抓取第二层：大盘资金面与风险溢价...")
    try:
        all_data['capital'] = fetch_all_capital()
        print("   ✓ 第二层完成")
    except Exception as e:
        errors.append(f"Layer2: {e}")
        print(f"   ✗ 第二层失败: {e}")
    
    # Layer 3: 大盘微观结构
    print("\n[3/5] 抓取第三层：大盘微观结构与情绪...")
    try:
        all_data['microstructure'] = fetch_all_microstructure()
        print("   ✓ 第三层完成")
    except Exception as e:
        errors.append(f"Layer3: {e}")
        print(f"   ✗ 第三层失败: {e}")
    
    # Layer 4: 行业板块轮动
    print("\n[4/5] 抓取第四层：行业板块轮动...")
    try:
        all_data['sector'] = fetch_all_sector()
        print("   ✓ 第四层完成")
    except Exception as e:
        errors.append(f"Layer4: {e}")
        print(f"   ✗ 第四层失败: {e}")
    
    # Layer 5: 个股微观结构
    print("\n[5/5] 抓取第五层：个股微观结构...")
    try:
        all_data['stocks'] = fetch_all_stocks()
        print("   ✓ 第五层完成")
    except Exception as e:
        errors.append(f"Layer5: {e}")
        print(f"   ✗ 第五层失败: {e}")
    
    # 生成综合汇总
    print("\n生成综合汇总报告...")
    try:
        summary = generate_overall_summary(all_data)
        output_path = os.path.join(DATA_DIR, 'summary.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        print(f"   ✓ 汇总已保存至: {output_path}")
        
        print("\n" + "=" * 60)
        print(f"综合信号: {summary['overall_signal']}")
        print(f"风险等级: {summary['risk_level']}")
        print(f"综合评分: {summary['score']}")
        print(f"交易建议: {summary['trading_advice']}")
        if summary['key_observations']:
            print("\n关键观察:")
            for obs in summary['key_observations']:
                print(f"  • {obs}")
        print("=" * 60)
    except Exception as e:
        errors.append(f"Summary: {e}")
    
    if errors:
        print(f"\n⚠️ 共 {len(errors)} 个错误:")
        for err in errors:
            print(f"  • {err}")
        sys.exit(1)
    
    print("\n✅ 所有数据抓取完成!")
    return 0


if __name__ == '__main__':
    sys.exit(main())
