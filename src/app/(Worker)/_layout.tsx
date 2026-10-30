import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
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
        
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Your Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Gigs"
        options={{
          title: "Skills",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="briefcase" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Message"
        options={{
          title: "Message",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="envelope" color={color} />
          ),
        }}
      />

       <Tabs.Screen
        name="Profile"
        options={{
          title: "Me",
          headerTitle: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
