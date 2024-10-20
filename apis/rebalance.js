const axios = require("axios");

const portfolio = {
  items: [
    {
      symbol: "TCS",
      type: "stock",
      quantity: 50,
    },
    {
      symbol: "GOLDBEES",
      type: "commodity",
      quantity: 100,
    },
    {
      symbol: "bitcoin",
      type: "crypto",
      quantity: 0.5,
    },
  ],
  risk_factor: 0.7,
};

async function rebalanceAndSuggest(portfolio) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/rebalance_and_suggest/",
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
rebalanceAndSuggest(portfolio)
  .then((data) => {
    console.log("Rebalanced Portfolio:", data);
  })
  .catch((error) => {
    console.error("Error in rebalancing:", error);
  });
