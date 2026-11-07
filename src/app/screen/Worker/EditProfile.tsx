// EditProfile.tsx

import { ToastMess } from "@/src/utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

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

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button, RadioButton, TextInput } from "react-native-paper";

import { api } from "../../config";

// Default image displayed when the user has no profile picture.
const DEFAULT_AVATAR = "https://i.pravatar.cc/300?img=12";

// Type describing a selected image from the gallery.
type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export default function EditProfile() {
  const router = useRouter();

  // User information.
  const [id, setId] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [checked, setChecked] = useState("");

  // Existing image URL from the server.
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // New image selected from the device.
  // This is separate from profileImage so remote URLs are never uploaded.
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );

  // Screen loading states.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Displayed image: selected local image takes priority.
  const displayedImage = selectedImage?.uri || profileImage || DEFAULT_AVATAR;

  const formatDate = (date: string): string => {
  // Return an empty value if no date is provided.
  if (!date) return "";

  // Parse the date.
  const parsedDate = new Date(date);

  // Check for an invalid date.
  if (Number.isNaN(parsedDate.getTime())) return "";

  // Format as YYYY-MM-DD.
  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, "0"),
    String(parsedDate.getDate()).padStart(2, "0"),
  ].join("-");
};

 

  // Load the existing user information.
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        ToastMess({
          type: "error",
          title: "User Not Found",
          content: "Please log in again.",
        });

        return;
      }

      const user = JSON.parse(storedUser);

       const dob = formatDate(user?.dob || user?.dateOfBirth || dateOfBirth);

      setId(String(user.id || ""));
      setFullname(user.fullname || user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || user.phoneNumber || "");
      setState(user.state || "");
      setLga(user.lga || "");
      setStreet(user.street || user.streetAddress || "");
      setChecked(user.gender || "");
      setDateOfBirth(dob);
      setBio(user.bio || "");

      // Support common profile image field names.
      const image = `${api}/uploads/${user?.passport}` || 
        null;

      setProfileImage(image);
      setSelectedImage(null);
    } catch (error) {
      console.log("Error loading user:", error);

      ToastMess({
        type: "error",
        title: "Loading Error",
        content: "Unable to load your profile information.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Select a new profile picture.
  const changePhoto = async () => {
    try {
      // Request permission to access the gallery.
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

      // Open the device gallery.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      // Stop if the user cancels the selection.
      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      // Determine the file extension.
      const extension =
        asset.fileName?.split(".").pop()?.toLowerCase() ||
        asset.uri.split(".").pop()?.split("?")[0]?.toLowerCase() ||
        "jpg";

      // Determine the MIME type.
      let mimeType = asset.mimeType;

      if (!mimeType) {
        if (extension === "png") {
          mimeType = "image/png";
        } else if (extension === "webp") {
          mimeType = "image/webp";
        } else {
          mimeType = "image/jpeg";
        }
      }

      // Create a filename if the device does not provide one.
      const filename = asset.fileName || `profile_${Date.now()}.${extension}`;

      // Save the selected image details for FormData.
      setSelectedImage({
        uri: asset.uri,
        name: filename,
        type: mimeType,
      });

      console.log("Selected image:", {
        uri: asset.uri,
        name: filename,
        type: mimeType,
      });
    } catch (error) {
      console.log("Image picker error:", error);

      ToastMess({
        type: "error",
        title: "Image Error",
        content: "Unable to select your profile picture.",
      });
    }
  };

  // Cancel a newly selected image.
  const cancelPhotoChange = () => {
    setSelectedImage(null);
  };

  // Update the profile information.
  const updateData = async () => {
    // Validate required fields.
    if (!fullname.trim() || !email.trim()) {
      ToastMess({
        type: "error",
        title: "Missing Information",
        content: "Full name and email are required.",
      });

      return;
    }

    // Validate the user ID.
    if (!id) {
      ToastMess({
        type: "error",
        title: "User Not Found",
        content: "Please log in again.",
      });

      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      // Get the authentication token.
      const token = await AsyncStorage.getItem("token");

      // Create FormData for text fields and an optional image.
      const formData = new FormData();

      // Append all profile information.
      formData.append("id", String(id));
      formData.append("fullname", fullname.trim());
      formData.append("email", email.trim());
      formData.append("phoneNumber", phone.trim());
      formData.append("dateOfBirth", dateOfBirth.trim());
      formData.append("gender", checked);
      formData.append("state", state.trim());
      formData.append("lga", lga.trim());
      formData.append("streetAddress", street.trim());
      formData.append("bio", bio.trim());

      // Convert the selected image URI into an Expo File object.
      if (selectedImage) {
        const imageFile = new File(selectedImage.uri);

        // Append the file with its original filename.
        formData.append("image", imageFile, selectedImage.name);
      }

      // Append the image only if a new one was selected.
      // if (selectedImage) {
      //   // React Native expects a file object with uri, name and type.
      //   formData.append("profile_picture", {
      //     uri: selectedImage.uri,
      //     name: selectedImage.name,
      //     type: selectedImage.type,
      //   } as any);
      // }

      console.log("Submitting profile update:", {
        id,
        fullname,
        email,
        hasNewImage: Boolean(selectedImage),
      });

      // Send the request to your backend.
      const response = await fetch(`${api}/users/updateprofile`, {
        method: "POST",

        headers: {
          Accept: "application/json",

          // Include the token when available.
          ...(token ? { Authorization: `Bearer ${token}` } : {}),

          // IMPORTANT:
          // Do not manually set Content-Type here.
          // Fetch must generate the multipart boundary.
        },

        body: formData,
      });

      // Read the response as text first.
      // This prevents JSON parsing errors if the server returns HTML or text.
      const responseText = await response.text();

      console.log("Update response status:", response.status);
      console.log("Update response body:", responseText);

      // Convert the response to JSON.
      let data: any = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          "The server returned an invalid response. Check your backend route.",
        );
      }

      // Check whether the server accepted the update.
      if (
        !response.ok ||
        data.status === false ||
        data.success === false ||
        data.ok === false
      ) {
        throw new Error(
          data.message || `Profile update failed (${response.status}).`,
        );
      }

      // Read the existing locally stored user.
      const storedUser = await AsyncStorage.getItem("user");

      const existingUser = storedUser ? JSON.parse(storedUser) : {};

      // Build the updated user information.
      const updatedUser = {
        ...existingUser,
        id,
        fullname: fullname.trim(),
        name: fullname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneNumber: phone.trim(),
        state: state.trim(),
        lga: lga.trim(),
        street: street.trim(),
        streetAddress: street.trim(),
        gender: checked,
        dob: dateOfBirth.trim(),
        dateOfBirth: dateOfBirth.trim(),
        bio: bio.trim(),

        // Use the image URL returned by the backend when available.
        ...(data.user || {}),
      };

      // Save the updated user information locally.
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // Update the image URL displayed by this screen if the backend
      // returned a new image URL.
      const returnedImage =
        data.user?.profile_picture ||
        data.user?.profilePicture ||
        data.user?.avatar ||
        null;

      if (returnedImage) {
        setProfileImage(returnedImage);
      }

      // Clear the selected local image after successful upload.
      setSelectedImage(null);

      ToastMess({
        type: "success",
        title: "Profile Updated",
        content: data.message || "Your profile has been updated.",
      });

      // Return to the previous screen.
      router.back();
    } catch (error: any) {
      console.log("Profile update error:", error);

      ToastMess({
        type: "error",
        title: "Update Failed",
        content: error?.message || "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Show a loading screen while retrieving user information.
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
            <Image source={{ uri: displayedImage }} style={styles.avatar} />

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={changePhoto}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="camera" size={19} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{fullname || "Your Name"}</Text>

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

            <Text style={styles.changePhotoText}>Change Profile Picture</Text>
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity
              onPress={cancelPhotoChange}
              style={styles.cancelPhoto}
            >
              <Text style={styles.cancelPhotoText}>Cancel photo change</Text>
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
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <Text style={styles.sectionSubtitle}>
                Your basic account details
              </Text>
            </View>
          </View>

          <TextInput
            label="Full Name"
            value={fullname}
            onChangeText={setFullname}
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
              <Text style={styles.sectionTitle}>Location Information</Text>

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

              <Text style={styles.sectionSubtitle}>Select your gender</Text>
            </View>
          </View>

          <RadioButton.Group onValueChange={setChecked} value={checked}>
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
                  <RadioButton value={gender} color="#2563EB" />

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

        {/* BIO */}
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
              <Text style={styles.sectionTitle}>Bio</Text>

              <Text style={styles.sectionSubtitle}>Tell us about yourself</Text>
            </View>
          </View>

          <TextInput
            label="Bio"
            value={bio}
            placeholder="Write a brief description about yourself..."
            onChangeText={setBio}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              {
                minHeight: 90,
                textAlignVertical: "top",
              },
            ]}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            left={<TextInput.Icon icon="text" />}
          />
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

// Screen styles.
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
});
