import { StyleSheet, ViewStyle, TextStyle } from "react-native";


interface Styles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  progressBarContainer: ViewStyle;
  progressText: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  wheelContainer: ViewStyle;
  navigationButtons: ViewStyle;
  button: ViewStyle;
  skipButton: ViewStyle;
  nextButton: ViewStyle;
  buttonText: TextStyle;
}

export const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
  },
  loadingText: {
    color: "#E0E0E0",
    marginTop: 10,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: "#E0E0E0",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#AEAEAE",
    marginBottom: 20, // Reduced margin slightly
    textAlign: "center",
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, // Reduced margin slightly
    // width and height are now set dynamically via inline style
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    position: "absolute",
    bottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  skipButton: {
    backgroundColor: "#4A403D",
  },
  nextButton: {
    backgroundColor: "#6A5ACD",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
