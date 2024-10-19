import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import LoginScreen from './Apps/Screens/LoginScreen';
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import BottomTabNavigation from './Apps/Navigation/BottomTabNavigation';
import { NavigationContainer } from '@react-navigation/native';

import { SafeAreaProvider } from 'react-native-safe-area-context';




export default function App() {
  return (
    <ClerkProvider publishableKey={'pk_test_YWNlLWxhcmstMTAuY2xlcmsuYWNjb3VudHMuZGV2JA'}>

    <SafeAreaProvider className="flex-1  bg-white">    
      <StatusBar style="auto" />
     <SignedIn>
    
     <NavigationContainer>
     <BottomTabNavigation/>    
     </NavigationContainer>
      
        </SignedIn>
        <SignedOut>
          <LoginScreen/>
          </SignedOut>
    </SafeAreaProvider>
    </ClerkProvider>
  );
}

