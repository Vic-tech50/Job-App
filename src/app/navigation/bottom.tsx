import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "expo-router/js-tabs";
import { View } from "react-native";
import Gigs from "../(Worker)/Gigs";
import Messages from "../(Worker)/Message";
import Profile from "../(Worker)/Profile";
import WorkerIndex from "../screen/Worker/Index";

const Tab = createBottomTabNavigator();

export default function WorkerTabs() {
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

        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Dashboard") {
            iconName = "view-dashboard-outline";
          } else if (route.name === "Work") {
            iconName = "briefcase-outline";
          } else if (route.name === "Messages") {
            iconName = "chat-outline";
          } else if (route.name === "Earnings") {
            iconName = "cash-multiple";
          } else if (route.name === "Profile") {
            iconName = "account-outline";
          }

          return (
            <View>
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={WorkerIndex}
        options={{ headerTitle: "Welcome Back" }}
      />
      <Tab.Screen name="Work" component={Gigs} />
      <Tab.Screen name="Messages" component={Messages} />
      {/* <Tab.Screen name="Earnings" component={Earnings} /> */}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
