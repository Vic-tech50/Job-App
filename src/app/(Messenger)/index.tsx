import { HelloWave } from "@/components/ui/hello-wave";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ClientDashboard({ navigation }: any) {
  const [user, setUser] = React.useState<any>(null);

  const router = useRouter();

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.log("Error loading user:", error);
      }
    };

    loadUser();
  }, []);
  const recentProjects = [
    {
      id: 1,
      title: "Mobile App UI Design",
      freelancer: "Victor Okenyi",
      status: "In Progress",
      budget: "$500",
    },
    {
      id: 2,
      title: "Laravel API Development",
      freelancer: "John Dev",
      status: "Pending Review",
      budget: "$850",
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
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>
              Welcome Back <HelloWave size="sm"></HelloWave>
            </Text>

            <Text style={styles.name}>{user?.fullname || "Client"}</Text>
          </View>

          <TouchableOpacity style={styles.notificationBtn}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Spent</Text>

          <Text style={styles.balanceAmount}>$4,250</Text>

          <Text style={styles.balanceSub}>Across 18 completed projects</Text>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          {/* <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("PostGig")}
          >
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={30}
              color="#2563EB"
            />

            <Text style={styles.actionText}>Post Gig</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(Messenger)/Hire")}
          >
            <MaterialCommunityIcons
              name="account-search-outline"
              size={30}
              color="#2563EB"
            />

            <Text style={styles.actionText}>Hire Worker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(Messenger)/Message")}
          >
            <MaterialCommunityIcons
              name="chat-processing-outline"
              size={30}
              color="#2563EB"
            />

            <Text style={styles.actionText}>Messages</Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>

            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>38</Text>

            <Text style={styles.statLabel}>Proposals</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.9</Text>

            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* RECENT PROJECTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>

            <Text style={styles.seeAll}>See All</Text>
          </View>

          {recentProjects.map((project) => (
            <TouchableOpacity key={project.id} style={styles.projectCard}>
              <View style={styles.projectTop}>
                <Text style={styles.projectTitle}>{project.title}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        project.status === "In Progress"
                          ? "#DBEAFE"
                          : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color:
                        project.status === "In Progress"
                          ? "#2563EB"
                          : "#D97706",
                    }}
                  >
                    {project.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.freelancer}>
                Freelancer: {project.freelancer}
              </Text>

              <View style={styles.projectBottom}>
                <Text style={styles.budget}>{project.budget}</Text>

                <TouchableOpacity style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* POST NEW PROJECT CTA */}
        <TouchableOpacity
          style={styles.postCard}
          onPress={() => navigation.navigate("PostGig")}
        >
          <MaterialCommunityIcons
            name="briefcase-plus-outline"
            size={32}
            color="#fff"
          />

          <View style={{ marginLeft: 15 }}>
            <Text style={styles.postTitle}>Need a freelancer?</Text>

            <Text style={styles.postSub}>
              Post a project and receive proposals
            </Text>
          </View>
        </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  welcome: {
    color: "#94A3B8",
    fontSize: 14,
  },

  name: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },

  notificationBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  balanceCard: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },

  balanceLabel: {
    color: "#DBEAFE",
    fontSize: 14,
  },

  balanceAmount: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    marginVertical: 6,
  },

  balanceSub: {
    color: "#DBEAFE",
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  actionCard: {
    backgroundColor: "#fff",
    width: "46%",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },

  actionText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    backgroundColor: "#fff",
    width: "31%",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },

  statLabel: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 12,
  },

  section: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  seeAll: {
    color: "#2563EB",
    fontWeight: "600",
  },

  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  projectTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  projectTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    width: "70%",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },

  freelancer: {
    color: "#64748B",
    marginBottom: 14,
  },

  projectBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  budget: {
    color: "#16A34A",
    fontWeight: "bold",
    fontSize: 16,
  },

  viewBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },

  viewBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  postCard: {
    backgroundColor: "#1D4ED8",
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  postTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  postSub: {
    color: "#DBEAFE",
    marginTop: 4,
  },
});
