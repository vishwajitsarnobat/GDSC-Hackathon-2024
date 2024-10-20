import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { FAB, Portal, Provider, Dialog, TextInput, Button } from 'react-native-paper';
import { useState } from 'react'
import StockCard from '../../cards/stockCard';
import { getStockNews } from '../../apiExpress/express_news'

async function fetchStockNews() {
  try {
    const stockNames = ['hdfc', 'reliance'];  // Example stock names
    const newsData = await getStockNews(stockNames);
    console.log(newsData['news']);  // Access the 'news' field from the response
  } catch (error) {
    console.error('Error in fetching stock news:', error);
  }
}


const portfolio = () => {
  const [stocks, setStocks] = useState([
    { symbol: 'AAPL', companyName: 'Apple Inc.', price: 150.12, dateOfPurchase: '2023-10-01', currentPrice: 155.30 },
    { symbol: 'GOOGL', companyName: 'Alphabet Inc.', price: 2803.79, dateOfPurchase: '2024-01-15', currentPrice: 2850.50 },
  ]);

  const [visible, setVisible] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '', companyName: '', price: '', dateOfPurchase: '' });
  const [hasNotifications, setHasNotifications] = useState(true); // State to track notifications

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleNewsPress = () => {
    console.log('News Clicked');
    hasNotifications ? console.log("hii") : console.log("bey");
    setHasNotifications(!hasNotifications);
    fetchStockNews();
  };

  const handleAddStock = () => {
    if (newStock.symbol && newStock.companyName && newStock.price && newStock.dateOfPurchase) {
      setStocks([
        ...stocks,
        {
          symbol: newStock.symbol,
          companyName: newStock.companyName,
          price: parseFloat(newStock.price),
          dateOfPurchase: newStock.dateOfPurchase,  // Store date
          currentPrice: parseFloat(newStock.price),  // Initially set currentPrice to purchase price
        },
      ]);
      hideDialog();
      setNewStock({ symbol: '', companyName: '', price: '', dateOfPurchase: '' });
    }
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {stocks.map((stock, index) => (
            <StockCard
              key={index}
              symbol={stock.symbol}
              companyName={stock.companyName}
              price={stock.price}
              dateofPurchase={stock.dateOfPurchase}
              currentPrice={stock.currentPrice}  // Pass the current price of the stock
            />
          ))}
        </ScrollView>

        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Add Stock</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Symbol"
                value={newStock.symbol}
                onChangeText={(text) => setNewStock((prev) => ({ ...prev, symbol: text }))}
                style={styles.input}
              />
              <TextInput
                label="Company Name"
                value={newStock.companyName}
                onChangeText={(text) => setNewStock((prev) => ({ ...prev, companyName: text }))}
                style={styles.input}
              />
              <TextInput
                label="Price"
                value={newStock.price}
                onChangeText={(text) => setNewStock((prev) => ({ ...prev, price: text }))}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Date of Purchase (YYYY-MM-DD)"
                value={newStock.dateOfPurchase}
                onChangeText={(text) => setNewStock((prev) => ({ ...prev, dateOfPurchase: text }))}
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleAddStock}>Add</Button>
              <Button onPress={hideDialog}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <FAB
          style={styles.analyzeFab}
          icon="chart-bar"
          onPress={() => console.log('Analyze Stocks')}
          color="white"
        />

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={showDialog}
          color='white'
          label="Add Stock"
        />

        <View style={styles.newsFabContainer}>
          <FAB
            style={styles.newsFab}
            icon="newspaper"
            onPress={handleNewsPress}
            color="white"
          />
          {hasNotifications ? <View style={styles.badge} /> : <View></View>}
        </View>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  analyzeFab: { 
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#00695C',
  },
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4A148C',
  },
  newsFabContainer: {
    position: 'absolute',
    left: 16,
    bottom: 16,
  },
  newsFab: {
    backgroundColor: '#4A148C',
  },
  badge: {
    position: 'absolute',
    top: -0,
    right: -0,
    backgroundColor: 'red',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  input: {
    marginBottom: 10,
  },
});

export default portfolio;
