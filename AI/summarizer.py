from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json
import time
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()


async def get_summary(prompt=""):
    api_key = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=api_key)
    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                    + ". Given this data, provide a short summary, insights, and recommendations that will help me make better financial decisions. Focus only on the important points and provide the output in JSON format, section-wise, with each point in an array.",
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

        return response_content

    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def print_json_keys_values(json_data):
    if isinstance(json_data, dict):
        for key, value in json_data.items():
            print(f"Key: {key}, Value: {value}")
    elif isinstance(json_data, list):
        for item in json_data:
            print_json_keys_values(item)


def convert_to_json(summary_str):
    summary_json = {}
    current_key = None
    current_array = []

    for line in summary_str.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("{") or line.startswith("}"):
            continue
        elif line.endswith(": ["):
            current_key = line[:-3].strip().strip('"')
            current_array = []
        elif line == "]":
            summary_json[current_key] = current_array
            current_key = None
            current_array = []
        elif current_key:
            current_array.append(line.strip('"').strip(",").strip('"'))
    return summary_json


async def process_prompt(prompt):
    summary = None
    summary_json = None
    while not summary_json:
        summary = await get_summary(prompt)
        if not summary:
            print("Empty response, retrying...")
            time.sleep(1)  # Wait for a second before retrying
        summary_json = convert_to_json(summary)
        if summary_json:
            print("Converted JSON:", json.dumps(summary_json, indent=2))
        else:
            print("Failed to convert summary to JSON.")

    print("Summary:", summary)
    return summary_json


class PromptRequest(BaseModel):
    prompt: str


@app.post("/processPrompt/")
async def summarize(request: PromptRequest):
    summary_json = await process_prompt(request.prompt)
    if summary_json:
        return summary_json
    else:
        raise HTTPException(status_code=500, detail="Failed to process prompt")


# Test function
async def test_process_prompt():
    sample_json = {
        "expenses": {
            "rent": 1000,
            "groceries": 200,
            "utilities": 150,
            "car": 200,
        },
        "savings": 1000,
        "stock_sold": 2000,
        "stock_bought": 3000,
        "income": 5000,
        "time_frame": "monthly",
        "start_date": "2022-01-01",
        "end_date": "2022-01-31",
    }
    sample_json2 = {
        "expenses": {
            "rent": 1200,
            "groceries": 250,
            "utilities": 200,
            "car": 250,
        },
        "savings": 1200,
        "stock_sold": 2500,
        "stock_bought": 3500,
        "income": 5500,
        "time_frame": "monthly",
        "start_date": "2022-02-01",
        "end_date": "2022-02-28",
    }
    prompt = json.dumps([sample_json, sample_json2])
    summary_json = await process_prompt(prompt)
    print("Test Summary JSON:", summary_json)


if __name__ == "__main__":
    import uvicorn
    # import asyncio

    # Run the test
    # asyncio.run(test_process_prompt())

    # Run the FastAPI app
    uvicorn.run(app, host="0.0.0.0", port=8000)
