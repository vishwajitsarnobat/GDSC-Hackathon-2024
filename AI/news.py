from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import requests
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

class Portfolio(BaseModel):
    tickets: List[str]

# Hugging Face API settings
API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct"
API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")

# Check if API token is loaded correctly
if not API_TOKEN:
    logging.error("Hugging Face API token not found!")
    raise Exception("Hugging Face API token not set in environment variables.")

headers = {"Authorization": f"Bearer {API_TOKEN}"}

def query_huggingface_api(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    # Log the full response for debugging
    logging.info(f"Hugging Face API response: {response.status_code}, {response.text}")
    return response.json()

def generate_financial_news(symbol):
    """Generate financial news for a given symbol using Hugging Face Inference API."""
    prompt = f"Generate a brief financial news summary for the Indian company with stock symbol {symbol}. Include recent performance, any major events, and future outlook."
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 150,
            "temperature": 0.7,
            "top_k": 50,
            "top_p": 0.95,
        }
    }
    
    try:
        response = query_huggingface_api(payload)
        
        if isinstance(response, list) and len(response) > 0 and 'generated_text' in response[0]:
            generated_text = response[0]['generated_text']
            # Remove the prompt from the generated text if needed
            news_summary = generated_text[len(prompt):].strip()
        else:
            news_summary = "Failed to generate summary"
        
        logging.info(f"Generated news summary for {symbol}")
        
        return {
            "symbol": symbol,
            "summary": news_summary
        }
    except Exception as e:
        logging.error(f"Error generating news for {symbol}: {str(e)}")
        return {
            "symbol": symbol,
            "summary": "Error generating news summary"
        }

@app.post("/getNews/")
async def get_news(portfolio: Portfolio):
    """Receive portfolio (tickets) and return generated news summaries."""
    all_news = []
    for symbol in portfolio.tickets:
        news = generate_financial_news(symbol)
        all_news.append(news)
    
    if not all_news:
        raise HTTPException(status_code=404, detail="Failed to generate news for the given portfolio")
    
    return all_news

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)