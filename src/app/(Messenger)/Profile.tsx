import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ClientProfile({ navigation }: any) {

  // Inside your component:
const router = useRouter();

const logout = async () => {
  try {
    // Remove the stored authentication data.
    await AsyncStorage.multiRemove(["token", "user"]);

    // Navigate to the login screen using Expo Router.
    router.replace("/screen/Auth/LoginScreen");
  } catch (error) {
    // Log any errors that occur during logout.
    console.log("Logout Error:", error);
  }
};

  return (
    <LinearGradient
      colors={["#0F172A", "#1E293B", "#334155"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE HEADER */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: "https://i.pravatar.cc/300?img=12",
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>
            Victor Okenyi
          </Text>

          <Text style={styles.email}>
            victor@gmail.com
          </Text>

          <View style={styles.badge}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={16}
              color="#fff"
            />

            <Text style={styles.badgeText}>
              Verified Client
            </Text>
          </View>
        </View>

        {/* ACCOUNT STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              18
            </Text>

            <Text style={styles.statLabel}>
              Projects
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              45
            </Text>

            <Text style={styles.statLabel}>
              Freelancers
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              $4.2K
            </Text>

            <Text style={styles.statLabel}>
              Spent
            </Text>
          </View>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() =>
              navigation.navigate("EditClientProfile")
            }
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="account-edit-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.menuText}>
                Edit Profile
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.menuText}>
                Security
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.menuText}>
                Notifications
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* BUSINESS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Business
          </Text>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.menuText}>
                Posted Projects
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="credit-card-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.menuText}>
                Payment Methods
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.menuText}>
                Invoices
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons
            name="logout"
            size={22}
            color="#fff"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    padding: 20,
    paddingBottom: 120,
  },

  profileHeader: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#2563EB",
    marginBottom: 15,
  },

  name: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  email: {
    color: "#CBD5E1",
    marginTop: 5,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
    marginTop: 12,
  },

  badgeText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    backgroundColor: "#fff",
    width: "31%",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },

  statLabel: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 12,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  logoutBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 18,
    paddingVertical: 16,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 10,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },
});