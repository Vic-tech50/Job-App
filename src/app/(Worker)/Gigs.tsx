import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../config";

const artisanCategories = [
  {
    id: "1",
    name: "Painter",
    icon: "brush",
    color: "#2563EB",
  },

  {
    id: "2",
    name: "Roofer",
    icon: "home-roof",
    color: "#DC2626",
  },

  {
    id: "3",
    name: "Tiler",
    icon: "grid",
    color: "#059669",
  },

  {
    id: "4",
    name: "Electrician",
    icon: "lightning-bolt",
    color: "#D97706",
  },

  {
    id: "5",
    name: "Plumber",
    icon: "water-pump",
    color: "#7C3AED",
  },
];

export default function ArtisanWorkUpload() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [workTitle, setWorkTitle] = useState("");

  const [workDescription, setWorkDescription] = useState("");

  const [selectedImage, setSelectedImage] = useState<any>(null);

  const [uploadedWorks, setUploadedWorks] = useState<any[]>([]);
  const [id, setId] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // OPEN MODAL
  const openUploadModal = () => {
    setModalVisible(true);
  };

  // ✅ fetch and store data
  const getData = async () => {
    try {
      const response = await fetch(`${api}/users/fetchwork`);
      const result = await response.json();
      if (!result.ok) {
        Alert.alert("Error fetching Data");
      }

      setData(result); // ✅ store data
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: true, // Enable crop UI
      aspect: [1, 1], // Square crop
      // quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setId(user.id || "");
        }
      } catch (error) {
        console.log("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const insertData = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    const formData = new FormData();

    formData.append("userid", id);
    formData.append("title", workTitle);
    formData.append("description", workDescription);
    formData.append("status", "1");
    // assuming the backend expects a field named "image" for the file upload
    formData.append("image", {
      uri: selectedImage,
      name: `work_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(`${api}/users/workupload`, {
        method: "POST",
        body: formData, // ✅ SEND FORMDATA
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);

        setWorkTitle("");
        setWorkDescription("");
        setSelectedImage(null);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Work</Text>

        <Text style={styles.subtitle}>
          Showcase your artisan projects and attract clients
        </Text>
      </View>

      {/* Portfolio */}
      <View>
       

        <TouchableOpacity
          onPress={() => openUploadModal()}
          style={[styles.button]}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Add New Work
          </Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY SELECTION */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      >
        {artisanCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            activeOpacity={0.8}
            onPress={() => openUploadModal(category)}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: category.color,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={30}
                color="#fff"
              />
            </View>

            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      {/* WORK DISPLAY */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="image-off-outline"
              size={70}
              color="#64748B"
            />

            <Text style={styles.emptyTitle}>No Work Uploaded Yet</Text>

            <Text style={styles.emptyText}>
              Select an artisan category above to upload your work
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.workCard}>
            <Image source={{ uri: item.image }} style={styles.workImage} />

            <View style={styles.workContent}>
              {/* <Text style={styles.workCategory}>{item.category}</Text> */}

              <Text style={styles.workTitle}>{item.title}</Text>

              <Text style={styles.workDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* CLOSE */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>

            {/* TITLE */}
            <Text style={styles.modalTitle}>
              Upload {selectedCategory?.name} Work
            </Text>

            {/* IMAGE PICKER  */}
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={50}
                    color="#2563EB"
                  />

                  <Text style={styles.uploadText}>Tap to Upload Image</Text>
                </>
              )}
            </TouchableOpacity>

            {/* {/* INPUTS */}
            <TextInput
              placeholder="Work Title"
              value={workTitle}
              onChangeText={setWorkTitle}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />

            <TextInput
              placeholder="Description"
              value={workDescription}
              onChangeText={setWorkDescription}
              style={[
                styles.input,
                {
                  height: 100,
                  textAlignVertical: "top",
                },
              ]}
              multiline
              placeholderTextColor="#94A3B8"
            />

            {/* BUTTON */}
            <TouchableOpacity style={styles.uploadBtn} onPress={insertData}>
              <Text style={styles.uploadBtnText}>Upload Work</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  scroll: {
    padding: 20,
    paddingTop: 40,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0F172A",
  },

  button: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#2563EB",
  },

  title: {
    color: "#000000",
    fontSize: 30,
    fontWeight: "bold",
  },

  subtitle: {
    color: "grey",
    marginTop: 8,
    fontSize: 15,
  },

  categoryCard: {
    width: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    marginRight: 14,
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryText: {
    color: "#fff",
    marginTop: 12,
    fontWeight: "600",
  },

  workCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    width: "48%",
    overflow: "hidden",
  },

  workImage: {
    width: "100%",
    height: 140,
  },

  workContent: {
    padding: 12,
  },

  workCategory: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
  },

  workTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#0F172A",
  },

  workDescription: {
    color: "#64748B",
    marginTop: 6,
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
    width: "100%",
  },

  emptyTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
  },

  emptyText: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    minHeight: "70%",
  },

  closeBtn: {
    alignSelf: "flex-end",
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 20,
  },

  uploadBox: {
    height: 200,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },

  uploadText: {
    color: "#2563EB",
    marginTop: 10,
    fontWeight: "600",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 15,
    color: "#0F172A",
  },

  uploadBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  uploadBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
