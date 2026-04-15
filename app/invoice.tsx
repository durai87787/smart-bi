import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { BASE_URL } from "./config/api";

type Invoice = {
  InvoiceNo: string;
  LocationCode: string;
  NetTotal: number;
  DateTime: string;
  Paymode: string;
  Amount: number;
};

export default function InvoiceList() {
  const router = useRouter();

  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  //    const [data, setData] = useState<PaymodeItem[]>([]);
  // const [filteredData, setFilteredData] = useState<PaymodeItem[]>([]);

  // const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");

  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingBrand, setLoadingBrand] = useState(false);


  // const fromDate = "2025-08-12";
  // const toDate = "2026-03-04";

  ////filter

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getToday = () => new Date();

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

  // 🔹 Apply
  const handleApply = () => {
    console.log("From:", formatDate(fromDate));
    console.log("To:", formatDate(toDate));
    loadInvoices();
    setShowFilter(false);
  };

  const loadInvoices = () => {
    setLoading(true);
    setError("");

    fetch(`${BASE_URL}/invoice-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        loctCode: null,
        FromDate: formatDate(fromDate), //"2025-05-12",
        ToDate: formatDate(toDate)   //"2026-03-12"
      })
    })
      .then(res => res.json())
      .then(result => {
        console.log("Invoice API:", result);
        setData(result || []);
        setLoading(false);
      })
      .catch(err => {
        console.log("API Error:", err);
        setError("Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/invoicereceipt",
          params: { invoiceNo: item.InvoiceNo },
        });
      }}
    >
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

        <View style={styles.line} />

        <Text style={styles.payTitle}>
          Paymodes:
        </Text>

        <View style={styles.row}>
          <Ionicons name="card-outline" size={22} color="#444" />

          <Text style={styles.paymode}>
            {item.Paymode}
          </Text>

          <Text style={styles.amount}>
            ${item.Amount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Invoice",
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
          )
        }}
      />
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


      {/* 🔥 CONDITIONAL UI */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2c78c4" />
          <Text style={styles.loadingText}>Loading invoices...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={60} color="red" />
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity onPress={loadInvoices} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color="#999" />
          <Text style={styles.noDataText}>No Data Found</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}

    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb"
  },

  toolbar: {
    height: 60,
    backgroundColor: "#686868",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#ece9ef",
    margin: 12,
    padding: 15,
    borderRadius: 14,
    elevation: 3
  },

  invoiceNo: {
    color: "#2c78c4",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  location: {
    color: "#333"
  },

  date: {
    color: "red"
  },

  total: {
    color: "green",
    fontWeight: "bold"
  },

  line: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8
  },

  payTitle: {
    fontWeight: "bold",
    marginBottom: 6
  },

  paymode: {
    marginLeft: 8,
    flex: 1
  },

  amount: {
    fontWeight: "bold"
  },

  /* 🔥 NEW STYLES */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666"
  },

  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999"
  },

  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "red"
  },

  retryBtn: {
    marginTop: 15,
    backgroundColor: "#2c78c4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold"
  },
  //filter ///
  //    toolbar: {
  //     flexDirection: "row",
  //     justifyContent: "space-between",
  //     alignItems: "center",
  //     padding: 15,
  //     backgroundColor: "#007bff",
  //   },

  //   title: {
  //     color: "#fff",
  //     fontSize: 18,
  //     fontWeight: "bold",
  //   },

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