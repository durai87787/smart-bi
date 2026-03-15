
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

type SaleItem = {
  DepartmentCode: string;
  DepartmentName: string;
  Total: number;
};

export default function DepartmentWiseSales() {

  const router = useRouter();

  const [showFilter,setShowFilter] = useState(false);
  const [mode,setMode] = useState("day");

  const [fromDate,setFromDate] = useState("2025-08-12");
  const [toDate,setToDate] = useState("2026-03-04");

  const [salesData,setSalesData] = useState<SaleItem[]>([]);

//  const loadSales = async () => {

//   try {

//     const response = await fetch(`${BASE_URL}/department-sales`,{
//       method:"POST",
//       headers:{
//         "Content-Type":"application/json"
//       },
//       body:JSON.stringify({
//         FromDate: fromDate,
//         ToDate: toDate,
//         loctCode: ''
//       })
//     });

//     const data = await response.json();

//     console.log("API Data:", data);

//     setSalesData(data);

//   } catch(error){
//     console.log("API Error:",error);
//   }

// };

const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/users`)
      .then(res => {
        console.log("Status:", res.status);
        return res.json();
      })
      .then(data => {
        setData(data);
        console.log("API DATA:", data);
      })
      .catch(err => console.log("API Error:", err));
  }, []);

const loadSales = () => {

  fetch(`${BASE_URL}/department-sales`,{
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      FromDate: fromDate,
      ToDate: toDate,
      loctCode: ""
    })
  })
  .then(async res => {

    console.log("Status:", res.status);

    if(!res.ok){
      const text = await res.text();
      throw new Error(text);
    }

    return res.json();
  })
  .then(data => {
    console.log("API Data:", data);
    setSalesData(data);
  })
  .catch(error => {
    console.log("API Error:", error.message);
  });

};

  useEffect(()=>{
    loadSales();
  },[]);

  return(

<View style={styles.container}>

{/* Toolbar */}

<View style={styles.toolbar}>

<TouchableOpacity onPress={()=>router.replace("/home")}>
<Ionicons name="arrow-back" size={24} color="white"/>
</TouchableOpacity>

<Text style={styles.title}>Department Wise Sales</Text>

<TouchableOpacity onPress={()=>setShowFilter(!showFilter)}>
<Ionicons name="filter" size={24} color="white"/>
</TouchableOpacity>

</View>

<ScrollView>

{/* Filter Panel */}

{showFilter && (

<View style={styles.filterBox}>

<View style={styles.filterRow}>

{["day","week","month","custom"].map((item)=>(
<TouchableOpacity
key={item}
style={[
styles.filterBtn,
mode===item && styles.filterBtnActive
]}
onPress={()=>setMode(item)}
>

<Text style={[
styles.filterText,
mode===item && {color:"white"}
]}>
{item.toUpperCase()}
</Text>

</TouchableOpacity>
))}

</View>

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
onPress={loadSales}
>

<Text style={{color:"white",fontWeight:"bold"}}>
Apply Filter
</Text>

</TouchableOpacity>

</View>

)}

{/* Department Sales Cards */}

{salesData.map((item,index)=>(
<View style={styles.card} key={index}>

<View style={styles.row}>

<Text style={styles.name}>
{item.DepartmentName}
</Text>

<View style={{alignItems:"flex-end"}}>

<Text style={styles.amount}>
₹ {item.Total}
</Text>

</View>

</View>

</View>
))}

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

filterRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:15
},

filterBtn:{
backgroundColor:"#dcdcdc",
paddingVertical:10,
paddingHorizontal:15,
borderRadius:8
},

filterBtnActive:{
backgroundColor:"#3b4a8a"
},

filterText:{
fontWeight:"600"
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
justifyContent:"space-between"
},

name:{
fontSize:16,
fontWeight:"600"
},

amount:{
fontWeight:"bold",
fontSize:15
}

});

