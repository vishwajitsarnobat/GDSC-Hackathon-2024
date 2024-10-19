import React from "react";
import ProfileScreen from "../Screens/ProfileScreen";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeScreenFab from "../Screens/homScreenFab";
import BudandGoal from "../Screens/BudandGoal";
import Exandinc from "../Screens/exandinc";
import Portfolio from "../Screens/portfolio";

const Tab = createMaterialBottomTabNavigator();

export default function BottomTabNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      barStyle={{
        backgroundColor: "#ADD8E6",
        height: 80,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
      }}
    >
      {/* Home Screen */}
      <Tab.Screen
        name="home"
        component={HomeScreenFab}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={color}
              size={28}
            />
          ),
        }}
      />

      {/* Budget and Goal */}
      <Tab.Screen
        name="BudandGoal"
        component={BudandGoal}
        options={{
          tabBarLabel: "Budget & Goals",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="bullseye-arrow"
              color={color}
              size={28}
            />
          ),
        }}
      />

      {/* Income and Expenses */}
      <Tab.Screen
        name="extrainc"
        component={Exandinc}
        options={{
          tabBarLabel: "Income & Expenses",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="currency-usd"
              color={color}
              size={28}
            />
          ),
        }}
      />

      {/* Portfolio */}
      <Tab.Screen
        name="portfolio"
        component={Portfolio}
        options={{
          tabBarLabel: "Portfolio",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="briefcase-outline"
              color={color}
              size={28}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-outline"
              color={color}
              size={28}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
