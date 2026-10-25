import { useEffect, useRef, useState } from "react";

import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialCommunityIcons } from "@expo/vector-icons";

// import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";
import { useNavigation } from "expo-router/react-navigation";

const slides = [
  {
    title: "Hire Top Freelancers",
    description:
      "Connect with trusted professionals for your projects with seamless collaboration.",
    icon: "account-search",
    gradient: ["#2563EB", "#1D4ED8"],
  },

  {
    title: "Manage Projects Easily",
    description:
      "Track progress, deadlines, milestones, and communication all in one place.",
    icon: "briefcase-check",
    gradient: ["#7C3AED", "#5B21B6"],
  },

  {
    title: "Secure Payments",
    description:
      "Pay freelancers securely and manage invoices with confidence and transparency.",
    icon: "cash-multiple",
    gradient: ["#059669", "#047857"],
  },
];

const { width } = Dimensions.get("window");

const Home = () => {
  const navigation = useNavigation();

  const scrollRef = useRef<ScrollView>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  // AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;

      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // HANDLE SCROLL
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);

    setActiveIndex(index);
  };

  return (
    <LinearGradient
      colors={["#0F172A", "#111827", "#1E293B"]}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* TOP HERO */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons
              name="briefcase-account"
              size={38}
              color="#fff"
            />
          </View>

          <Text style={styles.title}>FreelanceFlow</Text>

          <Text style={styles.subtitle}>
            Modern freelance marketplace for clients and professionals.
          </Text>
        </View>

        {/* SLIDER */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {slides.map((slide, index) => (
              <LinearGradient
                key={index}
                colors={slide.gradient as any}
                style={styles.slide}
              >
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons
                    name={slide.icon as any}
                    size={60}
                    color="#fff"
                  />
                </View>

                <Text style={styles.slideTitle}>{slide.title}</Text>

                <Text style={styles.slideDescription}>{slide.description}</Text>
              </LinearGradient>
            ))}
          </ScrollView>

          {/* INDICATORS */}
          <View style={styles.indicators}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* FEATURES */}
        <View style={styles.features}>
          <View style={styles.featureCard}>
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color="#2563EB"
            />

            <Text style={styles.featureText}>Verified Users</Text>
          </View>

          <View style={styles.featureCard}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={24}
              color="#7C3AED"
            />

            <Text style={styles.featureText}>Fast Hiring</Text>
          </View>

          <View style={styles.featureCard}>
            <MaterialCommunityIcons
              name="cash-lock"
              size={24}
              color="#059669"
            />

            <Text style={styles.featureText}>Secure Payments</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionContainer}>
          <Link href="/screen/Auth/LoginScreen" asChild>
            <Pressable
              style={styles.loginBtn}
              onPress={() => navigation.navigate("Login" as never)}
            >
              <Text style={styles.loginText}>Login</Text>
            </Pressable>
          </Link>

          <Link href="/screen/Auth/RegisterScreen" asChild>
            <Pressable
              style={styles.registerBtn}
              // onPress={() => navigation.navigate("Register" as never)}
            >
              <Text style={styles.registerText}>Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingBottom: 40,
  },
  scrollContainer: {
    // padding: 20,
    // paddingTop: 60,
    paddingBottom: 10,
  },

  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoCircle: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  sliderContainer: {
    marginTop: 40,
  },

  slide: {
    width: width - 40,
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120,
  },

  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  slideTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },

  slideDescription: {
    color: "#E2E8F0",
    textAlign: "center",
    lineHeight: 26,
    fontSize: 16,
  },

  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#475569",
    marginHorizontal: 5,
  },

  activeDot: {
    width: 28,
    backgroundColor: "#fff",
  },

  features: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 40,
  },

  featureCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 18,
    marginHorizontal: 5,
    borderRadius: 18,
    alignItems: "center",
  },

  featureText: {
    color: "#E2E8F0",
    marginTop: 10,
    fontWeight: "600",
    fontSize: 13,
  },

  actionContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 10,
  },

  loginBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
  },

  loginText: {
    color: "#0F172A",
    fontWeight: "bold",
    fontSize: 16,
  },

  registerBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
  },

  registerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Home;
