import axios from 'axios';

// Define an async function to send the POST request
async function getStockNews(stockNames) {
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/get_stock_news',
      {
        'stock_names': stockNames // Pass the stock names dynamically
      },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    // Return the response data, or whatever part of it you need
    return response.data;
  } catch (error) {
    console.error('Error fetching stock news:', error);
    throw error; // Throw the error to handle it in calling functions
  }
}

// Export the function for use in other modules
export { getStockNews };