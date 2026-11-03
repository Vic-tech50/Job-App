import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ToastMess } from "@/src/utils/toast";
import { api } from "../../config";

// Define the booking information returned by your API.
interface Booking {
  id: number | string;
  booking_id?: string;
  client_id?: number | string;
  artisan_id?: number | string;
  service?: string;
  description?: string;
  address?: string;
  state?: string;
  lga?: string;
  preferred_date?: string;
  preferred_time?: string;
  budget?: string | number;
  phone?: string;
  status?: string;
  date?: string;

  // Customer information from the joined users table.
  customer_name?: string;
  customer_fullname?: string;
  customer_email?: string;
  customer_phone?: string;
}

export default function BookingDetails() {
  const router = useRouter();

  // Read the booking ID passed from the Hire page.
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Load one booking from the backend.
  const loadBooking = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        ToastMess({
          type: "error",
          title: "Session expired",
          content: "Please login again.",
        });
        router.replace("/screen/Auth/LoginScreen");
        return;
      }

      if (!id) {
        ToastMess({
          type: "error",
          title: "Error",
          content: "Booking ID is missing.",
        });
        return;
      }

      const response = await fetch(`${api}/api/getbookingsdetails/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load booking.");
      }

      // Support common API response structures.
      const bookingData =
        result.data?.booking || result.booking || result.data || result;

      if (!bookingData || !bookingData.id) {
        throw new Error("Booking information was not found.");
      }

      setBooking(bookingData);
    } catch (error: any) {
      console.log("Booking details error:", error);
      ToastMess({
        type: "error",
        title: "Unable to load booking",
        content: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // Refresh booking details.
  const onRefresh = () => {
    setRefreshing(true);
    loadBooking();
  };

  // Format a date such as 2026-11-05.
  const formatDate = (date?: string) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(`${date.substring(0, 10)}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format a time such as 14:30:00 into 2:30 PM.
  const formatTime = (time?: string) => {
    if (!time) return "Not specified";

    const parts = time.split(":");
    const hour = Number(parts[0]);
    const minute = Number(parts[1] || 0);

    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return time;
    }

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format the budget in Nigerian Naira.
  const formatBudget = (budget?: string | number) => {
    if (budget === undefined || budget === null || budget === "") {
      return "Not specified";
    }

    const amount = Number(budget);

    if (Number.isNaN(amount)) return String(budget);

    return `₦${amount.toLocaleString("en-NG")}`;
  };

  // Get the customer's phone number.
  const customerPhone = booking?.customer_phone || booking?.phone || "";

  // Call the customer using the device's phone application.
  const callCustomer = async () => {
    if (!customerPhone) {
      ToastMess({
        type: "error",
        title: "Phone number unavailable",
        content: "The customer has not provided a phone number.",
      });
      return;
    }

    try {
      const phoneUrl = `tel:${customerPhone.replace(/[^\d+]/g, "")}`;

      const supported = await Linking.canOpenURL(phoneUrl);

      if (!supported) {
        ToastMess({
          type: "error",
          title: "Unable to call",
          content: "Calling is not supported on this device.",
        });
        return;
      }

      await Linking.openURL(phoneUrl);
    } catch (error) {
      console.log("Call customer error:", error);
      ToastMess({
        type: "error",
        title: "Error",
        content: "Could not open the phone application.",
      });
    }
  };

  // Update booking status through the backend.
  const updateBookingStatus = async (
    newStatus: "accepted" | "rejected" | "completed",
  ) => {
    if (!booking) return;

    const messages = {
      accepted: {
        title: "Accept booking?",
        message: "Do you want to accept this customer's request?",
        success: "Booking accepted successfully.",
      },
      rejected: {
        title: "Reject booking?",
        message: "Are you sure you want to reject this request?",
        success: "Booking rejected successfully.",
      },
      completed: {
        title: "Complete this job?",
        message: "Confirm that you have finished this customer's job.",
        success: "Job marked as completed successfully.",
      },
    };

    ToastMess({
      type: "error",
      title: messages[newStatus].title,
      content: messages[newStatus].message,
    });
    {
      const continueUpdate = async () => {
        try {
          setUpdating(true);

          const token = await AsyncStorage.getItem("token");

          const response = await fetch(
            `${api}/api/bookings/${booking.id}/status`,
            {
              method: "PATCH",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                status: newStatus,
              }),
            },
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message || "Unable to update booking status.",
            );
          }

          // Update the displayed booking after the server confirms.
          setBooking((previous) =>
            previous ? { ...previous, status: newStatus } : previous,
          );

          ToastMess({
            type: "success",
            title: "Success",
            content: messages[newStatus].success,
          });
        } catch (error: any) {
          console.log("Status update error:", error);
          ToastMess({
            type: "error",
            title: "Update failed",
            content: error.message || "Please try again.",
          });
        } finally {
          setUpdating(false);
        }
      };
      void continueUpdate();
    }
  };

  // Reusable information row.
  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons name={icon} size={20} color="#2563EB" />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  // Show a loading screen while retrieving booking details.
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="calendar-alert"
          size={55}
          color="#94A3B8"
        />
        <Text style={styles.emptyTitle}>Booking not found</Text>
        <Text style={styles.emptyText}>
          This booking may have been removed or is no longer available.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine the booking status.
  const status = (booking.status || "pending").toLowerCase();

  const statusColor =
    status === "accepted"
      ? "#15803D"
      : status === "completed"
        ? "#2563EB"
        : status === "rejected" || status === "cancelled"
          ? "#DC2626"
          : "#D97706";

  const customerName =
    booking.customer_name || booking.customer_fullname || "Customer";

  const fullAddress = [booking.address, booking.lga, booking.state]
    .filter(Boolean)
    .join(", ");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Top navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={23} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Booking Details</Text>

        <View style={{ width: 42 }} />
      </View>

      {/* Booking summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.serviceIcon}>
            <MaterialCommunityIcons
              name="briefcase-check-outline"
              size={27}
              color="#2563EB"
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.serviceLabel}>SERVICE REQUEST</Text>
            <Text style={styles.serviceName}>
              {booking.service || "Service request"}
            </Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.referenceRow}>
          <View>
            <Text style={styles.referenceLabel}>Booking Reference</Text>
            <Text style={styles.referenceValue}>
              {booking.booking_id || `#${booking.id}`}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Customer information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Information</Text>

        <View style={styles.customerRow}>
          <View style={styles.customerAvatar}>
            <MaterialCommunityIcons name="account" size={30} color="#2563EB" />
          </View>

          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.customerSubtitle}>Customer</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <InfoRow
          icon="phone-outline"
          label="Phone Number"
          value={customerPhone || "Not provided"}
        />

        {booking.customer_email ? (
          <InfoRow
            icon="email-outline"
            label="Email Address"
            value={booking.customer_email}
          />
        ) : null}

        <InfoRow
          icon="map-marker-outline"
          label="Service Address"
          value={fullAddress || "Address not provided"}
        />

        <TouchableOpacity
          style={[styles.callButton, !customerPhone && styles.disabledButton]}
          onPress={callCustomer}
          disabled={!customerPhone}
        >
          <MaterialCommunityIcons name="phone" size={19} color="#FFFFFF" />
          <Text style={styles.callButtonText}>Call Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Job description */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Job Description</Text>

        <Text style={styles.description}>
          {booking.description || "No job description provided."}
        </Text>
      </View>

      {/* Appointment details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>

        <InfoRow
          icon="calendar-month-outline"
          label="Preferred Date"
          value={formatDate(booking.preferred_date)}
        />

        <InfoRow
          icon="clock-outline"
          label="Preferred Time"
          value={formatTime(booking.preferred_time)}
        />

        <InfoRow
          icon="cash"
          label="Customer Budget"
          value={formatBudget(booking.budget)}
        />

        <InfoRow
          icon="calendar-check-outline"
          label="Request Submitted"
          value={formatDate(booking.date)}
        />
      </View>

      {/* Booking actions */}
      {status === "pending" && (
        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Respond to Request</Text>

          <Text style={styles.actionDescription}>
            Review the customer's request and choose whether to accept or reject
            the job.
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, updating && styles.disabledButton]}
            disabled={updating}
            onPress={() => updateBookingStatus("accepted")}
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.primaryButtonText}>Accept Request</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rejectButton, updating && styles.disabledButton]}
            disabled={updating}
            onPress={() => updateBookingStatus("rejected")}
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={20}
              color="#DC2626"
            />
            <Text style={styles.rejectButtonText}>Reject Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Complete an accepted job */}
      {status === "accepted" && (
        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Job Progress</Text>

          <View style={styles.acceptedNotice}>
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color="#15803D"
            />
            <Text style={styles.acceptedNoticeText}>
              You have accepted this booking. Contact the customer and complete
              the requested work.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.completeButton, updating && styles.disabledButton]}
            disabled={updating}
            onPress={() => updateBookingStatus("completed")}
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.primaryButtonText}>
                  Mark Job as Completed
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Completed booking */}
      {status === "completed" && (
        <View style={styles.completedNotice}>
          <MaterialCommunityIcons
            name="check-decagram"
            size={30}
            color="#15803D"
          />
          <Text style={styles.completedTitle}>Job Completed</Text>
          <Text style={styles.completedText}>
            This booking has been marked as completed.
          </Text>
        </View>
      )}

      {/* Rejected or cancelled booking */}
      {(status === "rejected" || status === "cancelled") && (
        <View style={styles.closedNotice}>
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color="#DC2626"
          />
          <Text style={styles.closedText}>
            This booking is {status}. No further action is available.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  scrollContent: {
    padding: 18,
    paddingTop: 55,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  loadingText: {
    color: "#64748B",
    marginTop: 12,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 15,
  },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 21,
  },

  backButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 20,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  backIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF1F6",
  },

  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryContent: {
    flex: 1,
    marginLeft: 13,
  },

  serviceLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  serviceName: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 5,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#EDF1F6",
    marginVertical: 17,
  },

  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  referenceLabel: {
    color: "#94A3B8",
    fontSize: 11,
  },

  referenceValue: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF1F6",
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 16,
  },

  customerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  customerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  customerDetails: {
    marginLeft: 13,
  },

  customerName: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },

  customerSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF1F6",
    marginVertical: 17,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 4,
  },

  infoValue: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },

  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },

  callButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 9,
  },

  disabledButton: {
    opacity: 0.5,
  },

  description: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 23,
  },

  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF1F6",
  },

  actionDescription: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 21,
    marginTop: -7,
    marginBottom: 17,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 11,
  },

  rejectButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  acceptedNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 13,
    marginBottom: 17,
  },

  acceptedNoticeText: {
    flex: 1,
    color: "#166534",
    fontSize: 12,
    lineHeight: 19,
    marginLeft: 9,
  },

  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 15,
    borderRadius: 12,
  },

  completedNotice: {
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 22,
    borderRadius: 17,
    marginBottom: 20,
  },

  completedTitle: {
    color: "#15803D",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 9,
  },

  completedText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

  closedNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  closedText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 10,
  },
});
