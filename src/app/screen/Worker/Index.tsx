import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-paper";

export default function WorkerIndex({route, navigation}: any) {
  const user = route?.params?.user;
  const [earnings, setEarnings] = useState(0);
  const [portfolioUploaded, setPortfolioUploaded] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    setEarnings(1250.5);
  }, []);

  useEffect(() => {
    const gigTimer = setTimeout(() => {
      setNotifications((prev) => [
        ...prev,
        "New gig available: Web Design Project",
      ]);
      Alert.alert("New Gig!", "A new gig has been posted for you.");
    }, 3000);

    return () => clearTimeout(gigTimer);
  }, []);

  useEffect(() => {
    const msgTimer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        "You have a new message from Client",
      ]);
      Alert.alert("New Message!", "You have received a new message.");
    }, 5000);

    return () => clearTimeout(msgTimer);
  }, []);

  const handleUploadPortfolio = () => {
    setPortfolioUploaded(true);
    Alert.alert("Success", "Portfolio uploaded successfully!");
  };

  return (
    // <LinearGradient
    //   colors={["#0F172A", "#1E293B", "#334155"]}
    //   style={styles.container}
    // >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>Worker {user?.fullname || "Dashboard"}</Text>
        <Text style={styles.subtitle}>
          Manage your gigs, earnings & activity
        </Text>

        {/* Earnings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Earnings</Text>
          <Text style={styles.earnings}>
            ${earnings.toFixed(2)}
          </Text>
        </View>

        {/* Portfolio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio</Text>

          <TouchableOpacity
            onPress={handleUploadPortfolio}
            style={[
              styles.button,
              {
                backgroundColor: portfolioUploaded
                  ? "#16A34A"
                  : "#2563EB",
              },
            ]}
          >
            <Text style={styles.buttonText}>
              {portfolioUploaded
                ? "Portfolio Uploaded ✓"
                : "Upload Portfolio"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Gig Notifications ({notifications.length})
          </Text>

          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>
              No new notifications
            </Text>
          ) : (
            notifications.map((n, i) => (
              <Text key={i} style={styles.itemText}>
                • {n}
              </Text>
            ))
          )}
        </View>

        {/* Messages */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Messages ({messages.length})
          </Text>

          {messages.length === 0 ? (
            <Text style={styles.emptyText}>
              No new messages
            </Text>
          ) : (
            messages.map((m, i) => (
              <Text key={i} style={styles.itemText}>
                • {m}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    // </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
  },

  subtitle: {
    fontSize: 14,
    color: "#0b0b0c",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0F172A",
  },

  earnings: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#16A34A",
  },

  button: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  itemText: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
  },
});