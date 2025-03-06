import { StatusBar } from "expo-status-bar";
import {
  Platform,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import {
  Provider as PaperProvider,
  List,
  Avatar,
  Card,
  Text,
  Appbar,
  Surface,
  useTheme,
  IconButton,
  Searchbar,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  Divider,
  FAB,
  Chip,
} from "react-native-paper";
import { useState } from "react";

const useData = [
  {
    name: "AMBALATHON",
    email: "ambalabu_anthon@mail.com",
    photo: require("./assets/ambalathon.jpg"),
    phone: "+62 812-3456-7890",
    favorite: true,
  },
  {
    name: "SONIC",
    email: "sonicBogor@mail.com",
    photo: require("./assets/sonic.jpg"),
    phone: "+62 813-4567-8901",
    favorite: false,
  },

  {
    name: "Tristan MartabakMAN",
    email: "martabak_wisman@mail.com",
    photo: require("./assets/MartabakTristan.png"),
    phone: "+62 814-5678-9012",
    favorite: true,
  },
  {
    name: "ReinHARD",
    email: "reinjv@mail.com",
    photo: require("./assets/reinhard.jpg"),
    phone: "+62 815-6789-0123",
    favorite: false,
  },
  {
    name: "Pak Vincent",
    email: "sayaAda2@mail.com",
    photo: require("./assets/pak_vincent.jpg"),
    phone: "+62 816-7890-1234",
    favorite: true,
  },
  {
    name: "Bola Reinhard",
    email: "bola_reinhard@mail.com",
    photo: require("./assets/bolaReinhard.png"),
    phone: "+62 817-8901-2345",
    favorite: false,
  },
  {
    name: "Adam Warlock",
    email: "adam_warlock@mail.com",
    photo: require("./assets/adamWarlock.png"),
    phone: "+62 818-9012-3456",
    favorite: false,
  },
  {
    name: "Efri",
    email: "efri@mail.com",
    photo: require("./assets/Efri.png"),
    phone: "+62 819-0123-4567",
    favorite: true,
  },
  {
    name: "IShowSpeed",
    email: "ishowspeed@mail.com",
    photo: require("./assets/IShowSpeed.jpeg"),
    phone: "+62 820-1234-5678",
    favorite: false,
  },
  {
    name: "Roblox",
    email: "roblox@mail.com",
    photo: require("./assets/Roblox.png"),
    phone: "+62 821-2345-6789",
    favorite: true,
  },
];

// Create a custom theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#3F51B5",
    secondary: "#6200EA",
    tertiary: "#03DAC6",
    background: "#F5F5F7",
  },
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(
    useData.reduce((acc, contact) => {
      acc[contact.name] = contact.favorite;
      return acc;
    }, {})
  );
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const onChangeSearch = (query) => setSearchQuery(query);

  const toggleFavorite = (name) => {
    setFavorites({
      ...favorites,
      [name]: !favorites[name],
    });
  };

  const filteredData = useData.filter((data) => {
    const matchesSearch =
      data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (showOnlyFavorites) {
      return matchesSearch && favorites[data.name];
    }
    return matchesSearch;
  });

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />

        <Appbar.Header style={styles.header}>
          <Appbar.Content
            title="Contact List"
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action icon="magnify" onPress={() => {}} />
          <Appbar.Action icon="dots-vertical" onPress={() => {}} />
        </Appbar.Header>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search contacts"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
          />

          <Chip
            selected={showOnlyFavorites}
            onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
            style={styles.favChip}
            icon="star"
            mode={showOnlyFavorites ? "flat" : "outlined"}
          >
            Favorites
          </Chip>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredData.map((data) => (
            <Card style={styles.card} key={data.name}>
              <Card.Title
                title={data.name}
                subtitle={data.email}
                titleStyle={styles.contactName}
                subtitleStyle={styles.contactEmail}
                left={(props) => (
                  <Avatar.Image {...props} source={data.photo} size={60} />
                )}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon={favorites[data.name] ? "star" : "star-outline"}
                    iconColor={favorites[data.name] ? "#FFC107" : "gray"}
                    onPress={() => toggleFavorite(data.name)}
                  />
                )}
              />

              <Card.Content style={styles.cardContent}>
                <View style={styles.contactDetail}>
                  <IconButton
                    icon="phone"
                    size={20}
                    style={styles.contactIcon}
                  />
                  <Text variant="bodyMedium">{data.phone}</Text>
                </View>
                <View style={styles.contactDetail}>
                  <IconButton
                    icon="email"
                    size={20}
                    style={styles.contactIcon}
                  />
                  <Text variant="bodyMedium">{data.email}</Text>
                </View>
              </Card.Content>

              <Card.Actions>
                <IconButton icon="message" />
                <IconButton icon="phone" />
                <IconButton icon="video" />
                <IconButton icon="information" style={{ marginLeft: "auto" }} />
              </Card.Actions>
            </Card>
          ))}
        </ScrollView>

        <FAB icon="plus" style={styles.fab} onPress={() => {}} />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    elevation: 2,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 22,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    elevation: 0,
    backgroundColor: "#F0F0F0",
  },
  favChip: {
    height: 36,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  card: {
    marginVertical: 8,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
  },
  contactName: {
    fontWeight: "bold",
    paddingLeft: 15,
  },
  contactEmail: {
    fontSize: 12,
    paddingLeft: 15,
  },
  cardContent: {
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 0,
    marginLeft: 0,
  },
  contactDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 0,
    marginVertical: -4,
    paddingLeft: 10,
  },
  contactIcon: {
    margin: 0,
    marginRight: 0,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#3F51B5",
  },
});
