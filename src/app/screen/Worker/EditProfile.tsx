import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, RadioButton, TextInput } from "react-native-paper";
import { api } from "../../config";

export default function EditProfile({ route }: any) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [checked, setChecked] = React.useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const user = JSON.parse(storedUser);

          setName(user.fullname || "");
          setId(user.id || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setState(user.state || "");
          setLga(user.lga || "");
          setStreet(user.street || "");
          setChecked(user.gender || "");
          setDateOfBirth(user.dob || "");
        }
      } catch (error) {
        console.log("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const updateData = async () => {
    try {
      const response = await fetch(`${api}/users/updateprofile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          fullname: name,
          email: email,
          phoneNumber: phone,
          dateOfBirth: dateOfBirth,
          gender: checked,
          state: state,
          lga: lga,
          streetAddress: street,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to update profile");
      } else {
        Alert.alert("Success", data.message);

        console.log("Updated user:", data.user);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* HEADER */}
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.subtitle}>Update your freelancer information</Text>

      {/* PROFILE IMAGE */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />

        <Text style={styles.changePhoto}>Change Profile Photo</Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        <TextInput
          label="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        <TextInput
          label="Date of Birth (YYYY-MM-DD)"
          keyboardType="phone-pad"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        <TextInput
          label="State Of Residence"
          value={state}
          onChangeText={setState}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        <TextInput
          label="Local Government Area"
          value={lga}
          onChangeText={setLga}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        <TextInput
          label="Street Address"
          value={street}
          onChangeText={setStreet}
          style={styles.input}
          mode="outlined"
          textColor="black"
          outlineColor="blue"
          outlineStyle={{ borderRadius: 5, borderColor: "#2563EB" }}
        />

        {/* Gender */}
        <View style={styles.radioCard}>
          <Text style={styles.genderTitle}>Select Gender</Text>

          <RadioButton.Group
            onValueChange={(value) => setChecked(value)}
            value={checked}
          >
            <View style={styles.radioRow}>
              <View style={styles.radioItem}>
                <RadioButton value="Male" color="#2563EB" />
                <Text>Male</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="Female" color="#2563EB" />
                <Text>Female</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="Other" color="#2563EB" />
                <Text>Other</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>

        {/* SAVE BUTTON */}
        <Button
          mode="contained"
          buttonColor="#2563EB"
          textColor="white"
          style={styles.button}
          onPress={updateData}
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
