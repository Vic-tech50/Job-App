import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

// Individual artisan details page.
export default function FreelancerDetails() {
  const router = useRouter();

  // Receive information passed from the previous page.
  const { id, freelancer } = useLocalSearchParams<{
    id: string;
    freelancer: string;
  }>();

  // Convert the received JSON string back into an object.
  const artisan = freelancer ? JSON.parse(freelancer) : null;

  // Protect the page if no artisan was passed.
  if (!artisan) {
    return (
      <View style={styles.empty}>
        <Text>Artisan information not found.</Text>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#2563EB", marginTop: 15 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Navigate to the booking page.
  const handleHire = () => {
    router.push({
      pathname: "/screen/Messenger/create-booking",
      params: {
        artisanId: id,
        artisanName: artisan.name,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Image source={{ uri: artisan.avatar }} style={styles.avatar} />

          <Text style={styles.name}>{artisan.name}</Text>

          <Text style={styles.profession}>{artisan.profession}</Text>

          <View style={styles.rating}>
            <MaterialCommunityIcons name="star" color="#FBBF24" size={18} />

            <Text style={styles.ratingText}>
              {Number(artisan.rating || 0).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Artisan details */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Location</Text>

          <Text style={styles.value}>{artisan.location}</Text>

          <Text style={styles.sectionTitle}>Service Charge</Text>

          <Text style={styles.price}>{artisan.hourlyRate}</Text>

          <Text style={styles.sectionTitle}>About Artisan</Text>

          <Text style={styles.description}>
            {artisan.bio ||
              `Professional ${artisan.profession} offering quality services.`}
          </Text>

          <Text style={styles.sectionTitle}>Skills & Expertise</Text>

          <View style={styles.skills}>
            {artisan.skills?.map((skill: string, index: number) => (
              <View key={index} style={styles.skill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Hire Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.hireButton} onPress={handleHire}>
          <Text style={styles.hireText}>Hire This Artisan</Text>

          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="#FFFFFF"
          />
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

  header: {
    backgroundColor: "#1E40AF",
    alignItems: "center",
    paddingTop: 65,
    paddingBottom: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backButton: {
    position: "absolute",
    top: 45,
    left: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 15,
  },

  profession: {
    color: "#DBEAFE",
    marginTop: 5,
  },

  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  ratingText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "bold",
  },

  content: {
    padding: 20,
  },

  sectionTitle: {
    color: "#0F172A",
    fontWeight: "bold",
    fontSize: 17,
    marginTop: 22,
    marginBottom: 10,
  },

  value: {
    color: "#64748B",
  },

  price: {
    color: "#16A34A",
    fontSize: 20,
    fontWeight: "bold",
  },

  description: {
    color: "#64748B",
    lineHeight: 24,
  },

  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  skill: {
    backgroundColor: "#DBEAFE",
    padding: 10,
    borderRadius: 20,
  },

  skillText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },

  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  hireButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  hireText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
