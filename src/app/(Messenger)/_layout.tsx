
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";

// Define the tab icons.
const tabIcons: Record<string, [string, string]> = {
  index: ["view-dashboard", "view-dashboard-outline"],
  Hire: ["account-search", "account-search-outline"],
  Message: ["message-text", "message-text-outline"],
  // Payment: ["credit-card", "credit-card-outline"],
  Profile: ["account", "account-outline"],
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "#0F172A",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },

        headerTintColor: "#fff",

        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
        },

        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 15,
          right: 15,
          height: 72,
          borderRadius: 22,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          marginHorizontal: 50,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 10,

          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },

        tabBarIcon: ({ focused, color }) => {
          const iconName =
            tabIcons[route.name]?.[focused ? 0 : 1] ?? "circle";

          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIconContainer,
              ]}
            >
              <MaterialCommunityIcons
                name={iconName as any}
                size={24}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home" }}
      />

      <Tabs.Screen
        name="Hire"
        options={{ title: "Hire" }}
      />

      <Tabs.Screen
        name="Message"
        options={{ title: "Messages" }}
      />

      {/* <Tabs.Screen
        name="Payment"
        options={{ title: "Payments" }}
      /> */}

      <Tabs.Screen
        name="Profile"
        options={{ title: "Profile" }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 23,
  },

  activeIconContainer: {
    backgroundColor: "#DBEAFE",
  },
});
