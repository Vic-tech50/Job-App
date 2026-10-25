import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "expo-router/js-tabs";
import React from "react";
import { StyleSheet, View } from "react-native";
import FindFreelancers from "../screen/Messenger/Hire";
import ClientDashboard from "../screen/Messenger/Index";
import ClientMessages from "../screen/Messenger/Message";
import ClientPayments from "../screen/Messenger/Payment";
import ClientProfile from "../screen/Messenger/Profile";

// CLIENT SCREENS
// import ClientDashboard from "../screen/Client/Dashboard";
// import ClientGigs from "../screen/Client/Gigs";
// import ClientMessages from "../screen/Client/Messages";
// import ClientPayments from "../screen/Client/Payments";
// import ClientProfile from "../screen/Client/Profile";

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  return (
    <Tab.Navigator
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
          bottom: 15,
          left: 15,
          right: 15,
          height: 72,

          borderRadius: 22,

          backgroundColor: "#FFFFFF",

          borderTopWidth: 0,

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
          let iconName: any;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "view-dashboard" : "view-dashboard-outline";
              break;

            case "Hire":
              iconName = focused ? "account-search" : "account-search-outline";
              break;

            case "Messages":
              iconName = focused ? "message-text" : "message-text-outline";
              break;

            case "Payments":
              iconName = focused ? "credit-card" : "credit-card-outline";
              break;

            case "Profile":
              iconName = focused ? "account" : "account-outline";
              break;

            default:
              iconName = "circle";
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIconContainer,
              ]}
            >
              <MaterialCommunityIcons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      {/* DASHBOARD */}
      <Tab.Screen
        name="Dashboard"
        component={ClientDashboard}
        options={{
          headerTitle: "Client Dashboard",
        }}
      />

      <Tab.Screen
        name="Hire"
        component={FindFreelancers}
        options={{
          headerTitle: "Find Freelancers",
        }}
      />

      <Tab.Screen
        name="Payments"
        component={ClientPayments}
        options={{
          headerTitle: "Payments",
        }}
      />

      <Tab.Screen
        name="Messages"
        component={ClientMessages}
        options={{
          headerTitle: "Messages",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ClientProfile}
        options={{
          headerTitle: "Profile",
        }}
      />

      {/* PROJECTS / GIGS
     

      {/* MESSAGES *
     
      {/* PAYMENTS *
      <Tab.Screen
        name="Payments"
        component={ClientPayments}
        options={{
          headerTitle: "Payments",
        }}
      />

      {/* PROFILE *
       */}
    </Tab.Navigator>
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
