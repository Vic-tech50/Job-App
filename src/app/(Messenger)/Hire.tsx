import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, TextInput } from "react-native-paper";

import { api } from "../config";

// Worker type.
interface Worker {
  id: string | number;
  name: string;
  profession: string;
  skills: string[];
  location: string;
  rating: number;
  avatar: string;
  hourlyRate: string;
}

// Available categories.
// const categories = [
//   "All",
//   "Full Stack Developer",
//   "UI/UX Designer",
//   "Mobile Developer",
//   "Backend Developer",
// ];

export default function FindFreelancers({ navigation }: any) {
  // Search and filter states.
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState("");

  // Backend data state.
  const [workers, setWorkers] = useState<Worker[]>([]);

  // Loading state.
  const [loading, setLoading] = useState(true);

  // Error state.
  const [error, setError] = useState("");

  // Fetch workers from backend.
  const getWorkerData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${api}/api/fetchWorker`);

      // Check HTTP response.
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      // Check backend response.
      if (result.ok === false) {
        throw new Error(result.message || "Unable to fetch workers");
      }

      // Support common Laravel and Express response formats.
      const workerList = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.workers)
            ? result.workers
            : Array.isArray(result.data?.data)
              ? result.data.data
              : [];

      // Convert backend data into the format used by the UI.
      const formattedWorkers: Worker[] = workerList.map((worker: any) => ({
        id: worker.id,

        name: worker.name || worker.fullname || "Unknown Worker",

        profession:
          worker.profession || worker.occupation || worker.title || "Artisan",

        skills: Array.isArray(worker.skills)
          ? worker.skills
          : typeof worker.skills === "string"
            ? worker.skills.split(",").map((skill: string) => skill.trim())
            : [],
        location:[worker.street, worker.lga, worker.state].filter(Boolean).join(", ") || "Location unavailable",

        rating: Number(worker.rating || 0),

        avatar:
          worker.avatar ||
          worker.profile_photo ||
          worker.profile_picture ||
          "https://i.pravatar.cc/150",

        hourlyRate:
          worker.hourlyRate ||
          worker.hourly_rate ||
          worker.rate ||
          "Negotiable",
      }));

      setWorkers(formattedWorkers);
    } catch (err: any) {
      console.log("Worker fetching error:", err);

      setError(err.message || "Something went wrong");

      Alert.alert("Error", err.message || "Unable to fetch workers");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch workers when screen loads.
  useEffect(() => {
    getWorkerData();
  }, [getWorkerData]);

  // Filter workers dynamically.
  const filteredFreelancers = useMemo(() => {
    return workers.filter((worker) => {
      // Search by name or skills.
      const matchesSearch =
        worker.name.toLowerCase().includes(search.toLowerCase()) ||
        worker.skills.some((skill) =>
          skill.toLowerCase().includes(search.toLowerCase()),
        );

      // Filter by profession.
      const matchesCategory =
        selectedCategory === "All" || worker.profession === selectedCategory;

      // Filter by location.
      const matchesLocation = worker.location
        .toLowerCase()
        .includes(location.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [workers, search, selectedCategory, location]);

  // Render individual worker.
  const renderFreelancer = ({ item }: { item: Worker }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("FreelancerDetails", {
          freelancer: item,
        })
      }
    >
      {/* Worker information */}
      <View style={styles.topRow}>
        <View style={styles.leftTop}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{item.name}</Text>

            <Text style={styles.profession}>{item.profession}</Text>
          </View>
        </View>

        <View style={styles.ratingBox}>
          <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />

          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={18}
          color="#64748B"
        />

        <Text style={styles.location}>{item.location}</Text>
      </View>

      {/* Skills */}
      <View style={styles.skillsContainer}>
        {item.skills.map((skill, index) => (
          <View key={`${item.id}-${index}`} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      {/* Bottom section */}
      <View style={styles.bottomRow}>
        <Text style={styles.rate}>{item.hourlyRate}</Text>

        <TouchableOpacity
          style={styles.hireBtn}
          onPress={() =>
            navigation.navigate("FreelancerDetails", {
              freelancer: item,
            })
          }
        >
          <Text style={styles.hireBtnText}>Hire Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#0F172A", "#1E293B", "#334155"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Freelancers</Text>

        <Text style={styles.subtitle}>Search and hire top talent</Text>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <TextInput
          mode="outlined"
          placeholder="Search by name or skill..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          left={<TextInput.Icon icon="magnify" />}
        />

        <TextInput
          mode="outlined"
          placeholder="Filter by location..."
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          left={<TextInput.Icon icon="map-marker" />}
        />
      </View>

      {/* Categories
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          paddingHorizontal: 20,
          marginBottom: 15,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              selectedCategory === item && styles.activeCategoryBtn,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.activeCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      /> */}

      {/* Loading */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error && workers.length === 0 ? (
        // Error state
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="wifi-off" size={70} color="#94A3B8" />

          <Text style={styles.emptyTitle}>Unable to load workers</Text>

          <Text style={styles.emptyText}>{error}</Text>

          <TouchableOpacity style={styles.hireBtn} onPress={getWorkerData}>
            <Text style={styles.hireBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredFreelancers.length === 0 ? (
        // Empty state
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="account-search-outline"
            size={80}
            color="#94A3B8"
          />

          <Text style={styles.emptyTitle}>No freelancers found</Text>

          <Text style={styles.emptyText}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        // Display backend workers.
        <FlatList
          data={filteredFreelancers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderFreelancer}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={getWorkerData}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 5,
  },

  searchSection: {
    paddingHorizontal: 20,
  },

  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  categoryBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
  },

  activeCategoryBtn: {
    backgroundColor: "#2563EB",
  },

  categoryText: {
    color: "#CBD5E1",
    fontWeight: "600",
  },

  activeCategoryText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 15,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0F172A",
  },

  profession: {
    color: "#64748B",
    marginTop: 3,
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  rating: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#92400E",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  location: {
    marginLeft: 5,
    color: "#64748B",
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
  },

  skillBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },

  skillText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 12,
  },

  bottomRow: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16A34A",
  },

  hireBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },

  hireBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },

  emptyText: {
    color: "#94A3B8",
    marginTop: 8,
    textAlign: "center",
  },
});
