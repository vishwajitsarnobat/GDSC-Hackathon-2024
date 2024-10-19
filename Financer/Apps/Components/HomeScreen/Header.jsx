import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { useUser } from "@clerk/clerk-react"; // Importing Clerk's useUser hook

const Header = () => {
  const { user } = useUser(); // Access the user object from Clerk

  // Extract the primary email if available
  const userEmail = user.primaryEmailAddress?.emailAddress || "UserEmail"; // Default value if no email is found

  return (
    <View style={styles.headerContainer}>
      <Image
        source={{ uri: user?.imageUrl || "https://via.placeholder.com/50" }} // Use user image or a placeholder
        style={styles.profileImage}
      />
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>{user?.fullName || "User"}</Text>
        <Text style={styles.greetingText}>{userEmail}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#5B8ED3", // Updated to blue color
    borderRadius: 30,
    marginBottom: 10,
    marginTop: 5,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5, // For Android shadow
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // Changed to white for better contrast
  },
  greetingText: {
    fontSize: 18,
    color: "#FFFFFF", // Changed to white for better contrast
  },
});

export default Header;
