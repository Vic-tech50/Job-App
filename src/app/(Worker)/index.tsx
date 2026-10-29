import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  //   Text,
  TouchableOpacity,
} from "react-native";
import { HelloWave } from '@/components/ui/hello-wave';
// import { LinearGradient } from "expo-linear-gradient";

export function CardStats() {
  const stats = [
    { title: "Skills", value: "2" },
    { title: "New Message", value: "0" },
  ];
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 10,
      }}
    >
      {stats.map((stat, index) => (
        <Card key={index} style={{ flex: 1, minWidth: 150 }}>
          <CardHeader>
            <CardTitle style={{ fontSize: 16 }}>{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
              {stat.value}
            </Text>
            {/* <Text style={{ color: "#22c55e", fontSize: 14 }}>
              {stat.change} from last month
            </Text> */}
          </CardContent>
        </Card>
      ))}
    </View>
  );
}

export default function WorkerIndex({ route, navigation }: any) {
  const user = route?.params?.user;
  const [earnings, setEarnings] = useState(0);
  const [portfolioUploaded, setPortfolioUploaded] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    setEarnings(1250.5);
  }, []);

  //   useEffect(() => {
  //     const gigTimer = setTimeout(() => {
  //       setNotifications((prev) => [
  //         ...prev,
  //         "New gig available: Web Design Project",
  //       ]);
  //       Alert.alert("New Gig!", "A new gig has been posted for you.");
  //     }, 3000);

  //     return () => clearTimeout(gigTimer);
  //   }, []);

  //   useEffect(() => {
  //     const msgTimer = setTimeout(() => {
  //       setMessages((prev) => [...prev, "You have a new message from Client"]);
  //       Alert.alert("New Message!", "You have received a new message.");
  //     }, 5000);

  //     return () => clearTimeout(msgTimer);
  //   }, []);

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
      <Text style={styles.title}>Welcome <HelloWave>👋</HelloWave> {user?.fullname || "Worker"}</Text>
      <Text style={styles.subtitle}>Manage your gigs, earnings & activity</Text>

      {/* Earnings Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Earnings</Text>
        <Text style={styles.earnings}>${earnings.toFixed(2)}</Text>
      </View>

      <CardStats />

      {/* Portfolio */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Skills</Text>

        <TouchableOpacity
          onPress={handleUploadPortfolio}
          style={[
            styles.button,
            {
              backgroundColor: portfolioUploaded ? "#16A34A" : "#2563EB",
            },
          ]}
        >
          <Text style={styles.buttonText}>
            {portfolioUploaded ? "Skill Added ✓" : "Add Skill"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      {/* <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Gig Notifications ({notifications.length})
        </Text>

        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No new notifications</Text>
        ) : (
          notifications.map((n, i) => (
            <Text key={i} style={styles.itemText}>
              • {n}
            </Text>
          ))
        )}
      </View> */}

      {/* Messages */}
      {/* <View style={styles.card}>
        <Text style={styles.cardTitle}>Messages ({messages.length})</Text>

        {messages.length === 0 ? (
          <Text style={styles.emptyText}>No new messages</Text>
        ) : (
          messages.map((m, i) => (
            <Text key={i} style={styles.itemText}>
              • {m}
            </Text>
          ))
        )}
      </View> */}
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
    paddingTop: 40,
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
