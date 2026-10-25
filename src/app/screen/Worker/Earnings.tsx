import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
// import { PDFDocument, rgb } from "pdf-lib";

export default function Earnings() {
  const transactions = [
    { title: "Website Design", amount: "+$250" },
    { title: "Mobile App UI", amount: "+$180" },
    { title: "Logo Design", amount: "+$50" },
  ];

//   const generateInvoice = async () => {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([600, 400]);

//   page.drawText("INVOICE", {
//     x: 250,
//     y: 350,
//     size: 20,
//   });

//   page.drawText("Service: Website Design", {
//     x: 50,
//     y: 300,
//   });

//   page.drawText("Amount: $250", {
//     x: 50,
//     y: 270,
//   });

//   const pdfBytes = await pdfDoc.save();
// //   return pdfBytes;
// };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* HEADER */}
      <Text style={styles.title}>Earnings</Text>
      <Text style={styles.subtitle}>Track your income & withdrawals</Text>

      {/* TOTAL BALANCE */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>

        <Text style={styles.balanceAmount}>$1,250.50</Text>

        <TouchableOpacity style={styles.withdrawBtn}>
          <Text style={styles.withdrawText}>Withdraw Earnings</Text>
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$320</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>$980</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      {/* TRANSACTIONS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {transactions.map((item, index) => (
          <View key={index} style={styles.transaction}>
            <Text style={styles.txTitle}>{item.title}</Text>

            <Text style={styles.txAmount}>{item.amount}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Earnings Overview
        </Text>

        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            datasets: [{ data: [120, 200, 150, 300, 250] }],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisLabel="$"
          chartConfig={{
            backgroundGradientFrom: "#0F172A",
            backgroundGradientTo: "#1E293B",
            color: () => "#2563EB",
          }}
          bezier
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
  },

  subtitle: {
    color: "#94A3B8",
    marginBottom: 20,
  },

  balanceCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },

  balanceLabel: {
    color: "#64748B",
    fontSize: 14,
  },

  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#16A34A",
    marginVertical: 10,
  },

  withdrawBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  withdrawText: {
    color: "#fff",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0F172A",
  },

  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  txTitle: {
    color: "#0F172A",
  },

  txAmount: {
    color: "#16A34A",
    fontWeight: "700",
  },
});
