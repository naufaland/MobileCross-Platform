import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import Animated, {
  SlideInLeft,
  FadeIn,
  SlideInRight,
  BounceIn,
  ZoomIn,
  Layout,
  FadeOut,
} from "react-native-reanimated";
import { userData, User } from "./data";

const UserList = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(userData);
  const [animationComplete, setAnimationComplete] = useState(true);

  const handleSearch = (text) => {
    // Reset animation state when search changes
    setAnimationComplete(false);
    setSearchText(text);

    // Slight delay to ensure animations don't overlap
    setTimeout(() => {
      const filtered = userData.filter((user) =>
        user.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
      setAnimationComplete(true);
    }, 100);
  };

  const renderItem = ({ item, index }: { item: User; index: number }) => {
    // Progressive delay based on item position (shorter delays for fewer items)
    const baseDelay = Math.min(filteredData.length * 10, 500);
    const itemDelay = baseDelay ? (baseDelay / filteredData.length) * index : 0;

    // Choose animation type based on index
    let animation;
    switch (
      index % 3 // Reduced from 5 to 3 different animations for better consistency
    ) {
      case 0:
        animation = SlideInRight.delay(itemDelay).springify().damping(12);
        break;
      case 1:
        animation = FadeIn.delay(itemDelay).duration(400);
        break;
      case 2:
        animation = ZoomIn.delay(itemDelay).duration(400);
        break;
      default:
        animation = FadeIn.delay(itemDelay);
    }

    return (
      <Animated.View
        entering={animation}
        exiting={FadeOut.duration(200)}
        layout={Layout.springify()}
        key={item.email}
      >
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => navigation.navigate("Profile", { user: item })}
        >
          <Image source={item.photo} style={styles.userPhoto} />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.name}</Text>
              {item.favorite && <Text style={styles.favorite}>★</Text>}
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        entering={SlideInLeft.duration(500)}
        style={styles.searchContainer}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </Animated.View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.email}
        contentContainerStyle={styles.listContent}
        // This ensures smooth transitions when list changes
        extraData={animationComplete}
        // Adding ItemSeparatorComponent for cleaner spacing
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
  favorite: {
    color: "#FFD700",
    fontSize: 18,
  },
  userEmail: {
    color: "#666",
    marginTop: 4,
  },
  userPhone: {
    color: "#666",
    marginTop: 2,
  },
});

export default UserList;
