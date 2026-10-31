
import { ToastMess } from "@/src/utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button, RadioButton, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { api } from "../../config";

const DEFAULT_AVATAR = "https://i.pravatar.cc/300?img=12";

export default function EditProfile() {
  const router = useRouter();

  // User information
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [checked, setChecked] = useState("");

  // Profile picture
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing user information
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        setId(String(user.id || ""));
        setName(user.fullname || "");
        setEmail(user.email || "");
        setPhone(user.phone || user.phoneNumber || "");
        setState(user.state || "");
        setLga(user.lga || "");
        setStreet(user.street || user.streetAddress || "");
        setChecked(user.gender || "");
        setDateOfBirth(user.dob || user.dateOfBirth || "");

        // Support common profile image field names
        const image =
          user.profile_picture ||
          user.avatar ||
          user.photo ||
          null;

        setProfileImage(image);
        setOriginalImage(image);
      }
    } catch (error) {
      console.log("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Select profile picture from gallery
  const changePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        ToastMess({
          type: "error",
          title: "Permission Required",
          content: "Please allow access to your photo library.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image picker error:", error);

      ToastMess({
        type: "error",
        title: "Image Error",
        content: "Unable to select your profile picture.",
      });
    }
  };

  // Restore the original picture before saving
  const cancelPhotoChange = () => {
    setProfileImage(originalImage);
  };

  // Update profile information
  const updateData = async () => {
    if (!name.trim() || !email.trim()) {
      ToastMess({
        type: "error",
        title: "Missing Information",
        content: "Full name and email are required.",
      });
      return;
    }

    if (!id) {
      ToastMess({
        type: "error",
        title: "User Not Found",
        content: "Please log in again.",
      });
      return;
    }

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem("token");

      // FormData allows text fields and images in one request
      const formData = new FormData();

      formData.append("id", id);
      formData.append("fullname", name.trim());
      formData.append("email", email.trim());
      formData.append("phoneNumber", phone);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("gender", checked);
      formData.append("state", state);
      formData.append("lga", lga);
      formData.append("streetAddress", street);

      // Only upload when a new local image has been selected
      if (
        profileImage &&
        profileImage !== originalImage &&
        !profileImage.startsWith("http")
      ) {
        const filename =
          profileImage.split("/").pop() || "profile.jpg";

        const extension = filename.split(".").pop()?.toLowerCase();

        const mimeType =
          extension === "png"
            ? "image/png"
            : extension === "webp"
            ? "image/webp"
            : "image/jpeg";

        formData.append(
          "profile_picture",
          {
            uri: profileImage,
            name: filename,
            type: mimeType,
          } as any
        );
      }

      const response = await fetch(`${api}/users/updateprofile`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Do not manually set Content-Type for FormData.
          // React Native must add the multipart boundary.
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        ToastMess({
          type: "error",
          title: "Update Failed",
          content: data.message || "Failed to update profile.",
        });
        return;
      }

      // Update locally stored user information
      const storedUser = await AsyncStorage.getItem("user");
      const existingUser = storedUser ? JSON.parse(storedUser) : {};

      const updatedUser = {
        ...existingUser,
        id,
        fullname: name,
        email,
        phone,
        phoneNumber: phone,
        state,
        lga,
        street,
        streetAddress: street,
        gender: checked,
        dob: dateOfBirth,
        dateOfBirth,
        ...(data.user || {}),
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      ToastMess({
        type: "success",
        title: "Profile Updated",
        content: data.message || "Your profile has been updated.",
      });

      router.back();
    } catch (error: any) {
      console.log("Profile update error:", error);

      ToastMess({
        type: "error",
        title: "Something Went Wrong",
        content: error?.message || "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={23}
              color="#0F172A"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>
            Manage your personal information and how people see you.
          </Text>
        </View>

        {/* PROFILE PICTURE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: profileImage || DEFAULT_AVATAR }}
              style={styles.avatar}
            />

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={changePhoto}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="camera"
                size={19}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {name || "Your Name"}
          </Text>

          <Text style={styles.profileEmail}>
            {email || "Your email address"}
          </Text>

          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={changePhoto}
          >
            <MaterialCommunityIcons
              name="image-edit-outline"
              size={17}
              color="#2563EB"
            />
            <Text style={styles.changePhotoText}>
              Change Profile Picture
            </Text>
          </TouchableOpacity>

          {profileImage !== originalImage && (
            <TouchableOpacity
              onPress={cancelPhotoChange}
              style={styles.cancelPhoto}
            >
              <Text style={styles.cancelPhotoText}>
                Cancel photo change
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.photoHint}>
            Choose a clear picture of yourself.
          </Text>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="account-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Your basic account details
              </Text>
            </View>
          </View>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="account-outline" />}
          />

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="email-outline" />}
          />

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="phone-outline" />}
          />

          <TextInput
            label="Date of Birth (YYYY-MM-DD)"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="calendar-outline" />}
          />
        </View>

        {/* LOCATION INFORMATION */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Location Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Where you are currently based
              </Text>
            </View>
          </View>

          <TextInput
            label="State of Residence"
            value={state}
            onChangeText={setState}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="map-marker-outline" />}
          />

          <TextInput
            label="Local Government Area"
            value={lga}
            onChangeText={setLga}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="map-outline" />}
          />

          <TextInput
            label="Street Address"
            value={street}
            onChangeText={setStreet}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="home-outline" />}
          />
        </View>

        {/* GENDER */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>Gender</Text>
              <Text style={styles.sectionSubtitle}>
                Select your gender
              </Text>
            </View>
          </View>

          <RadioButton.Group
            onValueChange={setChecked}
            value={checked}
          >
            <View style={styles.genderContainer}>
              {["Male", "Female", "Other"].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    checked === gender && styles.genderSelected,
                  ]}
                  onPress={() => setChecked(gender)}
                >
                  <RadioButton
                    value={gender}
                    color="#2563EB"
                  />
                  <Text
                    style={[
                      styles.genderText,
                      checked === gender && styles.genderTextSelected,
                    ]}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </RadioButton.Group>
        </View>

        {/* SAVE BUTTON */}
        <Button
          mode="contained"
          buttonColor="#2563EB"
          textColor="#FFFFFF"
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          loading={saving}
          disabled={saving}
          onPress={updateData}
          icon="content-save-outline"
        >
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>

        <Text style={styles.bottomText}>
          Keep your profile information accurate and up to date.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  scroll: {
    padding: 20,
    paddingTop: 45,
    paddingBottom: 50,
  },

  loader: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 14,
  },

  header: {
    marginBottom: 25,
  },

  backButton: {
    width: 43,
    height: 43,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 23,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#DBEAFE",
    backgroundColor: "#E2E8F0",
  },

  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  profileName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
  },

  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
  },

  changePhotoText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 13,
  },

  cancelPhoto: {
    marginTop: 12,
  },

  cancelPhotoText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },

  photoHint: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 13,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 12,
  },

  sectionIcon: {
    width: 43,
    height: 43,
    backgroundColor: "#EFF6FF",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 3,
  },

  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
    fontSize: 14,
  },

  genderContainer: {
    gap: 10,
  },

  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  genderSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  genderText: {
    color: "#475569",
    fontSize: 14,
  },

  genderTextSelected: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  saveButton: {
    borderRadius: 13,
    marginTop: 5,
  },

  saveButtonContent: {
    height: 53,
  },

  bottomText: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 18,
  },
})