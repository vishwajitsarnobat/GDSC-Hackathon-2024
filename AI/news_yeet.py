import pandas as pd
from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import logging
from datetime import datetime, timedelta

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Download the vader_lexicon
try:
    nltk.download("vader_lexicon")
except Exception as e:
    logging.error(f"Error downloading vader_lexicon: {e}")


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


# Function to fetch news data
def fetch_news_data(tickers):
    finwiz_url = "https://finviz.com/quote.ashx?t="
    news_tables = {}

    for ticker in tickers:
        url = finwiz_url + ticker
        try:
            req = Request(
                url=url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
                },
            )
            resp = urlopen(req)
            html = BeautifulSoup(resp, features="lxml")
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


# 0=positive. 1=negative. 0.5=neutral


# Main function to process news data and get summaries
def main():
    tickers = ["TCS", "HDB", "RELI"]
    news = fetch_news_data(tickers)

    print("Processing with VADER sentiment model:")
    vader_sentiments = get_sentiment_vader(news)
    print("VADER Sentiments:", vader_sentiments)


# Run the main function
if __name__ == "__main__":
    main()
