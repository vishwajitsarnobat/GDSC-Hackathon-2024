import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Dimensions } from "react-native";
import { Button, TextInput, Chip, Divider } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  doc,
  getFirestore,
  setDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function Exandinc() {
  const db = getFirestore(app);
  const { user } = useUser();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [categoryData, setCategoryData] = useState([]);

  const categories = ["Food", "Rent", "Salary", "Entertainment", "Travel"];

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onSubmitMethod = async (value) => {
    const amount = parseFloat(value.amount);
    if (isNaN(amount)) {
      alert("Please enter a valid numeric amount.");
      return;
    }

    try {
      const title = `${user.primaryEmailAddress?.emailAddress}${
        value.transactionTitle
      }${Date.now()}`;

      const transactionData = {
        ...value,
        userName: String(user.fullName),
        useremail: user.primaryEmailAddress?.emailAddress,
        timestamp: Date.now(),
      };

      await setDoc(doc(db, "Transactions", title), transactionData);
      console.log("Document uploaded");

      await fetchTransactions();
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  const userName = String(user.fullName);
  const userEmail = user.primaryEmailAddress?.emailAddress;

  const validationSchema = Yup.object().shape({
    transactionTitle: Yup.string().required("Required"),
    amount: Yup.number().required("Required"),
    category: Yup.string().required("Required"),
    type: Yup.string().required("Required"),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Expenses & Budget</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Total Income: ₹{totalIncome.toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            Total Expenses: ₹{totalExpense.toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            Balance: ₹{(totalIncome - totalExpense).toFixed(2)}
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Pie Chart for Expenses */}
      {totalExpense > 0 && (
        <View style={styles.chartContainer}>
          <PieChart
            data={categoryData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#FFFFFF",
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      <Divider style={styles.divider} />

      {/* Recent Transactions Section */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionHeader}>Recent Transactions</Text>
        {recentTransactions
          .slice(0, showMore ? recentTransactions.length : 5)
          .map((transaction, index) => (
            <View key={index} style={styles.transactionCard}>
              <Text style={styles.transactionTitle}>
                {transaction.transactionTitle}
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
          <Button
            onPress={() => setShowMore(!showMore)}
            style={styles.showMoreButton}
          >
            {showMore ? "Show Less" : "Show More"}
          </Button>
        )}
        {recentTransactions.length === 0 && (
          <Text style={styles.noTransactionsText}>
            No transactions available.
          </Text>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Add New Transaction Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionHeader}>Add New Transaction</Text>
        <Formik
          initialValues={{
            transactionTitle: "",
            amount: "",
            description: "",
            category: "",
            type: "expense",
            userName: userName,
            useremail: userEmail,
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => onSubmitMethod(values)}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            touched,
            errors,
          }) => (
            <View style={styles.form}>
              <TextInput
                mode="outlined"
                label="Transaction Title"
                value={values.transactionTitle}
                onChangeText={handleChange("transactionTitle")}
                onBlur={handleBlur("transactionTitle")}
                style={styles.input}
                error={
                  touched.transactionTitle && Boolean(errors.transactionTitle)
                }
              />
              {touched.transactionTitle && errors.transactionTitle && (
                <Text style={styles.errorText}>{errors.transactionTitle}</Text>
              )}

              <TextInput
                mode="outlined"
                label="Amount"
                keyboardType="numeric"
                value={values.amount}
                onChangeText={handleChange("amount")}
                onBlur={handleBlur("amount")}
                style={styles.input}
                error={touched.amount && Boolean(errors.amount)}
              />
              {touched.amount && errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}

              <TextInput
                mode="outlined"
                label="Description (Optional)"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                style={styles.input}
              />

              <View style={styles.categoryContainer}>
                <TextInput
                  mode="outlined"
                  label="Category"
                  value={values.category}
                  onChangeText={handleChange("category")}
                  onBlur={handleBlur("category")}
                  style={styles.input}
                  error={touched.category && Boolean(errors.category)}
                />
                {touched.category && errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}

                <ScrollView horizontal>
                  {categories.map((cat, index) => (
                    <Chip
                      key={index}
                      onPress={() => setFieldValue("category", cat)}
                      style={[
                        styles.chip,
                        values.category === cat && styles.chipSelected,
                      ]}
                    >
                      {cat}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.transactionTypeContainer}>
                <Button
                  mode={values.type === "expense" ? "contained" : "outlined"}
                  onPress={() => setFieldValue("type", "expense")}
                  style={styles.typeButton}
                >
                  Expense
                </Button>
                <Button
                  mode={values.type === "income" ? "contained" : "outlined"}
                  onPress={() => setFieldValue("type", "income")}
                  style={styles.typeButton}
                >
                  Income
                </Button>
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                Add Transaction
              </Button>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "#E9F5FF", // Light blue background
  },
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
  divider: {
    marginVertical: 10,
    height: 0.5, // Set the height to 0.5 for a thinner line
    backgroundColor: "#ccc", // Change the color if needed
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
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
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  chip: {
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  chipSelected: {
    backgroundColor: "#6CB4F8", // Change chip color on selection
  },
  transactionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeButton: {
    width: "48%",
  },
  submitButton: {
    paddingVertical: 8,
    backgroundColor: "#6CB4F8",
  },
  showMoreButton: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#D3E7FF",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
});
