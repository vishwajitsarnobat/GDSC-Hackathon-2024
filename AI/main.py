import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.ensemble import IsolationForest
from sklearn.metrics import mean_squared_error
from scipy import stats
import requests
import logging
from dotenv import load_dotenv
import os

load_dotenv()

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# API keys from .env file
NEWS_API_KEY = os.getenv('NEWS_API_KEY')

def fetch_stock_data(symbol, period='2y'):
    """Fetch stock data from Yahoo Finance with error handling."""
    try:
        data = yf.download(symbol, period=period)
        if data.empty:
            raise ValueError(f"No data available for {symbol}")
        data = data.dropna().interpolate(method='time')
        logging.info(f"Data fetched for {symbol}")
        return data
    except Exception as e:
        logging.error(f"Error fetching data for {symbol}: {e}")
        return None

def calculate_risk(data, lookback=252):
    """Calculate risk using standard deviation of returns and beta."""
    if data is None or len(data) < lookback:
        logging.warning(f"Insufficient data for risk calculation")
        return None, None
    
    returns = data['Close'].pct_change().dropna()
    volatility = returns.std() * np.sqrt(252)
    
    # Use Nifty 50 as the market benchmark for Indian stocks
    try:
        market_data = yf.download('^NSEI', start=data.index[0], end=data.index[-1])
        market_returns = market_data['Adj Close'].pct_change().dropna()
        
        common_dates = returns.index.intersection(market_returns.index)
        stock_returns = returns.loc[common_dates]
        market_returns = market_returns.loc[common_dates]
        
        covariance = np.cov(stock_returns, market_returns)[0][1]
        market_variance = np.var(market_returns)
        beta = covariance / market_variance
    except Exception as e:
        logging.error(f"Error calculating beta: {e}")
        beta = None
    
    logging.info(f"Risk calculated: Volatility={volatility}, Beta={beta}")
    return volatility, beta

def detect_anomalies(data, contamination=0.01):
    """Detect anomalies using Isolation Forest."""
    if data is None or data.empty:
        logging.warning("No data available for anomaly detection")
        return None
    
    clf = IsolationForest(contamination=contamination, random_state=42)
    features = data[['Open', 'High', 'Low', 'Close', 'Volume']].values
    anomalies = clf.fit_predict(features)
    anomaly_indices = np.where(anomalies == -1)[0]
    logging.info(f"{len(anomaly_indices)} anomalies detected.")
    return data.iloc[anomaly_indices]

def get_financial_news(symbol):
    """Fetch financial news for a given symbol."""
    url = f"https://newsapi.org/v2/everything?q={symbol}&apiKey={NEWS_API_KEY}&language=en&sortBy=publishedAt&pageSize=5"
    try:
        response = requests.get(url)
        news_data = response.json()
        articles = news_data.get('articles', [])
        logging.info(f"Fetched {len(articles)} news articles for {symbol}.")
        return articles
    except Exception as e:
        logging.error(f"Error fetching news for {symbol}: {e}")
        return []

def analyze_investment(investment):
    """Analyze a single investment."""
    data = fetch_stock_data(investment['Symbol'])
    if data is None:
        return {
            'Investment': investment['Symbol'],
            'Error': 'Unable to fetch data'
        }
    
    volatility, beta = calculate_risk(data)
    anomalies = detect_anomalies(data)
    news = get_financial_news(investment['Symbol'])
    
    return {
        'Investment': investment['Symbol'],
        'Volatility': volatility,
        'Beta': beta,
        'Anomalies': len(anomalies) if anomalies is not None else 0,
        'News': news,
        'CurrentPrice': data['Close'].iloc[-1] if not data.empty else None,
        'PriceChange': data['Close'].pct_change().iloc[-1] if not data.empty else None
    }

def analyze_portfolio(portfolio):
    """Analyze the entire portfolio."""
    return [analyze_investment(investment) for investment in portfolio]

if __name__ == "__main__":
    # Updated portfolio data for Indian stocks
    portfolio_data = [
        {'Symbol': 'RELIANCE.BO', 'Type': 'Stock'},  # Reliance Industries
        {'Symbol': 'TCS.BO', 'Type': 'Stock'},       # Tata Consultancy Services
        {'Symbol': 'HDFCBANK.BO', 'Type': 'Stock'},  # HDFC Bank
        {'Symbol': 'INFY.BO', 'Type': 'Stock'},      # Infosys
    ]
    
    analysis_results = analyze_portfolio(portfolio_data)
    
    for result in analysis_results:
        print(f"\nAnalysis for {result['Investment']}:")
        for key, value in result.items():
            if key != 'News':
                print(f"{key}: {value}")
        print("Recent News:")
        for article in result.get('News', [])[:3]:  # Print top 3 news articles
            print(f"- {article['title']}")