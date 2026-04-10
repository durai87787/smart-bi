import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Stack } from "expo-router";
import { BASE_URL } from "./config/api";

type Sales = {
  Label: string;
  HQ: number;
};

export default function LiveSales() {

  const [type, setType] = useState("Daily");
  const [data, setData] = useState<Sales[]>([]);
  const [expanded, setExpanded] = useState<number | null>(0);

  // 🔥 NEW STATES
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSales = () => {
    console.log('type', type);

    setLoading(true);
    setError("");

    fetch(`${BASE_URL}/livesales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        LocationCode: null,
        Type: type
      })
    })
      .then(res => res.json())
      .then(result => {
        console.log("Sales API:", result);
        setData(result || []);
      })
      .catch(err => {
        console.log("API Error:", err);
        setError("Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });

  };

  useEffect(() => {
    loadSales();
  }, [type]);

  const renderItem = ({ item, index }: any) => {
    const locations = Object.keys(item).filter(
      (key) => key !== "Label" && item[key] !== null
    );

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpanded(expanded === index ? null : index)}
        >
          <Text style={styles.date}>{item.Label}</Text>

          <Ionicons
            name={expanded === index ? "chevron-up" : "chevron-down"}
            size={20}
          />
        </TouchableOpacity>

        {expanded === index && (
          <View>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>S.No</Text>
              <Text style={styles.col2}>Location</Text>
              <Text style={styles.col3}>Amount</Text>
            </View>

            {/* Dynamic Rows */}
            {locations.map((loc, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{i + 1}</Text>
                <Text style={styles.col2}>{loc}</Text>
                <Text style={styles.col3}>{item[loc]}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (

    <View style={styles.container}>

      <Stack.Screen
        options={{
          title: "Live Sales",
        }}
      />

      <View style={styles.selectRow}>

        <Text style={styles.label}>
          Select Type:
        </Text>

        <Picker
          selectedValue={type}
          style={styles.picker}
          onValueChange={(value) => setType(value)}
        >
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
          <Picker.Item label="Yearly" value="Yearly" />
        </Picker>

      </View>

      {/* 🔥 CONDITIONAL UI */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2c78c4" />
          <Text style={styles.loadingText}>Loading sales...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={60} color="red" />
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity onPress={loadSales} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color="#999" />
          <Text style={styles.noDataText}>No Data Found</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
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

  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eee"
  },

  label: {
    fontSize: 16,
    marginRight: 10
  },

  picker: {
    flex: 1
  },

  card: {
    backgroundColor: "#e6e6ea",
    margin: 10,
    borderRadius: 12,
    padding: 10
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  date: {
    fontSize: 16,
    fontWeight: "bold"
  },

  tableHeader: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 6
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6
  },

  col1: {
    width: "20%"
  },

  col2: {
    width: "40%"
  },

  col3: {
    width: "40%",
    textAlign: "right"
  },

  /* 🔥 NEW STYLES */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666"
  },

  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999"
  },

  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "red"
  },

  retryBtn: {
    marginTop: 15,
    backgroundColor: "#2c78c4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold"
  }

});