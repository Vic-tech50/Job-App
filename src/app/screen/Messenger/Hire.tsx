import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ActivityIndicator, TextInput } from "react-native-paper";

const freelancersData = [
  {
    id: "1",
    name: "Victor Okenyi",
    profession: "Full Stack Developer",
    skills: ["React Native", "Laravel", "Node.js"],
    location: "Enugu, Nigeria",
    rating: 4.9,
    avatar: "https://i.pravatar.cc/150?img=12",
    hourlyRate: "$35/hr",
  },

  {
    id: "2",
    name: "Sarah Johnson",
    profession: "UI/UX Designer",
    skills: ["Figma", "Adobe XD", "UI Design"],
    location: "Lagos, Nigeria",
    rating: 4.8,
    avatar: "https://i.pravatar.cc/150?img=32",
    hourlyRate: "$28/hr",
  },

  {
    id: "3",
    name: "Michael Brown",
    profession: "Mobile Developer",
    skills: ["Flutter", "React Native", "Firebase"],
    location: "Abuja, Nigeria",
    rating: 4.7,
    avatar: "https://i.pravatar.cc/150?img=15",
    hourlyRate: "$40/hr",
  },

  {
    id: "4",
    name: "David Mark",
    profession: "Backend Developer",
    skills: ["Laravel", "PHP", "MySQL"],
    location: "Port Harcourt, Nigeria",
    rating: 4.6,
    avatar: "https://i.pravatar.cc/150?img=22",
    hourlyRate: "$32/hr",
  },
];

const categories = [
  "All",
  "Full Stack Developer",
  "UI/UX Designer",
  "Mobile Developer",
  "Backend Developer",
];

export default function FindFreelancers({ navigation }: any) {
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [location, setLocation] = useState("");

  const [loading] = useState(false);

  // FILTER LOGIC
  const filteredFreelancers = useMemo(() => {
    return freelancersData.filter((freelancer) => {
      const matchesSearch =
        freelancer.name.toLowerCase().includes(search.toLowerCase()) ||
        freelancer.skills.some((skill) =>
          skill.toLowerCase().includes(search.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "All" ||
        freelancer.profession === selectedCategory;

      const matchesLocation =
        location.length === 0 ||
        freelancer.location.toLowerCase().includes(location.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [search, selectedCategory, location]);

  // FREELANCER CARD
  const renderFreelancer = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("FreelancerDetails", {
          freelancer: item,
        })
      }
    >
      {/* TOP */}
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

          <Text style={styles.rating}>{item.rating}</Text>
        </View>
      </View>

      {/* LOCATION */}
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={18}
          color="#64748B"
        />

        <Text style={styles.location}>{item.location}</Text>
      </View>

      {/* SKILLS */}
      <View style={styles.skillsContainer}>
        {item.skills.map((skill: string, index: number) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      {/* BOTTOM */}
      <View style={styles.bottomRow}>
        <Text style={styles.rate}>{item.hourlyRate}</Text>

        <TouchableOpacity style={styles.hireBtn}>
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
      {Platform.OS === "web" ? (
        <>
          <Text>isPad</Text>
          <Text>This is a web browser</Text>
        </>
      ) : (
        <>
          <Text>isPad</Text>
          <Text>This is a Android browser</Text>
        </>
      )}
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Freelancers</Text>

        <Text style={styles.subtitle}>Search and hire top talent</Text>
      </View>

      {/* SEARCH */}
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

      {/* CATEGORY FILTER */}
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
      />

      {/* LOADING */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <>
          {/* EMPTY STATE */}
          {filteredFreelancers.length === 0 ? (
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
            <FlatList
              data={filteredFreelancers}
              keyExtractor={(item) => item.id}
              renderItem={renderFreelancer}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 120,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
