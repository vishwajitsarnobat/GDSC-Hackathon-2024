---

# AI-Driven Financial Risk Management and Personal Finance Assistant

## Team Details  
**Team Abhimanyu**  
- **Team Leader**: Vishwajit Sarnobat (Github username: vishwajitsarnobat)
- **Team Members**:  
  - Nikhil Vishwakarma  (Github username: Vishwakarma-Nikhil)
  - Vinayak Yadav  (Github username: vinayakyadav2709)
  - Yateen Vaviya  (Github username: Yateen00)
All team members are from Sardar Patel Institute of Technology.

## Project Abstract  
Our project provides a comprehensive AI-driven financial risk management and personal finance assistant. Key features include:

- **Personalized Dashboard**: Displays a complete portfolio overview.
- **AI Summarizer**: Summarizes expenses, investments, profits, and goals.
- **Portfolio Analyzer & Rebalancer**: Balances the portfolio across stocks, bonds, ETFs, crypto, and commodities based on the user’s risk appetite, with personalized recommendations for optimization.
- **Tax Analyzer**: Suggests tax-saving strategies for complex investment portfolios involving stocks, bonds, and crypto.

### Additional Features:
- **Financial Summary**: Provides detailed insights into spending and investment performance.
- **Budget Management**: Tracks budgets and identifies potential savings.
- **Investment Tracking & Goal Setting**: Monitors asset performance and helps users achieve financial goals.
- **Risk Analysis**: Continuously evaluates market risk and suggests adjustments to manage volatility.

## Domain and Tools Used  
This project integrates various technologies:

- **Frontend**:  
  - React Native Expo for building the mobile app.  
  - React Native Paper for UI components.
- **Backend**:  
  - Python, FastAPI to handle backend operations, including financial data and AI-driven analysis.
- **Database & Authentication**: Firebase for real-time data management and user authentication.
- **APIs**:  
  - Yahoo Finance for live financial data.  
  - News API for relevant financial news.  
  - GROQ API for LLM-powered insights.
- **Machine Learning**: TensorFlow and Scikit-learn for implementing AI models.

## How It Works  
The app interacts with FastAPI to handle backend processes and provide real-time financial data, analysis, and insights. Once everything is set up, all features, including financial summaries, portfolio management, and risk assessments, are fully accessible within the mobile app.

## Guide for Using Expo

### Prerequisites  
- Ensure you have **Node.js** installed.  
- Install the **Expo CLI** globally using npm:
  ```bash
  npm install -g expo-cli
  ```

### Running the App  
1. Clone the repository.
2. Navigate to the app's directory.
3. Install the necessary dependencies using npm:
   ```bash
   npm install
   ```
4. Start the Expo development server:
   ```bash
   expo start
   ```
5. You can now use the Expo app on your mobile device (iOS or Android) or an emulator to view and interact with the application.

### Additional Expo Commands  
- To build the app for deployment:
  ```bash
  expo build
  ```
- To run the app on an emulator:
  ```bash
  expo start --ios   # for iOS
  expo start --android  # for Android
  ```

## Backend Setup with FastAPI  
The application makes calls to the backend via FastAPI, which handles tasks such as financial data processing, AI-driven analysis, and interactions with external APIs (Yahoo Finance, News API). To run the FastAPI server:

1. Install the dependencies from the `requirements.txt` file:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
3. Once the FastAPI server is running, the mobile app will automatically communicate with it, and all features like financial summaries, portfolio recommendations, and risk analysis will be available directly in the app.

## Getting Started  
1. Set up the backend and run the FastAPI server as mentioned above.
2. Run the Expo app using the steps outlined in the "Guide for Using Expo."
3. After setup, everything will be available within the app, which will handle communication with the FastAPI backend for real-time data and insights.

---
