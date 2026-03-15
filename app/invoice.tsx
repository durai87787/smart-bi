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

type Invoice = {
InvoiceNo:string;
LocationCode:string;
NetTotal:number;
DateTime:string;
Paymode:string;
Amount:number;
};

export default function InvoiceList(){

const router = useRouter();

const [data,setData] = useState<Invoice[]>([]);

const loadInvoices = () => {

fetch(`${BASE_URL}/invoice-list`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
loctCode:null,
FromDate:"2025-05-12",
ToDate:"2026-03-12"
})
})
.then(res=>res.json())
.then(result=>{

console.log("Invoice API:",result);

setData(result);

})
.catch(err=>{
console.log("API Error:",err);
});

};

useEffect(()=>{
loadInvoices();
},[]);

const renderItem = ({item}:any) => (

<View style={styles.card}>

<Text style={styles.invoiceNo}>
Invoice # : {item.InvoiceNo}
</Text>

<View style={styles.row}>

<Text style={styles.location}>
Location: {item.LocationCode}
</Text>

<Text style={styles.date}>
{item.DateTime}
</Text>

<Text style={styles.total}>
${item.NetTotal}
</Text>

</View>

<View style={styles.line}/>

<Text style={styles.payTitle}>
Paymodes:
</Text>

<View style={styles.row}>

<Ionicons name="card-outline" size={22} color="#444"/>

<Text style={styles.paymode}>
{item.Paymode}
</Text>

<Text style={styles.amount}>
${item.Amount}
</Text>

</View>

</View>

);

return(

<View style={styles.container}>

{/* Toolbar */}

<View style={styles.toolbar}>

<TouchableOpacity onPress={()=>router.replace("/home")}> <Ionicons name="arrow-back" size={24} color="white"/> </TouchableOpacity>

<Text style={styles.title}>
Invoice
</Text>

<Ionicons name="filter" size={24} color="white"/>

</View>

<FlatList
data={data}
keyExtractor={(item,index)=>index.toString()}
renderItem={renderItem}
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
backgroundColor:"#ece9ef",
margin:12,
padding:15,
borderRadius:14,
elevation:3
},

invoiceNo:{
color:"#2c78c4",
fontSize:16,
fontWeight:"bold",
marginBottom:6
},

row:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between"
},

location:{
color:"#333"
},

date:{
color:"red"
},

total:{
color:"green",
fontWeight:"bold"
},

line:{
height:1,
backgroundColor:"#ccc",
marginVertical:8
},

payTitle:{
fontWeight:"bold",
marginBottom:6
},

paymode:{
marginLeft:8,
flex:1
},

amount:{
fontWeight:"bold"
}

});
