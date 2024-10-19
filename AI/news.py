from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import requests
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

class Portfolio(BaseModel):
    tickets: List[str]

def get_financial_news(symbol):
    """Fetch financial news for a given symbol from Moneycontrol."""
    base_url = "https://www.moneycontrol.com/news/business/stocks/"
    search_term = symbol.split('.')[0].lower()  # Remove '.BO' and convert to lowercase
    
    try:
        response = requests.get(f"{base_url}{search_term}/") # search on website
        soup = BeautifulSoup(response.content, 'html.parser') # parse
        news_list = soup.find_all('li', class_='clearfix') # get relevant info
        
        articles = []
        for news in news_list[:5]:  # Get top 5 news articles
            title = news.find('h2').text.strip() # get headline
            link = news.find('a')['href'] # get url
            # Fetch the full article
            article_response = requests.get(link) # fetch content from link
            article_soup = BeautifulSoup(article_response.content, 'html.parser') # parse
            body = article_soup.find('div', class_='content_wrapper arti-flow').text.strip() 
            author = article_soup.find('div', class_='article_author').text.strip() if article_soup.find('div', class_='article_author') else "Unknown"
            articles.append({'title': title, 'author': author, 'body': body})
        
        logging.info(f"Fetched {len(articles)} news articles for {symbol}.")
        return articles
    except Exception as e:
        logging.error(f"Error fetching news for {symbol}: {e}")
        return []

# api part
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)