import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { BASE_URL } from "./config/api";


// ================================
// 🔥 TYPE
// ================================
type Item = {
  DepartmentCode?: string;
  DepartmentName?: string;
  CategoryCode?: string;
  CategoryName?: string;
  BrandCode?: string;
  BrandName?: string;
  Total: number;
};

// 🔹 Helpers
// const formatDate = (date: Date) => date.toISOString().split("T")[0];
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

export default function DepartmentWiseSales() {

  const [departments, setDepartments] = useState<Item[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: Item[] }>({});
  const [brands, setBrands] = useState<{ [key: string]: Item[] }>({});

  const [openDept, setOpenDept] = useState<string | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);

  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingBrand, setLoadingBrand] = useState(false);

  const router = useRouter();
  // const fromDate = "2025-08-12";
  // const toDate = "2026-03-04";

  ////filter

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




  // ================================
  // 🔹 LOAD DEPARTMENTS
  // ================================
  const loadDepartments = async () => {
    console.log('d', formatDate(fromDate));
    // alert(formatDate(fromDate))
    setLoadingDept(true);   // ✅ ADD

    try {
      const res = await fetch(`${BASE_URL}/department-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          FromDate: formatDate(fromDate),
          ToDate: formatDate(toDate),
          loctCode: ""
        })
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (Array.isArray(data)) {
        setDepartments(data);
      } else {
        console.log("Dept Error:", data);
        setDepartments([]);
      }

    } catch (err) {
      console.log("Dept Fetch Error:", err);
      setDepartments([]);
    } finally {
      setLoadingDept(false);   // ✅ ADD
    }
  };

  // ================================
  // 🔹 LOAD CATEGORY
  // ================================
  const loadCategories = async (deptCode: string) => {
    console.log('c', formatDate(fromDate),);
    // alert(deptCode);

    if (openDept === deptCode) {
      setOpenDept(null);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/category-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          FromDate: formatDate(fromDate),
          ToDate: formatDate(toDate),
          loctCode: "",
          DeptCode: deptCode
        })
      });

      const text = await res.text();
      console.log("CATEGORY RAW:", text);

      const data = JSON.parse(text);

      // ✅ FIX HERE
      if (Array.isArray(data)) {
        setCategories(prev => ({
          ...prev,
          [deptCode]: data
        }));
      } else {
        console.log("Category Error:", data);
        setCategories(prev => ({
          ...prev,
          [deptCode]: []
        }));
      }

      setOpenDept(deptCode);
      setOpenCat(null);

    } catch (err) {
      console.log("Category Fetch Error:", err);
    }
  };
  // ================================
  // 🔹 LOAD BRAND
  // ================================
  const loadBrands = async (deptCode: string, catCode: string) => {
    console.log('b', formatDate(fromDate),);
    if (openCat === catCode) {
      setOpenCat(null);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/brand-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          FromDate: formatDate(fromDate),
          ToDate: formatDate(toDate),
          loctCode: "",
          DeptCode: deptCode,
          CatCode: catCode
        })
      });

      const text = await res.text();
      console.log("BRAND RAW:", text);

      const data = JSON.parse(text);

      // ✅ FIX
      if (Array.isArray(data)) {
        setBrands(prev => ({
          ...prev,
          [catCode]: data
        }));
      } else {
        console.log("Brand Error:", data);
        setBrands(prev => ({
          ...prev,
          [catCode]: []
        }));
      }

      setOpenCat(catCode);

    } catch (err) {
      console.log("Brand Fetch Error:", err);
    }
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
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Department Wise Sales",
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

      {/* 🔥 DEPARTMENT LOADING */}
      {loadingDept && (
        <Text style={{ textAlign: "center", marginTop: 250, fontSize: 25 }}>
          Loading...
        </Text>
      )}

      {/* 🔥 NO DEPARTMENT DATA */}
      {!loadingDept && Array.isArray(departments) && departments.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 250, fontSize: 20 }}>
          No Data Found
        </Text>
      )}
      {Array.isArray(departments) && departments.map((dept, i) => (
        <View key={i} style={styles.deptCard}>

          {/* 🔵 DEPARTMENT */}
          <TouchableOpacity
            onPress={() => {
              if (!dept.DepartmentCode) {
                console.log("Invalid DeptCode:", dept);
                return;
              }
              loadCategories(dept.DepartmentCode);
            }}
          >
            <View style={styles.row}>
              <Text style={styles.deptText}>{dept.DepartmentName}</Text>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.amount}>$ {dept.Total}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 🟢 CATEGORY */}
          {openDept === dept.DepartmentCode && (
            <>
              {/* 🔥 NO CATEGORY DATA */}
              {!loadingCat &&
                (!categories[String(dept.DepartmentCode)] ||
                  categories[String(dept.DepartmentCode)].length === 0) && (
                  <Text style={{ padding: 10 }}>No Data Found</Text>
                )}

              {categories[String(dept.DepartmentCode)]?.map((cat, j) => (
                <View key={j} style={styles.catCard}>

                  <TouchableOpacity
                    onPress={() => {
                      if (!cat.CategoryCode) return;
                      loadBrands(dept.DepartmentCode!, cat.CategoryCode);
                    }}
                  >
                    <View style={styles.row}>
                      <Text style={styles.catText}>{cat.CategoryName}</Text>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.amount}>$ {cat.Total}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* 🟡 BRAND */}
                  {openCat === cat.CategoryCode && (
                    <>
                      {/* 🔥 NO BRAND DATA */}
                      {!loadingBrand &&
                        (!brands[String(cat.CategoryCode)] ||
                          brands[String(cat.CategoryCode)].length === 0) && (
                          <Text style={{ padding: 10 }}>No Data Found</Text>
                        )}

                      {brands[String(cat.CategoryCode)]?.map((br, k) => (
                        <TouchableOpacity
                          key={k}
                          style={styles.brandCard}
                          onPress={() => goToInventory(br, cat, dept)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.row}>
                            <Text style={styles.brandText}>{br.BrandName}</Text>

                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={styles.amount}>$ {br.Total}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                </View>
              ))}
            </>
          )}

        </View>
      ))}
    </ScrollView>
  );
}

// ================================
// 🎨 STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  deptCard: {
    backgroundColor: "#9ee6fc",
    margin: 10,
    padding: 15,
    borderRadius: 10
  },

  deptText: {
    fontSize: 16,
    fontWeight: "bold"
  },

  catCard: {
    backgroundColor: "#c2fbcf",
    marginTop: 10,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50"
  },

  catText: {
    fontSize: 14,
    fontWeight: "600"
  },

  brandCard: {
    backgroundColor: "#fbf8da",
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e6d96c"
  },

  brandText: {
    fontSize: 13
  },

  amount: {
    fontWeight: "bold",
    fontSize: 14
  },

  percent: {
    fontSize: 12,
    color: "#444"
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

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

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

  applyBtn: {
    marginTop: 20,
    backgroundColor: "#6d6e6e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    padding: 20,
  },
});