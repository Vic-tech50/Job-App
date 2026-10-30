import * as React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";

import { artisans } from "@/src/utils/artisanlist";
import nigeriaLocations from "@/src/utils/stateLga";
import { ToastMess } from "@/src/utils/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  ProgressBar,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { api } from "../../config";

type Item = {
  id?: string | number;
  fullname?: string;
  email?: string;
  password?: string;
  role?: string;
};

type Props = {
  route: { params: { user?: Item } };
  navigation: any;
};

const WizardForm = ({ route, navigation }: Props) => {
  // const user = route?.params?.user;
  const router = useRouter();

  // Receive the parameters sent through Expo Router.
  const { user: userParam } = useLocalSearchParams<{
    user?: string;
  }>();

  // Convert the JSON string into a JavaScript object.
  const user = userParam ? JSON.parse(userParam) : null;
  const [step, setStep] = React.useState(1);
  const [checked, setChecked] = React.useState("");

  const [formData, setFormData] = React.useState({
    name: user?.fullname || "",
    email: user?.email || "",
    role: user?.role || "",
    phoneNumber: "",
    dateOfBirth: "",
    occupation: "",
    experience: "",
    state: "",
    lga: "",
    gender: "",
    streetAddress: "",
  });

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        // name: user.fullname || "",
        email: user.email || "",
        role: user.role || "",
      }));
    }
  }, [user]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // const handleChange = (field: string, value: string) => {
  //   setFormData({ ...formData, [field]: value });
  // };

  // Update form fields safely without overwriting other fields.
  const handleChange = (field: string, value: string) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value,
    }));
  };

  // Find the selected state's information.
  const selectedStateData = nigeriaLocations.find(
    (item) =>
      item.state.trim().toLowerCase() ===
      String(formData.state || "")
        .trim()
        .toLowerCase(),
  );

  // Get only the LGAs belonging to the selected state.
  const lgaList = selectedStateData?.lgas || [];

  // const handleSubmit = async () => {
  //   try {
  //     const response = await fetch("http://nativephpapp.test/api/users", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         ...formData,
  //         gender: checked,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to submit form");
  //     }

  //     const data = await response.json();

  //     alert("Form submitted successfully!");
  //     console.log(data);
  //   } catch (error) {
  //     alert("Error submitting form");
  //     console.error(error);
  //   }
  // };

  const updateData = async () => {
    try {
      const response = await fetch(`${api}/auth/updateprofile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          fullname: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: checked,
          occupation: formData.occupation,
          experience: formData.experience,
          state: formData.state,
          lga: formData.lga,
          streetAddress: formData.streetAddress,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to update profile");
      } else {
        ToastMess({
          type: "success",
          title: "Worker Data Saved",
          content: data.message || "Worker Data Saved.",
        });
        // Alert.alert("Success", data.message);
        router.push({
          pathname: "/(Worker)",
          params: {
            user: JSON.stringify(data.user),
            token: data.access_token ?? data.token,
          },
        });

        console.log("Updated user:", data.user);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <LinearGradient
      colors={["#0F172A", "#1E293B", "#334155"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Registration Wizard</Text>

            <Text style={styles.subTitle}>
              Complete your profile in simple steps
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Step */}
            <View style={styles.stepRow}>
              <Text style={styles.stepText}>Step {step} of 4</Text>

              <Text style={styles.percentText}>
                {Math.round((step / 4) * 100)}%
              </Text>
            </View>

            <ProgressBar
              progress={step / 4}
              color="#2563EB"
              style={styles.progressBar}
            />

            {/* STEP 1 */}
            {step === 1 && (
              <View>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <TextInput
                  label="Full Name"
                  mode="outlined"
                  value={formData.name}
                  textColor="black"
                  onChangeText={(text) => handleChange("name", text)}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Icon icon="account-outline" />}
                  theme={inputTheme}
                />

                <TextInput
                  label="Email Address"
                  mode="outlined"
                  textColor="black"
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" />}
                  theme={inputTheme}
                />

                <TextInput
                  label="Account Role"
                  mode="outlined"
                  textColor="black"
                  value={formData.role}
                  disabled
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Icon icon="shield-account-outline" />}
                  theme={inputTheme}
                />

                <TextInput
                  label="Phone Number"
                  mode="outlined"
                  textColor="black"
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleChange("phoneNumber", text)}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone-outline" />}
                  theme={inputTheme}
                />

                <TextInput
                  label="Date of Birth"
                  mode="outlined"
                  textColor="black"
                  value={formData.dateOfBirth}
                  onChangeText={(text) => handleChange("dateOfBirth", text)}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  placeholder="YYYY-MM-DD"
                  left={<TextInput.Icon icon="calendar-outline" />}
                  theme={inputTheme}
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
              </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <View>
                <Text style={styles.sectionTitle}>Occupational Details</Text>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.occupation}
                    onValueChange={(itemValue) =>
                      handleChange("occupation", itemValue)
                    }
                  >
                    <Picker.Item label="Select Occupation" value="" />
                    {artisans.map((artisan) => (
                      <Picker.Item
                        label={artisan.label}
                        value={artisan.value}
                      />
                    ))}
                  </Picker>
                </View>

                <TextInput
                  label="Years of Experience"
                  mode="outlined"
                  value={formData.experience}
                  onChangeText={(text) => handleChange("experience", text)}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Icon icon="briefcase-outline" />}
                  theme={inputTheme}
                />
              </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <View>
                {/* Section heading */}
                <Text style={styles.sectionTitle}>Location Details</Text>

                {/* State Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.state}
                    onValueChange={(itemValue) => {
                      // Update state and clear the previous LGA together.
                      setFormData((previousData) => ({
                        ...previousData,
                        state: itemValue,
                        lga: "",
                      }));
                    }}
                  >
                    {/* Default state option */}
                    <Picker.Item label="Select State" value="" />

                    {/* Display all Nigerian states */}
                    {nigeriaLocations.map((item) => (
                      <Picker.Item
                        key={item.state}
                        label={item.state}
                        value={item.state}
                      />
                    ))}
                  </Picker>
                </View>

                {/* LGA Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.lga}
                    enabled={lgaList.length > 0}
                    onValueChange={(itemValue) => {
                      // Save the selected LGA.
                      handleChange("lga", itemValue);
                    }}
                  >
                    {/* Default LGA option */}
                    <Picker.Item
                      label={
                        formData.state
                          ? "Select Local Government Area"
                          : "Select a state first"
                      }
                      value=""
                    />

                    {/* Display LGAs for the selected state */}
                    {lgaList.map((lga) => (
                      <Picker.Item key={lga} label={lga} value={lga} />
                    ))}
                  </Picker>
                </View>

                {/* Street Address */}
                <TextInput
                  label="Street Address"
                  mode="outlined"
                  value={formData.streetAddress}
                  onChangeText={(text) => handleChange("streetAddress", text)}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  theme={inputTheme}
                />
              </View>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <View>
                <Text style={styles.sectionTitle}>Review Details</Text>

                <View style={styles.reviewCard}>
                  {[
                    ["Name", formData.name],
                    ["Email", formData.email],
                    ["Role", formData.role],
                    ["Phone", formData.phoneNumber],
                    ["Gender", checked],
                    ["Occupation", formData.occupation],
                    ["Experience", formData.experience],
                    ["State", formData.state],
                    ["LGA", formData.lga],
                    ["Address", formData.streetAddress],
                  ].map(([label, value], index) => (
                    <View key={index} style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>{label}</Text>

                      <Text style={styles.reviewValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {step > 1 && (
                <Button
                  mode="outlined"
                  onPress={handleBack}
                  style={styles.backButton}
                  textColor="#2563EB"
                >
                  Back
                </Button>
              )}

              {step < 4 ? (
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={styles.nextButton}
                  buttonColor="#2563EB"
                >
                  Next
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={updateData}
                  style={styles.nextButton}
                  buttonColor="#2563EB"
                >
                  Submit
                </Button>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default WizardForm;

const inputTheme = {
  colors: {
    primary: "#2563EB",
    outline: "#CBD5E1",
    background: "#FFFFFF",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  subTitle: {
    fontSize: 16,
    color: "#CBD5E1",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  stepText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  percentText: {
    fontSize: 14,
    color: "#64748B",
  },

  progressBar: {
    height: 8,
    borderRadius: 20,
    marginBottom: 25,
    backgroundColor: "#E2E8F0",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 22,
    color: "#0F172A",
  },

  input: {
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  inputOutline: {
    borderRadius: 14,
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

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  reviewCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 18,
  },

  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 8,
  },

  reviewLabel: {
    fontWeight: "700",
    color: "#0F172A",
  },

  reviewValue: {
    color: "#475569",
    width: "55%",
    textAlign: "right",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 30,
  },

  backButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 14,
    borderColor: "#2563EB",
  },

  nextButton: {
    flex: 1,
    borderRadius: 14,
  },
});
