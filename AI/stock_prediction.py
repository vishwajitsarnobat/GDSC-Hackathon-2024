import os
import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score
import tensorflow as tf
import logging

# Set Matplotlib backend to Agg
matplotlib.use("Agg")
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
# List of Nifty 50 stock symbols
nifty_50_symbols = [
    "BHARTIARTL.NS",
    "LTIM.NS",
    "HDFCLIFE.NS",
    "NTPC.NS",
    "MARUTI.NS",
    "NESTLEIND.NS",
    "BAJFINANCE.NS",
    "KOTAKBANK.NS",
    "TATASTEEL.NS",
    "ONGC.NS",
    "BAJAJ-AUTO.NS",
    "LT.NS",
    "ITC.NS",
    "TCS.NS",
    "BRITANNIA.NS",
    "SHRIRAMFIN.NS",
    "ADANIENT.NS",
    "CIPLA.NS",
    "WIPRO.NS",
    "INDUSINDBK.NS",
    "ULTRACEMCO.NS",
    "TATACONSUM.NS",
    "BAJAJFINSV.NS",
    "RELIANCE.NS",
    "HEROMOTOCO.NS",
    "COALINDIA.NS",
    "TITAN.NS",
    "HINDALCO.NS",
    "APOLLOHOSP.NS",
]


# Function to fetch stock data
def fetch_stock_data(symbol, period="5y"):
    stock = yf.Ticker(symbol)
    df = stock.history(period=period)
    return df


# Function to prepare the data for LSTM
def prepare_data(data, time_step=1):
    X, y = [], []
    for i in range(len(data) - time_step - 1):
        X.append(data[i : (i + time_step), 0])
        y.append(data[i + time_step, 0])
    return np.array(X), np.array(y)


# Function to save data
def save_data(X_train, X_test, y_train, y_test, scaled_data, folder):
    np.save(os.path.join(folder, "X_train.npy"), X_train)
    np.save(os.path.join(folder, "X_test.npy"), X_test)
    np.save(os.path.join(folder, "y_train.npy"), y_train)
    np.save(os.path.join(folder, "y_test.npy"), y_test)
    np.save(os.path.join(folder, "scaled_data.npy"), scaled_data)


# Function to load data
def load_data(folder):
    try:
        X_train = np.load(os.path.join(folder, "X_train.npy"))
        X_test = np.load(os.path.join(folder, "X_test.npy"))
        y_train = np.load(os.path.join(folder, "y_train.npy"))
        y_test = np.load(os.path.join(folder, "y_test.npy"))
        scaled_data = np.load(os.path.join(folder, "scaled_data.npy"))
        return X_train, X_test, y_train, y_test, scaled_data
    except FileNotFoundError:
        return None, None, None, None, None


# Function to save model
def save_model(model, filename):
    model.save(filename)


# Function to load model
def load_model(filename):
    return tf.keras.models.load_model(filename)


# Function to calculate risk metrics
def calculate_risk_metrics(data):
    """Calculate various risk metrics for a stock."""
    if data is None or data.empty:
        return None

    returns = data["Close"].pct_change().dropna()
    volatility = returns.std() * np.sqrt(252)
    beta = calculate_beta(returns)
    sharpe_ratio = calculate_sharpe_ratio(returns)

    return {"volatility": volatility, "beta": beta, "sharpe_ratio": sharpe_ratio}


def calculate_beta(returns, market_returns=None):
    """Calculate beta against the market (Nifty 50)."""
    if market_returns is None:
        try:
            market_data = yf.download(
                "^NSEI", start=returns.index[0], end=returns.index[-1]
            )
            market_returns = market_data["Adj Close"].pct_change().dropna()
        except Exception as e:
            logging.error(f"Error fetching market data: {e}")
            return None

    common_dates = returns.index.intersection(market_returns.index)
    if len(common_dates) < 30:  # Require at least 30 data points
        return None

    stock_returns = returns.loc[common_dates]
    market_returns = market_returns.loc[common_dates]

    covariance = np.cov(stock_returns, market_returns)[0][1]
    market_variance = np.var(market_returns)
    return covariance / market_variance


def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    """Calculate Sharpe ratio."""
    excess_returns = returns - risk_free_rate / 252  # Assuming 252 trading days
    return np.sqrt(252) * excess_returns.mean() / returns.std()


# Function to predict stock price
def predict_stock_price(symbol, future_days, time_step=60):
    period = "5y"
    folder = f"{symbol}_{period}"
    os.makedirs(folder, exist_ok=True)
    model_filename = os.path.join(folder, "model.keras")

    # Check if model and data exist
    X_train, X_test, y_train, y_test, scaled_data = load_data(folder)
    if os.path.exists(model_filename) and X_train is not None:
        model = load_model(model_filename)
    else:
        # Fetch and process data
        df = fetch_stock_data(symbol, period)
        data = df["Close"].values.reshape(-1, 1)
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)

        # Prepare training and test data
        X, y = prepare_data(scaled_data, time_step)

        # Split data into training and testing sets
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]

        # Reshape input to be [samples, time steps, features]
        X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
        X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

        # Save the data
        save_data(X_train, X_test, y_train, y_test, scaled_data, folder)

        # Build the improved LSTM model
        model = tf.keras.Sequential()
        model.add(tf.keras.Input(shape=(X_train.shape[1], 1)))
        model.add(
            tf.keras.layers.Bidirectional(
                tf.keras.layers.LSTM(64, return_sequences=True)
            )
        )
        model.add(tf.keras.layers.Dropout(0.3))
        model.add(
            tf.keras.layers.Bidirectional(
                tf.keras.layers.LSTM(64, return_sequences=True)
            )
        )
        model.add(tf.keras.layers.Dropout(0.3))
        model.add(tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64)))
        model.add(tf.keras.layers.Dropout(0.3))
        model.add(tf.keras.layers.Dense(1))  # Output layer

        model.compile(optimizer="adam", loss="mean_squared_error")

        # Train the model
        model.fit(X_train, y_train, epochs=100, batch_size=32, validation_split=0.2)

        # Save the model
        save_model(model, model_filename)

    # Make predictions for the future
    last_sequence = scaled_data[-time_step:]
    future_predictions = []

    for _ in range(future_days):
        last_sequence = last_sequence.reshape((1, time_step, 1))
        next_prediction = model.predict(last_sequence)
        future_predictions.append(next_prediction[0, 0])
        last_sequence = np.append(
            last_sequence[:, 1:, :], next_prediction.reshape(1, 1, 1), axis=1
        )

    # Inverse transform the predictions
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaler.fit_transform(
        fetch_stock_data(symbol, period)["Close"].values.reshape(-1, 1)
    )
    future_predictions = scaler.inverse_transform(
        np.array(future_predictions).reshape(-1, 1)
    )

    # Calculate the risk factor (mean squared error) on the test set
    predictions = model.predict(X_test)
    predictions = scaler.inverse_transform(predictions)
    y_test = scaler.inverse_transform(y_test.reshape(-1, 1))
    risk_factor = mean_squared_error(y_test, predictions)

    # Normalize the risk factor to get a confidence percentage
    max_possible_error = np.max(y_test) - np.min(y_test)
    confidence_percentage = (1 - (risk_factor / max_possible_error)) * 100
    confidence_percentage = max(
        0, min(confidence_percentage, 100)
    )  # Ensure it's between 0 and 100

    # Calculate the accuracy (R^2 score)
    accuracy = r2_score(y_test, predictions) * 100

    # Calculate risk metrics
    risk_metrics = calculate_risk_metrics(df)

    # Display the predicted price
    predicted_price = future_predictions[-1][0]

    # Plot the results
    plt.figure(figsize=(14, 5))
    plt.plot(y_test, label="Actual Price")
    plt.plot(predictions, label="Predicted Price")
    plt.xlabel("Time")
    plt.ylabel("Price")
    plt.title(f"{symbol} Stock Price Prediction")
    plt.legend()
    plt.savefig(os.path.join(folder, "stock_price_prediction.png"))

    return predicted_price, accuracy, confidence_percentage, risk_metrics


# Function to get predictions for all Nifty 50 stocks
def get_nifty_50_predictions(future_days):
    predictions = []
    for symbol in nifty_50_symbols:
        predicted_price, accuracy, confidence_percentage, risk_metrics = (
            predict_stock_price(symbol, future_days)
        )
        predictions.append(
            {
                "symbol": symbol,
                "predicted_price": predicted_price,
                "accuracy": accuracy,
                "confidence_percentage": confidence_percentage,
                "volatility": risk_metrics["volatility"],
                "beta": risk_metrics["beta"],
                "sharpe_ratio": risk_metrics["sharpe_ratio"],
            }
        )
    return predictions


# Function to recommend top 10 stocks based on risk category
def recommend_stocks(future_days, risk_category):
    predictions = get_nifty_50_predictions(future_days)
    predictions.sort(key=lambda x: x["predicted_price"], reverse=True)

    risk_thresholds = {
        "low": 0.02,  # Low volatility
        "moderate": 0.05,  # Moderate volatility
        "high": 1.0,  # High volatility (includes all stocks)
    }

    recommended_stocks = []
    for prediction in predictions:
        if prediction["volatility"] <= risk_thresholds[risk_category]:
            recommended_stocks.append(prediction)
        if len(recommended_stocks) >= 10:
            break

    return recommended_stocks


if __name__ == "__main__":
    # Example usage
    future_days = 30
    risk_category = "moderate"
    recommended_stocks = recommend_stocks(future_days, risk_category)
    for stock in recommended_stocks:
        print(
            f"Symbol: {stock['symbol']}, Predicted Price: {stock['predicted_price']}, Accuracy: {stock['accuracy']:.2f}%, Confidence: {stock['confidence_percentage']:.2f}%, Volatility: {stock['volatility']:.4f}, Beta: {stock['beta']:.4f}, Sharpe Ratio: {stock['sharpe_ratio']:.4f}"
        )
