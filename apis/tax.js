const axios = require("axios");

const portfolio = {
  assets: [
    {
      name: "Stock A",
      buy_price: 100,
      current_price: 150,
      buy_date: "2022-01-01",
      type: "stock",
      total_stocks: 10,
    },
    {
      name: "Stock B",
      buy_price: 200,
      current_price: 300,
      buy_date: "2021-03-10",
      type: "stock",
      total_stocks: 5,
    },
    {
      name: "Bond C",
      buy_price: 1000,
      current_price: 1100,
      buy_date: "2020-04-15",
      type: "bond",
      total_stocks: 2,
    },
  ],
};

const past_sales = {
  sales: [
    {
      name: "Stock X",
      buy_price: 100,
      sale_price: 120,
      buy_date: "2020-01-01",
      sale_date: "2021-03-10",
      type: "stock",
    },
    {
      name: "Stock Y",
      buy_price: 300,
      sale_price: 290,
      buy_date: "2020-05-01",
      sale_date: "2022-06-15",
      type: "stock",
    },
  ],
};

async function taxOptimization(portfolio, past_sales) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8004/tax_optimization/",
      {
        portfolio,
        past_sales,
      },
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
taxOptimization(portfolio, past_sales)
  .then((data) => {
    console.log("Tax Optimization Suggestions:", data);
  })
  .catch((error) => {
    console.error("Error in tax optimization:", error);
  });
