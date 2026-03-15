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

type PurchaseItem = {
DepartmentCode:string;
DepartmentName:string;
Total:number;
};

export default function PurchaseWiseSales(){

const router = useRouter();

const [showFilter,setShowFilter] = useState(false);

const [fromDate,setFromDate] = useState("2010-08-12");
const [toDate,setToDate] = useState("2026-03-10");

const [data,setData] = useState<PurchaseItem[]>([]);

const loadData = () => {

fetch(`${BASE_URL}/dept-purchase`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
FromDate:fromDate,
ToDate:toDate,
loctCode:''
})
})
.then(res=>res.json())
.then(result=>{

console.log("Purchase Dept:",result);

setData(result);

})
.catch(err=>{
console.log("API Error:",err);
});

};

useEffect(()=>{
loadData();
},[]);

return(

<View style={styles.container}>

{/* Toolbar */}

<View style={styles.toolbar}>

<TouchableOpacity onPress={()=>router.replace("/home")}>
<Ionicons name="arrow-back" size={24} color="white"/>
</TouchableOpacity>

<Text style={styles.title}>
Purchase Wise Sales
</Text>

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
onPress={loadData}
>

<Text style={{color:"white",fontWeight:"bold"}}>
Apply Filter
</Text>

</TouchableOpacity>

</View>

)}

{/* Data Section */}

{data.length === 0 ? (

<View style={styles.emptyContainer}>

<Ionicons name="document-text-outline" size={80} color="#bbb" />

<Text style={styles.emptyText}>
No Purchase Data Available
</Text>

{/* <Text style={styles.emptySub}>
Try changing the filter dates
</Text> */}

</View>

) : (

data.map((item,index)=>(

<View style={styles.card} key={index}>

<View style={styles.row}>

<View>

<Text style={styles.name}>
{item.DepartmentName}
</Text>

<Text style={styles.code}>
{item.DepartmentCode}
</Text>

</View>

<Text style={styles.amount}>
₹ {item.Total}
</Text>

</View>

</View>

))

)}

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

card:{
backgroundColor:"#6fb3c7",
margin:10,
padding:18,
borderRadius:10
},

row:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

name:{
fontSize:16,
fontWeight:"600",
color:"#fff"
},

code:{
color:"#eef"
},

amount:{
fontWeight:"bold",
fontSize:16,
color:"#fff"
},

emptyContainer:{
alignItems:"center",
justifyContent:"center",
marginTop:80
},

emptyText:{
fontSize:18,
fontWeight:"600",
marginTop:10,
color:"#555"
},

emptySub:{
fontSize:14,
color:"#888",
marginTop:5
}

});