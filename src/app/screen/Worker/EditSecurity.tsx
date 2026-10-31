import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ToastMess } from "@/src/utils/toast";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Button, TextInput } from "react-native-paper";
import { api } from "../../config";

export default function EditSecurity({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Load the logged-in user from AsyncStorage.
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  // Clear all password fields.
  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Log out after a successful password update.
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      router.replace("/screen/Auth/LoginScreen");

      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Login" }],
      // });
    } catch (error) {
      // console.log("Logout Error:", error);
      ToastMess({
        type: "error",
        title: "Password Updated",
        content:
          "Your password was changed, but automatic logout failed. Please log out manually.",
      });
    }
  };

  // Update the user's password.
  const updateSecurity = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      ToastMess({
        type: "error",
        title: "Missing Information",
        content: "Please fill in all password fields.",
      });
      return;
    }

    if (newPassword.length < 8) {
      ToastMess({
        type: "error",
        title: "Weak Password",
        content: "Your new password must contain at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      ToastMess({
        type: "error",
        title: "Password Mismatch",
        content: "Your new passwords do not match.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      ToastMess({
        type: "error",
        title: "Invalid Password",
        content:
          "Your new password must be different from your current password.",
      });
      return;
    }

    if (!user?.id) {
      ToastMess({
        type: "error",
        title: "Error",
        content: "User information could not be found. Please log in again.",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${api}/users/updatesecurity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: user.id,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        ToastMess({
          type: "error",
          title: "Update Failed",
          content: data.message || "Failed to update your password.",
        });
        return;
      }

      ToastMess({
        type: "success",
        title: "Password Updated",
        content: data.message || "Your password has been changed successfully.",
      });
      resetForm();
      await logout();
    } catch (error: any) {
      ToastMess({
        type: "error",
        title: "Connection Error",
        content:
          error?.message ||
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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

          {/* <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={35}
              color="#2563EB"
            />
          </View> */}

          <Text style={styles.title}>Security Settings</Text>

          <Text style={styles.subtitle}>
            Protect your account by keeping your password strong and up to date.
          </Text>
        </View>

        {/* SECURITY INFORMATION */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={24}
              color="#2563EB"
            />
          </View>

          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Keep your account secure</Text>
            <Text style={styles.infoDescription}>
              Never share your password with anyone. Choose a password that is
              difficult to guess.
            </Text>
          </View>
        </View>

        {/* FORM CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Text style={styles.cardSubtitle}>
              Enter your current password and choose a new one.
            </Text>
          </View>

          {/* CURRENT PASSWORD */}
          <Text style={styles.fieldLabel}>Current Password</Text>

          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            mode="outlined"
            placeholder="Enter current password"
            secureTextEntry={!showCurrent}
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            textColor="#0F172A"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showCurrent ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowCurrent(!showCurrent)}
              />
            }
          />

          {/* NEW PASSWORD */}
          <Text style={styles.fieldLabel}>New Password</Text>

          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            placeholder="Enter new password"
            secureTextEntry={!showNew}
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            textColor="#0F172A"
            left={<TextInput.Icon icon="lock-plus-outline" />}
            right={
              <TextInput.Icon
                icon={showNew ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowNew(!showNew)}
              />
            }
          />

          <Text style={styles.helperText}>
            Use at least 8 characters for better security.
          </Text>

          {/* CONFIRM PASSWORD */}
          <Text style={styles.fieldLabel}>Confirm New Password</Text>

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            placeholder="Confirm your new password"
            secureTextEntry={!showConfirm}
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#2563EB"
            textColor="#0F172A"
            left={<TextInput.Icon icon="lock-check-outline" />}
            right={
              <TextInput.Icon
                icon={showConfirm ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowConfirm(!showConfirm)}
              />
            }
          />

          {/* SAVE BUTTON */}
          <Button
            mode="contained"
            buttonColor="#2563EB"
            textColor="#FFFFFF"
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}
            onPress={updateSecurity}
          >
            {loading ? "Updating Password..." : "Save Changes"}
          </Button>

          <View style={styles.footerNote}>
            <MaterialCommunityIcons
              name="information-outline"
              size={17}
              color="#64748B"
            />
            <Text style={styles.footerText}>
              You will be logged out after changing your password.
            </Text>
          </View>
        </View>

        {/* BOTTOM SECURITY NOTE */}
        <View style={styles.bottomNote}>
          <MaterialCommunityIcons
            name="shield-check"
            size={19}
            color="#16A34A"
          />
          <Text style={styles.bottomNoteText}>
            Your account security matters to us.
          </Text>
        </View>
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
    paddingBottom: 40,
  },

  header: {
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  headerIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  infoIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoText: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },

  infoDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  cardHeader: {
    marginBottom: 22,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  cardSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 17,
    fontSize: 14,
  },

  helperText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: -11,
    marginBottom: 17,
  },

  button: {
    borderRadius: 12,
    marginTop: 12,
  },

  buttonContent: {
    height: 52,
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    gap: 7,
  },

  footerText: {
    fontSize: 11,
    color: "#64748B",
    flexShrink: 1,
  },

  bottomNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    gap: 8,
  },

  bottomNoteText: {
    fontSize: 12,
    color: "#64748B",
  },
});
