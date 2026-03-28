import yfinance as yf
import datetime

async def portfolio_xray_node(state):
    data = state["raw_financial_data"]
    mf_list = data.get("investments", {}).get("mutual_funds", [])
    stock_list = data.get("investments", {}).get("stocks", [])
    
    analysis = []
    total_value = 0
    
    for stock in stock_list:
        ticker = stock['symbol'] + ".NS"
        stock_data = yf.Ticker(ticker)
        current_price = stock_data.history(period="1d")['Close'].iloc[-1]
        holding_value = current_price * stock['quantity']
        total_value += holding_value
        analysis.append({
            "asset": stock['symbol'],
            "current_price": round(current_price, 2),
            "holding_value": round(holding_value, 2)
        })

    for mf in mf_list:
        total_value += mf['current_value']

    alerts = []
    equity_ratio = (sum(m['invested_amount'] for m in mf_list if m['category'] == 'Equity') / total_value) * 100 if total_value > 0 else 0
    
    if equity_ratio > 80:
        alerts.append("⚠️ Portfolio is very aggressive! 80% se zyada Equity hai.")
    
    return {
        "analysis_reports": [{
            "agent": "Portfolio X-Ray",
            "total_portfolio_value": round(total_value, 2),
            "breakdown": analysis,
            "equity_exposure": round(equity_ratio, 2),
            "alerts": alerts,
            "timestamp": str(datetime.datetime.now())
        }]
    }