import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
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
