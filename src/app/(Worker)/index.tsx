import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
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

// Artisan information.
interface Worker {
  id: number | string;
  name: string;
  profession: string;
  avatar?: string;
  rating?: number;
  location?: string;
}

// Booking information.
interface Booking {
  id: number;
  booking_id: string;
  artisan_id: number;
  client_id: number;
  service: string;
  description: string;
  address: string;
  state: string;
  lga: string;
  preferred_date: string;
  preferred_time: string;
  budget: number | string | null;
  phone: string;
  status: string;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch artisan profile and bookings.
  const fetchDashboard = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      // Get artisan information.
      const workerResponse = await fetch(`${api}/api/getWorkerData`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const workerResult = await workerResponse.json();

      if (!workerResponse.ok) {
        throw new Error(
          workerResult.message || "Unable to load artisan profile.",
        );
      }

      // Support different API response structures.
      const workerData =
        workerResult.data?.worker ||
        workerResult.worker ||
        workerResult.data ||
        workerResult;

      setWorker({
        id: workerData.id,
        name:
          workerData.name ||
          workerData.fullname ||
          workerData.full_name ||
          "Artisan",
        profession:
          workerData.profession ||
          workerData.occupation ||
          workerData.title ||
          "Professional Artisan",
        avatar:
          workerData.avatar ||
          workerData.profile_photo ||
          workerData.profile_picture ||
          "",
        rating: Number(workerData.rating || 0),
        location: [workerData.street, workerData.lga, workerData.state]
          .filter(Boolean)
          .join(", "),
      });

      // Get bookings assigned to this artisan.
      const bookingResponse = await fetch(
        `${api}/api/artisan/bookings/${workerData.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingResult.message || "Unable to load bookings.");
      }

      // Support array and object responses.
      const bookingData = Array.isArray(bookingResult)
        ? bookingResult
        : bookingResult.data?.data ||
          bookingResult.data ||
          bookingResult.bookings ||
          [];

      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (error: any) {
      console.log("Dashboard error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load dashboard when page opens.
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Refresh dashboard.
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  // Count bookings by status.
  const pending = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  const accepted = bookings.filter(
    (booking) => booking.status === "accepted",
  ).length;

  const completed = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const rejected = bookings.filter(
    (booking) => booking.status === "rejected",
  ).length;

  // Format booking date.
  const formatDate = (date: string) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format budget.
  const formatBudget = (budget: number | string | null) => {
    if (budget === null || budget === "") return "Negotiable";

    const amount = Number(budget);

    return Number.isNaN(amount)
      ? String(budget)
      : `₦${amount.toLocaleString("en-NG")}`;
  };

  // Get booking status color.
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

  // Navigate to booking details.
  // const openBooking = (booking: Booking) => {
  //     router.push({
  //         pathname: "/(Worker)/booking-details",
  //         params: {
  //             id: String(booking.id),
  //         },
  //     });
  // };

  // Display booking card.
  const renderBooking = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      activeOpacity={0.8}
      // onPress={() => openBooking(booking)}
    >
      <View style={styles.bookingTop}>
        <View style={styles.bookingIcon}>
          <MaterialCommunityIcons
            name="briefcase-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <View style={styles.bookingTitleContainer}>
          <Text style={styles.bookingService}>{booking.service}</Text>

          <Text style={styles.bookingReference}>#{booking.booking_id}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusBackground(booking.status),
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: getStatusColor(booking.status),
              },
            ]}
          >
            {booking.status}
          </Text>
        </View>
      </View>

      <Text style={styles.bookingDescription} numberOfLines={2}>
        {booking.description}
      </Text>

      <View style={styles.bookingInfo}>
        <MaterialCommunityIcons
          name="calendar-outline"
          size={16}
          color="#64748B"
        />

        <Text style={styles.bookingInfoText}>
          {formatDate(booking.preferred_date)}
        </Text>

        <MaterialCommunityIcons
          name="map-marker-outline"
          size={16}
          color="#64748B"
        />

        <Text style={styles.bookingInfoText} numberOfLines={1}>
          {booking.lga}, {booking.state}
        </Text>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.bookingBudget}>{formatBudget(booking.budget)}</Text>

        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>View request</Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color="#2563EB"
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.loadingText}>Preparing your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Welcome back,</Text>

            <Text style={styles.workerName}>{worker?.name || "Worker"} 👋</Text>

            <Text style={styles.profession}>{worker?.profession}</Text>
          </View>

          {worker?.avatar ? (
            <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons
                name="account"
                size={30}
                color="#2563EB"
              />
            </View>
          )}
        </View>

        {/* Availability / Profile Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <MaterialCommunityIcons name="tools" size={25} color="#FFFFFF" />
          </View>

          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Grow your business</Text>

            <Text style={styles.bannerDescription}>
              Keep your profile updated and respond to customer requests
              promptly.
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Work Overview</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statNumber}>{bookings.length}</Text>

            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={22}
                color="#D97706"
              />
            </View>

            <Text style={styles.statNumber}>{pending}</Text>

            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#DCFCE7" }]}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color="#15803D"
              />
            </View>

            <Text style={styles.statNumber}>{accepted}</Text>

            <Text style={styles.statLabel}>Accepted Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
              <MaterialCommunityIcons
                name="trophy-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statNumber}>{completed}</Text>

            <Text style={styles.statLabel}>Completed Jobs</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(Worker)/workerBookings")}
          >
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={25}
              color="#2563EB"
            />

            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(Worker)/Message")}
          >
            <MaterialCommunityIcons
              name="message-text-outline"
              size={25}
              color="#2563EB"
            />

            <Text style={styles.actionText}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(Worker)/Profile")}
          >
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={25}
              color="#2563EB"
            />

            <Text style={styles.actionText}>My Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bookings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>

          <TouchableOpacity
            onPress={() => router.push("/(Worker)/workerBookings")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {bookings.length > 0 ? (
          bookings.slice(0, 4).map(renderBooking)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="briefcase-search-outline"
              size={50}
              color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>No booking requests yet</Text>

            <Text style={styles.emptyDescription}>
              New customer requests will appear here when someone books your
              services.
            </Text>
          </View>
        )}

        {/* Additional information */}
        <View style={styles.footerNote}>
          <MaterialCommunityIcons
            name="information-outline"
            size={19}
            color="#64748B"
          />

          <Text style={styles.footerNoteText}>
            You have {rejected} rejected booking
            {rejected === 1 ? "" : "s"}.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  headerText: {
    flex: 1,
  },

  greeting: {
    fontSize: 14,
    color: "#64748B",
  },

  workerName: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },

  profession: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#E2E8F0",
  },

  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  banner: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  bannerIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  bannerText: {
    flex: 1,
    marginLeft: 13,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },

  bannerDescription: {
    color: "#DBEAFE",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
  },

  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  actionCard: {
    width: "31.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    marginTop: 9,
  },

  seeAll: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  bookingTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  bookingIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  bookingTitleContainer: {
    flex: 1,
    marginLeft: 10,
  },

  bookingService: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  bookingReference: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  bookingDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginTop: 13,
    marginBottom: 12,
  },

  bookingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  bookingInfoText: {
    fontSize: 11,
    color: "#64748B",
    flexShrink: 1,
  },

  bookingFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bookingBudget: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
  },

  viewDetailsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyDescription: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 13,
    borderRadius: 12,
    marginTop: 15,
    gap: 9,
  },

  footerNoteText: {
    fontSize: 11,
    color: "#64748B",
  },
});
