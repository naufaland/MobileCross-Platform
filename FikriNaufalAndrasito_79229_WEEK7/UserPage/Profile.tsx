import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { User } from "./data";
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
} from "react-native-reanimated";

type ProfileProps = {
  route: {
    params: {
      user: User;
    };
  };
  navigation: any;
};

const Profile = ({ route, navigation }: ProfileProps) => {
  const { user } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={SlideInLeft.duration(600)} style={styles.header}>
        <Image source={user.photo} style={styles.profileImage} />
        <Text style={styles.name}>{user.name}</Text>
        {user.favorite && (
          <Animated.View
            entering={FadeIn.delay(500)}
            style={styles.favoriteTag}
          >
            <Text style={styles.favoriteText}>★ Favorite</Text>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.delay(200)}
        style={styles.detailsContainer}
      >
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{user.email}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{user.phone}</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  favoriteTag: {
    backgroundColor: "#fff3cd",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 5,
  },
  favoriteText: {
    color: "#856404",
    fontWeight: "500",
  },
  detailsContainer: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  detailItem: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
  },
});

export default Profile;
