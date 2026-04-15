import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "./config/api";

export default function VendorDetailsScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const vendorCode = String(params.vendorCode);
    const fromDate = String(params.fromDate);
    const toDate = String(params.toDate);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    type VendorItem = {
        Gid: string;
        Date: string;
        Cost: number;
    };

    const fetchData = async () => {
        try {
            const url = `${BASE_URL}/api/vendor-details?vendorCode=${vendorCode}&fromDate=${fromDate}&toDate=${toDate}`;

            console.log("API:", url);

            const res = await fetch(url);
            const json = await res.json();

            setData(json);
        } catch (err) {
            console.log("ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderItem = ({ item }: { item: VendorItem }) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.gid}>{item.Gid}</Text>
                <Text style={styles.date}>
                    {item.Date.split("T")[0]}
                </Text>
            </View>

            <Text style={styles.cost}>
                {Number(item.Cost).toFixed(2)}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* 🔵 Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Vendor Details List</Text>
            </View>

            {/* 🔄 Loader */}
            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ padding: 10 }}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2f3e7c",
        padding: 15,
    },

    headerTitle: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 15,
        fontWeight: "600",
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        elevation: 3,
    },

    gid: {
        fontSize: 14,
        fontWeight: "600",
    },

    date: {
        fontSize: 12,
        color: "gray",
        marginTop: 4,
    },

    cost: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
});