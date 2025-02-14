import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";

export default function App() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Image
          style={styles.profileImage}
          source={require("./assets/ambalathon.jpg")}
        />
        <Text style={styles.name}>Ambalathon</Text>
        <Text style={styles.description}>
          Hi i'm Ambalathon, sebuah anomali beruang.
        </Text>
        <StatusBar style="auto" />
      </View>

      <View style={styles.container}>
        <Image
          style={styles.profileImage}
          source={require("./assets/sonic.jpg")}
        />
        <Text style={styles.name}>Sonic The Hedgehog</Text>
        <Text style={styles.description}>
          Hi i'm Sonic The Hedgehog, the fastest hedgehog alive.
        </Text>
        <StatusBar style="auto" />
      </View>

      <View style={styles.container}>
        <Image
          style={styles.profileImage}
          source={require("./assets/pak vincent.jpg")}
        />
        <Text style={styles.name}>Pak Vincent</Text>
        <Text style={styles.description}>
          Hi i'm Pak Vincent, sebenarnya saya ada dua.
        </Text>
        <StatusBar style="auto" />
      </View>

      <View style={styles.container}>
        <Image
          style={styles.profileImage}
          source={require("./assets/reinhard.jpg")}
        />
        <Text style={styles.name}>Reinhard</Text>
        <Text style={styles.description}>
          Hi i'm Reinhard, saya suka main roblox terutama CDID.
        </Text>
        <StatusBar style="auto" />
      </View>

      <View style={styles.container}>
        <Image
          style={styles.profileImage}
          source={require("./assets/MartabakTristan.png")}
        />
        <Text style={styles.name}>Tristan</Text>
        <Text style={styles.description}>
          Hi i'm Tristan, saya suka makan martabak.
        </Text>
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 20,
    marginTop: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 3,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
  },
});
