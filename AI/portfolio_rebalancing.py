from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import logging
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
from textblob import TextBlob
import re
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

# Add ticker to company name mapping
ticker_to_company = {
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "Tata Consultancy Services",
    "HDFCBANK.NS": "HDFC Bank",
    "INFY.NS": "Infosys",
    "ICICIBANK.NS": "ICICI Bank",
    "HINDUNILVR.NS": "Hindustan Unilever",
    "SBIN.NS": "State Bank of India",
    "BHARTIARTL.NS": "Bharti Airtel",
    "ITC.NS": "ITC Limited",
    "KOTAKBANK.NS": "Kotak Mahindra Bank",
    # Add more mappings as needed
}

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

def fetch_data(symbol, period='1y', asset_type='stock'):
    try:
        if asset_type in ['stock', 'etf', 'mutual_fund']:
            if not symbol.endswith('.NS') and asset_type == 'stock':
                symbol += '.NS'
            data = yf.download(symbol, period=period)
        elif asset_type == 'crypto':
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)  # 1 year (free tier limitation)
            url = f"https://api.coingecko.com/api/v3/coins/{symbol.lower()}/market_chart/range"
            params = {
                "vs_currency": "inr",
                "from": int(start_date.timestamp()),
                "to": int(end_date.timestamp())
            }
            response = requests.get(url, params=params)
            if response.status_code == 200:
                json_data = response.json()
                df = pd.DataFrame(json_data['prices'], columns=['Date', 'Close'])
                df['Date'] = pd.to_datetime(df['Date'], unit='ms')
                df.set_index('Date', inplace=True)
                df['Volume'] = [item[1] for item in json_data['total_volumes']]
                data = df
            else:
                logging.error(f"CoinGecko API error: {response.status_code} - {response.text}")
                raise ValueError(f"Unable to fetch data for {symbol}")
        elif asset_type in ['commodity', 'real_estate']:
            commodity_map = {
                'GOLD': 'GC=F',
                'SILVER': 'SI=F',
                'CRUDEOIL': 'CL=F',
                'REALESTATE': 'NIFTYTV23REALT.NS'
            }
            symbol = commodity_map.get(symbol.upper(), symbol)
            data = yf.download(symbol, period=period)
        else:
            raise ValueError(f"Unsupported asset type: {asset_type}")

        if data.empty:
            raise ValueError(f"No data available for {symbol}")
        data = data.dropna().interpolate(method='time')
        logging.info(f"Data fetched for {symbol}")
        return data
    except Exception as e:
        logging.error(f"Error fetching data for {symbol}: {str(e)}")
        return None

def calculate_risk_metrics(data):
    if data is None or data.empty:
        return None
    
    returns = data['Close'].pct_change().dropna()
    volatility = returns.std() * np.sqrt(252)
    beta = calculate_beta(returns)
    sharpe_ratio = calculate_sharpe_ratio(returns)
    
    return {
        'volatility': volatility,
        'beta': beta,
        'sharpe_ratio': sharpe_ratio
    }

def calculate_beta(returns, market_returns=None):
    if market_returns is None:
        try:
            market_data = yf.download('^NSEI', start=returns.index[0], end=returns.index[-1])
            market_returns = market_data['Adj Close'].pct_change().dropna()
        except Exception as e:
            logging.error(f"Error fetching market data: {e}")
            return None

    common_dates = returns.index.intersection(market_returns.index)
    if len(common_dates) < 30:
        return None

    stock_returns = returns.loc[common_dates]
    market_returns = market_returns.loc[common_dates]

    covariance = np.cov(stock_returns, market_returns)[0][1]
    market_variance = np.var(market_returns)
    return covariance / market_variance

def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    # Using 5% as an approximate risk-free rate for India
    excess_returns = returns - risk_free_rate / 252
    return np.sqrt(252) * excess_returns.mean() / returns.std()

def predict_risk(symbol, data, asset_type):
    if data is None or data.empty:
        return None

    # Calculate various features
    returns = data['Close'].pct_change().dropna()
    log_returns = np.log(1 + returns)
    volatility = returns.rolling(window=30).std() * np.sqrt(252)
    ma_50 = data['Close'].rolling(window=50).mean()
    ma_200 = data['Close'].rolling(window=200).mean()

    # Prepare features for the model
    features = pd.DataFrame({
        'log_returns': log_returns,
        'volatility': volatility,
        'ma_50': ma_50,
        'ma_200': ma_200,
        'volume': data['Volume']
    }).dropna()

    # Prepare target (future volatility)
    future_volatility = volatility.shift(-30).dropna()

    # Align features and target
    features = features[:-30]
    future_volatility = future_volatility[:len(features)]

    # If we don't have enough data points, return a high risk value
    if len(features) < 100:  # Arbitrary threshold, adjust as needed
        logging.warning(f"Not enough data points for {symbol} to predict risk accurately. Returning high risk.")
        return 0.5  # Arbitrary high risk value, adjust as needed

    # Split data
    train_size = int(len(features) * 0.8)
    X_train, X_test = features[:train_size], features[train_size:]
    y_train, y_test = future_volatility[:train_size], future_volatility[train_size:]

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Predict risk (use the last available data point)
    last_data_point = scaler.transform(features.iloc[-1].values.reshape(1, -1))
    predicted_risk = model.predict(last_data_point)[0]

    # Adjust risk based on asset type
    if asset_type == 'options':
        predicted_risk *= 1.5  # Options are generally riskier
    elif asset_type == 'mutual_fund':
        # Adjust based on fund type (e.g., equity, debt, balanced)
        fund_type = get_fund_type(symbol)
        if fund_type == 'equity':
            predicted_risk *= 1.2
        elif fund_type == 'debt':
            predicted_risk *= 0.8
        # For balanced funds, no adjustment
    elif asset_type == 'crypto':
        predicted_risk *= 2  # Cryptocurrencies are typically very volatile

    return predicted_risk

def fetch_news(query, num_articles=5):
    url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, features='xml')
    articles = soup.findAll('item')
    
    news_list = []
    for a in articles[:num_articles]:
        title = a.title.text
        link = a.link.text
        pub_date = a.pubDate.text
        description = a.description.text
        news_list.append({
            'title': title,
            'link': link,
            'pub_date': pub_date,
            'description': description
        })
    
    print("Stage 2")
    print(news_list)
    return news_list

def analyze_sentiment(text):
    blob = TextBlob(text)
    return blob.sentiment.polarity

def get_company_name(ticker):
    if ticker in ticker_to_company:
        return ticker_to_company.get(ticker, ticker)
    else:
        ticker

def track_central_bank_news():
    rbi_news = fetch_news("RBI interest rates")
    global_news = fetch_news("global central banks interest rates")
    
    rbi_sentiment = np.mean([analyze_sentiment(news['title'] + " " + news['description']) for news in rbi_news])
    global_sentiment = np.mean([analyze_sentiment(news['title'] + " " + news['description']) for news in global_news])
    
    print("Stage 4")
    print(rbi_sentiment, global_sentiment)
    return rbi_sentiment, global_sentiment

def adjust_bond_valuation(bond_item, rbi_sentiment, global_sentiment):
    # Simplified bond valuation adjustment based on central bank sentiments
    # Positive sentiment (likely rate increase) generally decreases bond values
    # Negative sentiment (likely rate decrease) generally increases bond values
    adjustment_factor = 1 - (rbi_sentiment * 0.05 + global_sentiment * 0.05)  # 10% max adjustment
    return bond_item['quantity'] * adjustment_factor

def rebalance_portfolio(portfolio: Portfolio):
    risk_factor = portfolio.risk_factor
    
    # Define asset allocation based on risk factor
    stock_allocation = risk_factor * 0.6
    bond_allocation = (1 - risk_factor) * 0.3
    other_allocation = 1 - stock_allocation - bond_allocation
    
    total_value = sum(item.quantity for item in portfolio.items)
    
    rebalanced_items = []
    for item in portfolio.items:
        if item.type in ['stock', 'etf', 'mutual_fund']:
            new_quantity = (item.quantity / total_value) * stock_allocation * total_value
        elif item.type == 'bond':
            new_quantity = (item.quantity / total_value) * bond_allocation * total_value
        else:
            new_quantity = (item.quantity / total_value) * other_allocation * total_value
        
        rebalanced_items.append({
            'symbol': item.symbol,
            'type': item.type,
            'quantity': new_quantity
        })
        
    print("Stage 1 done")
    print(rebalanced_items)
    return rebalanced_items
    
def suggest_portfolio(rebalanced_items: List[Dict], risk_factor: float):
    suggested_items = []
    rbi_sentiment, global_sentiment = track_central_bank_news()
    
    for item in rebalanced_items:
        asset_type = item['type']
        ticker = item['symbol']
        company_name = get_company_name(ticker)
        
        data = fetch_data(ticker, asset_type=asset_type)
        
        if data is not None:
            predicted_risk = predict_risk(ticker, data, asset_type)
            if predicted_risk is not None:
                risk_adjustment = (predicted_risk / risk_factor) if risk_factor > 0 else 1
                suggested_quantity = item['quantity'] * risk_adjustment
                
                asset_news = fetch_news(f"{company_name} stock")
                asset_sentiment = np.mean([analyze_sentiment(news['title'] + " " + news['description']) for news in asset_news])
                sentiment_adjustment = 1 + asset_sentiment * 0.1
                
                suggested_quantity *= sentiment_adjustment
                
                if asset_type == 'bond':
                    suggested_quantity = adjust_bond_valuation(item, rbi_sentiment, global_sentiment)
                elif asset_type == 'crypto':
                    suggested_quantity = min(suggested_quantity, item['quantity'] * 1.5)
                elif asset_type == 'options':
                    suggested_quantity = min(suggested_quantity, item['quantity'] * 1.2)
                
                suggested_items.append(SuggestedItem(
                    symbol=ticker,
                    type=asset_type,
                    quantity=suggested_quantity,
                    risk_percentage=predicted_risk * 100
                ))
            else:
                logging.warning(f"Unable to predict risk for {ticker}")
                suggested_items.append(SuggestedItem(
                    symbol=ticker,
                    type=asset_type,
                    quantity=item['quantity'],
                    risk_percentage=0
                ))
        else:
            logging.warning(f"Unable to fetch data for {ticker}")
            suggested_items.append(SuggestedItem(
                symbol=ticker,
                type=asset_type,
                quantity=item['quantity'],
                risk_percentage=0
            ))
    
    logging.info(f"Stage 6: Suggested items: {suggested_items}")
    return suggested_items

@app.post("/rebalance_and_suggest/", response_model=RebalancedPortfolio)
async def rebalance_and_suggest(portfolio: Portfolio):
    try:
        rebalanced_items = rebalance_portfolio(portfolio)
        suggested_items = suggest_portfolio(rebalanced_items, portfolio.risk_factor)
        
        valid_items = [item for item in suggested_items if item.risk_percentage > 0]
        invalid_items = [item for item in suggested_items if item.risk_percentage == 0]
        
        if invalid_items:
            logging.warning(f"Unable to process the following items: {invalid_items}")
        
        if not valid_items:
            raise HTTPException(status_code=400, detail="Unable to fetch data for any portfolio items")
        
        return RebalancedPortfolio(items=valid_items)
    except Exception as e:
        logging.error(f"Error in rebalance_and_suggest: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

'''
curl -X POST "http://127.0.0.1:8000/rebalance_and_suggest/" \
-H "Content-Type: application/json" \
-d '{
  "items": [
    {
      "symbol": "TCS",
      "type": "stock",
      "quantity": 50
    },
    {
      "symbol": "GOLDBEES",
      "type": "commodity",
      "quantity": 100
    },
    {
      "symbol": "bitcoin",
      "type": "crypto",
      "quantity": 0.5
    }
  ],
  "risk_factor": 0.7
}'
'''