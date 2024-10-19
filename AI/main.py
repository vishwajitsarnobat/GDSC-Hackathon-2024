from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import requests
from bs4 import BeautifulSoup
import logging
from datetime import datetime, timedelta

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

class Portfolio(BaseModel):
    tickets: List[str]

# Helper functions

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

def get_financial_news(symbol):
    """Fetch financial news for a given symbol from Moneycontrol."""
    base_url = "https://www.moneycontrol.com/news/business/stocks/"
    search_term = symbol.split('.')[0].lower()  # Remove '.BO' and convert to lowercase
    
    try:
        response = requests.get(f"{base_url}{search_term}/")
        soup = BeautifulSoup(response.content, 'html.parser')
        news_list = soup.find_all('li', class_='clearfix')
        
        articles = []
        for news in news_list[:5]:  # Get top 5 news articles
            title = news.find('h2').text.strip()
            link = news.find('a')['href']
            # Fetch the full article
            article_response = requests.get(link)
            article_soup = BeautifulSoup(article_response.content, 'html.parser')
            body = article_soup.find('div', class_='content_wrapper arti-flow').text.strip()
            author = article_soup.find('div', class_='article_author').text.strip() if article_soup.find('div', class_='article_author') else "Unknown"
            articles.append({'title': title, 'author': author, 'body': body})
        
        logging.info(f"Fetched {len(articles)} news articles for {symbol}.")
        return articles
    except Exception as e:
        logging.error(f"Error fetching news for {symbol}: {e}")
        return []

def calculate_risk_metrics(data):
    """Calculate various risk metrics for a stock."""
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
    """Calculate beta against the market (Nifty 50)."""
    if market_returns is None:
        try:
            market_data = yf.download('^NSEI', start=returns.index[0], end=returns.index[-1])
            market_returns = market_data['Adj Close'].pct_change().dropna()
        except Exception as e:
            logging.error(f"Error fetching market data: {e}")
            return None

    common_dates = returns.index.intersection(market_returns.index)
    if len(common_dates) < 30:  # Require at least 30 data points
        return None

    stock_returns = returns.loc[common_dates]
    market_returns = market_returns.loc[common_dates]

    covariance = np.cov(stock_returns, market_returns)[0][1]
    market_variance = np.var(market_returns)
    return covariance / market_variance

def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    """Calculate Sharpe ratio."""
    excess_returns = returns - risk_free_rate / 252  # Assuming 252 trading days
    return np.sqrt(252) * excess_returns.mean() / returns.std()

# Endpoint functions

@app.post("/getNews/")
async def get_news(portfolio: Portfolio):
    """Receive portfolio (tickets) and return latest relevant news."""
    all_news = []
    for symbol in portfolio.tickets:
        news = get_financial_news(symbol)
        all_news.extend([{
            "symbol": symbol,
            "title": article['title'],
            "author": article['author'],
            "body": article['body']
        } for article in news])
    return all_news

@app.post("/getRiskyStocks/")
async def get_risky_stocks(portfolio: Portfolio):
    """Receive portfolio (tickets) and return risky stocks."""
    risky_stocks = []
    for symbol in portfolio.tickets:
        data = fetch_stock_data(symbol)
        if data is not None:
            risk_metrics = calculate_risk_metrics(data)
            if risk_metrics:
                # Define a simple risk threshold (you may want to adjust this)
                if risk_metrics['volatility'] > 0.3 or risk_metrics['beta'] > 1.5:
                    risky_stocks.append({
                        "symbol": symbol,
                        "volatility": risk_metrics['volatility'],
                        "beta": risk_metrics['beta'],
                        "sharpe_ratio": risk_metrics['sharpe_ratio']
                    })
    return risky_stocks

@app.post("/getCategoryStocks/")
async def get_category_stocks(portfolio: Portfolio):
    """Receive portfolio (tickets) and return categorised portfolio."""
    categories = {
        "Large Cap": [],
        "Mid Cap": [],
        "Small Cap": [],
        "High Growth": [],
        "Value": [],
        "Dividend": []
    }
    
    for symbol in portfolio.tickets:
        data = fetch_stock_data(symbol)
        if data is not None:
            market_cap = data['Close'].iloc[-1] * data['Volume'].iloc[-1]
            pe_ratio = data['Close'].iloc[-1] / (data['Close'].pct_change().mean() * 252)
            dividend_yield = (data['Close'].pct_change().mean() * 252) / data['Close'].iloc[-1]
            
            # Categorize based on market cap
            if market_cap > 200000000000:  # 20,000 crores
                categories["Large Cap"].append(symbol)
            elif market_cap > 50000000000:  # 5,000 crores
                categories["Mid Cap"].append(symbol)
            else:
                categories["Small Cap"].append(symbol)
            
            # Categorize based on growth and value
            if pe_ratio < 15:
                categories["Value"].append(symbol)
            elif data['Close'].pct_change().mean() * 252 > 0.25:  # 25% annual growth
                categories["High Growth"].append(symbol)
            
            # Categorize based on dividend yield
            if dividend_yield > 0.03:  # 3% dividend yield
                categories["Dividend"].append(symbol)
    
    return categories

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)