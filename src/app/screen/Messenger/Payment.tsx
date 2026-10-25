import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ClientPayments() {
  const transactions = [
    {
      id: 1,
      title: "Mobile App Development",
      freelancer: "John Dev",
      amount: "$500",
      status: "Completed",
    },
    {
      id: 2,
      title: "UI/UX Design",
      freelancer: "Sarah Design",
      amount: "$250",
      status: "Pending",
    },
    {
      id: 3,
      title: "Website Backend API",
      freelancer: "Victor Okenyi",
      amount: "$800",
      status: "Completed",
    },
  ];

  return (
    <LinearGradient
      colors={["#0F172A", "#1E293B", "#334155"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>
          Manage your spending & transactions
        </Text>

        {/* WALLET CARD */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>
            Available Balance
          </Text>

          <Text style={styles.walletAmount}>
            $1,250.00
          </Text>

          <Text style={styles.walletSub}>
            Safe & secured escrow wallet
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              $4.2K
            </Text>

            <Text style={styles.statLabel}>
              Total Spent
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              12
            </Text>

            <Text style={styles.statLabel}>
              Transactions
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              2
            </Text>

            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>
        </View>

        {/* ACTION BUTTON */}
        <TouchableOpacity style={styles.addBtn}>
          <MaterialCommunityIcons
            name="credit-card-plus-outline"
            size={22}
            color="#fff"
          />

          <Text style={styles.addBtnText}>
            Add Payment Method
          </Text>
        </TouchableOpacity>

        {/* TRANSACTIONS */}
        <Text style={styles.sectionTitle}>
          Recent Transactions
        </Text>

        {transactions.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.left}>
              <Text style={styles.jobTitle}>
                {item.title}
              </Text>

              <Text style={styles.freelancer}>
                {item.freelancer}
              </Text>
            </View>

            <View style={styles.right}>
              <Text style={styles.amount}>
                {item.amount}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      item.status === "Completed"
                        ? "#DCFCE7"
                        : "#FEF3C7",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color:
                      item.status === "Completed"
                        ? "#16A34A"
                        : "#D97706",
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#94A3B8",
    marginBottom: 20,
  },

  walletCard: {
    backgroundColor: "#2563EB",
    padding: 22,
    borderRadius: 20,
    marginBottom: 18,
  },

  walletLabel: {
    color: "#DBEAFE",
  },

  walletAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 6,
  },

  walletSub: {
    color: "#DBEAFE",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  statCard: {
    backgroundColor: "#fff",
    width: "31%",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },

  addBtn: {
    flexDirection: "row",
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,

    flexDirection: "row",
    justifyContent: "space-between",
  },

  left: {
    width: "60%",
  },

  right: {
    alignItems: "flex-end",
  },

  jobTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },

  freelancer: {
    color: "#64748B",
    marginTop: 4,
  },

  amount: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#16A34A",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },
});