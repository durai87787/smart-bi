import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Home() {

  const router = useRouter();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const cards = [
    { title: "Dashboard", icon: "qr-code", color: "#cb2ca6", route: "/dashboard" },
    { title: "Department Wise Sales", icon: "newspaper", color: "#3b82f6", route: "/department-wise-sales" },
    { title: "PayMode BreakUp", icon: "stats-chart", color: "#ef4444", route: "/paymode-breakup" },
    { title: "Purchase", icon: "archive", color: "#10b981", route: "/purchase" },
    { title: "Purchase Wise Sales", icon: "bar-chart", color: "#f59e0b", route: "/purchase-wise-sales" },
    { title: "Vendors Wise Purchase", icon: "logo-usd", color: "#8b5cf6", route: "/vendors-wise-purchase" },
    { title: "Live Sales", icon: "pulse", color: "#14b8a6", route: "/livesales" },
    { title: "Invoice", icon: "wallet", color: "#f97316", route: "/invoice" },
    // { title: "Invoice", icon: "wallet", color: "#f97316", route: "/filter" }
  ];

  const goToPage = (route: string) => {
    router.push(route as any);
  };

  const confirmLogout = () => {
    setLogoutVisible(true);
  };

  // const logout = () => {
  //   setLogoutVisible(false);
  //   router.replace("/login" as any);
  // };
  const logout = async () => {
  setLogoutVisible(false);

  try {
    // 🔥 REMOVE USER DATA
    await AsyncStorage.removeItem("user");

    // 🔥 OPTIONAL: remove token if you stored
    // await AsyncStorage.removeItem("token");

    router.replace("/login");

  } catch (error) {
    console.log("LOGOUT ERROR:", error);
  }
};

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Stack.Screen
        options={{
          title: "Home",
          headerRight: () => (
            <TouchableOpacity
              onPress={confirmLogout}
              style={{ marginRight: 5, padding: 10 }}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          )
        }}
      />

      {/* CARDS */}
      <FlatList
        data={cards}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() => goToPage(item.route)}
          >

            <View style={styles.cardLeft}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
              <Text style={styles.cardText}>{item.title}</Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#999" />

          </TouchableOpacity>

        )}
      />

      {/* LOGOUT MODAL */}
      <Modal visible={logoutVisible} transparent animationType="fade">

        <View style={styles.modalContainer}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Logout</Text>

            <Text style={styles.modalText}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.modalButtons}>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={{ color: "white" }}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={logout}
              >
                <Text style={{ color: "white" }}>Yes</Text>
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
    backgroundColor: "#f5f7ff"
  },

  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  cardText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600"
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },

  modalBox: {
    width: 280,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  modalText: {
    marginBottom: 20
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  cancelBtn: {
    backgroundColor: "#c12626",
    padding: 10,
    borderRadius: 6,
    width: 80,
    alignItems: "center"
  },

  confirmBtn: {
    backgroundColor: "#0f8e0f",
    padding: 10,
    borderRadius: 6,
    width: 80,
    alignItems: "center"
  }

});