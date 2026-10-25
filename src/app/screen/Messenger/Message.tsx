import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ClientMessages({ navigation }: any) {
  const chats = [
    {
      id: 1,
      name: "John Dev",
      lastMessage: "I’ve finished the API integration.",
      time: "2m ago",
      unread: 2,
      online: true,
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
      id: 2,
      name: "Sarah Design",
      lastMessage: "Can you review the new UI?",
      time: "1h ago",
      unread: 0,
      online: false,
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    {
      id: 3,
      name: "Victor Okenyi",
      lastMessage: "Project update sent 🚀",
      time: "Yesterday",
      unread: 1,
      online: true,
      avatar: "https://i.pravatar.cc/150?img=12",
    },
  ];

  return (
    <LinearGradient
      colors={["#0F172A", "#1E293B", "#334155"]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>

        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="message-plus-outline"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR (UI ONLY) */}
      <View style={styles.searchBox}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#94A3B8"
        />
        <Text style={styles.searchText}>
          Search conversations...
        </Text>
      </View>

      {/* CHAT LIST */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatCard}
            onPress={() =>
              navigation.navigate("ChatScreen", {
                user: chat.name,
              })
            }
          >
            {/* AVATAR */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: chat.avatar }}
                style={styles.avatar}
              />

              {chat.online && (
                <View style={styles.onlineDot} />
              )}
            </View>

            {/* INFO */}
            <View style={styles.middle}>
              <Text style={styles.name}>
                {chat.name}
              </Text>

              <Text
                style={styles.message}
                numberOfLines={1}
              >
                {chat.lastMessage}
              </Text>
            </View>

            {/* RIGHT SIDE */}
            <View style={styles.right}>
              <Text style={styles.time}>
                {chat.time}
              </Text>

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },

  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 14,
    marginBottom: 15,
  },

  searchText: {
    marginLeft: 8,
    color: "#94A3B8",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
  },

  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },

  middle: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  message: {
    color: "#64748B",
    marginTop: 4,
  },

  right: {
    alignItems: "flex-end",
  },

  time: {
    fontSize: 12,
    color: "#94A3B8",
  },

  badge: {
    marginTop: 6,
    backgroundColor: "#2563EB",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});