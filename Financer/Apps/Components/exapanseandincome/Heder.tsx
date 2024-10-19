import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Header = ({ totalIncome, totalExpense, balance }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Expenses & Budget</Text>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total Income: ₹{totalIncome.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          Total Expenses: ₹{totalExpense.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>Balance: ₹{balance.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    color: "#444",
  },
});

export default Header;
