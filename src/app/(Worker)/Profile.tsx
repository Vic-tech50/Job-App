
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../config";

// Define the artisan profile structure.
interface User {
  id?: number | string;
  fullname?: string;
  name?: string;
  occupation?: string;
  profession?: string;
  email?: string;
  phone?: string;
  profile_photo?: string;
  profile_picture?: string;
  avatar?: string;
  state?: string;
  lga?: string;
  street?: string;
  skills?: string[] | string;
  bio?: string;
  rating?: number;
  total_jobs?: number;
}

export default function Profile() {
  const router = useRouter();

  // Store profile information.
  const [user, setUser] = useState<User | null>(null);

  // Track loading and refreshing.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load the artisan's profile.
  const loadUser = useCallback(async () => {
    try {
      // Get locally stored user information.
      const storedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Fetch the latest profile from your backend.
      if (token) {
        const response = await fetch(`${api}/api/getWorkerData`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok) {
          const profile =
            result.data?.worker ||
            result.worker ||
            result.data ||
            result;

          if (profile && typeof profile === "object") {
            setUser(profile);

            // Keep the local profile updated.
            await AsyncStorage.setItem("user", JSON.stringify(profile));
          }
        }
      }
    } catch (error) {
      console.log("Profile loading error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Refresh the profile.
  const onRefresh = () => {
    setRefreshing(true);
    loadUser();
  };

  // Log the artisan out.
  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["token", "user"]);
              router.replace("/screen/Auth/LoginScreen");
            } catch (error) {
              console.log("Logout error:", error);
              Alert.alert("Error", "Unable to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Get the user's display name.
  const fullName = user?.fullname || user?.name || "Artisan";

  // Get the user's profession.
  const profession = user?.occupation || user?.profession || "Professional Artisan";

  // Get the profile picture.
  const avatar =
    user?.profile_photo ||
    user?.profile_picture ||
    user?.avatar;

  // Convert skills into an array.
  const skills = Array.isArray(user?.skills)
    ? user.skills
    : typeof user?.skills === "string"
      ? user.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      : [];

  // Get the user's location.
  const location = [
    user?.lga,
    user?.state,
  ].filter(Boolean).join(", ");

  // Reusable settings menu item.
  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIcon,
          danger && styles.dangerIcon,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={danger ? "#DC2626" : "#2563EB"}
        />
      </View>

      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={23}
        color="#94A3B8"
      />
    </TouchableOpacity>
  );

  // Display loading indicator while retrieving profile.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.pageTitle}>My Profile</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/screen/Worker/EditProfile")}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={19}
              color="#2563EB"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons
                name="account"
                size={55}
                color="#64748B"
              />
            </View>
          )}

          <View style={styles.onlineIndicator} />
        </View>

        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.profession}>{profession}</Text>

        {user?.email ? (
          <Text style={styles.email}>{user.email}</Text>
        ) : null}

        {location ? (
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={17}
              color="#64748B"
            />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        ) : null}

        <View style={styles.profileBadge}>
          <MaterialCommunityIcons
            name="account-check"
            size={15}
            color="#15803D"
          />
          <Text style={styles.profileBadgeText}>Artisan Account</Text>
        </View>
      </View>

      {/* Profile information */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About Me</Text>

          <TouchableOpacity
            onPress={() => router.push("/screen/Worker/EditProfile")}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.bioText}>
          {user?.bio || "Add a short description about yourself, your experience and the services you offer."}
        </Text>

        <View style={styles.divider} />

        <View style={styles.contactRow}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={19}
            color="#64748B"
          />
          <Text style={styles.contactText}>
            {user?.phone || "Phone number not added"}
          </Text>
        </View>

        <View style={styles.contactRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={19}
            color="#64748B"
          />
          <Text style={styles.contactText}>
            {user?.street || "Street address not added"}
          </Text>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Skills</Text>

        {skills.length > 0 ? (
          <View style={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <View key={`${skill}-${index}`} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            No skills added yet. Update your profile to showcase your skills.
          </Text>
        )}
      </View>

      {/* Professional information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Professional Information</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="briefcase-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.infoLabel}>Profession</Text>
            <Text style={styles.infoValue}>{profession}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.infoLabel}>Service Location</Text>
            <Text style={styles.infoValue}>
              {location || "Location not added"}
            </Text>
          </View>
        </View>
      </View>

      {/* Account settings */}
      <Text style={styles.groupTitle}>ACCOUNT SETTINGS</Text>

      <View style={styles.card}>
        <MenuItem
          icon="account-edit-outline"
          title="Edit Profile"
          subtitle="Update your personal and professional details"
          onPress={() => router.push("/screen/Worker/EditProfile")}
        />

        <MenuItem
          icon="shield-lock-outline"
          title="Security"
          subtitle="Change your password and protect your account"
          onPress={() => router.push("/screen/Worker/EditSecurity")}
        />

        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get assistance with your account"
          onPress={() => Alert.alert("Help & Support", "Support options will be available here.")}
        />

        <MenuItem
          icon="logout"
          title="Logout"
          subtitle="Sign out of your account"
          danger
          onPress={logout}
        />
      </View>

      <Text style={styles.footer}>
        Your work. Your reputation. Your opportunities.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FB",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },

  header: {
    alignItems: "center",
    marginBottom: 22,
  },

  headerTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  pageTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },

  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },

  onlineIndicator: {
    position: "absolute",
    bottom: 7,
    right: 5,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  profession: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 5,
  },

  email: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  locationText: {
    color: "#64748B",
    fontSize: 13,
    marginLeft: 4,
  },

  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 13,
  },

  profileBadgeText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EDF1F6",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  editText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },

  bioText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF1F6",
    marginVertical: 15,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  contactText: {
    color: "#475569",
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  skillChip: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 9,
  },

  skillText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 21,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },

  groupTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 3,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  menuIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIcon: {
    backgroundColor: "#FEF2F2",
  },

  menuContent: {
    flex: 1,
    marginLeft: 13,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  menuSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },

  dangerText: {
    color: "#DC2626",
  },

  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 10,
  },
});
