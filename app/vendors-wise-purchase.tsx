import React, { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "./config/api";

type Vendor = {
Code:string;
Name:string;
Total:number;
GidCount:number;
};

export default function VendorsWisePurchase(){

const router = useRouter();

const [data,setData] = useState<Vendor[]>([]);

const loadData = () => {

fetch(`${BASE_URL}/vendor-purchase`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
FromDate:"2023-03-01",
ToDate:"2026-03-12"
})
})
.then(res=>res.json())
.then(result=>{
console.log("Vendor Purchase:",result);
setData(result);
})
.catch(err=>{
console.log("API Error:",err);
});

};

useEffect(()=>{
loadData();
},[]);

const renderVendor = ({item,index}:any) => {

const bgColor = index % 2 === 0 ? "#f4d7a7" : "#e8a9bb";
const borderColor = index % 2 === 0 ? "#e6a33a" : "#d4477c";

return(

<View style={[styles.card,{backgroundColor:bgColor,borderColor:borderColor}]}>

<View style={styles.row}>

<Text style={styles.vendorName}>
{item.Name}
</Text>

<Text style={styles.amount}>
$ {item.Total}
</Text>

</View>

<Text style={styles.count}>
{item.GidCount}
</Text>

</View>

);

};

return(

<View style={styles.container}>

{/* Toolbar */}

<View style={styles.toolbar}>

<TouchableOpacity onPress={()=>router.replace("/home")}> <Ionicons name="arrow-back" size={24} color="white"/> </TouchableOpacity>

<Text style={styles.title}>
Vendors Wise Purchase
</Text>

<Ionicons name="filter" size={24} color="white"/>

</View>

{/* Vendor List */}

<FlatList
data={data}
keyExtractor={(item,index)=>index.toString()}
renderItem={renderVendor}
/>

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

card:{
margin:12,
padding:18,
borderRadius:12,
borderWidth:2
},

row:{
flexDirection:"row",
justifyContent:"space-between"
},

vendorName:{
fontSize:16,
fontWeight:"bold",
color:"#c57d00"
},

amount:{
fontSize:16,
fontWeight:"bold"
},

count:{
marginTop:8,
fontSize:15
}

});
