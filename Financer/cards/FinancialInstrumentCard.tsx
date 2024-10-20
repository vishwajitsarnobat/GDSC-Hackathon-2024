import React from 'react';
import { Card, Paragraph } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';

interface FinancialInstrumentCardProps {
  type: 'stock' | 'bond' | 'futures' | 'options' | 'crypto' | 'real estate';
  symbol: string;
  companyName: string;
  price: number;
  currentPrice: number;
  dateOfPurchase: string;
  quantity: number; // Change to 'quantity' to reflect current quantity
}

const FinancialInstrumentCard: React.FC<FinancialInstrumentCardProps> = ({
  type,
  symbol,
  companyName,
  price,
  currentPrice,
  dateOfPurchase,
  quantity,
}) => {
  const changePercentage = (((currentPrice - price) / price) * 100).toFixed(2);
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>
            {companyName} ({symbol})
          </Text>
          <Text style={styles.type}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
        </View>
        <View style={styles.details}>
          <Paragraph style={styles.detailText}>
            Quantity: {quantity} {/* Display updated quantity */}
          </Paragraph>
          <Paragraph style={styles.detailText}>
            Purchase Price: ${price.toFixed(2)}
          </Paragraph>
          <Paragraph style={styles.detailText}>
            Current Price: <Text style={styles.currentPrice}>${currentPrice.toFixed(2)}</Text>
          </Paragraph>
        </View>
        <Text style={parseFloat(changePercentage) >= 0 ? styles.positiveChange : styles.negativeChange}>
          Change: {changePercentage}%
        </Text>
        <Text style={styles.dateText}>Date of Purchase: {dateOfPurchase}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 8,
    elevation: 2, // Adds shadow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 14,
    color: '#777',
  },
  details: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    marginVertical: 2,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveChange: {
    color: 'green',
    marginVertical: 5,
    fontSize: 16,
  },
  negativeChange: {
    color: 'red',
    marginVertical: 5,
    fontSize: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#555',
  },
});

export default FinancialInstrumentCard;
