import pandas as pd
from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import logging
from datetime import datetime, timedelta
from groq import Groq
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import requests
import os
from dotenv import load_dotenv
import logging
import aiohttp

# Load environment variables
load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
try:
    nltk.download("vader_lexicon")
except Exception as e:
    logging.error(f"Error downloading vader_lexicon: {e}")
app = FastAPI()


class Portfolio(BaseModel):
    portfolio_json: List[str]


# Function to get sentiment using VADER model
def get_sentiment_vader(news):
    analyzer = SentimentIntensityAnalyzer()
    scores = news["Headline"].apply(analyzer.polarity_scores).tolist()
    df_scores = pd.DataFrame(scores)
    news = news.join(df_scores, rsuffix="_right")

    # Normalize compound score to range [0, 1]
    news["normalized_score"] = (1 - news["compound"]) / 2

    # View Data
    news["Date"] = pd.to_datetime(news.Date).dt.date

    unique_ticker = news["Ticker"].unique().tolist()
    news_dict = {name: news.loc[news["Ticker"] == name] for name in unique_ticker}

    # Calculate current sentiment for each ticker and print headlines
    current_sentiments = {}
    for ticker in unique_ticker:
        dataframe = news_dict[ticker]
        dataframe = dataframe.set_index("Ticker")
        dataframe = dataframe.sort_values(by=["Date", "Time"], ascending=False)
        most_recent_date = dataframe["Date"].max()
        recent_data = dataframe[dataframe["Date"] == most_recent_date]
        current_sentiment = recent_data["normalized_score"].mean()
        current_sentiments[ticker] = current_sentiment

        # Print current sentiment and headlines
        print(f"Current sentiment for {ticker}: {current_sentiment:.2f}")
        print("Recent headlines:")
        for headline in recent_data["Headline"]:
            print(f"- {headline}")
        print("\n")

    return current_sentiments


# Asynchronous function to fetch news data
async def fetch_news_data(tickers):
    finwiz_url = "https://finviz.com/quote.ashx?t="
    news_tables = {}

    async with aiohttp.ClientSession() as session:
        for ticker in tickers:
            url = finwiz_url + ticker
            try:
                async with session.get(
                    url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
                    },
                ) as resp:
                    html = BeautifulSoup(await resp.text(), features="lxml")
                    news_table = html.find(id="news-table")
                    news_tables[ticker] = news_table
            except Exception as e:
                logging.error(f"Error fetching data for {ticker}: {e}")

    parsed_news = []

    for file_name, news_table in news_tables.items():
        for row in news_table.findAll("tr")[:5]:  # Only take the top 5 articles
            headline = row.a.get_text()
            link = row.a["href"]
            date_scrape = row.td.text.split()

            if len(date_scrape) == 1:
                time = date_scrape[0]
                date = datetime.now().date()
            else:
                date = date_scrape[0]
                time = date_scrape[1]

            if date == "Today":
                date = datetime.now().date()
            elif date == "Yesterday":
                date = datetime.now().date() - timedelta(1)
            else:
                date = pd.to_datetime(date).date()

            ticker = file_name.split("_")[0]
            parsed_news.append([ticker, date, time, headline, link])

    columns = ["Ticker", "Date", "Time", "Headline", "Link"]
    news = pd.DataFrame(parsed_news, columns=columns)
    return news


# Asynchronous function to get summary using LLaMA model
async def get_summary_llama(prompt=""):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logging.error("GROQ_API_KEY is not set in the environment variables.")
        return None

    # Debugging: Print the API key
    logging.info(f"Using GROQ_API_KEY: {api_key}")

    client = Groq(api_key=api_key)
    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                    + ". Provide a 2-3 line summary of this article. dont write amything else. not even here is the information you requested.",
                }
            ],
            temperature=1,
            max_tokens=8192,
            top_p=1,
            stream=False,
            stop=None,
        )

        # Extract the response content
        response_content = completion.choices[0].message.content

        return response_content.strip()

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return None


# Asynchronous function to fetch article content
async def fetch_article_content(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
                },
            ) as resp:
                html = BeautifulSoup(await resp.text(), features="lxml")
                paragraphs = html.find_all("p")
                content = " ".join([para.get_text() for para in paragraphs])
                return content
    except Exception as e:
        logging.error(f"Error fetching article content from {url}: {e}")
        return None


async def generate_financial_news(tickers):
    """Generate financial news for a given symbol using LLAMA API."""
    output = {}

    for ticker in tickers:
        news = await fetch_news_data([ticker])
        articles = []
        for index, row in news.iterrows():
            if index >= 2:  # limit to 2
                break
            article_content = await fetch_article_content(row["Link"])
            if article_content:
                summary = await get_summary_llama(article_content)
                if summary:
                    article = {
                        "headline": row["Headline"],
                        "author": "Unknown",
                        "site": row["Link"],
                        "summary": summary,
                    }
                    articles.append(article)
        output[ticker] = articles

    return json.dumps(output, indent=4)


async def test():
    tickers = ["TCS", "RELI"]
    news = await fetch_news_data(tickers)

    print("Processing with VADER sentiment model:")
    vader_sentiments = get_sentiment_vader(news)
    print("VADER Sentiments:", vader_sentiments)

    # Example usage of getting top articles JSON
    output = await generate_financial_news(tickers)
    print("VADER Sentiments:", vader_sentiments)
    print("Top Articles JSON:", output)


@app.post("/getNews/")
async def get_news(portfolio: Portfolio):
    """Receive portfolio (tickers) and return generated news summaries."""
    return await generate_financial_news(portfolio.portfolio_json)


@app.post("/getSentiment/")
async def get_sentiment(portfolio: Portfolio):
    """Receive portfolio (tickers) and return sentiment analysis."""
    news = await fetch_news_data(portfolio.portfolio_json)
    return get_sentiment_vader(news)


if __name__ == "__main__":
    import uvicorn
    # import asyncio

    # # Run the test
    # asyncio.run(test())
    uvicorn.run(app, host="0.0.0.0", port=8000)
