import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
FlatList,
StyleSheet,
Text,
View,
ActivityIndicator,
TouchableOpacity,
Platform
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { BASE_URL } from "./config/api";

type Vendor = {
Code: string;
Name: string;
Total: number;
GidCount: number;
};

export default function VendorsWisePurchase() {

const [data, setData] = useState<Vendor[]>([]);
const [loading, setLoading] = useState(false);

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
   loadData();
    setShowFilter(false);
  };


const loadData = async () => {
try {
setLoading(true);


  const res = await fetch(`${BASE_URL}/vendor-purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      // FromDate: "2023-03-01T00:00:00",
      // ToDate: "2026-03-12T00:00:00"
       FromDate: formatDate(fromDate),
        ToDate: formatDate(toDate),
    })
  });

  const result = await res.json();
  setData(result || []);

} catch (err) {
  console.log("API Error:", err);
  setData([]);
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadData();
}, []);

return ( <View style={styles.container}>


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

  {loading && (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={{ marginTop: 10 }}>Loading...</Text>
    </View>
  )}

  {!loading && data.length === 0 && (
    <View style={styles.center}>
      <Ionicons name="alert-circle-outline" size={40} color="#999" />
      <Text style={{ marginTop: 10 }}>No data found</Text>
    </View>
  )}

  {!loading && data.length > 0 && (
    <FlatList
      data={data}
      keyExtractor={(item) => item.Code}
      renderItem={({ item, index }) => {
        const bgColor = index % 2 === 0 ? "#f4d7a7" : "#e8a9bb";
        const borderColor = index % 2 === 0 ? "#e6a33a" : "#d4477c";

        return (
          <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
            <View style={styles.row}>
              <Text style={styles.vendorName}>{item.Name}</Text>
              <Text style={styles.amount}>
                ₹ {Number(item.Total || 0).toLocaleString()}
              </Text>
            </View>

            <Text style={styles.count}>
              {item.GidCount || 0}
            </Text>
          </View>
        );
      }}
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
