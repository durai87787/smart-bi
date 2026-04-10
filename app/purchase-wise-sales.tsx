import React, { useEffect, useState } from "react";

import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { BASE_URL } from "./config/api";

type Dept = {
  DepartmentCode: string;
  DepartmentName: string;
  Total: number;
};

type Category = {
  CategoryCode: string;
  CategoryName: string;
  Total: number;
};

type Brand = {
  BrandCode: string;
  BrandName: string;
  Total: number;
};

export default function PurchaseWiseSales() {

  const router = useRouter();

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getToday = () => new Date();

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

  // const [fromDate, setFromDate] = useState("2010-08-12");
  // const [toDate, setToDate] = useState("2026-03-10");

  const [departments, setDepartments] = useState<Dept[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: Category[] }>({});
  const [brands, setBrands] = useState<{ [key: string]: Brand[] }>({});

  const [openDept, setOpenDept] = useState<string | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);

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


  // 🔹 Apply
  const handleApply = () => {
    console.log("From:", formatDate(fromDate));
    console.log("To:", formatDate(toDate));
    loadDepartments();
    setShowFilter(false);
  };

  // ===============================
  // LOAD DEPARTMENTS
  // ===============================
  const loadDepartments = async () => {

    const res = await fetch(`${BASE_URL}/dept-purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        FromDate: fromDate,
        ToDate: toDate,
        loctCode: ""
      })
    });

    const data = await res.json();
    setDepartments(Array.isArray(data) ? data : []);
  };

  // ===============================
  // LOAD CATEGORY
  // ===============================
  const loadCategories = async (deptCode: string) => {

    if (openDept === deptCode) {
      setOpenDept(null);
      return;
    }

    const res = await fetch(`${BASE_URL}/purchase-category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        FromDate: fromDate,
        ToDate: toDate,
        loctCode: "",
        DeptCode: deptCode
      })
    });

    const text = await res.text();
    console.log("CATEGORY RAW:", text);

    const data = JSON.parse(text);

    setCategories(prev => ({
      ...prev,
      [deptCode]: Array.isArray(data) ? data : []
    }));

    setOpenDept(deptCode);
    setOpenCat(null);
  };

  // ===============================
  // LOAD BRAND
  // ===============================
  const loadBrands = async (deptCode: string, catCode: string) => {

    if (openCat === catCode) {
      setOpenCat(null);
      return;
    }

    const res = await fetch(`${BASE_URL}/purchase-brand`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        FromDate: fromDate,
        ToDate: toDate,
        loctCode: "",
        DeptCode: deptCode,
        CatCode: catCode
      })
    });

    const text = await res.text();
    console.log("BRAND RAW:", text);

    const data = JSON.parse(text);

    setBrands(prev => ({
      ...prev,
      [catCode]: Array.isArray(data) ? data : []
    }));

    setOpenCat(catCode);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const goToInventory = (br: any, cat: any, dept: any) => {
    console.log("CLICK DATA:", br, cat, dept); // 🔥 debug

    router.push({
      pathname: "/inventory-list", // ⚠️ make sure file name matches
      params: {
        loctCode: dept?.loctCode || null,   // ✅ added
        DeptCode: dept?.DepartmentCode,     // ✅ FIXED
        CatCode: cat?.CategoryCode,         // ✅ FIXED
        BCode: br?.BrandCode,               // ✅ correct
        FromDate: formatDate(fromDate),
        ToDate: formatDate(toDate),
      },
    });
  };


  // ===============================
  // UI
  // ===============================

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Purchase Wise Sales",
          headerRight: () => (
            <TouchableOpacity

              onPress={() => setShowFilter(!showFilter)}
            >
              <Text style={{ marginRight: 20 }}>
                <Ionicons name="filter-outline" size={24} color="white" />
              </Text>
              {/* <Text style={styles.filterText}>
            {showFilter ? "Close" : "Filter"}*/}

            </TouchableOpacity>
            // <TouchableOpacity
            //   // onPress={confirmLogout}
            //   style={{ marginRight: 5, padding: 10 }}
            // >
            //   <Ionicons name="filter-outline" size={24} color="white" />
            // </TouchableOpacity>
          )
        }}
      />



      {/* 🔽 Filter Panel */}
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
      <View style={styles.dotContainer}>
        <View style={[styles.dot, { backgroundColor: "#9ee6fc" }]} />
        <Text style={styles.text}>Department</Text>
        <View style={[styles.dot, { backgroundColor: "#c2fbcf" }]} />
        <Text style={styles.text}>Categories</Text>
        <View style={[styles.dot, { backgroundColor: "#fbf8da" }]} />
        <Text style={styles.text}>Brands</Text>
      </View>
      <ScrollView>



        {/* DATA */}
        {departments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={40} color="#999" />
            <Text style={styles.emptyText}>No Purchase Data</Text>
          </View>
        ) : (

          departments.map((dept) => (

            <View key={dept.DepartmentCode} style={styles.card}>

              {/* DEPARTMENT */}
              <TouchableOpacity onPress={() => loadCategories(dept.DepartmentCode)}>
                <View style={styles.row}>
                  <Text style={styles.name}>{dept.DepartmentName}</Text>
                  <Text style={styles.amount}>₹ {dept.Total}</Text>
                </View>
              </TouchableOpacity>

              {/* CATEGORY */}
              {openDept === dept.DepartmentCode &&
                (categories[dept.DepartmentCode] || []).map((cat) => (

                  <View key={cat.CategoryCode} style={styles.subCard}>

                    <TouchableOpacity
                      onPress={() =>
                        loadBrands(dept.DepartmentCode, cat.CategoryCode)
                      }
                    >
                      <View style={styles.row}>
                        <Text style={styles.subText}>{cat.CategoryName}</Text>
                        <Text style={styles.amount}>₹ {cat.Total}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* BRAND */}
                    {openCat === cat.CategoryCode &&
                      (brands[cat.CategoryCode] || []).map((brand) => (

                        // <View key={brand.BrandCode} style={styles.innerCard}>
                        //   <View style={styles.row}>
                        //     <Text style={styles.innerText}>{brand.BrandName}</Text>
                        //     <Text style={styles.amount}>₹ {brand.Total}</Text>
                        //   </View>
                        // </View>
                        <TouchableOpacity
                          key={brand.BrandCode}
                          style={styles.innerCard}
                          onPress={() => goToInventory(brand, cat, dept)} // 🔥 IMPORTANT
                        >
                          <View style={styles.row}>
                            <Text style={styles.innerText}>{brand.BrandName}</Text>
                            <Text style={styles.amount}>₹ {brand.Total}</Text>
                          </View>
                        </TouchableOpacity>

                      ))}
                  </View>

                ))}
            </View>

          ))

        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f4f6fb"
  },

  filterBox: {
    backgroundColor: "#e9edf7",
    padding: 15
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  dateInput: {
    backgroundColor: "white",
    width: "48%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc"
  },

  applyBtn: {
    backgroundColor: "#555556",
    marginTop: 15,
    padding: 12,
    alignItems: "center",
    borderRadius: 10
  },

  card: {
    backgroundColor: "#9ee6fc",
    margin: 10,
    padding: 15,
    borderRadius: 10
  },

  subCard: {
    backgroundColor: "#a7fbbaff",
    marginTop: 10,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderColor: "#696868ff",
    padding: 15,
  },

  innerCard: {
    backgroundColor: "#fffac4ff",
    marginTop: 8,
    paddingLeft: 25,
    padding: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000ff"
  },

  subText: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 1)"
  },

  innerText: {
    fontSize: 13,
    color: "#000000ff"
  },

  amount: {
    fontWeight: "bold",
    color: "#000000ff"
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 80
  },

  emptyText: {
    fontSize: 18,
    color: "#555"
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20
  },

  dot: {
    width: 15,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 8
  },
  text: {
    fontSize: 16,
    fontWeight: "500"
  },
  /////filter css


  // container: { flex: 1, backgroundColor: "#fff" },

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

  // dateRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginTop: 10,
  // },

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

  // applyBtn: {
  //   marginTop: 20,
  //   backgroundColor: "#6d6e6e",
  //   padding: 12,
  //   borderRadius: 8,
  //   alignItems: "center",
  // },

  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    padding: 20,
  },

});