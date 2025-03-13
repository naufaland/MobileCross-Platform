import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { User } from "./data";

type DetailsProps = {
  route: {
    params?: {
      user?: User;
    };
  };
  navigation: any;
};

const Details = ({ route, navigation }: DetailsProps) => {
  // Get user from route params or use a default message
  const user = route.params?.user;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No user details available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <Image source={user.photo} style={styles.profileImage} />
          <Text style={styles.name}>{user.name}</Text>
          {user.favorite && <Text style={styles.favoriteTag}>★ Favorite</Text>}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  favoriteTag: {
    color: "#ff8c00",
    fontSize: 16,
    fontWeight: "500",
  },
  infoSection: {
    padding: 20,
    backgroundColor: "white",
    margin: 10,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontWeight: "bold",
    width: 80,
    fontSize: 16,
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Details;
