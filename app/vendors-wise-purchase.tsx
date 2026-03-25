import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { BASE_URL } from "./config/api";

type Vendor = {
  Code: string;
  Name: string;
  Total: number;
  GidCount: number;
};

export default function VendorsWisePurchase() {

  const router = useRouter();

  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {

    setLoading(true);

    fetch(`${BASE_URL}/vendor-purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        FromDate: "2023-03-01T00:00:00",
        ToDate: "2026-03-12T00:00:00"
      })
    })
      .then(res => res.json())
      .then(result => {
        console.log("Vendor Purchase:", result);
        setData(result || []);
      })
      .catch(err => {
        console.log("API Error:", err);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderVendor = ({ item, index }: any) => {

    const bgColor = index % 2 === 0 ? "#f4d7a7" : "#e8a9bb";
    const borderColor = index % 2 === 0 ? "#e6a33a" : "#d4477c";

    return (
        
      <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
        
        <View style={styles.row}>
          <Text style={styles.vendorName}>
            {item.Name}
          </Text>

          <Text style={styles.amount}>
            ₹ {Number(item.Total).toLocaleString()}
          </Text>
        </View>

        <Text style={styles.count}>
          {item.GidCount}
        </Text>
      </View>
    );
  };

  return (

    <View style={styles.container}>
 <Stack.Screen
        options={{
          title: "Vendors Wise Purchase",
        }}
      />
      {loading ? (

        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={{ marginTop: 10 }}>Loading...</Text>
        </View>

      ) : data.length === 0 ? (

        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color="#999" />
          <Text style={{ marginTop: 10 }}>No data found</Text>
        </View>

      ) : (

        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderVendor}
        />

      )}

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f4f6fb"
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    margin: 12,
    padding: 18,
    borderRadius: 12,
    borderWidth: 2
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  vendorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c57d00"
  },

  amount: {
    fontSize: 16,
    fontWeight: "bold"
  },

  count: {
    marginTop: 8,
    fontSize: 15
  }

});