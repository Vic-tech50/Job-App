import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { api } from "../config";

// Booking interface.
interface Booking {
  id: number;
  booking_id: string;
  artisan_id: number;
  service: string;
  description: string;
  address: string;
  state: string;
  lga: string;
  preferred_date: string;
  preferred_time: string;
  budget: number | string | null;
  phone: string;
  date: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  artisan?: {
    name?: string;
    fullname?: string;
    profession?: string;
  };
}

const filters = [
  "all",
  "pending",
  "accepted",
  "rejected",
  "completed",
  "cancelled",
];

export default function Bookings() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  //   const [user, setUser] = useState<any>(null);
  //     const loadUser = async () => {
  //       try {
  //         const storedUser = await AsyncStorage.getItem("user");

  //         if (storedUser) {
  //           const userData = JSON.parse(storedUser);
  //           setUser(userData);
  //         }
  //       } catch (error) {
  //         console.log("Error loading user:", error);
  //       }
  //     };

  //     useEffect(() => {
  //       loadUser();
  //     }, []);

  // Fetch bookings from node API.
  const fetchBookings = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      // Get the logged-in user's information.
      const userData = await AsyncStorage.getItem("user");

      // Convert stored JSON into an object.
      const user = userData ? JSON.parse(userData) : null;

      const userid = user?.id;

      const response = await fetch(`${api}/api/bookings/${userid}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch bookings.");
      }

      // Support Laravel pagination and normal JSON responses.
      const data = Array.isArray(result)
        ? result
        : result.data?.data || result.data || result.bookings || [];

      setBookings(data);
    } catch (error: any) {
      console.log("Booking error:", error.message);
      Alert.alert("Error", error.message || "Could not load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Refresh bookings.
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Filter bookings by status.
  const filteredBookings =
    selectedFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === selectedFilter);

  // Get status color.
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "#15803D";
      case "completed":
        return "#2563EB";
      case "rejected":
      case "cancelled":
        return "#DC2626";
      default:
        return "#D97706";
    }
  };

  // Get status background.
  const getStatusBackground = (status: string) => {
    switch (status) {
      case "accepted":
        return "#DCFCE7";
      case "completed":
        return "#DBEAFE";
      case "rejected":
      case "cancelled":
        return "#FEE2E2";
      default:
        return "#FEF3C7";
    }
  };

  // Format currency.
  const formatBudget = (budget: number | string | null) => {
    if (budget === null || budget === "") return "Negotiable";

    const amount = Number(budget);

    if (Number.isNaN(amount)) return String(budget);

    return `₦${amount.toLocaleString("en-NG")}`;
  };

  // Open individual booking details.
  const openBooking = (booking: Booking) => {
    // router.push({
    // //   pathname: "",
    //   params: {
    //     id: String(booking.id),
    //   },
    // });
  };

  // Render individual booking card.
  const renderBooking = (booking: Booking) => {
    const status = booking.status || "pending";

    return (
      <TouchableOpacity
        key={booking.id}
        style={[styles.bookingCard]}
        activeOpacity={0.8}
        onPress={() => openBooking(booking)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.serviceIcon}>
            <MaterialCommunityIcons name="tools" size={23} color="#2563EB" />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.serviceName}>{booking.service}</Text>

            <Text style={styles.bookingReference}>
              Ref: #{booking.booking_id}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusBackground(status),
              },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(status) }]}
            >
              {status}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {booking.description}
        </Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={17} color="#64748B" />
          <Text style={styles.infoText}>
            {new Date(booking.preferred_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <MaterialCommunityIcons
            name="clock-outline"
            size={17}
            color="#64748B"
          />
          <Text style={styles.infoText}>
            {new Date(
              `1970-01-01T${booking.preferred_time}`,
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={17}
            color="#64748B"
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {booking.address}, {booking.lga}, {booking.state}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.budgetLabel}>Your Budget</Text>
            <Text style={styles.budget}>{formatBudget(booking.budget)}</Text>
          </View>

          <View style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#2563EB"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>My Bookings</Text>
          <Text style={styles.subheading}>
            Manage and track your service requests
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Booking Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Bookings</Text>
        <Text style={styles.summaryNumber}>{bookings.length}</Text>

        <View style={styles.summaryFooter}>
          <Text style={styles.summarySmall}>
            {bookings.filter((b) => b.status === "pending").length} Pending
          </Text>

          <Text style={styles.summarySmall}>
            {bookings.filter((b) => b.status === "accepted").length} Accepted
          </Text>

          <Text style={styles.summarySmall}>
            {bookings.filter((b) => b.status === "completed").length} Completed
          </Text>
        </View>
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Booking List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBookings.length > 0 ? (
            filteredBookings.map(renderBooking)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={65}
                color="#CBD5E1"
              />

              <Text style={styles.emptyTitle}>No bookings found</Text>

              <Text style={styles.emptyText}>
                Your {selectedFilter === "all" ? "" : selectedFilter + " "}
                bookings will appear here.
              </Text>

              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/(Messenger)/Hire")}
              >
                <Text style={styles.exploreButtonText}>Find an Artisan</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 55,
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
  },

  subheading: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCard: {
    backgroundColor: "#2563EB",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },

  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 14,
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginVertical: 5,
  },

  summaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    flexWrap: "wrap",
  },

  summarySmall: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },

  filterScroll: {
    maxHeight: 48,
    flexGrow: 0,
  },

  filterContainer: {
    paddingHorizontal: 20,
    gap: 9,
  },

  filterButton: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  activeFilter: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    // padding: 10,
    textTransform: "capitalize",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 45,
    height: 45,
    backgroundColor: "#EFF6FF",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  bookingReference: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 15,
    marginBottom: 13,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 7,
  },

  infoText: {
    color: "#475569",
    fontSize: 12,
    flexShrink: 1,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    marginTop: 8,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  budgetLabel: {
    color: "#94A3B8",
    fontSize: 11,
  },

  budget: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },

  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
  },

  viewDetailsText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#64748B",
    marginTop: 12,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 65,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 15,
  },

  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },

  exploreButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },

  exploreButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
