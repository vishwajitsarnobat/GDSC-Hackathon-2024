import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native"; // Import Text
import { Provider as PaperProvider, FAB } from "react-native-paper";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";
import { app } from "../../firebaseConfig";
import Header from "../Components/exapanseandincome/Heder";
import TransactionsList from "../Components/exapanseandincome/TransactionsList";
import TransactionModal from "../Components/exapanseandincome/TrasactionaModal";
import PieChartComponent from "../Components/exapanseandincome/PieChartComponent";

export default function Exandinc() {
  const db = getFirestore(app);
  const { user } = useUser();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

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

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Header
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={totalIncome - totalExpense}
          />

          <PieChartComponent
            totalExpense={totalExpense}
            categoryData={categoryData}
          />

          <TransactionsList
            recentTransactions={recentTransactions}
            fetchTransactions={fetchTransactions}
          />
        </ScrollView>

        <View style={styles.fabContainer}>
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setModalVisible(true)}
          />
        </View>

        <TransactionModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          fetchTransactions={fetchTransactions}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F5FF",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fabContainer: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 10, // Adjust to create space for the label
    alignItems: "center",
  },
  fabLabel: {
    color: "#6CB4F8",
    marginBottom: 4,
    fontWeight: "bold",
  },
  fab: {
    backgroundColor: "#6CB4F8",
  },
});
