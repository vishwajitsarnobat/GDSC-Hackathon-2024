import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#40E0D0",
        tabBarInactiveTintColor: "#87CEFA",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#00008B",
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12, 
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "portfolio",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="shopping-bag" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="BudandGoal"
        options={{
          title: "Buddget and Goal",
          tabBarIcon: ({ color }) => (
            <Entypo size={28} name="wallet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exandinc"
        options={{
          title: "expense",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="shopping-bag" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
