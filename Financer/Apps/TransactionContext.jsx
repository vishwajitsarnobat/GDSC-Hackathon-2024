import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getFirestore,
} from "firebase/firestore";
import { app } from "../firebaseConfig"; // Adjust the import according to your file structure
import { useUser } from "@clerk/clerk-expo";

const TransactionContext = createContext();

export const useTransactions = () => {
  return useContext(TransactionContext);
};

export const TransactionProvider = ({ children }) => {
  const db = getFirestore(app);
  const { user } = useUser();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const fetchTransactions = async () => {
    const transactionsCollection = collection(db, "Transactions");
    const querySnapshot = await getDocs(transactionsCollection);

    let incomeSum = 0;
    let expenseSum = 0;
    const transactions = [];
    const categoryTotals = {
      Food: 0,
      Rent: 0,
      Salary: 0,
      Entertainment: 0,
      Travel: 0,
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.useremail === user.primaryEmailAddress?.emailAddress) {
        transactions.push(data);

        const amount = parseFloat(data.amount);
        if (!isNaN(amount)) {
          if (data.type === "income") {
            incomeSum += amount;
          } else if (data.type === "expense") {
            expenseSum += amount;

            // Summing up category expenses
            if (categoryTotals[data.category] !== undefined) {
              categoryTotals[data.category] += amount;
            }
          }
        }
      }
    });

    setTotalIncome(incomeSum);
    setTotalExpense(expenseSum);
    setRecentTransactions(
      transactions.sort((a, b) => b.timestamp - a.timestamp)
    );

    // Prepare category data for pie chart
    const pieData = Object.keys(categoryTotals).map((category) => ({
      name: category,
      amount: categoryTotals[category],
      color: getRandomColor(),
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    }));

    setCategoryData(pieData);
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const addTransaction = async (transactionData) => {
    const title = `${user.primaryEmailAddress?.emailAddress}${
      transactionData.transactionTitle
    }${Date.now()}`;

    try {
      await setDoc(doc(db, "Transactions", title), transactionData);
      console.log("Document uploaded");

      fetchTransactions(); // Refresh transactions after adding
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        totalIncome,
        totalExpense,
        recentTransactions,
        categoryData,
        addTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
