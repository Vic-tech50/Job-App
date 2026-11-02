import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ToastMess } from "@/src/utils/toast";
import { api } from "../../config";

// Create booking page.
export default function CreateBooking() {
  const router = useRouter();

  // Receive artisan information from the details page.
  const { artisanId, artisanName, profession } = useLocalSearchParams<{
    artisanId: string;
    artisanName: string;
    profession: string;
  }>();

  // Booking form states.
  const [service, setService] = useState(profession || "");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [budget, setBudget] = useState("");

  const [user, setUser] = useState<any>(null);
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

  useEffect(() => {
    loadUser();
  }, []);

  // Loading state.
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setService("");
    setDescription("");
    setAddress("");
    setState("");
    setLga("");
    setPhone("");
    setPreferredDate("");
    setPreferredTime("");
    setBudget("");
  };

  // Submit booking request.
  const handleBooking = async () => {
    // Validate required fields.
    if (
      !artisanId ||
      !service.trim() ||
      !description.trim() ||
      !address.trim() ||
      !state.trim() ||
      !lga.trim() ||
      !phone.trim() ||
      !preferredDate.trim() ||
      !preferredTime.trim()
    ) {
      ToastMess({
        type: "error",
        title: "Incomplete Information",
        content: "Please fill in all required fields.",
      });

      return;
    }

    // Validate date format.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      ToastMess({
        type: "error",
        title: "Invalid Date",
        content: "Enter your preferred date in YYYY-MM-DD format.",
      });
      return;
    }

    // Validate time format.
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(preferredTime)) {
      ToastMess({
        type: "error",
        title: "Invalid Time",
        content: "Enter your preferred time in 24-hour format, e.g. 14:30.",
      });
      return;
    }

    // Validate budget if provided.
    if (
      budget.trim() &&
      (!Number.isFinite(Number(budget)) || Number(budget) <= 0)
    ) {
      ToastMess({
        type: "error",
        title: "Invalid Budget",
        content: "Enter a valid budget amount.",
      });
      return;
    }

    try {
      setLoading(true);

      // Get the client's authentication token.
      const token = await AsyncStorage.getItem("token");

      // Prepare booking information.
      const bookingData = {
        artisan_id: artisanId,
        client_id: user?.id,
        service: service.trim(),
        description: description.trim(),
        address: address.trim(),
        state: state.trim(),
        lga: lga.trim(),
        phone: phone.trim(),
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        budget: budget.trim() ? Number(budget) : null,
      };

      // Send booking request to Laravel.
      const response = await fetch(`${api}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingData),
      });

      // Read server response.
      const result = await response.json();

      // Handle unsuccessful request.
      if (!response.ok || result.ok === false) {
        throw new Error(result.message || "Unable to submit your booking.");
      }

      // Show successful booking message.
      ToastMess({
        type: "success",
        title: "Booking Submitted",
        content: "Your booking request has been submitted successfully.",
      });

      resetForm();
    } catch (error: any) {
      console.log("Booking error:", error);

      ToastMess({
        type: "error",
        title: "Booking Failed",
        content: error.message || "Something went wrong. Please try again.",
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#0F172A"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Create Booking</Text>

          <Text style={styles.subtitle}>
            Provide your job details to hire an artisan.
          </Text>
        </View>

        {/* Selected artisan */}
        <View style={styles.artisanCard}>
          <View style={styles.artisanIcon}>
            <MaterialCommunityIcons
              name="account-hard-hat"
              size={28}
              color="#2563EB"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>HIRING</Text>

            <Text style={styles.artisanName}>
              {artisanName || "Selected Artisan"}
            </Text>

            <Text style={styles.profession}>
              {profession || "Professional Artisan"}
            </Text>
          </View>

          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color="#16A34A"
          />
        </View>

        {/* Service information */}
        <Text style={styles.sectionTitle}>Service Information</Text>

        {/* <Picker
                            selectedValue={service}
                            onValueChange={(itemValue) =>
                              handleChange("service", itemValue)
                            }
                          >
                            <Picker.Item label="Select Occupation" value="" />
                            {artisans.map((artisan) => (
                              <Picker.Item
                                label={artisan.label}
                                value={artisan.value}
                              />
                            ))}
                          </Picker> */}

        <Text style={styles.label}>
          Service Required <Text style={{ color: "red" }}>*</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Plumbing, Electrical repair"
          value={service}
          onChangeText={setService}
        />

        <Text style={styles.label}>
          Describe Your Job <Text style={{ color: "red" }}>*</Text>
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Explain what you need the artisan to do..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Location information */}
        <Text style={styles.sectionTitle}>Service Location</Text>

        <Text style={styles.label}>
          Street Address <Text style={{ color: "red" }}>*</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your full service address"
          value={address}
          onChangeText={setAddress}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              State <Text style={{ color: "red" }}>*</Text>
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Enugu"
              value={state}
              onChangeText={setState}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              LGA <Text style={{ color: "red" }}>*</Text>
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Enugu North"
              value={lga}
              onChangeText={setLga}
            />
          </View>
        </View>

        <Text style={styles.label}>
          Phone Number <Text style={{ color: "red" }}>*</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number For Artisan to reach you"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />

        {/* Schedule */}
        <Text style={styles.sectionTitle}>Preferred Schedule</Text>

        <Text style={styles.label}>
          Preferred Date <Text style={{ color: "red" }}>*</Text>
        </Text>

        <View style={styles.inputWithIcon}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={21}
            color="#64748B"
          />

          <TextInput
            style={styles.iconInput}
            placeholder="YYYY-MM-DD"
            value={preferredDate}
            onChangeText={setPreferredDate}
          />
        </View>

        <Text style={styles.label}>
          Preferred Time <Text style={{ color: "red" }}>*</Text>
        </Text>

        <View style={styles.inputWithIcon}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={21}
            color="#64748B"
          />

          <TextInput
            style={styles.iconInput}
            placeholder="e.g. 14:30"
            value={preferredTime}
            onChangeText={setPreferredTime}
          />
        </View>

        {/* Budget */}
        <Text style={styles.sectionTitle}>Your Budget</Text>

        <Text style={styles.label}>
          Estimated Budget (₦) <Text style={{ fontSize: 10 }}>Optional</Text>
        </Text>

        <View style={styles.inputWithIcon}>
          <Text style={styles.currency}>₦</Text>

          <TextInput
            style={styles.iconInput}
            placeholder="Enter your estimated budget"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.helperText}>
          Your budget helps the artisan understand your expectations. Leave it
          empty if you want to discuss the price.
        </Text>

        {/* Booking notice */}
        <View style={styles.notice}>
          <MaterialCommunityIcons
            name="information-outline"
            size={21}
            color="#2563EB"
          />

          <Text style={styles.noticeText}>
            Submitting this request does not mean your booking is confirmed. The
            artisan may need to accept your request before the service is
            scheduled.
          </Text>
        </View>

        {/* Submit booking */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleBooking}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="calendar-check"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.submitText}>Submit Booking Request</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Please confirm that your information is correct before submitting.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Page styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    marginBottom: 25,
    paddingTop: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 7,
    fontSize: 14,
  },

  artisanCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 17,
    marginBottom: 25,
    gap: 12,
  },

  artisanIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  smallLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  artisanName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 3,
  },

  profession: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 15,
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#0F172A",
  },

  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  iconInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#0F172A",
  },

  currency: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748B",
  },

  helperText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 8,
    lineHeight: 19,
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    gap: 10,
  },

  noticeText: {
    flex: 1,
    color: "#1E40AF",
    fontSize: 12,
    lineHeight: 19,
  },

  submitButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 17,
    borderRadius: 14,
    marginTop: 25,
    gap: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  bottomText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 15,
  },
});
