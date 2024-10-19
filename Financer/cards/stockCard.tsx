import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, useTheme } from 'react-native-paper';

interface StockCardProps {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  dateOfPurchase: string;
}

const StockCard: React.FC<StockCardProps> = ({ symbol, companyName, price, change, dateOfPurchase }) => {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.info}>
            <Title>{symbol}</Title>
            <Paragraph>{companyName}</Paragraph>
            <Paragraph style={styles.price}>${price.toFixed(2)}</Paragraph>
            <Paragraph
              style={[styles.change, change >= 0 ? styles.positive : styles.negative]}
            >
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </Paragraph>
            <Paragraph style={styles.date}>Purchased on: {dateOfPurchase}</Paragraph>
          </View>
        </View>
      </Card.Content>
      
    </Card>
  );
};

const App = () => {
  return (
    <View style={styles.container}>
      <StockCard
        symbol="AAPL"
        companyName="Apple Inc."
        price={150.12}
        change={1.24}
        dateOfPurchase="2023-10-01"
      />

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4A148C',  // Dark Purple for Add Stock
  },
  newsFab: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: '#4A148C',  // Same Dark Purple for consistency
  },
  card: {
    margin: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 16,
    marginTop: 4,
  },
  date: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
});


export default App;
