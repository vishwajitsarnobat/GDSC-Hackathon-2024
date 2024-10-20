import React from 'react';
import { Card } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';

interface StockCardProps {
  symbol: string;
  companyName: string;
  price: number;
  dateofPurchase: string;
  currentPrice: number;
}

const StockCard: React.FC<StockCardProps> = ({
  symbol,
  companyName,
  price,
  dateofPurchase,
  currentPrice,
}) => {
  const changePercentage = (((currentPrice - price) / price) * 100).toFixed(2);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>{companyName} ({symbol})</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.leftColumn}>
            <Text style={styles.purchasePrice}>Purchase Price: ${price.toFixed(2)}</Text>
            <Text>Date of Purchase: {dateofPurchase}</Text>
          </View>
          <View style={styles.rightColumn}>
            <Text style={styles.currentPrice}>${currentPrice.toFixed(2)}</Text>
            <Text style={parseFloat(changePercentage) >= 0 ? styles.positiveChange : styles.negativeChange}>
              Change: {changePercentage}%
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 10,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  purchasePrice: {
    marginBottom: 5,
  },
  currentPrice: {
    fontSize: 20, // Increased font size for current price
    marginBottom: 5,
  },
  positiveChange: {
    color: 'green',
  },
  negativeChange: {
    color: 'red',
  },
});

export default StockCard;
