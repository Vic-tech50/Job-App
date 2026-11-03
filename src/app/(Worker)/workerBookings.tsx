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

// Booking information from the database.
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

const filters = ["all", "pending", "accepted", "rejected", "completed"];

export default function Hire() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch artisan's bookings.
  const fetchBookings = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      // Get the logged-in user's information.
      const userData = await AsyncStorage.getItem("user");

      // Convert stored JSON into an object.
      const user = userData ? JSON.parse(userData) : null;

      const userid = user?.id;

      if (!userid) {
        throw new Error("Artisan ID could not be found.");
      }

      // Fetch bookings belonging to this artisan.
      const response = await fetch(`${api}/api/artisan/bookings/${userid}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch bookings.");
      }

      const data = Array.isArray(result)
        ? result
        : result.data?.data || result.data || result.bookings || [];

      setBookings(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log("Booking error:", error.message);

      Alert.alert("Error", error.message || "Could not load booking requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Refresh booking list.
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Count bookings.
  const countStatus = (status: string) => {
    if (status === "all") return bookings.length;

    return bookings.filter((booking) => booking.status === status).length;
  };

  // Filter bookings.
  const filteredBookings =
    selectedFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === selectedFilter);

  // Format date.
  const formatDate = (date: string) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format time.
  const formatTime = (time: string) => {
    if (!time) return "Time unavailable";

    const parsedTime = new Date(`1970-01-01T${time}`);

    if (Number.isNaN(parsedTime.getTime())) return time;

    return parsedTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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

  // Status colors.
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

  // Update booking status.
  const updateBookingStatus = async (
    booking: Booking,
    status: "accepted" | "rejected",
  ) => {
    const action = status === "accepted" ? "accept" : "reject";

    Alert.alert(
      `${status === "accepted" ? "Accept" : "Reject"} Booking`,
      `Are you sure you want to ${action} this booking request?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: status === "accepted" ? "Accept" : "Reject",
          style: status === "rejected" ? "destructive" : "default",
          onPress: async () => {
            try {
              setUpdatingId(booking.id);

              const token = await AsyncStorage.getItem("token");

              const response = await fetch(
                `${api}/api/bookings/${booking.id}/status`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...(token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : {}),
                  },
                  body: JSON.stringify({ status }),
                },
              );

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.message || "Unable to update booking.");
              }

              // Update the booking in the current list.
              setBookings((previous) =>
                previous.map((item) =>
                  item.id === booking.id ? { ...item, status } : item,
                ),
              );

              Alert.alert("Successful", `Booking ${status} successfully.`);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Something went wrong.");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ],
    );
  };

  // Open booking details.
  const openBooking = (booking: Booking) => {
    router.push({
      pathname: "/screen/Worker/workerBookingDetails",
      params: {
        id: String(booking.id),
      },
    });
  };

  // Booking card.
  const renderBooking = (booking: Booking) => {
    const isUpdating = updatingId === booking.id;

    return (
      <View key={booking.id} style={styles.bookingCard}>
        {/* Booking header */}
        <View style={styles.cardHeader}>
          <View style={styles.serviceIcon}>
            <MaterialCommunityIcons name="tools" size={23} color="#2563EB" />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.serviceName}>{booking.service}</Text>

            <Text style={styles.reference}>Ref: {booking.booking_id}</Text>
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

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {booking.description}
        </Text>

        {/* Location */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={18}
            color="#64748B"
          />

          <Text style={styles.infoText}>
            {booking.address}, {booking.lga}, {booking.state}
          </Text>
        </View>

        {/* Appointment date */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={18}
            color="#64748B"
          />

          <Text style={styles.infoText}>
            {formatDate(booking.preferred_date)}
          </Text>
        </View>

        {/* Appointment time */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={18}
            color="#64748B"
          />

          <Text style={styles.infoText}>
            {formatTime(booking.preferred_time)}
          </Text>
        </View>

        {/* Phone number */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={18}
            color="#64748B"
          />

          <Text style={styles.infoText}>{booking.phone}</Text>
        </View>

        {/* Budget */}
        <View style={styles.budgetContainer}>
          <View>
            <Text style={styles.budgetLabel}>Customer's Budget</Text>

            <Text style={styles.budget}>{formatBudget(booking.budget)}</Text>
          </View>

          <TouchableOpacity
            onPress={() => openBooking(booking)}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>Details</Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color="#2563EB"
            />
          </TouchableOpacity>
        </View>

        {/* Accept and reject buttons */}
        {booking.status === "pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.rejectButton}
              disabled={isUpdating}
              onPress={() => updateBookingStatus(booking, "rejected")}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              disabled={isUpdating}
              onPress={() => updateBookingStatus(booking, "accepted")}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept Request</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.loadingText}>Loading booking requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Booking Requests</Text>

          <Text style={styles.subheading}>Manage your customer requests</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>Total Requests</Text>

          <Text style={styles.summaryNumber}>{bookings.length}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View>
          <Text style={styles.summaryLabel}>Pending</Text>

          <Text style={styles.pendingNumber}>{countStatus("pending")}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View>
          <Text style={styles.summaryLabel}>Accepted</Text>

          <Text style={styles.acceptedNumber}>{countStatus("accepted")}</Text>
        </View>
      </View>

      {/* Filters */}
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
              {filter.charAt(0).toUpperCase() + filter.slice(1)} (
              {countStatus(filter)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Booking list */}
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
              name="clipboard-text-outline"
              size={65}
              color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>No booking requests found</Text>

            <Text style={styles.emptyDescription}>
              {selectedFilter === "all"
                ? "New customer requests will appear here."
                : `You don't have any ${selectedFilter} bookings.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 55,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    color: "#64748B",
    marginTop: 12,
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  heading: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
  },

  subheading: {
    color: "#64748B",
    fontSize: 12,
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

  summary: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },

  summaryLabel: {
    fontSize: 10,
    color: "#64748B",
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 5,
  },

  pendingNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#D97706",
    marginTop: 5,
  },

  acceptedNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#15803D",
    marginTop: 5,
  },

  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: "#E2E8F0",
  },

  filterScroll: {
    maxHeight: 45,
    flexGrow: 0,
  },

  filterContainer: {
    paddingHorizontal: 20,
    gap: 9,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  activeFilter: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
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
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  reference: {
    fontSize: 10,
    color: "#94A3B8",
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
    fontSize: 12,
    color: "#64748B",
    lineHeight: 19,
    marginTop: 15,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 11,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
  },

  budgetContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 14,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  budgetLabel: {
    color: "#94A3B8",
    fontSize: 10,
  },

  budget: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailsButtonText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  rejectButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  rejectButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 12,
  },

  acceptButton: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 65,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 15,
  },

  emptyDescription: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
  },
});
