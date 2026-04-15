import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HeaderCard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            if (userObj && userObj.name) {
              setUserName(userObj.name);
            } else if (userObj && userObj.userName) {
              setUserName(userObj.userName);
            } else if (userObj && userObj.userCode) {
              setUserName(userObj.userCode.trim());
            } else {
              setUserName("User");
            }
          } catch (e) {
            setUserName("User");
          }
        }
      } catch (err) {
        console.log("Error fetching user", err);
      }
    };
    fetchUser();

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    // <View style={styles.headerCard}>
    <LinearGradient
      colors={["#f7f7f7ff", "#ffffffff", "#fdfdfdff", "#ffffffff",]}
      // colors={["#ff9a9e", "#fad0c4", "#a18cd1", "#a18cd1",]}  // 🔥 3 colors
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }} // horizontal
      style={styles.headerCard}
    >
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color="#3498db" />
        </View>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
      </View>
      <View style={styles.timeInfo}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </LinearGradient>
  );
};

export default function Home() {
  const router = useRouter();
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Classic dashboard colors
  const cards = [
    { title: "Dashboard", icon: "qr-code", color: "#3498db", route: "/dashboard" },
    { title: "Department Wise Sales", icon: "newspaper", color: "#1abc9c", route: "/department-wise-sales" },
    { title: "PayMode BreakUp", icon: "pie-chart", color: "#e74c3c", route: "/paymode-breakup" },
    { title: "Purchase", icon: "cart", color: "#27ae60", route: "/purchase" },
    { title: "Purchase Wise Sales", icon: "bar-chart", color: "#f39c12", route: "/purchase-wise-sales" },
    { title: "Vendors Wise Purchase", icon: "people", color: "#9b59b6", route: "/vendors-wise-purchase" },
    { title: "Live Sales", icon: "pulse", color: "#e67e22", route: "/livesales" },
    { title: "Invoice", icon: "receipt", color: "#34495e", route: "/invoice" },
  ];

  const goToPage = (route: string) => {
    router.push(route as any);
  };

  const confirmLogout = () => {
    setLogoutVisible(true);
  };

  const logout = async () => {
    setLogoutVisible(false);
    try {
      await AsyncStorage.removeItem("user");
      router.replace("/login");
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Home",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#2c3e50", // Classic dark header
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity onPress={confirmLogout} style={styles.headerBtn}>
              <Ionicons name="log-out-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />

      <HeaderCard />

      <FlatList
        data={cards}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => goToPage(item.route)}
            activeOpacity={0.8}
          >
            <View style={[styles.card, { borderLeftColor: item.color }]}>
              <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#bdc3c7" style={styles.chevron} />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* CLASSIC MODAL */}
      <Modal visible={logoutVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={logout}>
                <Text style={styles.modalBtnConfirmText}>YES</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8", // Very standard light gray background
  },
  headerCard: {
    // backgroundColor: "#ffffffff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#200917ff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 10,
    shadowRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // borderColor: "#000000ff",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: "#000",
    backgroundColor: "#ebf5fb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: "#5a6363ff",
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  timeInfo: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9f3b8bff",
  },
  dateText: {
    fontSize: 12,
    color: "#505858ff",
  },
  headerBtn: {
    padding: 8,
    marginRight: 4,
  },
  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    overflow: "hidden",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "bold",
  },
  chevron: {
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6b7280",
  },
  modalBtnConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalBtnConfirmText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});