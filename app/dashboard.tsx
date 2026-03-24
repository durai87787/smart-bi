import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import { useRouter } from "expo-router";
import { BarChart, PieChart } from "react-native-chart-kit";

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

export default function Dashboard(){

const router = useRouter();

const [locations,setLocations] = useState<LocationItem[]>([]);
const [buttons,setButtons] = useState<ButtonItem[]>([]);
const [pie,setPie] = useState<ChartItem[]>([]);
const [bar,setBar] = useState<ChartItem[]>([]);

useEffect(()=>{
loadDashboard();
},[]);

const loadDashboard = async()=>{

const fromDate="2025-08-01";
const toDate="2026-12-31";

const fromDate1="2026-12-01";
const toDate1="2026-12-31";

try{

const loc = await axios.get(`${BASE_URL}/dashboard/location?from=${fromDate}&to=${toDate}`);
console.log(loc.data,'loc.data');

setLocations(loc.data);

const btn = await axios.get(`${BASE_URL}/dashboard/buttons?from=${fromDate1}&to=${toDate1}`);
console.log(btn.data,'btn.data');
setButtons(btn.data);

const pieRes = await axios.get(`${BASE_URL}/dashboard/pie?from=${fromDate1}&to=${toDate1}`);
setPie(pieRes.data);

const barRes = await axios.get(`${BASE_URL}/dashboard/bar?from=${fromDate1}&to=${toDate1}`);
setBar(barRes.data);

}catch(err){
console.log("Dashboard error:",err);
}

};

const pieData = pie
.filter(x => x.Name !== "Profit$" && x.Name !== "ProfitPercent")
.map((item,i)=>({
name:item.Name,
population:Number(item.Total),
color:["#4f46e5","#22c55e","#f97316","#ef4444","#0ea5e9","#8b5cf6"][i%6],
legendFontColor:"#333",
legendFontSize:13
}));

const barData={
labels:bar.map(x=>x.Name),
datasets:[{
data:bar.map(x=>Number(x.Total))
}]
};

return(

<View style={styles.container}>

{/* Toolbar */}

{/* <View style={styles.toolbar}>

<TouchableOpacity onPress={()=>router.back()}> <Ionicons name="arrow-back" size={24} color="#fff"/> </TouchableOpacity>

<Text style={styles.toolbarTitle}>Dashboard</Text>

<Ionicons name="filter" size={22} color="#fff"/>

</View> */}

<ScrollView>

{/* Location Cards */}

<View style={styles.row}>

{locations.map((item,index)=>(

<View key={index} style={styles.locationCard}>

<Text style={styles.locName}>
{item.LocationName}
</Text>

<Text style={styles.amount}>
₹{Number(item.TotalSales).toLocaleString()}
</Text>

</View>

))}

</View>

{/* KPI Cards */}

<View style={styles.grid}>

{buttons.map((item,index)=>(

<View key={index} style={styles.smallCard}>

<Text style={styles.cardTitle}>
{item.Name}
</Text>

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
width={screenWidth-20}
height={230}
accessor="population"
backgroundColor="transparent"
paddingLeft="15"
chartConfig={{
backgroundGradientFrom:"#ffffff",
backgroundGradientTo:"#ffffff",
color:(opacity=1)=>`rgba(0,0,0,${opacity})`,
decimalPlaces:0
}}
/>

</View>

{/* Bar Chart */}

<View style={styles.chartCard}>

<Text style={styles.chartTitle}>Sales Overview</Text>

<BarChart
data={barData}
width={screenWidth-20}
height={240}
yAxisLabel="₹"
yAxisSuffix=""
fromZero
showValuesOnTopOfBars
chartConfig={{
backgroundGradientFrom:"#ffffff",
backgroundGradientTo:"#ffffff",
decimalPlaces:0,
color:(opacity=1)=>`rgba(79,70,229,${opacity})`,
labelColor:(opacity=1)=>`rgba(0,0,0,${opacity})`
}}
style={{borderRadius:12}}
/>

</View>

</ScrollView>

</View>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f3f4f6"
},

toolbar:{
height:60,
backgroundColor: "#686868",
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
paddingHorizontal:15
},

toolbarTitle:{
color:"#fff",
fontSize:18,
fontWeight:"bold"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
padding:10
},

locationCard:{
backgroundColor:"#fff",
padding:15,
borderRadius:12,
width:"48%",
elevation:3
},

locName:{
fontSize:14,
color:"#666"
},

grid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
padding:10
},

smallCard:{
backgroundColor:"#fff",
width:"48%",
padding:16,
borderRadius:12,
marginBottom:10,
elevation:3
},

cardTitle:{
fontSize:13,
color:"#555"
},

amount:{
fontSize:18,
fontWeight:"bold",
marginTop:6
},

chartCard:{
backgroundColor:"#fff",
margin:10,
padding:15,
borderRadius:12,
elevation:3
},

chartTitle:{
fontSize:16,
fontWeight:"bold",
marginBottom:10
}

});
