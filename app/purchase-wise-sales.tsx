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

  const [showFilter, setShowFilter] = useState(false);

  const [fromDate, setFromDate] = useState("2010-08-12");
  const [toDate, setToDate] = useState("2026-03-10");

  const [departments, setDepartments] = useState<Dept[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: Category[] }>({});
  const [brands, setBrands] = useState<{ [key: string]: Brand[] }>({});

  const [openDept, setOpenDept] = useState<string | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);

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

  // ===============================
  // UI
  // ===============================
  return (
    <View style={styles.container}>
  <View style={styles.dotContainer}>
        <View style={[styles.dot, { backgroundColor: "#9ee6fc" }]} />
        <Text style={styles.text}>Department</Text>
        <View style={[styles.dot, { backgroundColor: "#c2fbcf" }]} />
        <Text style={styles.text}>Categories</Text>
        <View style={[styles.dot, { backgroundColor: "#fbf8da" }]} />
         <Text style={styles.text}>Brands</Text>
        </View>
      <ScrollView>

        {/* FILTER */}
        {showFilter && (
          <View style={styles.filterBox}>
            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateInput}
                value={fromDate}
                onChangeText={setFromDate}
              />
              <TextInput
                style={styles.dateInput}
                value={toDate}
                onChangeText={setToDate}
              />
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={loadDepartments}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Apply Filter
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DATA */}
        {departments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#bbb" />
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

                        <View key={brand.BrandCode} style={styles.innerCard}>
                          <View style={styles.row}>
                            <Text style={styles.innerText}>{brand.BrandName}</Text>
                            <Text style={styles.amount}>₹ {brand.Total}</Text>
                          </View>
                        </View>

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
    backgroundColor: "#3b4a8a",
    marginTop: 15,
    padding: 12,
    alignItems: "center",
    borderRadius: 10
  },

  card: {
    backgroundColor: "#6fb3c7",
    margin: 10,
    padding: 15,
    borderRadius: 10
  },

  subCard: {
    marginTop: 10,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderColor: "#fff"
  },

  innerCard: {
    marginTop: 8,
    paddingLeft: 25
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },

  subText: {
    fontSize: 14,
    color: "#eef"
  },

  innerText: {
    fontSize: 13,
    color: "#fff"
  },

  amount: {
    fontWeight: "bold",
    color: "#fff"
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
  }

});