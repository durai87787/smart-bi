import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";
import { BASE_URL } from "./config/api";

export default function InvoiceScreen() {
    const params = useLocalSearchParams();
    const invoiceNo = String(params.invoiceNo || "");

    const [header, setHeader] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${BASE_URL}/api/invoice-details?invoiceNo=${invoiceNo}`
            );

            const json = await res.json();

            setHeader(json.header);
            setItems(json.items);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
    }, []);

    // if (loading) {
    //     return <ActivityIndicator style={{ marginTop: 50, }} />;
    // }

    // if (loading) {
    //     return <ActivityIndicator style={{ marginTop: 50 }} />;
    // }

    return (

        <View style={styles.container}>

            <Stack.Screen options={{ title: "Invoice Receipt" }} />

            {/* 🔥 CARD */}
            <View style={styles.card}>

                {/* HEADER */}

                <View style={styles.headerBox}>
                    <Text style={styles.info}>
                        Invoice No: {header?.InvoiceNo}
                    </Text>
                    <Text style={styles.info}>
                        Invoice Date: {header?.InvoiceDate?.split("T")[0]}
                    </Text>
                    <Text style={styles.info}>
                        Location: {header?.LocationCode}
                    </Text>
                </View>

                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                    <Text style={styles.colItem}>Item</Text>
                    <Text style={styles.colQty}>Qty</Text>
                    <Text style={styles.colPrice}>Price</Text>
                    <Text style={styles.colTotal}>Total</Text>
                </View>

                {/* ITEMS */}
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.colItem}>
                                {item.Description}
                            </Text>
                            <Text style={styles.colQty}>
                                {item.Qty}
                            </Text>
                            <Text style={styles.colPrice}>
                                {item.Price}
                            </Text>
                            <Text style={styles.colTotal}>
                                {item.NetAmount}
                            </Text>
                        </View>
                    )}
                />

            </View>
            {/* 🔄 LOADING OVERLAY */}
            {loading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#2f3b73" />
                    <Text style={{ marginTop: 10 }}>Loading...</Text>
                </View>
            )}
        </View>

    );
}
const styles = StyleSheet.create({
    loaderOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.8)", // ✅ WHITE overlay
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#eef1f7",
        padding: 10,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },

    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#2f3b73",
    },

    headerBox: {
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },

    info: {
        fontSize: 12,
        marginBottom: 3,
        color: "#444",
    },

    tableHeader: {
        flexDirection: "row",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        marginTop: 5,
    },

    row: {
        flexDirection: "row",
        paddingVertical: 8,
        borderBottomWidth: 0.3,
        borderColor: "#ddd",
    },

    colItem: {
        flex: 2,
        fontSize: 12,
        color: "#333",
    },

    colQty: {
        flex: 1,
        fontSize: 12,
        textAlign: "center",
    },

    colPrice: {
        flex: 1,
        fontSize: 12,
        textAlign: "right",
    },

    colTotal: {
        flex: 1,
        fontSize: 12,
        textAlign: "right",
        fontWeight: "600",
    },
});