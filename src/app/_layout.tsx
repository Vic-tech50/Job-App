import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" options={{}} />
      <Stack.Screen name="(Messenger)" options={{ headerShown: false }} />
      <Stack.Screen name="(Worker)" options={{ headerShown: false }} />
    </Stack>
  );
}
