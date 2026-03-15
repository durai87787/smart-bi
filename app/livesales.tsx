import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { BASE_URL } from "./config/api";

type Sales = {
Label:string;
HQ:number;
};

export default function LiveSales(){

const [type,setType] = useState("Daily");
const [data,setData] = useState<Sales[]>([]);
const [expanded,setExpanded] = useState<number | null>(0);

const loadSales = () => {

fetch(`${BASE_URL}/livesales`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
LocationCode:null,
Type:type
})
})
.then(res=>res.json())
.then(result=>{
console.log("Sales API:",result);
setData(result);
})
.catch(err=>{
console.log("API Error:",err);
});

};

useEffect(()=>{
loadSales();
},[type]);

const renderItem = ({item,index}:any) => (

<View style={styles.card}>

<TouchableOpacity
style={styles.cardHeader}
onPress={()=>setExpanded(expanded===index ? null : index)}

>

<Text style={styles.date}>
{item.Label}
</Text>

<Ionicons
name={expanded===index ? "chevron-up" : "chevron-down"}
size={20}
/>

</TouchableOpacity>

{expanded===index && (

<View>

<View style={styles.tableHeader}>

<Text style={styles.col1}>S.No</Text> <Text style={styles.col2}>Location</Text> <Text style={styles.col3}>Amount</Text>

</View>

<View style={styles.tableRow}>

<Text style={styles.col1}>1</Text> <Text style={styles.col2}>2G</Text> <Text style={styles.col3}>{item.HQ}</Text>

</View>

</View>

)}

</View>

);

return(

<View style={styles.container}>

{/* Toolbar */}

<View style={styles.toolbar}>

<Ionicons name="arrow-back" size={24} color="white"/>

<Text style={styles.title}>
Live Sales
</Text>

<View style={{width:24}}/>

</View>

{/* Select Type */}

<View style={styles.selectRow}>

<Text style={styles.label}>
Select Type:
</Text>

<Picker
selectedValue={type}
style={styles.picker}
onValueChange={(value)=>setType(value)}

>

<Picker.Item label="Daily" value="Daily"/>
<Picker.Item label="Weekly" value="Weekly"/>
<Picker.Item label="Monthly" value="Monthly"/>
<Picker.Item label="Yearly" value="Yearly"/>

</Picker>

</View>

{/* Sales List */}

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

selectRow:{
flexDirection:"row",
alignItems:"center",
padding:10,
backgroundColor:"#eee"
},

label:{
fontSize:16,
marginRight:10
},

picker:{
flex:1
},

card:{
backgroundColor:"#e6e6ea",
margin:10,
borderRadius:12,
padding:10
},

cardHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

date:{
fontSize:16,
fontWeight:"bold"
},

tableHeader:{
flexDirection:"row",
marginTop:10,
borderTopWidth:1,
borderBottomWidth:1,
paddingVertical:6
},

tableRow:{
flexDirection:"row",
paddingVertical:6
},

col1:{
width:"20%"
},

col2:{
width:"40%"
},

col3:{
width:"40%",
textAlign:"right"
}

});
