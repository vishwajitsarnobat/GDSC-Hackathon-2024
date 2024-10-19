import { View, Text } from 'react-native'
import React from 'react'
import HomeScreenFab from '../Screens/homScreenFab'
import AddUnit from '../Components/HomeScreen/AddUnit'
import { createStackNavigator } from '@react-navigation/stack';
import Addsewadal from '../Components/HomeScreen/Addsewadal';
import { NavigationContainer } from '@react-navigation/native';



export default function Addunitstack() {
    
const Stack = createStackNavigator();
  return (
    
      <Stack.Navigator   initialRouteName="Home">
        <Stack.Screen  name="Home" component={HomeScreenFab} options={{headerShown:false}} />
        <Stack.Screen name="AddUnit" component={AddUnit} />
        <Stack.Screen name="AddSewadal" component={Addsewadal} />
      </Stack.Navigator>
    
  )
}