const yahooFinance = require("yahoo-finance2").default;

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

function test() {
  getCurrentPrice("RELI").then((price) => {
    if (price !== null) {
      console.log(`The current price of RELI is $${price}`);
    } else {
      console.log("Failed to fetch the price.");
    }
  });
}

test();
