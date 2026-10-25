import AsyncStorage from "@react-native-async-storage/async-storage"; //npm expo install @react-native-async-storage/async-storage  very important for loging out
import * as React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Profile({ navigation }: any) {
  const [user, setUser] = React.useState<any>(null);

  

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.log("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    try {
      // Remove stored auth data
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // Reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user?.fullname}</Text>

        <Text style={styles.role}>
          Full Stack Freelancer •{" "}
          <Text style={{ color: "#16A34A" }}>Verified ✓</Text>{" "}
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Jobs</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>$1.2K</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>

      {/* SKILLS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skills</Text>

        <View style={styles.skills}>
          {["React Native", "Laravel", "Node.js", "UI/UX", "Firebase"].map(
            (skill, i) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ),
          )}
        </View>
      </View>

      {/* PORTFOLIO */}
      {/* <View style={styles.card}>
        <Text style={styles.sectionTitle}>Portfolio</Text>

        <View style={styles.portfolioBox}>
          <Text style={{ color: "#94A3B8" }}>No portfolio uploaded yet</Text>
        </View>

        <Button
          mode="contained"
          buttonColor="#2563EB"
          style={{ marginTop: 15 }}
        >
          Upload Work
        </Button>
      </View> */}

      {/* ACTIONS */}
      <View style={styles.card}>
        {/* EDIT PROFILE */}
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <View style={styles.listLeft}>
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={22}
              color="#2563EB"
            />

            <Text style={styles.listText}>Edit Profile</Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#94A3B8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate("EditSecurity")}
        >
          <View style={styles.listLeft}>
            <MaterialCommunityIcons name="security" size={22} color="#2563EB" />

            <Text style={styles.listText}>Security</Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#94A3B8"
          />
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.listItem} onPress={logout}>
          <View style={styles.listLeft}>
            <MaterialCommunityIcons name="logout" size={22} color="#DC2626" />

            <Text style={[styles.listText, { color: "#DC2626" }]}>Logout</Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#94A3B8"
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  listLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  listText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  scroll: {
    padding: 20,
    paddingTop: 60,
  },

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#2563EB",
    marginBottom: 10,
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
  },

  role: {
    color: "#94A3B8",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 10,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0F172A",
  },

  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  skillChip: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    margin: 4,
  },

  skillText: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "500",
  },

  portfolioBox: {
    height: 80,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
