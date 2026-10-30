import { Stack } from "expo-router";
import Toast from "react-native-toast-message";


export default function RootLayout() {
  return (
    <>
    <Stack
      initialRouteName="screen/Template/Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LoginScreen" options={{}} />
      <Stack.Screen name="(Messenger)" options={{ headerShown: false }} />
      <Stack.Screen name="(Worker)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="screen/template/home" /> */}

    </Stack>
      <Toast />
      </>
  );
}
