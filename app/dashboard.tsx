import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { PieChart } from "react-native-chart-kit";
import { BarChart as GiftedBarChart } from "react-native-gifted-charts";
import { BASE_URL } from "./config/api";

const screenWidth = Dimensions.get("window").width;

interface LocationItem {
  LocationCode: string;
  LocationName: string;
  TotalSales: number;
}

interface ButtonItem {
  Name: string;
  Total: number;
}

interface ChartItem {
  Name: string;
  Total: number;
}

export default function Dashboard() {

  const premiumColors = [
  "#6366f1", // indigo
  "#0ea5e9", // sky blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
];

const gradients = [
  ["#6366f1", "#8b5cf6"],
  ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#22c55e"],
  ["#f59e0b", "#f97316"],
  ["#ef4444", "#f43f5e"],
] as const;

  const router = useRouter();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [buttons, setButtons] = useState<ButtonItem[]>([]);
  const [pie, setPie] = useState<ChartItem[]>([]);
  const [bar, setBar] = useState<ChartItem[]>([]);
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
     loadDashboard();
      setShowFilter(false);
    };
  

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {

    const from_Date = formatDate(fromDate);
    const to_Date   = formatDate(toDate);

    

    setLoading(true);

    try {

      const loc = await axios.get(`${BASE_URL}/dashboard/location?from=${from_Date}&to=${to_Date}`);
      setLocations(loc.data);

      const btn = await axios.get(`${BASE_URL}/dashboard/buttons?from=${from_Date}&to=${to_Date}`);
      setButtons(btn.data);

      const pieRes = await axios.get(`${BASE_URL}/dashboard/pie?from=${from_Date}&to=${to_Date}`);
      setPie(pieRes.data);

      const barRes = await axios.get(`${BASE_URL}/dashboard/bar?from=${from_Date}&to=${to_Date}`);
      setBar(barRes.data);

    } catch (err) {
      console.log("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = pie
    .filter(x => x.Name !== "Profit$" && x.Name !== "ProfitPercent")
    .map((item, i) => ({
      name: item.Name,
      population: Number(item.Total),
      color: ["#4f46e5", "#22c55e", "#f97316", "#ef4444", "#0ea5e9", "#8b5cf6"][i % 6],
      legendFontColor: "#333",
      legendFontSize: 13
    }));

  const barData = {
    labels: bar.map(x => x.Name),
    datasets: [
      {
        data: bar.map(x => Number(x.Total))
      }
    ]
  };

  const animatedBarData = bar.map((item) => ({
  value: Number(item.Total),
  label: item.Name,
  frontColor: "#6366f1",   // bar color
}));

  return (
    <View style={styles.container}>
  <Stack.Screen
              options={{
                title: "DashBoard",
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
    {/* <Text style={styles.label}>From</Text> */}

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
    {/* <Text style={styles.label}>To</Text> */}

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

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
        </View>
      ) : (

        <ScrollView>

          {/* No Data */}
          {pie.length === 0 && bar.length === 0 && (
            <Text style={styles.noData}>No data found</Text>
          )}

          {/* Location Cards */}


        <View style={styles.row}>
  {locations.map((item, index) => {
    const colors = gradients[index % gradients.length];

    return (
      <LinearGradient
        key={index}
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.locationCard} // ✅ SAME STYLE NAME
      >
        {/* ✨ Shine effect */}
        <View  />

        <Text style={styles.locName}>
          {item.LocationName}
        </Text>

        <Text style={styles.amount}>
          ₹{Number(item.TotalSales).toLocaleString()}
        </Text>
      </LinearGradient>
    );
  })}
</View>

          {/* KPI Cards */}
          {/* <View style={styles.grid}>
            {buttons.map((item, index) => (
              <View key={index} style={styles.smallCard}>
                <Text style={styles.cardTitle}>{item.Name}</Text>
                <Text style={styles.amount}>
                  ₹{Number(item.Total).toLocaleString()}
                </Text>
              </View>
            ))}
          </View> */}
          
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {buttons.map((item, index) => {
    const gradients = [
      ["#6366f1", "#8b5cf6"],
      ["#0ea5e9", "#06b6d4"],
      ["#10b981", "#22c55e"],
      ["#f59e0b", "#f97316"],
      ["#ef4444", "#f43f5e"],
    ];

    const colors = gradients[index % gradients.length];
  
    return (
      <View key={index} style={styles.cardWrapper}>
        
        {/* 🔥 Gradient Card */}
        <LinearGradient
          colors={colors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >

          {/* ✨ Glass shine effect */}
          <View style={styles.shine} />

          <Text style={styles.cardTitle1}>{item.Name}</Text>

          <Text style={styles.amount1}>
            ₹ {Number(item.Total).toLocaleString()}
          </Text>

        </LinearGradient>
      </View>
    );
  })}
</ScrollView>

          {/* Pie Chart */}
          <View style={styles.chartCard}>

<Text style={styles.chartTitle}>Payment Mode</Text>
         <PieChart
  data={pieData}
  width={screenWidth - 10}
  height={240}
  accessor="population"
  backgroundColor="transparent"
  paddingLeft="20"
  absolute
  hasLegend
  chartConfig={{
    backgroundGradientFrom: "#f8fafc",
    backgroundGradientTo: "#f8fafc",
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontWeight: "bold"
    }
  }}
/>
</View>
          {/* Bar Chart */}
         {animatedBarData.length > 0 && (
  <View style={styles.chartCard}>
    <Text style={styles.chartTitle}>Sales</Text>

   <GiftedBarChart
  data={animatedBarData}
  barWidth={30}
  spacing={30}
  roundedTop
  hideRules={false}
  xAxisThickness={0}
  yAxisThickness={0}
  yAxisTextStyle={{ color: "#666" }}
  noOfSections={10}

  // ✅ animation
  isAnimated
  animationDuration={1200}

  // ✅ correct way to show values
  showValuesAsTopLabel
  topLabelTextStyle={{ color: "#333", fontSize: 15 }}
/>
  </View>
)}

        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f3f4f6"
  },

  loader: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  noData: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#777"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
     padding: 7,
    // marginTop:-20
    
  }, 

  locationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "45%",
    elevation: 3
  },

  locName: {
    fontSize: 20,
    color: "#ffffff"
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // padding: 5
    
  },

  smallCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3
  },

  cardTitle: {
    fontSize: 18,
    color: "#fefdfd"
  },

  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 6,
    color: "#fefdfd"
  },

  chartCard: {
    backgroundColor: "#ffffff",
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 3
  },

  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
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
  cardWrapper: {
  marginRight: 16,
},

premiumCard: {
  width: 180,
  height: 100,
  padding: 13,
  borderRadius: 15,
  justifyContent: "space-between",

  // 🔥 Deep Shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  marginLeft:10,
  elevation: 12,
},

// ✨ Glass shine overlay
shine: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 50,
  backgroundColor: "rgba(255,255,255,0.2)",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},

cardTitle1: {
  color: "rgba(255,255,255,0.85)",
  fontSize: 20,
},

amount1: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
},

});