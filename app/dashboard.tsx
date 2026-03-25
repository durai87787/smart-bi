import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from "react-native";

import { useRouter } from "expo-router";
import { BarChart, PieChart } from "react-native-chart-kit";
import { BASE_URL } from "./config/api";
import { BarChart as GiftedBarChart } from "react-native-gifted-charts";

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

  const router = useRouter();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [buttons, setButtons] = useState<ButtonItem[]>([]);
  const [pie, setPie] = useState<ChartItem[]>([]);
  const [bar, setBar] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {

    const fromDate = "2025-08-01";
    const toDate = "2026-12-31";

    setLoading(true);

    try {

      const loc = await axios.get(`${BASE_URL}/dashboard/location?from=${fromDate}&to=${toDate}`);
      setLocations(loc.data);

      const btn = await axios.get(`${BASE_URL}/dashboard/buttons?from=${fromDate}&to=${toDate}`);
      setButtons(btn.data);

      const pieRes = await axios.get(`${BASE_URL}/dashboard/pie?from=${fromDate}&to=${toDate}`);
      setPie(pieRes.data);

      const barRes = await axios.get(`${BASE_URL}/dashboard/bar?from=${fromDate}&to=${toDate}`);
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
            {locations.map((item, index) => (
              <View key={index} style={styles.locationCard}>
                <Text style={styles.locName}>{item.LocationName}</Text>
                <Text style={styles.amount}>
                  ₹{Number(item.TotalSales).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          {/* KPI Cards */}
          <View style={styles.grid}>
            {buttons.map((item, index) => (
              <View key={index} style={styles.smallCard}>
                <Text style={styles.cardTitle}>{item.Name}</Text>
                <Text style={styles.amount}>
                  ₹{Number(item.Total).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

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
    <Text style={styles.chartTitle}>Sales Overview</Text>

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
    padding: 10
  }, 

  locationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    elevation: 3
  },

  locName: {
    fontSize: 14,
    color: "#666"
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10
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
    fontSize: 13,
    color: "#555"
  },

  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 6
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
  }

});