// MonthlyStats.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { app } from "../../../firebaseConfig";
import { useUser } from "@clerk/clerk-expo";

const MonthlyStats = () => {
  const db = getFirestore(app);
  const { user } = useUser();
  const [data, setData] = useState({
    income: [],
    expenses: [],
    totalBalance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Check if user is available
      if (!user || !user.primaryEmailAddress) return;

      const transactionsCollection = collection(db, "Transactions");
      const querySnapshot = await getDocs(transactionsCollection);

      let incomeSum = 0;
      let expenseSum = 0;
      const incomeData = [];
      const expenseData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.useremail === user.primaryEmailAddress.emailAddress) {
          const amount = parseFloat(data.amount);
          if (!isNaN(amount)) {
            if (data.type === "income") {
              incomeSum += amount;
              incomeData.push(amount);
            } else if (data.type === "expense") {
              expenseSum += amount;
              expenseData.push(amount);
            }
          } else {
            console.warn(
              `Invalid amount for transaction ID ${doc.id}: ${data.amount}`
            );
          }
        }
      });

      setData({
        income: incomeData,
        expenses: expenseData,
        totalBalance: incomeSum - expenseSum,
      });
    };

    fetchData();
  }, [user]); // Add user as a dependency

  const labels = Array.from(
    { length: Math.max(data.income.length, data.expenses.length) },
    (_, i) => (i + 1).toString()
  );

  // Check if there is no data to display
  if (data.income.length === 0 && data.expenses.length === 0) {
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsHeader}>This Month</Text>
        <Text>No data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsHeader}>This Month</Text>

      {/* Total Balance Card */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Total Balance</Text>
        <Text style={styles.cardAmount}>₹{data.totalBalance.toFixed(2)}</Text>
        <View style={styles.incomeExpenseContainer}>
          <Text style={styles.incomeText}>
            Income: ₹
            {data.income.reduce((acc, curr) => acc + curr, 0).toFixed(2)}
          </Text>
          <Text style={styles.expenseText}>
            Expense: ₹
            {data.expenses.reduce((acc, curr) => acc + curr, 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Line Graph */}
      <View style={{ alignItems: "center" }}>
        <Text style={styles.graphHeader}>Income and Expenses Over Time</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data.income,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green for income
                strokeWidth: 2,
              },
              {
                data: data.expenses,
                color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, // Red for expenses
                strokeWidth: 2,
              },
            ],
          }}
          width={320} // from react-native
          height={220}
          yAxisLabel="₹"
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#e26a00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5, // For Android shadow
  },
  statsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3, // For Android shadow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50", // Green color for balance
    marginBottom: 10,
  },
  incomeExpenseContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  incomeText: {
    color: "#4CAF50", // Green for income
    fontSize: 16,
  },
  expenseText: {
    color: "#F44336", // Red for expenses
    fontSize: 16,
  },
  graphHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default MonthlyStats;
