import React, { useState } from "react";
import {
  View,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, TextInput, Chip, Text } from "react-native-paper";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo"; // Clerk for authentication
import { app } from "../../../firebaseConfig"; // Your Firebase config

const { width, height } = Dimensions.get("window");

const TransactionModal = ({
  modalVisible,
  setModalVisible,
  fetchTransactions,
}) => {
  const db = getFirestore(app);
  const { user } = useUser();
  const categories = ["Food", "Rent", "Salary", "Entertainment", "Travel"];
  const [loading, setLoading] = useState(false); // State to track loading

  const handleAddTransaction = async (values, { resetForm }) => {
    setLoading(true); // Set loading to true
    try {
      const newTransaction = {
        transactionTitle: values.transactionTitle,
        amount: parseFloat(values.amount),
        category: values.category,
        type: values.type,
        useremail: user.primaryEmailAddress?.emailAddress, // Adding user email for transaction filtering
        timestamp: serverTimestamp(), // Record the time of transaction creation
      };

      // Add transaction to Firestore
      const docRef = await addDoc(
        collection(db, "Transactions"),
        newTransaction
      );
      console.log("Transaction added with ID: ", docRef.id);

      // Refresh transactions after adding
      await fetchTransactions();

      // Reset form after submission
      resetForm();
      setModalVisible(false); // Close modal
    } catch (error) {
      console.error("Error adding transaction: ", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.formContainer}>
          <Formik
            initialValues={{
              transactionTitle: "",
              amount: "",
              category: "",
              type: "expense",
            }}
            validationSchema={Yup.object({
              transactionTitle: Yup.string().required(
                "Transaction title is required"
              ),
              amount: Yup.number()
                .required("Amount is required")
                .positive("Amount must be positive"),
              category: Yup.string().required("Category is required"),
            })}
            onSubmit={handleAddTransaction}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              touched,
              errors,
              setFieldValue,
            }) => (
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <TextInput
                  label="Transaction Title"
                  value={values.transactionTitle}
                  onChangeText={handleChange("transactionTitle")}
                  onBlur={handleBlur("transactionTitle")}
                  error={
                    touched.transactionTitle && Boolean(errors.transactionTitle)
                  }
                  style={styles.input}
                />
                {touched.transactionTitle && errors.transactionTitle && (
                  <Text style={styles.errorText}>
                    {errors.transactionTitle}
                  </Text>
                )}

                <TextInput
                  label="Amount"
                  value={values.amount}
                  onChangeText={handleChange("amount")}
                  onBlur={handleBlur("amount")}
                  keyboardType="numeric"
                  error={touched.amount && Boolean(errors.amount)}
                  style={styles.input}
                />
                {touched.amount && errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}

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

                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonLoading, // Add loading style
                  ]}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" /> // Show loading indicator
                  ) : (
                    "Add Transaction"
                  )}
                </Button>

                <Button
                  onPress={() => setModalVisible(false)} // Close modal
                  style={styles.closeButton}
                >
                  Close
                </Button>
              </ScrollView>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim background effect
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15, // Softer edges
    shadowColor: "#000",
    shadowOpacity: 0.1, // Slightly softer shadow
    shadowOffset: { width: 0, height: 4 }, // Elevation for shadow
    shadowRadius: 6,
    elevation: 10, // Elevated effect on Android
    width: width * 0.9, // Responsive width
    maxHeight: height * 0.85, // Limit height for better usability
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#F9F9F9", // Soft background for inputs
    borderColor: "#D1D1D1",
    borderWidth: 1,
    borderRadius: 10, // Softer input fields
  },
  chip: {
    marginRight: 8,
    backgroundColor: "#E5E5E5", // Subtle pastel background for unselected chips
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: "#A5D6F9", // Light pastel blue for selected chips
  },
  categoryContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  transactionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeButton: {
    width: "48%",
    borderRadius: 10, // Rounded buttons
  },
  submitButton: {
    paddingVertical: 12,
    backgroundColor: "#6CB4F8", // Main action button color (pastel blue)
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonLoading: {
    backgroundColor: "#A5D6F9", // Lighter color for loading state
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#E3F2FD", // Light blue for close button
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  errorText: {
    color: "#FF6B6B", // Red for errors
    fontSize: 12,
    marginBottom: 10,
  },
});

export default TransactionModal;
