import { SafeAreaView, ScrollView, StyleSheet, View, Modal, Text, } from 'react-native';
import { FAB, Portal, Provider, Dialog, TextInput, Button } from 'react-native-paper';
import { useState } from 'react'
import FinancialInstrumentCard from '../../cards/FinancialInstrumentCard';
import Analyze from './Analyze';


async function getStockNews() {
  try {
    const stockNames = ['hdfc', 'reliance'];  // Example stock names
    const newsData = "sd";
    console.log(newsData['news']);  // Access the 'news' field from the response
  } catch (error) {
    console.error('Error in fetching stock news:', error);
  }
  return "hii"
}


const Portfolio = () => {

 


  const [analyzeVisible, setAnalyzeVisible] = useState(false);

  const [visible, setVisible] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '', companyName: '', price: '', dateOfPurchase: '' });
  const [hasNotifications, setHasNotifications] = useState(true); // State to track notifications
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const hideAnalyzeDialog = () => setAnalyzeVisible(false);

  const [newsVisible, setNewsVisible] = useState(false); // State for news modal
  const [newsData, setNewsData] = useState<string[]>([]); // State for storing news
  const [currentSymbol, setCurrentSymbol] = useState<string>(''); // Store the symbol for which to fetch news
  
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const hideNewsDialog = () => {
    setHasNotifications(false)  
    setNewsVisible(false)
  }; // Hide news modal


  const handleNewsPress = () => {
    setCurrentSymbol('hii'); // Set the current symbol for which to fetch news
    const news = getStockNews(); // Fetch news for this stock symbol
    setNewsData(["hii"]); // Set the news data
    setNewsVisible(true); // Show news modal
  };

  
  const [newInstrument, setNewInstrument] = useState({
    type: 'stock', // Default type
    symbol: '',
    companyName: '',
    price: '',
    currentPrice: '',
    dateOfPurchase: '',
    numberOfUnits: '',
  });

  const [instruments, setInstruments] = useState([
    {
      type: 'stock',
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      price: 150.12,
      currentPrice: 170.0,
      dateOfPurchase: '2023-10-01',
      numberOfUnits: 10,
    },
    {
      type: 'bond',
      symbol: 'US10Y',
      companyName: 'US 10-Year Treasury',
      price: 100.0,
      currentPrice: 102.5,
      dateOfPurchase: '2023-09-15',
      numberOfUnits: 5,
    },
    {
      type: 'futures',
      symbol: 'CL',
      companyName: 'Crude Oil Futures',
      price: 70.0,
      currentPrice: 75.0,
      dateOfPurchase: '2023-10-05',
      numberOfUnits: 15,
    },
    {
      type: 'options',
      symbol: 'AAPL220121C00150000',
      companyName: 'AAPL Call Option',
      price: 5.0,
      currentPrice: 8.0,
      dateOfPurchase: '2023-09-20',
      numberOfUnits: 20,
    },
    {
      type: 'crypto',
      symbol: 'BTC',
      companyName: 'Bitcoin',
      price: 45000.0,
      currentPrice: 48000.0,
      dateOfPurchase: '2023-10-01',
      numberOfUnits: 2,
    },
    {
      type: 'real estate',
      symbol: 'NYC_APT',
      companyName: 'New York City Apartment',
      price: 1000000.0,
      currentPrice: 1050000.0,
      dateOfPurchase: '2023-01-01',
      numberOfUnits: 1,
    },
  ]);


  const handleAddInstrument = () => {
    if (
      newInstrument.symbol &&
      newInstrument.companyName &&
      newInstrument.price &&
      newInstrument.currentPrice &&
      newInstrument.dateOfPurchase &&
      newInstrument.numberOfUnits
    ) {
      console.warn("Working")
      setInstruments([
        ...instruments,
        {
          type: newInstrument.type,
          symbol: newInstrument.symbol,
          companyName: newInstrument.companyName,
          price: parseFloat(newInstrument.price),
          currentPrice: parseFloat(newInstrument.currentPrice),
          dateOfPurchase: newInstrument.dateOfPurchase,
          numberOfUnits: parseInt(newInstrument.numberOfUnits),
        },
      ]);
      hideDialog();
      setNewInstrument({
        type: 'stock',
        symbol: '',
        companyName: '',
        price: '',
        currentPrice: '',
        dateOfPurchase: '',
        numberOfUnits: '',
      });
    }
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {instruments.map((stock, index) => (
            <FinancialInstrumentCard
            key={index}
            type={stock.type}
            symbol={stock.symbol}
            companyName={stock.companyName}
            price={stock.price}
            currentPrice={stock.currentPrice}
            dateOfPurchase={stock.dateOfPurchase}
            numberOfUnits={stock.numberOfUnits}
          />
          
          ))}
        </ScrollView>

        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Add Financial Instrument</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Type (stock, bond, futures, options, crypto, real estate)"
                value={newInstrument.type}
                onChangeText={(text) => setNewInstrument((prev) => ({ ...prev, type: text }))}
                style={styles.input}
              />
              <TextInput
                label="Symbol"
                value={newInstrument.symbol}
                onChangeText={(text) => setNewInstrument((prev) => ({ ...prev, symbol: text }))}
                style={styles.input}
              />
              <TextInput
                label="Company Name"
                value={newInstrument.companyName}
                onChangeText={(text) => setNewInstrument((prev) => ({ ...prev, companyName: text }))}
                style={styles.input}
              />
              <TextInput
                label="Purchase Price"
                value={newInstrument.price}
                onChangeText={(text) => setNewInstrument((prev) => ({ ...prev, price: text }))}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Current Price"
                value={newInstrument.currentPrice}
                onChangeText={(text) => setNewInstrument((prev) => ({ ...prev, currentPrice: text }))}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Date of Purchase (YYYY-MM-DD)"
                value={newInstrument.dateOfPurchase}
                onChangeText={(text) => setNewInstrument((prev) => ({ ...prev, dateOfPurchase: text }))}
                style={styles.input}
              />
              <TextInput
                label="Number of Units"
                value={newInstrument.numberOfUnits}
                onChangeText={(text) => setNewInstrument((prev) => ({ ...prev, numberOfUnits: text }))}
                keyboardType="numeric"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleAddInstrument}>Add</Button>
              <Button onPress={hideDialog}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        
        <Portal>
          

          {/* News Modal */}
          <Modal visible={newsVisible} onDismiss={hideNewsDialog}>
            <View style={styles.newsModalContainer}>
              <Text style={styles.newsTitle}>Latest News for {currentSymbol}</Text>
              {newsData.length > 0 ? (
                newsData.map((news, index) => (
                  <Text key={index} style={styles.newsItem}>
                    {news}
                  </Text>
                ))
              ) : (
                <Text>No news available.</Text>
              )}
              <Button onPress={hideNewsDialog}>Close</Button>
            </View>
          </Modal>
        </Portal>

        {/* Analyze Modal */}
        <Modal visible={analyzeVisible} onRequestClose={hideAnalyzeDialog} animationType="slide">
          <Analyze onClose={hideAnalyzeDialog} />
        </Modal>

        <FAB
          style={styles.analyzeFab}
          icon="chart-bar"
          onPress={() => setAnalyzeVisible(true)} // Open the analysis modal
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
  newsModalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  analysisModalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newsItem: {
    fontSize: 16,            // Font size for news items
    color: '#333',           // Text color
    marginVertical: 5,       // Space above and below each item
    padding: 10,             // Padding around each item
    borderBottomWidth: 1,    // Border at the bottom
    borderBottomColor: '#ccc', // Color of the bottom border
  },
  input: {
    marginBottom: 10,
  },
});

export default Portfolio;
