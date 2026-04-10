import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";

import { BASE_URL } from "./config/api"; // ✅ correct path

type InventoryItem = {
    InventoryCode: string;
    Description: string;
    Total: number;
};

export default function InventoryScreen() {
    const params = useLocalSearchParams();

    const DeptCode = String(params.DeptCode || "");
    const CatCode = String(params.CatCode || "");
    const BCode = String(params.BCode || "");
    const FromDate = String(params.FromDate || "");
    const ToDate = String(params.ToDate || "");

    const loctCode =
        params.loctCode && params.loctCode !== "null"
            ? String(params.loctCode)
            : "";

    const [data, setData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔥 API CALL
    const getInventory = async () => {
        try {
            let url = `${BASE_URL}/api/inventory?DeptCode=${DeptCode}&CatCode=${CatCode}&BCode=${BCode}&FromDate=${FromDate}&ToDate=${ToDate}`;

            if (loctCode) {
                url += `&loctCode=${loctCode}`;
            }

            console.log("API:", url);

            const res = await fetch(url);
            const json = await res.json();

            setData(json);
        } catch (err) {
            console.log("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (DeptCode && CatCode && BCode) {
            getInventory();
        }
    }, [DeptCode, CatCode, BCode]);

    // 🔥 TABLE ROW
    const renderItem = ({ item, index }: { item: InventoryItem; index: number }) => (
        <View style={styles.row}>
            <Text style={styles.cellIndex}>{index + 1}</Text>
            {/* <Text style={styles.cellCode}>{item.InventoryCode}</Text> */}
            <Text style={styles.cellDesc}>{item.Description}</Text>
            <Text style={styles.cellTotal}>{item.Total}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Inventory List",
                }}
            />

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ padding: 10 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={{ flex: 1 }}>
                                {/* <Text style={styles.code}>{item.InventoryCode}</Text> */}
                                <Text style={styles.name}>{item.Description}</Text>
                            </View>

                            <Text style={styles.amount}>$ {item.Total}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
    },

    headerRow: {
        flexDirection: "row",
        backgroundColor: "#ddd",
        padding: 8,
        borderBottomWidth: 1,
    },

    headerIndex: { width: 30, fontWeight: "bold" },
    headerCode: { width: 120, fontWeight: "bold" },
    headerDesc: { flex: 1, fontWeight: "bold" },
    headerTotal: { width: 80, textAlign: "right", fontWeight: "bold" },

    row: {
        flexDirection: "row",
        padding: 8,
        borderBottomWidth: 0.5,
    },

    cellIndex: { width: 30 },
    cellCode: { width: 120 },
    cellDesc: { flex: 1 },
    cellTotal: { width: 80, textAlign: "right" },


    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        // shadow
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },

    code: {
        fontSize: 12,
        color: "#888",
        marginBottom: 4,
    },

    name: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },

    amount: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2f3b73",
    },
});