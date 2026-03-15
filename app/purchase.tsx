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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BASE_URL } from "./config/api";

type PurchaseData = {
TotalPurchase:number;
VendorCount:number;
GRNCount:number;
POCount:number;
};

export default function Purchase(){

const router = useRouter();

const [showFilter,setShowFilter] = useState(false);

const [fromDate,setFromDate] = useState("2025-08-12");
const [toDate,setToDate] = useState("2026-03-10");

const [data,setData] = useState<PurchaseData | null>(null);

const loadPurchase = () => {

fetch(`${BASE_URL}/purchase-summary`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
FromDate:fromDate,
ToDate:toDate
})
})
.then(res=>res.json())
.then(result=>{

console.log("Purchase API:",result);

if(result.length>0){
setData(result[0]);
}

})
.catch(err=>{
console.log("API Error:",err);
});

};

useEffect(()=>{
loadPurchase();
},[]);

return(

<View style={styles.container}>

{/* Toolbar */}

<View style={styles.toolbar}>

<TouchableOpacity onPress={()=>router.replace("/home")}>
<Ionicons name="arrow-back" size={24} color="white"/>
</TouchableOpacity>

<Text style={styles.title}>Purchase Dashboard</Text>

<TouchableOpacity onPress={()=>setShowFilter(!showFilter)}>
<Ionicons name="filter" size={24} color="white"/>
</TouchableOpacity>

</View>

<ScrollView>

{/* Filter Panel */}

{showFilter && (

<View style={styles.filterBox}>

<View style={styles.dateRow}>

<TextInput
style={styles.dateInput}
value={fromDate}
onChangeText={setFromDate}
placeholder="YYYY-MM-DD"
/>

<TextInput
style={styles.dateInput}
value={toDate}
onChangeText={setToDate}
placeholder="YYYY-MM-DD"
/>

</View>

<TouchableOpacity
style={styles.applyBtn}
onPress={loadPurchase}
>

<Text style={{color:"white",fontWeight:"bold"}}>
Apply Filter
</Text>

</TouchableOpacity>

</View>

)}

{/* Dashboard Cards */}

<View style={styles.cardContainer}>

{/* Total Purchase */}

<LinearGradient
colors={["#43cea2","#185a9d"]}
style={styles.card}
>

<Ionicons name="cash-outline" size={38} color="white"/>

<Text style={styles.cardTitle}>
Total Purchase
</Text>

<Text style={styles.cardValue}>
₹ {data?.TotalPurchase ?? 0}
</Text>

</LinearGradient>

{/* Vendor Count */}

<LinearGradient
colors={["#36d1dc","#5b86e5"]}
style={styles.card}
>

<Ionicons name="people-outline" size={38} color="white"/>

<Text style={styles.cardTitle}>
Vendor Count
</Text>

<Text style={styles.cardValue}>
{data?.VendorCount ?? 0}
</Text>

</LinearGradient>

{/* GRN Count */}

<LinearGradient
colors={["#f7971e","#ffd200"]}
style={styles.card}
>

<Ionicons name="cube-outline" size={38} color="white"/>

<Text style={styles.cardTitle}>
GRN Count
</Text>

<Text style={styles.cardValue}>
{data?.GRNCount ?? 0}
</Text>

</LinearGradient>

{/* PO Count */}

<LinearGradient
colors={["#c471f5","#fa71cd"]}
style={styles.card}
>

<Ionicons name="document-text-outline" size={38} color="white"/>

<Text style={styles.cardTitle}>
PO Count
</Text>

<Text style={styles.cardValue}>
{data?.POCount ?? 0}
</Text>

</LinearGradient>

</View>

</ScrollView>

</View>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f4f6fb"
},

toolbar:{
height:60,
backgroundColor: "#686868",
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

filterBox:{
backgroundColor:"#e9edf7",
padding:15
},

dateRow:{
flexDirection:"row",
justifyContent:"space-between"
},

dateInput:{
backgroundColor:"white",
width:"48%",
padding:12,
borderRadius:10,
borderWidth:1,
borderColor:"#ccc"
},

applyBtn:{
backgroundColor:"#3b4a8a",
marginTop:15,
padding:12,
alignItems:"center",
borderRadius:10
},

cardContainer:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
padding:16
},

card:{
width:"48%",
height:150,
borderRadius:20,
padding:18,
marginBottom:18,
justifyContent:"space-between",
shadowColor:"#000",
shadowOffset:{width:0,height:6},
shadowOpacity:0.25,
shadowRadius:10,
elevation:8
},

cardTitle:{
color:"#fff",
fontSize:14
},

cardValue:{
color:"#fff",
fontSize:26,
fontWeight:"bold"
}

});