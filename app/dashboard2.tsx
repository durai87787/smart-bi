import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";

export default function Dashboard() {

  const router = useRouter();

  const barData = [
    { value: 120, label: "Mon", frontColor: "#4f46e5" },
    { value: 190, label: "Tue", frontColor: "#4f46e5" },
    { value: 300, label: "Wed", frontColor: "#4f46e5" },
    { value: 250, label: "Thu", frontColor: "#4f46e5" },
    { value: 220, label: "Fri", frontColor: "#4f46e5" }
  ];

  const revenueData = [
    { value: 5000, label: "Jan" },
    { value: 7000, label: "Feb" },
    { value: 8000, label: "Mar" },
    { value: 6500, label: "Apr" },
    { value: 9000, label: "May" }
  ];

  const paymentData = [
    { value: 400, color: "#22c55e", text: "Cash" },
    { value: 300, color: "#f59e0b", text: "Card" },
    { value: 350, color: "#8b5cf6", text: "UPI" }
  ];

  return (

    <View style={styles.container}>

      {/* Toolbar */}

      {/* <View style={styles.toolbar}>

        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Dashboard</Text>

        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>

      </View> */}

      <ScrollView>

        {/* Cards */}

        <View style={styles.cardGrid}>

          <View style={[styles.card,{backgroundColor:"#4f46e5"}]}>
            <Ionicons name="cash-outline" size={28} color="white"/>
            <Text style={styles.cardValue}>₹12,400</Text>
            <Text style={styles.cardLabel}>Sales</Text>
          </View>

          <View style={[styles.card,{backgroundColor:"#22c55e"}]}>
            <Ionicons name="cart-outline" size={28} color="white"/>
            <Text style={styles.cardValue}>320</Text>
            <Text style={styles.cardLabel}>Orders</Text>
          </View>

          <View style={[styles.card,{backgroundColor:"#f97316"}]}>
            <Ionicons name="cube-outline" size={28} color="white"/>
            <Text style={styles.cardValue}>145</Text>
            <Text style={styles.cardLabel}>Products</Text>
          </View>

          <View style={[styles.card,{backgroundColor:"#ef4444"}]}>
            <Ionicons name="trending-up-outline" size={28} color="white"/>
            <Text style={styles.cardValue}>₹4,200</Text>
            <Text style={styles.cardLabel}>Profit</Text>
          </View>

        </View>

        {/* Weekly Sales */}

        <View style={styles.chartCard}>

          <Text style={styles.sectionTitle}>Weekly Sales</Text>

          <BarChart
            data={barData}
            barWidth={30}
            spacing={20}
            roundedTop
            showValuesAsTopLabel
            highlightEnabled
            onPress={(item:any)=>alert("Sales: "+item.value)}
          />

        </View>

        {/* Monthly Revenue */}

        <View style={styles.chartCard}>

          <Text style={styles.sectionTitle}>Monthly Revenue</Text>

          <LineChart
            data={revenueData}
            curved
            thickness={3}
            color="#4f46e5"
            dataPointsColor="#4f46e5"
            showDataPointOnFocus
            onPress={(item:any)=>alert("Revenue: ₹"+item.value)}
          />

        </View>

        {/* Payment Mode */}

        <View style={styles.chartCard}>

          <Text style={styles.sectionTitle}>Payment Mode</Text>

          <PieChart
            donut
            showText
            radius={110}
            innerRadius={60}
            focusOnPress
            showValuesAsLabels
            data={paymentData}
          />

        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f7ff"
},

toolbar:{
height:60,
backgroundColor:"#686868",
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
paddingHorizontal:15
},

title:{
color:"white",
fontSize:18,
fontWeight:"bold"
},

cardGrid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
padding:10
},

card:{
width:"48%",
borderRadius:14,
padding:20,
marginBottom:12
},

cardValue:{
color:"white",
fontSize:20,
fontWeight:"bold",
marginTop:8
},

cardLabel:{
color:"white",
marginTop:4
},

chartCard:{
backgroundColor:"white",
margin:10,
padding:15,
borderRadius:12
},

sectionTitle:{
fontSize:16,
fontWeight:"bold",
marginBottom:10
}

});