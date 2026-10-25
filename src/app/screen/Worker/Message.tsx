import React from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Messages({ navigation }: any) {
  const chats = [
    {
      name: "John Client",
      lastMessage: "Can you finish the project today?",
      unread: 2,
    },
    {
      name: "Sarah Agency",
      lastMessage: "We reviewed your proposal 👍",
      unread: 0,
    },
    {
      name: "Tech Startup",
      lastMessage: "Send your portfolio please",
      unread: 1,
    },
  ];

  return (
   
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          Your client conversations
        </Text>

        {chats.map((chat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() =>
              navigation.navigate("Chat", { user: chat.name })
            }
          >
            <View style={styles.row}>
              <View style={styles.avatar} />

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {chat.name}
                </Text>

                <Text style={styles.message}>
                  {chat.lastMessage}
                </Text>
              </View>

              {chat.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {chat.unread}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
  
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    color: "#94A3B8",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#CBD5E1",
    marginRight: 12,
  },

  name: {
    fontWeight: "700",
    color: "#0F172A",
  },

  message: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 3,
  },

  badge: {
    backgroundColor: "#2563EB",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});