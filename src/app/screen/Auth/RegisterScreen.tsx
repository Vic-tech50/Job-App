import { ToastMess } from "@/src/utils/toast";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../../config";

export default function Register({ navigation }: any) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const resetForm = () => {
    setName("");
    setPassword("");
    setRole("");
    setEmail("");
  };

  const registerData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(api + "/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        ToastMess({
          type: "error",
          title: "Registration Failed",
          content: data.message || "Please try again.",
        });
      } else {
        ToastMess({
          type: "success",
          title: "Registration Successful",
          content: data.message || "Registration Successful.",
        });
        resetForm();
        router.replace("/screen/Auth/LoginScreen");
      }
    } catch (err: any) {
      ToastMess({
        type: "error",
        title: "Something is wrong",
        content: err.message || "Please try again.",
      });
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
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <Text style={styles.welcomeText}>Create Account</Text>

          <Text style={styles.subText}>
            Join us and start your journey today
          </Text>
        </View>

        {/* Card Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register</Text>

          <TextInput
            label="Full Name"
            mode="outlined"
            textColor="black"
            value={name}
            onChangeText={setName}
            style={styles.input}
            outlineStyle={{ borderRadius: 14 }}
            theme={{
              colors: {
                primary: "#2563EB",
                outline: "#CBD5E1",
                background: "#FFFFFF",
              },
            }}
            left={<TextInput.Icon icon="account-outline" />}
          />

          <TextInput
            label="Email Address"
            mode="outlined"
            value={email}
            textColor="black"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
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

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              style={{ height: 50, width: "100%" }}
              onValueChange={(itemValue) => setRole(itemValue)}
              // dropdownIconColor={"blue"}
              // left={<TextInput.Icon icon="lock-outline" />}
            >
              <Picker.Item label="Select Role" value="" />
              <Picker.Item label="Messenger" value="Messenger" />
              <Picker.Item label="Worker" value="Worker" />
            </Picker>
          </View>

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

          <Button
            mode="contained"
            buttonColor="#2563EB"
            style={styles.button}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            onPress={registerData}
            disabled={loading}
          >
            {loading ? "Creating..." : " Create Account"}
          </Button>

          {/* Login Redirect */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>

            <TouchableOpacity>
              <Link href="/screen/Auth/LoginScreen" style={styles.loginLink}>
                {" "}
                Login
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

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
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

  button: {
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 24,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: "#64748B",
    fontSize: 15,
  },

  loginLink: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
});
