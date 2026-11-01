import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Import your API configuration.
import { api } from "../config";

// Service categories.
const categories = [
  { id: "1", name: "Plumbing", icon: "wrench" },
  { id: "2", name: "Electrical", icon: "lightning-bolt" },
  { id: "3", name: "Carpentry", icon: "hammer" },
  { id: "4", name: "Painting", icon: "format-paint" },
  { id: "5", name: "Cleaning", icon: "broom" },
  { id: "6", name: "AC Repair", icon: "air-conditioner" },
  { id: "7", name: "Masonry", icon: "wall" },
  { id: "8", name: "More", icon: "dots-horizontal" },
];

// Sample artisan data.
// Replace this with data from your backend.
const sampleArtisans = [
  {
    id: "1",
    name: "Emeka Okafor",
    occupation: "Professional Plumber",
    rating: 4.9,
    reviews: 28,
    location: "Enugu",
    image: "https://i.pravatar.cc/300?img=12",
    available: true,
  },
  {
    id: "2",
    name: "Chinedu James",
    occupation: "Electrical Technician",
    rating: 4.8,
    reviews: 19,
    location: "Enugu",
    image: "https://i.pravatar.cc/300?img=13",
    available: true,
  },
  {
    id: "3",
    name: "Daniel Peter",
    occupation: "Furniture Carpenter",
    rating: 4.7,
    reviews: 35,
    location: "Nsukka",
    image: "https://i.pravatar.cc/300?img=14",
    available: false,
  },
];

export default function ClientHome() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [artisans, setArtisans] = useState(sampleArtisans);
  const [loading, setLoading] = useState(false);

  // Load client details.
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Unable to load user:", error);
      }
    };

    loadUser();
  }, []);

  // Fetch artisans from your backend.
  // Adjust the endpoint to match your Laravel API.
  const fetchArtisans = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${api}/artisans`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Could not load artisans");
      }

      const data = await response.json();

      // Adjust this mapping to your API response structure.
      if (Array.isArray(data)) {
        setArtisans(data);
      } else if (Array.isArray(data.artisans)) {
        setArtisans(data.artisans);
      }
    } catch (error) {
      console.log("Artisan loading error:", error);
      // Keep sample data visible if the API is unavailable.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, []);

  // Filter artisans based on search and category.
  const filteredArtisans = artisans.filter((artisan: any) => {
    const searchMatch =
      artisan.name?.toLowerCase().includes(search.toLowerCase()) ||
      artisan.occupation?.toLowerCase().includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" ||
      artisan.occupation
        ?.toLowerCase()
        .includes(selectedCategory.toLowerCase());

    return searchMatch && categoryMatch;
  });

  // Open artisan details.
  const openArtisan = (artisan: any) => {
    // router.push({
    //   pathname: "/client/artisan/[id]",
    //   params: { id: String(artisan.id) },
    // });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>GOOD DAY 👋</Text>

            <Text style={styles.username}>
              Hello, {user?.fullname?.split(" ")[0] || "there"}
            </Text>

            <View style={styles.location}>
              <MaterialCommunityIcons
                name="map-marker"
                size={15}
                color="#2563EB"
              />

              <Text style={styles.locationText}>
                {user?.state || "Set your location"}, Nigeria
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/client/notifications" as any)}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={23}
              color="#0F172A"
            />

            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* SEARCH SECTION */}
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>
            What service do you need today?
          </Text>

          <Text style={styles.searchSubtitle}>
            Find trusted professionals around you.
          </Text>

          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={23} color="#94A3B8" />

            <TextInput
              placeholder="Search artisans or services..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            <MaterialCommunityIcons
              name="tune-variant"
              size={21}
              color="#2563EB"
            />
          </View>
        </View>

        {/* CATEGORIES */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Explore Services</Text>
            <Text style={styles.sectionSubtitle}>
              Find the right professional for your needs.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/client/categories" as any)}
          >
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => {
                setSelectedCategory(category.name);
                setSearch("");
              }}
            >
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons
                  name={category.icon as any}
                  size={25}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TOP ARTISANS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top Artisans</Text>
            <Text style={styles.sectionSubtitle}>
              Professionals clients love.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/client/artisans" as any)}
          >
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator color="#2563EB" style={{ marginVertical: 15 }} />
        )}

        {filteredArtisans.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-search-outline"
              size={38}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>No artisans found</Text>

            <Text style={styles.emptySubtitle}>
              Try searching for another service.
            </Text>
          </View>
        ) : (
          filteredArtisans.map((artisan: any) => (
            <TouchableOpacity
              key={artisan.id}
              style={styles.artisanCard}
              onPress={() => openArtisan(artisan)}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    artisan.profile_picture ||
                    artisan.image ||
                    "https://i.pravatar.cc/300?img=12",
                }}
                style={styles.artisanImage}
              />

              <View style={styles.artisanDetails}>
                <Text style={styles.artisanName}>
                  {artisan.name || artisan.fullname}
                </Text>

                <Text style={styles.artisanOccupation}>
                  {artisan.occupation || artisan.skill}
                </Text>

                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#F59E0B"
                  />

                  <Text style={styles.ratingText}>{artisan.rating || 0}</Text>

                  <Text style={styles.reviewText}>
                    ({artisan.reviews || 0} reviews)
                  </Text>
                </View>

                <View style={styles.artisanLocation}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={14}
                    color="#64748B"
                  />

                  <Text style={styles.artisanLocationText}>
                    {artisan.location ||
                      artisan.state ||
                      "Location unavailable"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.availability,
                    !artisan.available && styles.unavailable,
                  ]}
                >
                  <Text
                    style={[
                      styles.availabilityText,
                      !artisan.available && styles.unavailableText,
                    ]}
                  >
                    {artisan.available ? "Available" : "Currently unavailable"}
                  </Text>
                </View>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#94A3B8"
              />
            </TouchableOpacity>
          ))
        )}

        {/* PROMOTIONAL CARD */}
        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Need a professional urgently?</Text>

            <Text style={styles.promoSubtitle}>
              Connect with skilled artisans and get your work done.
            </Text>

            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => router.push("/client/artisans" as any)}
            >
              <Text style={styles.promoButtonText}>Find an Artisan</Text>

              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <MaterialCommunityIcons name="tools" size={75} color="#BFDBFE" />
        </View>

        {/* BOTTOM SPACE */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/client/home" as any)}
        >
          <MaterialCommunityIcons name="home" size={23} color="#2563EB" />
          <Text style={styles.activeNavText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/client/bookings" as any)}
        >
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={23}
            color="#94A3B8"
          />
          <Text style={styles.navText}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/client/messages" as any)}
        >
          <MaterialCommunityIcons
            name="message-text-outline"
            size={23}
            color="#94A3B8"
          />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/client/profile" as any)}
        >
          <MaterialCommunityIcons
            name="account-outline"
            size={23}
            color="#94A3B8"
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scroll: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  greeting: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  username: {
    fontSize: 25,
    color: "#0F172A",
    fontWeight: "800",
    marginTop: 5,
  },

  location: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },

  locationText: {
    fontSize: 12,
    color: "#64748B",
  },

  notificationButton: {
    width: 47,
    height: 47,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  notificationDot: {
    position: "absolute",
    width: 8,
    height: 8,
    backgroundColor: "#EF4444",
    borderRadius: 4,
    top: 10,
    right: 11,
  },

  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  searchSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 17,
  },

  searchBox: {
    height: 51,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },

  seeAll: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  categoryItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 17,
  },

  categoryIcon: {
    width: 61,
    height: 61,
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  categoryName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },

  artisanCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },

  artisanImage: {
    width: 83,
    height: 94,
    borderRadius: 13,
    backgroundColor: "#E2E8F0",
  },

  artisanDetails: {
    flex: 1,
  },

  artisanName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  artisanOccupation: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 3,
  },

  ratingText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "700",
  },

  reviewText: {
    fontSize: 10,
    color: "#94A3B8",
  },

  artisanLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 3,
  },

  artisanLocationText: {
    fontSize: 10,
    color: "#64748B",
  },

  availability: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 7,
  },

  unavailable: {
    backgroundColor: "#F1F5F9",
  },

  availabilityText: {
    color: "#15803D",
    fontSize: 9,
    fontWeight: "700",
  },

  unavailableText: {
    color: "#64748B",
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginTop: 10,
  },

  emptySubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 5,
  },

  promoCard: {
    backgroundColor: "#1D4ED8",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
    overflow: "hidden",
  },

  promoContent: {
    flex: 1,
    paddingRight: 8,
  },

  promoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  promoSubtitle: {
    fontSize: 11,
    color: "#DBEAFE",
    lineHeight: 17,
    marginTop: 7,
  },

  promoButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 13,
    gap: 7,
  },

  promoButtonText: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "800",
  },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 25 : 12,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  navItem: {
    alignItems: "center",
    gap: 4,
  },

  navText: {
    fontSize: 10,
    color: "#94A3B8",
  },

  activeNavText: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "800",
  },
});
