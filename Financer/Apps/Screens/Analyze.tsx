// Analyze.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons'; // Import the icon component
import { PieChart } from 'react-native-chart-kit'; // Import the PieChart component

interface AnalyzeProps {
  onClose: () => void; // Function to close the modal
  onExecute: (transactions: { instrument: string; action: string; quantity: number }[]) => void; // Function to execute action with the risk level
}

const Analyze: React.FC<AnalyzeProps> = ({ onClose, onExecute }) => {
  const [risk, setRisk] = useState<number>(5); // Default value set to 5
  const [transactions, setTransactions] = useState<{ instrument: string; action: string; quantity: number; selected: boolean }[]>([
    { instrument: 'AAPL', action: 'Buy', quantity: 10, selected: false }, // Example transaction
    { instrument: 'GOOGL', action: 'Sell', quantity: 5, selected: false }, // Example transaction
  ]);

  const toggleTransactionSelection = (index: number) => {
    setTransactions((prevTransactions) => {
      const updatedTransactions = [...prevTransactions];
      updatedTransactions[index].selected = !updatedTransactions[index].selected; // Toggle selection
      return updatedTransactions;
    });
  };

  const executeTransactions = () => {
    const selectedTransactions = transactions.filter(transaction => transaction.selected);
    if (selectedTransactions.length === 0) {
      Alert.alert("No transactions selected", "Please select at least one transaction to execute.");
      return;
    }
    onExecute(selectedTransactions); // Pass selected transactions for execution
  };

  // Data for pie charts
  const beforeTransactionData = [
    { name: 'AAPL', quantity: 30, color: '#FF6384', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'GOOGL', quantity: 70, color: '#36A2EB', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  const getAfterTransactionData = () => {
    const afterData = [...beforeTransactionData];
    transactions.forEach(transaction => {
      if (transaction.selected) {
        const existing = afterData.find(data => data.name === transaction.instrument);
        if (existing) {
          if (transaction.action === 'Buy') {
            existing.quantity += transaction.quantity; // Increase quantity for Buy action
          } else if (transaction.action === 'Sell') {
            existing.quantity = Math.max(0, existing.quantity - transaction.quantity); // Decrease quantity for Sell action
          }
        }
      }
    });
    return afterData;
  };

  const afterTransactionData = getAfterTransactionData();

  return (
    <ScrollView style={styles.container}>
      {/* Close Icon in Top Right Corner */}
      <Icon
        name="close"
        size={30} // Size of the icon
        color="#FF6347" // Color of the icon
        onPress={onClose} // Close modal when pressed
        style={styles.closeIcon} // Style for positioning
      />

      <Text style={styles.title}>Stock Analysis</Text>
      <Text>Analysis content goes here...</Text>

      {/* Set Risk Slider */}
      <Text style={styles.riskLabel}>Set Risk Level: {risk}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={risk}
        onValueChange={setRisk}
        minimumTrackTintColor="#1fb28a"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#f4f4f4"
      />

      {/* Instrument Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Instruments</Text>
        {transactions.map((transaction, index) => (
          <TouchableOpacity key={index} onPress={() => toggleTransactionSelection(index)} style={styles.transactionRow}>
            <Text style={styles.transactionText}>
              {transaction.action} {transaction.quantity} of {transaction.instrument}
            </Text>
            <Text style={transaction.selected ? styles.selected : styles.unselected}>
              {transaction.selected ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Execute Button */}
      <Button title="Execute Transactions" onPress={executeTransactions} color="#FF6347" />

      {/* Pie Chart for Distribution Before Execution */}
      <Text style={styles.chartTitle}>Before Execution</Text>
      <PieChart
        data={beforeTransactionData}
        width={320} // Width of the chart
        height={220} // Height of the chart
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0, // Optional
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Color of the chart
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Color of the labels
          style: {
            borderRadius: 16,
          },
        }}
        accessor="quantity" // Accessor for the data quantity
        backgroundColor="transparent"
        paddingLeft="15" // Padding on the left for labels
        absolute // For absolute values
      />

      {/* Pie Chart for Distribution After Execution */}
      <Text style={styles.chartTitle}>After Execution</Text>
      <PieChart
        data={afterTransactionData}
        width={320} // Width of the chart
        height={220} // Height of the chart
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0, // Optional
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Color of the chart
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Color of the labels
          style: {
            borderRadius: 16,
          },
        }}
        accessor="quantity" // Accessor for the data quantity
        backgroundColor="transparent"
        paddingLeft="15" // Padding on the left for labels
        absolute // For absolute values
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  riskLabel: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  closeIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  card: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    alignItems: 'center',
  },
  transactionText: {
    fontSize: 16,
  },
  selected: {
    color: 'green',
    fontSize: 18,
  },
  unselected: {
    color: 'gray',
    fontSize: 18,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default Analyze;
