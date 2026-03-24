import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


// 🔹 Helpers
const formatDate = (date: Date) => date.toISOString().split("T")[0];

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


// 🔹 Component
export default function FilterScreen() {
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

    setShowFilter(false);
  };


  return (
    <View style={styles.container}>

      {/* 🔝 Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.title}>My Screen</Text>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Text style={styles.filterText}>
            {showFilter ? "Close" : "Filter"}
          </Text>
        </TouchableOpacity>
      </View>


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

            {/* From */}
            <View style={styles.dateBox}>
              <Text style={styles.label}>From</Text>

              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={formatDate(fromDate)}
                  onChange={(e) =>
                    setFromDate(new Date(e.target.value))
                  }
                  style={styles.webInput}
                />
              ) : (
                <TouchableOpacity
                  style={styles.input}
                  onPress={() =>
                    selected === "custom" && setShowFromPicker(true)
                  }
                >
                  <Text>{formatDate(fromDate)}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* To */}
            <View style={styles.dateBox}>
              <Text style={styles.label}>To</Text>

              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={formatDate(toDate)}
                  onChange={(e) =>
                    setToDate(new Date(e.target.value))
                  }
                  style={styles.webInput}
                />
              ) : (
                <TouchableOpacity
                  style={styles.input}
                  onPress={() =>
                    selected === "custom" && setShowToPicker(true)
                  }
                >
                  <Text>{formatDate(toDate)}</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>


          {/* 📅 Mobile Pickers */}
          {Platform.OS !== "web" && showFromPicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowFromPicker(false);
                if (date) setFromDate(date);
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
                if (date) setToDate(date);
              }}
            />
          )}


          {/* ✅ Apply */}
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>

        </View>
      )}


      {/* 📦 Content */}
      <View style={styles.content}>
        <Text>Data will appear here...</Text>
      </View>

    </View>
  );
}


// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

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
    backgroundColor: "#28a745",
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