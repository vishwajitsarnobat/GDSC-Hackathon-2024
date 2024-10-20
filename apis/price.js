const yahooFinance = require("yahoo-finance2").default;
const axios = require("axios");

// Function to get the current price of a ticker
async function getCurrentPrice(ticker) {
  try {
    const queryOptions = {
      period1: "2021-02-01",
      period2: new Date(),
      interval: "1d",
    };
    const result = await yahooFinance.historical(ticker, queryOptions);

    if (result.length === 0) {
      throw new Error("No data found");
    }

    const latestQuote = result[result.length - 1];
    return latestQuote.close;
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error);
    return null;
  }
}

// Function to get the current USD to INR conversion rate
async function getConversionRate() {
  try {
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    return response.data.rates.INR;
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    return null;
  }
}

// Function to convert USD to INR
async function convertToINR(usdPrice) {
  const conversionRate = await getConversionRate();
  if (conversionRate === null) {
    return null;
  }
  return usdPrice * conversionRate;
}

function test() {
  getCurrentPrice("RELI").then(async (price) => {
    if (price !== null) {
      const priceInINR = await convertToINR(price);
      if (priceInINR !== null) {
        console.log(`The current price of RELI is ₹${priceInINR.toFixed(2)}`);
      } else {
        console.log("Failed to convert the price to INR.");
      }
    } else {
      console.log("Failed to fetch the price.");
    }
  });
}

test();
