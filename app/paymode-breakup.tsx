import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "./config/api";
import { Stack } from "expo-router";

type PaymodeItem = {
  Paymode: string;
  Code: string; // ✅ added
  TotalAmount: number;
};

export default function PaymodeBreakup() {

  const [data, setData] = useState<PaymodeItem[]>([]);
  const [filteredData, setFilteredData] = useState<PaymodeItem[]>([]);

  // const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");

   const [loadingDept, setLoadingDept] = useState(false);
    const [loadingCat, setLoadingCat] = useState(false);
    const [loadingBrand, setLoadingBrand] = useState(false);
    
  
    // const fromDate = "2025-08-12";
    // const toDate = "2026-03-04";
  
  ////filter

  const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getToday = () => new Date();
  
   const [showFilter, setShowFilter] = useState(false);
    const [selected, setSelected] = useState("day");
  
    const [fromDate, setFromDate] = useState(getToday());
    const [toDate, setToDate] = useState(getToday());
  
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    // 🔹 Select Type
  const handleSelect = (type: string) => {
    setSelected(type);

    if (type === "day") {
      const today = new Date();
      setFromDate(today);
      setToDate(today);
    }

    if (type === "week") {
      const { from, to } = getWeekRange();
      setFromDate(from);
      setToDate(to);
    }

    if (type === "month") {
      const { from, to } = getMonthRange();
      setFromDate(from);
      setToDate(to);
    }
  };



const getWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(today.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { from: monday, to: sunday };
};

const getMonthRange = () => {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return { from: first, to: last };
};

  // 🔹 Apply
  const handleApply = () => {
    console.log("From:", formatDate(fromDate));
    console.log("To:", formatDate(toDate));
   
    setShowFilter(false);
  };


  // 🔥 Load API
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

  // 🔍 Filter
  const applyFilter = (text: string) => {

    setSearch(text);

    const filtered = data.filter(item =>
      item.Paymode.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredData(filtered);
  };

  // 🎯 Icon
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

  // 🎨 Color
  const getColor = (paymode: string) => {
    switch (paymode) {
      case "Cash":
        return "#FF6B6B";
      case "Card":
        return "#4ECDC4";
      case "UPI":
        return "#5A67D8";
      case "Wallet":
        return "#F6AD55";
      default:
        return "#A0AEC0";
    }
  };

  return (

    <View style={styles.container}>

      <ScrollView>

        <Stack.Screen
              options={{
                title: "PayMode BreakUp",
                headerRight: () => (
                   <TouchableOpacity
          
          onPress={() => setShowFilter(!showFilter)}
        >
          <Text style={{marginRight:20}}>
          <Ionicons  name="filter-outline" size={24} color="white" />
             </Text> 
          {/* <Text style={styles.filterText}>
            {showFilter ? "Close" : "Filter"}*/}
       
        </TouchableOpacity>
                )
              }}
            />
        {showFilter && (
        <View style={styles.filterPanel}>

          {/* 🔘 Options */}
          <View style={styles.buttonRow}>
            {["day", "week", "month", "custom"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionBtn,
                  selected === item && styles.activeBtn,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.btnText}>{item.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>


          {/* 📅 SAME ROW DATE */}
        <View style={styles.dateRow}>

  {/* FROM */}
  <View style={styles.dateBox}>
    <Text style={styles.label}>From</Text>

    {Platform.OS === "web" ? (
      <input
        type="date"
        value={formatDate(fromDate)}
        onChange={(e) => {
          const value = e.target.value; // yyyy-mm-dd
          if (!value) return;

          const [y, m, d] = value.split("-");
          const newDate = new Date(
            Number(y),
            Number(m) - 1,
            Number(d)
          );

          setFromDate(newDate);
        }}
        style={styles.webInput}
      />
    ) : (
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          if (selected === "custom") {
            setShowFromPicker(true);
          }
        }}
      >
        <Text>{formatDate(fromDate)}</Text>
      </TouchableOpacity>
    )}
  </View>

  {/* TO */}
  <View style={styles.dateBox}>
    <Text style={styles.label}>To</Text>

    {Platform.OS === "web" ? (
      <input
        type="date"
        value={formatDate(toDate)}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) return;

          const [y, m, d] = value.split("-");
          const newDate = new Date(
            Number(y),
            Number(m) - 1,
            Number(d)
          );

          setToDate(newDate);
        }}
        style={styles.webInput}
      />
    ) : (
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          if (selected === "custom") {
            setShowToPicker(true);
          }
        }}
      >
        <Text>{formatDate(toDate)}</Text>
      </TouchableOpacity>
    )}
  </View>

</View>

{/* 📅 MOBILE PICKERS */}
{Platform.OS !== "web" && showFromPicker && (
  <DateTimePicker
    value={fromDate}
    mode="date"
    display="default"
    onChange={(event, date) => {
      setShowFromPicker(false);
      if (date) {
        setFromDate(date);

        // ✅ auto fix: if from > to
        if (date > toDate) {
          setToDate(date);
        }
      }
    }}
  />
)}

{Platform.OS !== "web" && showToPicker && (
  <DateTimePicker
    value={toDate}
    mode="date"
    display="default"
    onChange={(event, date) => {
      setShowToPicker(false);
      if (date) {
        setToDate(date);

        // ✅ auto fix: if to < from
        if (date < fromDate) {
          setFromDate(date);
        }
      }
    }}
  />
)}


          {/* ✅ Apply */}
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>

        </View>
      )}

        {/* 🧾 Cards */}
        <View style={styles.cardContainer}>

          {filteredData.map((item, index) => (

            <View
              key={index}
              style={[
                styles.card,
                { borderLeftColor: getColor(item.Paymode) }
              ]}
            >

              {/* Top Row */}
              <View style={styles.row}>

                <Ionicons
                  name={getIcon(item.Paymode) as any}
                  size={24}
                  color={getColor(item.Paymode)}
                />

                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.cardTitle}>
                    {item.Paymode}
                  </Text>

                  <Text style={styles.codeText}>
                    {item.Code}
                  </Text>
                </View>

              </View>

              {/* Amount */}
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
    backgroundColor: "#fefcfce9",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,

    borderLeftWidth: 5, // 🎨 color strip

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
    marginLeft: 4,
    color: "#444",
    fontWeight: "600"
  },

  codeText: {
    fontSize: 12,
    color: "#888"
  },

  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 5
  },


  //filter ///
   toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#007bff",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  filterBtn: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
  },

  filterText: {
    color: "#007bff",
    fontWeight: "bold",
   
  },

  filterPanel: {
    backgroundColor: "#f5f5f5",
    padding: 15,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  optionBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#ccc",
    width: "23%",
    alignItems: "center",
  },

  activeBtn: {
    backgroundColor: "#007bff",
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  dateBox: {
    width: "48%",
  },

  label: {
    marginBottom: 5,
    fontSize: 13,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },

  webInput: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  } as any,

  applyBtn: {
    marginTop: 20,
    backgroundColor: "#6d6e6e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    padding: 20,
  },

});