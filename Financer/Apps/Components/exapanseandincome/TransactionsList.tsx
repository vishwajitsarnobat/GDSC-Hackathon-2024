import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons"; // Make sure to install expo/vector-icons

const TransactionsList = ({ recentTransactions, fetchTransactions }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <View style={styles.transactionsContainer}>
      <Text style={styles.sectionHeader}>Recent Transactions</Text>
      {recentTransactions
        .slice(0, showMore ? recentTransactions.length : 5)
        .map((transaction, index) => (
          <View key={index} style={styles.transactionCard}>
            <Text style={styles.transactionTitle}>
              {transaction.transactionTitle}
            </Text>
            <Text style={styles.transactionCategory}>
              Category: {transaction.category}
            </Text>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionAmount}>
                {transaction.type === "income" ? "+" : "-"} ₹
                {transaction.amount}
              </Text>
              {transaction.description ? (
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      {recentTransactions.length > 5 && (
        <TouchableOpacity
          onPress={() => setShowMore(!showMore)}
          style={styles.showMoreButton}
        >
          <Text style={styles.showMoreText}>
            {showMore ? "Show Less" : "Show More"}
          </Text>
          <MaterialIcons
            name={showMore ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#6CB4F8" // Match with your theme color
          />
        </TouchableOpacity>
      )}
      {recentTransactions.length === 0 && (
        <Text style={styles.noTransactionsText}>
          No transactions available.
        </Text>
      )}
      <Divider style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  transactionsContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  transactionCategory: {
    fontSize: 14,
    color: "#6CB4F8", // Color for the category text
    marginBottom: 5, // Margin to separate it from the title
  },
  transactionDetails: {
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 16,
    color: "#777",
  },
  transactionDescription: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  noTransactionsText: {
    fontSize: 16,
    color: "#777",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  showMoreText: {
    color: "#6CB4F8",
    fontWeight: "bold",
    marginRight: 8,
  },
  divider: {
    marginVertical: 10,
    height: 0.5,
    backgroundColor: "#ccc",
  },
});

export default TransactionsList;
