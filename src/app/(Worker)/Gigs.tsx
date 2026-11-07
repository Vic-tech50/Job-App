import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { api } from "../config";

// Artisan categories available for portfolio uploads.
const artisanCategories = [
  { id: "1", name: "Painter", icon: "brush", color: "#2563EB" },
  { id: "2", name: "Roofer", icon: "home-roof", color: "#DC2626" },
  { id: "3", name: "Tiler", icon: "grid", color: "#059669" },
  { id: "4", name: "Electrician", icon: "lightning-bolt", color: "#D97706" },
  { id: "5", name: "Plumber", icon: "water-pump", color: "#7C3AED" },
];

interface Work {
  id: string | number;
  title: string;
  description: string;
  image: string;
  category?: string;
}

export default function ArtisanWorkUpload() {
  // User information.
  const [userId, setUserId] = useState("");

  // Portfolio information.
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload form information.
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [workTitle, setWorkTitle] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load the logged-in artisan.
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserId(String(user.id || ""));
        }
      } catch (error) {
        console.log("Unable to load user:", error);
      }
    };

    loadUser();
  }, []);

  // Fetch uploaded portfolio projects.
  const getData = useCallback(async () => {
    try {
      const response = await fetch(`${api}/users/fetchwork`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch portfolio.");
      }

      // Supports either a direct array or an object containing data.
      const records = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.works)
            ? result.works
            : [];

      setWorks(records);
    } catch (error: any) {
      console.log("Portfolio error:", error.message);
      Alert.alert("Error", "Unable to load your portfolio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  // Open the upload modal.
  const openUploadModal = (category: any = null) => {
    setSelectedCategory(category);
    setWorkTitle("");
    setWorkDescription("");
    setSelectedImage(null);
    setModalVisible(true);
  };

  // Select a category and open the upload form.
  const selectCategory = (category: any) => {
    openUploadModal(category);
  };

  // Choose an image from the phone gallery.
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to select an image.");
    }
  };

  // Upload a new portfolio project.
  const insertData = async () => {
    if (!userId) {
      Alert.alert("Error", "Your user account could not be identified.");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Category required", "Please select an artisan category.");
      return;
    }

    if (!workTitle.trim()) {
      Alert.alert("Required", "Please enter your project title.");
      return;
    }

    if (!workDescription.trim()) {
      Alert.alert("Required", "Please describe your project.");
      return;
    }

    if (!selectedImage) {
      Alert.alert("Required", "Please select a project image.");
      return;
    }

    const formData = new FormData();

    // Add the project information.
    formData.append("userid", userId);
    formData.append("title", workTitle.trim());
    formData.append("description", workDescription.trim());
    formData.append("category", selectedCategory.name);
    formData.append("status", "1");

    // Add the selected image.
    formData.append("image", {
      uri: selectedImage,
      name: `work_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    try {
      setUploading(true);

      const response = await fetch(`${api}/users/workupload`, {
        method: "POST",
        body: formData,
        // Do not manually set Content-Type.
        // Fetch will generate the multipart boundary.
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to upload your work.");
      }

      Alert.alert(
        "Upload successful",
        result.message || "Your project has been uploaded successfully.",
      );

      // Clear the form and close the modal.
      setWorkTitle("");
      setWorkDescription("");
      setSelectedImage(null);
      setSelectedCategory(null);
      setModalVisible(false);

      // Refresh the portfolio gallery.
      await getData();
    } catch (error: any) {
      Alert.alert("Upload failed", error.message || "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PAGE HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR PROFESSIONAL PROFILE</Text>
            <Text style={styles.title}>My Portfolio</Text>
            <Text style={styles.subtitle}>
              Let your completed projects speak for you.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="briefcase-check-outline"
              size={27}
              color="#2563EB"
            />
          </View>
        </View>

        {/* PORTFOLIO OVERVIEW */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View>
              <Text style={styles.overviewLabel}>PROJECTS SHOWCASED</Text>
              <Text style={styles.overviewNumber}>{works.length}</Text>
              <Text style={styles.overviewDescription}>
                Your work, your reputation.
              </Text>
            </View>

            <View style={styles.overviewIcon}>
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={34}
                color="#FFFFFF"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.overviewButton}
            activeOpacity={0.8}
            onPress={() => openUploadModal()}
          >
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={20}
              color="#2563EB"
            />
            <Text style={styles.overviewButtonText}>Upload New Project</Text>
          </TouchableOpacity>
        </View>

        {/* CATEGORY SECTION */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Choose a Category</Text>
            <Text style={styles.sectionSubtitle}>
              Add a project under your profession.
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {artisanCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.8}
              onPress={() => selectCategory(category)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: `${category.color}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={category.icon as any}
                  size={27}
                  color={category.color}
                />
              </View>

              <Text style={styles.categoryName}>{category.name}</Text>
              <MaterialCommunityIcons
                name="plus-circle"
                size={17}
                color="#94A3B8"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PROJECT GALLERY */}
        <View style={styles.galleryHeader}>
          <View>
            <Text style={styles.sectionTitle}>My Projects</Text>
            <Text style={styles.sectionSubtitle}>
              Your uploaded work and completed jobs.
            </Text>
          </View>

          <View style={styles.projectCount}>
            <Text style={styles.projectCountText}>{works.length}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading your projects...</Text>
          </View>
        ) : works.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="image-plus-outline"
                size={43}
                color="#2563EB"
              />
            </View>

            <Text style={styles.emptyTitle}>Your portfolio is empty</Text>

            <Text style={styles.emptyText}>
              Start showcasing your best projects. Upload pictures of your
              completed work to attract more customers.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => openUploadModal()}
            >
              <MaterialCommunityIcons name="plus" size={19} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Your First Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gallery}>
            {works.map((item) => (
              <View style={styles.workCard} key={String(item.id)}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.workImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log("Image loading error:", error.nativeEvent);
                  }}
                />
                {/* <Image
                  source={{ uri: "http://192.168.43.13:3000/uploads/" + item.image }}
                  // source={{ uri: "http://192.168.43.13:3000/uploads/1781045110932-image.jpg" }}
                  style={styles.workImage}
                  resizeMode="cover"
                /> */}

                <View style={styles.workContent}>
                  {item.category ? (
                    <Text style={styles.workCategory}>{item.category}</Text>
                  ) : null}

                  <Text style={styles.workTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.workDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* UPLOAD PROJECT MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* MODAL HEADER */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Add New Project</Text>
                  <Text style={styles.modalSubtitle}>
                    Showcase your professional work.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                  disabled={uploading}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color="#334155"
                  />
                </TouchableOpacity>
              </View>

              {/* SELECTED CATEGORY */}
              <Text style={styles.inputLabel}>PROJECT CATEGORY</Text>

              <View style={styles.selectedCategoryBox}>
                {selectedCategory ? (
                  <>
                    <MaterialCommunityIcons
                      name={selectedCategory.icon}
                      size={22}
                      color={selectedCategory.color}
                    />
                    <Text style={styles.selectedCategoryText}>
                      {selectedCategory.name}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                      <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {artisanCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.modalCategory}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text style={styles.modalCategoryText}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* IMAGE UPLOAD */}
              <Text style={styles.inputLabel}>PROJECT IMAGE</Text>

              <TouchableOpacity
                style={styles.uploadBox}
                activeOpacity={0.8}
                onPress={pickImage}
                disabled={uploading}
              >
                {selectedImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.previewImage}
                    />

                    <View style={styles.changeImageButton}>
                      <MaterialCommunityIcons
                        name="camera"
                        size={17}
                        color="#FFFFFF"
                      />
                      <Text style={styles.changeImageText}>Change image</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.uploadIcon}>
                      <MaterialCommunityIcons
                        name="cloud-upload-outline"
                        size={35}
                        color="#2563EB"
                      />
                    </View>

                    <Text style={styles.uploadTitle}>Upload project image</Text>

                    <Text style={styles.uploadSubtitle}>
                      Tap here to select an image from your gallery
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* PROJECT TITLE */}
              <Text style={styles.inputLabel}>PROJECT TITLE</Text>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="format-title"
                  size={20}
                  color="#94A3B8"
                />
                <TextInput
                  placeholder="e.g. Modern residential painting"
                  value={workTitle}
                  onChangeText={setWorkTitle}
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                  editable={!uploading}
                />
              </View>

              {/* PROJECT DESCRIPTION */}
              <Text style={styles.inputLabel}>PROJECT DESCRIPTION</Text>

              <View style={[styles.inputContainer, styles.descriptionBox]}>
                <TextInput
                  placeholder="Describe the work you completed, materials used, and the result..."
                  value={workDescription}
                  onChangeText={setWorkDescription}
                  style={styles.descriptionInput}
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  editable={!uploading}
                />
              </View>

              {/* UPLOAD BUTTON */}
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploading && styles.disabledButton,
                ]}
                onPress={insertData}
                disabled={uploading}
                activeOpacity={0.8}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="cloud-upload"
                      size={21}
                      color="#FFFFFF"
                    />
                    <Text style={styles.uploadButtonText}>Upload Project</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.modalFooterText}>
                Make sure your image clearly displays your completed work.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// All screen styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  eyebrow: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
  },

  headerIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  overviewCard: {
    backgroundColor: "#1D4ED8",
    borderRadius: 24,
    padding: 22,
    marginBottom: 30,
    overflow: "hidden",
  },

  overviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  overviewLabel: {
    color: "#BFDBFE",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  overviewNumber: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 5,
  },

  overviewDescription: {
    color: "#DBEAFE",
    fontSize: 12,
    marginTop: 3,
  },

  overviewIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  overviewButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  overviewButtonText: {
    color: "#1D4ED8",
    fontWeight: "800",
    fontSize: 13,
  },

  sectionHeader: {
    marginBottom: 15,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 5,
  },

  categoryList: {
    paddingBottom: 30,
    gap: 12,
  },

  categoryCard: {
    width: 112,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  categoryName: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 8,
  },

  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  projectCount: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  projectCountText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
  },

  workCard: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  workImage: {
    width: "100%",
    height: 145,
    backgroundColor: "#E2E8F0",
  },

  workContent: {
    padding: 12,
  },

  workCategory: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 5,
    textTransform: "uppercase",
  },

  workTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  workDescription: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 17,
  },

  loadingContainer: {
    paddingVertical: 65,
    alignItems: "center",
  },

  loadingText: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 12,
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 9,
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: "92%",
  },

  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  modalTitle: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 5,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 17,
  },

  selectedCategoryBox: {
    minHeight: 52,
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 13,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  selectedCategoryText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },

  changeText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "800",
  },

  modalCategory: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginRight: 8,
  },

  modalCategoryText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },

  uploadBox: {
    height: 185,
    borderRadius: 17,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#93C5FD",
    backgroundColor: "#F8FAFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  uploadIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  uploadTitle: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "800",
  },

  uploadSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 7,
    textAlign: "center",
    paddingHorizontal: 15,
  },

  imagePreviewContainer: {
    width: "100%",
    height: "100%",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  changeImageButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(15,23,42,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  changeImageText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  inputContainer: {
    minHeight: 52,
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },

  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
    paddingVertical: 13,
  },

  descriptionBox: {
    minHeight: 115,
    alignItems: "flex-start",
    paddingVertical: 12,
  },

  descriptionInput: {
    flex: 1,
    width: "100%",
    color: "#0F172A",
    fontSize: 13,
    minHeight: 90,
  },

  uploadButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  modalFooterText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 13,
    marginBottom: 10,
  },
});
