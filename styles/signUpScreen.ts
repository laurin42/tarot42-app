import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  signInLinkContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  signInLinkText: {
    color: "blue",
  },
  signInLinkTextBold: {
    fontWeight: "bold",
  },
});
