import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "./config/api";

type PaymodeItem = {
  Paymode: string;
  TotalAmount: number;
};

export default function PaymodeBreakup() {

  const router = useRouter();

  const [data, setData] = useState<PaymodeItem[]>([]);
  const [filteredData, setFilteredData] = useState<PaymodeItem[]>([]);

  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");

  const loadPaymode = async () => {
    try {
      const res = await fetch(`${BASE_URL}/paymode-breakup`);
      const result = await res.json();

      setData(result);
      setFilteredData(result);

    } catch (err) {
      console.log("API Error:", err);
    }
  };

  useEffect(() => {
    loadPaymode();
  }, []);

  const applyFilter = (text: string) => {

    setSearch(text);

    const filtered = data.filter(item =>
      item.Paymode.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const getIcon = (paymode: string) => {

    switch (paymode) {

      case "Cash":
        return "cash-outline";

      case "Card":
        return "card-outline";

      case "UPI":
        return "phone-portrait-outline";

      case "Wallet":
        return "wallet-outline";

      default:
        return "cash-outline";
    }

  };

  return (

    <View style={styles.container}>

      {/* Toolbar */}

      <View style={styles.toolbar}>

        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Paymode Breakup</Text>

        <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>

      </View>

      <ScrollView>

        {/* Filter Panel */}

        {showFilter && (

          <View style={styles.filterBox}>

            <TextInput
              style={styles.searchInput}
              placeholder="Search Paymode"
              value={search}
              onChangeText={applyFilter}
            />

          </View>

        )}

        {/* Cards */}

        <View style={styles.cardContainer}>

          {filteredData.map((item, index) => (

            <View key={index} style={styles.card}>

              <View style={styles.row}>

                <Ionicons
                  name={getIcon(item.Paymode) as any}
                  size={24}
                  color="#3b4a8a"
                />

                <Text style={styles.cardTitle}>
                  {item.Paymode}
                </Text>

              </View>

              <Text style={styles.cardValue}>
                ₹ {item.TotalAmount}
              </Text>

            </View>

          ))}

        </View>

      </ScrollView>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f4f6fb"
  },

  toolbar: {
    height: 60,
    backgroundColor: "#686868",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },

  filterBox: {
    padding: 15,
    backgroundColor: "#e9edf7"
  },

  searchInput: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc"
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16
  },

  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },

  cardTitle: {
    fontSize: 15,
    marginLeft: 8,
    color: "#444",
    fontWeight: "600"
  },

  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222"
  }

});