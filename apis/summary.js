const axios = require("axios");

const promptData = {
  prompt: JSON.stringify([
    {
      expenses: {
        rent: 1000,
        groceries: 200,
        utilities: 150,
        car: 200,
      },
      savings: 1000,
      stock_sold: 2000,
      stock_bought: 3000,
      income: 5000,
      time_frame: "monthly",
      start_date: "2022-01-01",
      end_date: "2022-01-31",
    },
    {
      expenses: {
        rent: 1200,
        groceries: 250,
        utilities: 200,
        car: 250,
      },
      savings: 1200,
      stock_sold: 2500,
      stock_bought: 3500,
      income: 5500,
      time_frame: "monthly",
      start_date: "2022-02-01",
      end_date: "2022-02-28",
    },
  ]),
};

async function processPrompt(promptData) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/processPrompt/",
      promptData,
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
processPrompt(promptData)
  .then((data) => {
    console.log("Summary JSON:", data);
  })
  .catch((error) => {
    console.error("Error in processing prompt:", error);
  });
