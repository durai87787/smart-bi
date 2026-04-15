import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { BASE_URL } from "./config/api";


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

type PurchaseData = {
    TotalPurchase: number;
    VendorCount: number;
    GRNCount: number;
    POCount: number;
};

const gradients = [
    ["#43cea2", "#185a9d"],
    ["#36d1dc", "#5b86e5"],
    ["#f7971e", "#ffd200"],
    ["#c471f5", "#fa71cd"],
] as const;



export default function Purchase() {

    const [showFilter, setShowFilter] = useState(false);
    const [selected, setSelected] = useState("day");

    const [fromDate, setFromDate] = useState(getToday());
    const [toDate, setToDate] = useState(getToday());

    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [loading, setLoading] = useState(false);


    type PurchaseData = {
        Name: string;
        Total: number;
    };

    const [data, setData] = useState<PurchaseData[]>([]);

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
        loadPurchase();
        setShowFilter(false);
    };

    const router = useRouter();

    // const [showFilter, setShowFilter] = useState(false);

    // const [fromDate, setFromDate] = useState("2025-08-12");
    // const [toDate, setToDate] = useState("2026-03-10");



    //     const loadPurchase = () => {
    //    console.log(fromDate,toDate);

    //         fetch(`${BASE_URL}/purchase-summary`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 FromDate: fromDate,
    //                 ToDate: toDate
    //             })
    //         })
    //             .then(res => res.json())
    //             .then(result => {

    //                 console.log("Purchase API:", result);

    //                 if (result.length > 0) {
    //                     setData(result[0]);
    //                 }

    //             })
    //             .catch(err => {
    //                 console.log("API Error:", err);
    //             });

    //     };

    const loadPurchase = () => {
        console.log('fromDate', formatDate(fromDate), formatDate(toDate));

        setLoading(true); // ✅ START LOADING

        fetch(`${BASE_URL}/purchase-summary`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                FromDate: formatDate(fromDate),
                ToDate: formatDate(toDate)
            })
        })
            .then(res => res.json())
            .then(result => {
                console.log("Purchase API:", result);

                // if (result.length > 0) {
                //     setData(result[0]);
                // }
                setData(result);
            })
            .catch(err => {
                console.log("API Error:", err);
            })
            .finally(() => {
                setLoading(false); // ✅ STOP LOADING
            });
    };

    useEffect(() => {
        loadPurchase();
    }, []);

    const getIcon = (name: string): any => {
        const text = name.toLowerCase();

        if (text.includes("purchase")) return "cash-outline";
        if (text.includes("vendor")) return "people-outline";
        if (text.includes("grn")) return "cube-outline";
        if (text.includes("po")) return "document-text-outline";

        return "stats-chart-outline";
    };

    return (

        <View style={styles.container}>
            <ScrollView>
                <Stack.Screen
                    options={{
                        title: "Purchase",
                        headerRight: () => (
                            <TouchableOpacity

                                onPress={() => setShowFilter(!showFilter)}
                            >
                                <Text style={{ marginRight: 20 }}>
                                    <Ionicons name="filter-outline" size={24} color="white" />
                                </Text>


                            </TouchableOpacity>

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

                {/* Dashboard Cards */}

                {loading ? (
                    <View style={{ marginTop: 50 }}>
                        <ActivityIndicator size="large" color="#007bff" />
                    </View>
                ) : (
                    <View style={styles.cardContainer}>
                        {Array.isArray(data) &&
                            data.map((item: any, index: number) => {
                                const colors = gradients[index % gradients.length];

                                return (
                                    <LinearGradient
                                        key={index}
                                        colors={colors}
                                        style={styles.card}
                                    >
                                        <Text style={styles.cardTitle}>{item.Name}</Text>

                                        <Text style={styles.cardValue}>
                                            {item.Name?.toLowerCase().includes("purchase")
                                                ? `${Number(item.Total ?? 0).toLocaleString()}`
                                                : item.Total ?? 0}
                                        </Text>
                                    </LinearGradient>
                                );
                            })}
                    </View>
                )}

                {/* <View style={styles.cardContainer}>
                    {Array.isArray(data) &&
                        data.map((item: any, index: number) => {
                            const colors = gradients[index % gradients.length];

                            return (
                                <LinearGradient
                                    key={index}
                                    colors={colors}
                                    style={styles.card}
                                >
                                    <Text style={styles.cardTitle}>{item.Name}</Text>

                                    <Text style={styles.cardValue}>
                                        {item.Name?.toLowerCase().includes("purchase")
                                            ? ` ${Number(item.Total ?? 0).toLocaleString()}`
                                            : item.Total ?? 0}
                                    </Text>
                                </LinearGradient>
                            );
                        })}
                </View> */}

            </ScrollView>

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
        backgroundColor: "#4e4e4e",
        marginTop: 15,
        padding: 12,
        alignItems: "center",
        borderRadius: 10
    },

    cardContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 16
    },

    card: {
        width: "48%",
        height: 150,
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8
    },

    cardTitle: {
        color: "#fff",
        fontSize: 14
    },

    cardValue: {
        color: "#fff",
        fontSize: 26,
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

    //   dateRow: {
    //     flexDirection: "row",
    //     justifyContent: "space-between",
    //     marginTop: 10,
    //   },

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

    //   applyBtn: {
    //     marginTop: 20,
    //     backgroundColor: "#6d6e6e",
    //     padding: 12,
    //     borderRadius: 8,
    //     alignItems: "center",
    //   },

    applyText: {
        color: "#fff",
        fontWeight: "bold",
    },

    content: {
        flex: 1,
        padding: 20,
    },

});