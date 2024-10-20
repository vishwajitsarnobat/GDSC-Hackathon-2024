const axios = require("axios");

const portfolio = {
  portfolio_json: ["AAPL", "GOOGL", "MSFT"],
};

async function getNews(portfolio) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/getNews/",
      portfolio,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function getSentiment(portfolio) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/getSentiment/",
      portfolio,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// Example usage
getNews(portfolio)
  .then((data) => {
    console.log("News Data:", data);
  })
  .catch((error) => {
    console.error("Error in getting news data:", error);
  });

getSentiment(portfolio)
  .then((data) => {
    console.log("Sentiment Data:", data);
  })
  .catch((error) => {
    console.error("Error in getting sentiment data:", error);
  });
