import { ToastMess } from "@/src/utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../../config";

// Inside your login component:

export default function Login({ navigation }: any) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const loginData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(api + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // ✅ Read as text first — safe for any response type
      const text = await response.text();

      // ✅ Debug log — remove after fixing
      console.log("Status:", response.status);
      console.log("Raw response:", text);

      // ✅ Check 429 before parsing
      if (response.status === 429) {
        Alert.alert("Too Many Requests", "Too many attempts. Please wait.");
        return;
      }

      // ✅ Safely parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert("Error", "Server returned an unexpected response.");
        console.error("Non-JSON response:", text);
        return;
      }

      if (!response.ok) {
        // Alert.alert("Error", data.message || "Login failed. Try again.");
        // Toast.show({
        //   type: "error",
        //   text1: "Login Failed",
        //   text2: data.message || "Please try again.",
        // });
        ToastMess({
          type: "error",
          title: "Login Failed",
          content: data.message || "Please try again.",
        });
        return;
      }

      // ✅ Validate token and user exist before navigating
      if (!data.token || !data.user) {
        Alert.alert("Error", "Invalid response from server.");
        return;
      }

      if (data.user.status !== 1 && data.user.role == "Worker") {
        Alert.alert("Success", data.message || "Login successful!");
        router.push({
          pathname: "/screen/Template/WizardFormScreen" as any,
          params: {
            user: JSON.stringify(data.user),
            token: data.access_token ?? data.token,
          },
        });
        // navigation.navigate("WizardForm", {
        //   user: data.user,
        //   token: data.token,
        // });
      } else if (data.user.status == 1 && data.user.role == "Worker") {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);
        Alert.alert("Success", data.message || "Login successful!");
        // navigation.navigate("MyTabs");
        router.replace("/(Worker)");
      } else {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);

        ToastMess({
          type: "success",
          title: "Login Successful",
          content: data.message || "Login Successfull.",
        });
        // navigation.navigate("MyTabs");
        router.replace("/(Messenger)");
      }
      console.log("Logged in user:", data.user);
    } catch (err: any) {
      // ✅ Friendlier network error message
      if (err.message === "Network request failed") {
        Alert.alert(
          "Network Error",
          "Cannot reach server. Check your connection.",
        );
      } else {
        Alert.alert("Error", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0F172A", "#1E293B", "#334155"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.keyboardContainer}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>
            Login to continue using your account
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login</Text>

          <TextInput
            label="Email Address"
            mode="outlined"
            value={email}
            textColor="black"
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            outlineStyle={{ borderRadius: 14 }}
            theme={{
              colors: {
                primary: "#2563EB",
                outline: "#CBD5E1",
                background: "#FFFFFF",
              },
            }}
            left={<TextInput.Icon icon="email-outline" />}
          />

          <TextInput
            label="Password"
            mode="outlined"
            textColor="black"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            outlineStyle={{ borderRadius: 14 }}
            theme={{
              colors: {
                primary: "#2563EB",
                outline: "#CBD5E1",
                background: "#FFFFFF",
              },
            }}
            left={<TextInput.Icon icon="lock-outline" />}
            right={<TextInput.Icon icon="eye-off-outline" />}
          />

          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            style={styles.button}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            buttonColor="#2563EB"
            disabled={loading}
            onPress={loginData}
          >
            {loading ? "Login..." : "Login"}
          </Button>

          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don’t have an account?</Text>

            <TouchableOpacity>
              <Link
                href="/screen/Auth/RegisterScreen"
                style={styles.registerLink}
              >
                {" "}
                Register
              </Link>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  topSection: {
    marginBottom: 30,
  },

  welcomeText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  subText: {
    fontSize: 16,
    color: "#CBD5E1",
    lineHeight: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  cardTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 24,
  },

  input: {
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },

  forgotText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  button: {
    borderRadius: 14,
    marginBottom: 24,
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  registerText: {
    color: "#64748B",
    fontSize: 15,
  },

  registerLink: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
});
