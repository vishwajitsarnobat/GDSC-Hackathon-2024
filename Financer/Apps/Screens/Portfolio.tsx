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



 

  const Portfolio = () => {
    const [stocks, setStocks] = useState([
      { symbol: 'AAPL', companyName: 'Apple Inc.', price: 150.12, change: 1.24, dateOfPurchase: '2023-10-01' },
      { symbol: 'GOOGL', companyName: 'Alphabet Inc.', price: 2803.79, change: -0.95, dateOfPurchase: '2024-01-15' },
    ]);
  
    const [visible, setVisible] = useState(false);
    const [newStock, setNewStock] = useState({ symbol: '', companyName: '', price: '', change: '', dateOfPurchase: '' });
  
    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);
  
    const [hasNotifications, setHasNotifications] = useState(true); // State to track notifications

    const handleNewsPress = () => {
      console.log('News Clicked');
      hasNotifications? console.log("hii"):console.log("bey")
      setHasNotifications(!hasNotifications)
      fetchStockNews();
      // Add navigation or fetch news for this stock symbol
    };
  
    const handleAddStock = () => {
      if (newStock.symbol && newStock.companyName && newStock.price && newStock.change && newStock.dateOfPurchase) {
        setStocks([
          ...stocks,
          {
            symbol: newStock.symbol,
            companyName: newStock.companyName,
            price: parseFloat(newStock.price),
            change: parseFloat(newStock.change),
            dateOfPurchase: newStock.dateOfPurchase,  // Store date
          },
        ]);
        hideDialog();
        setNewStock({ symbol: '', companyName: '', price: '', change: '', dateOfPurchase: '' });
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
                change={stock.change}
                dateofPurchase={stock.dateOfPurchase}
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
                  label="Change (%)"
                  value={newStock.change}
                  onChangeText={(text) => setNewStock((prev) => ({ ...prev, change: text }))}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Date of Purchase (YYYY-MM-DD)"  // New field for date
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
            icon="chart-bar" // Use any relevant icon such as "sort" or "analysis"
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

          {/* FAB for News Icon at Bottom-Left */}
          <View style={styles.newsFabContainer}>
            <FAB
              style={styles.newsFab}
              icon="newspaper"
              onPress={handleNewsPress}
              color="white"
            />
            {/* Red Dot Notification Badge */}
            {hasNotifications? <View style={styles.badge} />:<View></View>}
          </View>
        </SafeAreaView>
      </Provider>
    );
  };
  
  const styles = StyleSheet.create({
    analyzeFab: { 
      position: 'absolute',
      right: 16,
      bottom: 80, // Position above the "Add Stock" button
      backgroundColor: '#00695C',  // Dark Teal for "Analyze" button
    },
    
    container: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: '#4A148C',  // Dark Purple for Add Stock
    },
    newsFabContainer: {
      position: 'absolute',
      left: 16,
      bottom: 16,
    },
    newsFab: {
      backgroundColor: '#4A148C',  // Same Dark Purple for consistency
    },
    badge: {
      position: 'absolute',
      top: -0, // Adjust this value to position the dot vertically
      right: -0, // Adjust this value to position the dot horizontally
      backgroundColor: 'red',
      width: 10, // Diameter of the dot
      height: 10, // Diameter of the dot
      borderRadius: 5, // Make it circular
      borderWidth: 2, // Optional: border to give it some contrast
      borderColor: 'white', // Optional: border color
    },
    card: {
      margin: 10,
      borderRadius: 8,
    },

    input: {
      marginBottom: 10,
    },
  });
  
  

export default Portfolio