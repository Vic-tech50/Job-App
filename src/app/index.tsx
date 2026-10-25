import { Text, View, StyleSheet } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import App from "./App";

export default function Index() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}


