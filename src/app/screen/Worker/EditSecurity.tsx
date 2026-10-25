import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
// import { Button, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage"; //npm expo install @react-native-async-storage/async-storage  very important for loging out
import { Button, TextInput } from "react-native-paper";
import { api } from "../../config";

export default function EditSecurity({ navigation }: any) {
  const [user, setUser] = React.useState<any>(null);
  const [currentPassword, setcurrentPassword] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.log("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  const resetForm = () => {
    setcurrentPassword("");
    setnewPassword("");
    setconfirmPassword("");
  };

  const logout = async () => {
    try {
      // Remove stored auth data
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // Reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  const updateSecurity = async () => {
    try {
      const response = await fetch(`${api}/users/updatesecurity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert(
          "Error",
          data.message || "Failed to update security settings.",
        );
      } else {
        Alert.alert("Success", data.message);
        resetForm();
        logout();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* HEADER */}
      <Text style={styles.title}>Edit Security </Text>
      <Text style={styles.subtitle}>Update your freelancer information</Text>

      {/* FORM CARD */}
      <View style={styles.card}>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setcurrentPassword}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          secureTextEntry={true}
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setnewPassword}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          secureTextEntry={true}
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setconfirmPassword}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          secureTextEntry={true}
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        {/* SAVE BUTTON */}
        <Button
          mode="contained"
          buttonColor="#2563EB"
          textColor="white"
          style={[styles.button]}
          onPress={updateSecurity}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
  },

  subtitle: {
    color: "#94A3B8",
    marginBottom: 20,
  },

  imageBox: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#2563EB",
  },

  changePhoto: {
    color: "#2563EB",
    marginTop: 8,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
  },

  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
    // color: "#0F172A",
  },

  button: {
    marginTop: 10,
    paddingVertical: 5,
    color: "white",
  },

  radioCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginTop: 5,
  },

  genderTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#0F172A",
  },

  radioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
});
