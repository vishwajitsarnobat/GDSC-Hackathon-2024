import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { app } from "../../../firebaseConfig";
import { useUser } from "@clerk/clerk-expo";

const TopCategories = () => {
  const db = getFirestore(app);
  const { user } = useUser();
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!user || !user.primaryEmailAddress) return;

      const transactionsCollection = collection(db, "Transactions");
      const querySnapshot = await getDocs(transactionsCollection);

      const categoryTotals = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.useremail === user.primaryEmailAddress.emailAddress) {
          const amount = parseFloat(data.amount);
          const category = data.category; // Ensure your data has a category field
          const type = data.type; // Ensure your data has a type field (income or expense)

          if (!isNaN(amount) && category) {
            if (!categoryTotals[category]) {
              categoryTotals[category] = { total: 0, type }; // Store type along with total
            }
            categoryTotals[category].total += amount;
          }
        }
      });

      // Convert the categoryTotals object to an array
      const formattedCategories = Object.entries(categoryTotals).map(
        ([category, { total, type }]) => ({
          category,
          total,
          type,
        })
      );

      // Sort categories by total amount
      formattedCategories.sort((a, b) => b.total - a.total);

      setCategoriesData(formattedCategories);
    };

    fetchCategoryData();
  }, [user]);

  const renderItem = ({ item }) => (
    <View style={styles.card(item.type)}>
      <Text style={styles.categoryText(item.type)}>
        {getEmoji(item.category)} {item.category}: ₹{item.total.toFixed(2)}
      </Text>
    </View>
  );

  // Function to return emoji based on category
  const getEmoji = (category) => {
    switch (category.toLowerCase()) {
      case "grocery":
        return "🛒";
      case "fashion":
        return "👗";
      case "entertainment":
        return "🎬";
      case "bills":
        return "💡";
      case "travel":
        return "✈️";
      // Add more cases for different categories
      default:
        return "📦"; // Default emoji for unknown categories
    }
  };

  return (
    <View style={styles.categoriesContainer}>
      <Text style={styles.categoriesHeader}>Top Categories</Text>
      {categoriesData.length === 0 ? (
        <Text>No categories available.</Text>
      ) : (
        <FlatList
          data={categoriesData}
          renderItem={renderItem}
          keyExtractor={(item) => item.category}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 20,
  },
  categoriesHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: (type) => ({
    padding: 10,
    backgroundColor: type === "income" ? "#E8F5E9" : "#FFEBEE", // Green for income, red for expense
    borderRadius: 10,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    height: 100,
    elevation: 2, // For Android shadow
    width: 150, // Smaller width for the cards
    alignItems: "center", // Center content in the card
  }),
  categoryText: (type) => ({
    fontSize: 14,
    fontWeight: "bold",
    color: type === "income" ? "#388E3C" : "#C62828", // Dark green for income, dark red for expense
  }),
});

export default TopCategories;
