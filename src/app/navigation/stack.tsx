// import { createStackNavigator } from "@react-navigation/stack";
import { createStackNavigator } from "expo-router/js-stack";
import FindFreelancers from "../(Messenger)/Hire";
import Login from "../screen/Auth/LoginScreen";
import Register from "../screen/Auth/RegisterScreen";
import Home from "../screen/Template/Home";
import EditProfile from "../screen/Worker/EditProfile";
import EditSecurity from "../screen/Worker/EditSecurity";
import MyTabs from "./bottom";
import MessengerTabs from "./MessengerBottom";

const Stack = createStackNavigator();

export default function MyStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      {/* <Stack.Screen name="WizardForm" component={WizardForm} /> */}
      <Stack.Screen name="MyTabs" component={MyTabs} />
      <Stack.Screen name="MessengerTabs" component={MessengerTabs} />
      <Stack.Screen name="FindFreelancers" component={FindFreelancers} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: true, headerTitle: "Edit Profile" }}
      />

      <Stack.Screen
        name="EditSecurity"
        component={EditSecurity}
        options={{ headerShown: true, headerTitle: "Edit Security" }}
      />
    </Stack.Navigator>
  );
}
