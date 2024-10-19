import React from "react";
import { View, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";

const PieChartComponent = ({ totalExpense, categoryData }) => {
  if (totalExpense === 0) {
    return null;
  }

  return (
    <View style={styles.chartContainer}>
      <PieChart
        data={categoryData}
        width={300}
        height={200}
        chartConfig={{
          backgroundColor: "#FFFFFF",
          color: () => "#6CB4F8",
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
});

export default PieChartComponent;
