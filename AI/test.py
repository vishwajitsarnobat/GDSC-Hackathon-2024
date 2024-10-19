from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

class PortfolioItem(BaseModel):
    symbol: str
    type: str
    quantity: float

class Portfolio(BaseModel):
    items: List[PortfolioItem]
    risk_factor: float

class SuggestedItem(BaseModel):
    symbol: str
    type: str
    quantity: float
    risk_percentage: float

class RebalancedPortfolio(BaseModel):
    items: List[SuggestedItem]

def fetch_data(symbol, period='2y'):
    try:
        data = yf.download(symbol, period=period)
        if data.empty:
            raise ValueError(f"No data available for {symbol}")
        return data
    except Exception as e:
        logging.error(f"Error fetching data for {symbol}: {e}")
        return None

def predict_risk(data):
    if data is None or data.empty:
        return None

    returns = data['Close'].pct_change().dropna()
    features = pd.DataFrame({
        'returns': returns,
        'volatility': returns.rolling(window=30).std()
    }).dropna()

    target = features['volatility'].shift(-1).dropna()
    features = features[:-1]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_scaled[:-1], target[:-1])

    last_data_point = scaler.transform(features.iloc[-1].values.reshape(1, -1))
    return model.predict(last_data_point)[0]

def rebalance_portfolio(portfolio: Portfolio):
    risk_factor = portfolio.risk_factor
    stock_allocation = risk_factor * 0.7
    bond_allocation = (1 - risk_factor) * 0.3
    
    total_value = sum(item.quantity for item in portfolio.items)
    
    rebalanced_items = []
    for item in portfolio.items:
        if item.type in ['stock', 'etf', 'mutual_fund']:
            new_quantity = (item.quantity / total_value) * stock_allocation * total_value
        elif item.type == 'bond':
            new_quantity = (item.quantity / total_value) * bond_allocation * total_value
        else:
            new_quantity = item.quantity  # Keep other asset types unchanged
        
        rebalanced_items.append({
            'symbol': item.symbol,
            'type': item.type,
            'quantity': new_quantity
        })
    
    return rebalanced_items

def suggest_portfolio(rebalanced_items: List[dict], risk_factor: float):
    suggested_items = []
    
    for item in rebalanced_items:
        data = fetch_data(item['symbol'])
        
        if data is not None:
            predicted_risk = predict_risk(data)
            if predicted_risk is not None:
                risk_adjustment = (predicted_risk / risk_factor) if risk_factor > 0 else 1
                suggested_quantity = item['quantity'] * risk_adjustment
                
                suggested_items.append(SuggestedItem(
                    symbol=item['symbol'],
                    type=item['type'],
                    quantity=suggested_quantity,
                    risk_percentage=predicted_risk * 100
                ))
            else:
                suggested_items.append(SuggestedItem(
                    symbol=item['symbol'],
                    type=item['type'],
                    quantity=item['quantity'],
                    risk_percentage=0
                ))
        else:
            suggested_items.append(SuggestedItem(
                symbol=item['symbol'],
                type=item['type'],
                quantity=item['quantity'],
                risk_percentage=0
            ))
    
    return suggested_items

@app.post("/rebalance_and_suggest/", response_model=RebalancedPortfolio)
async def rebalance_and_suggest(portfolio: Portfolio):
    try:
        rebalanced_items = rebalance_portfolio(portfolio)
        suggested_items = suggest_portfolio(rebalanced_items, portfolio.risk_factor)
        return RebalancedPortfolio(items=suggested_items)
    except Exception as e:
        logging.error(f"Error in rebalance_and_suggest: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)