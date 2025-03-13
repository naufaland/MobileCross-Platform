import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
});

export default styles;
