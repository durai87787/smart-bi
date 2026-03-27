import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { BASE_URL } from "./config/api";

export default function Login() {

  const router = useRouter();

  // ✅ only username + password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  type LoginResponse = {
  success?: boolean;
  message?: string;
  user?: any;
};

 const handleLogin = async () => {

  if (!username.trim() || !password.trim()) {
    Alert.alert("Error", "Please enter username and password");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password.trim()
      })
    });

    const data = await response.json();

    console.log("STATUS:", response.status);
    console.log("DATA:", data);

    if (response.status === 200 && data.success) {
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      // Alert.alert("Success", "Login Successful");
      router.replace("/home");
      return;
    }

    // 🔥 FORCE ALERT (THIS WILL DEFINITELY SHOW)
    Alert.alert(
      "Login Failed",
      data?.message || "Invalid username or password"
    );

  } catch (error) {

    console.log("ERROR:", error);

    Alert.alert("Error", "Server not reachable");

  } finally {
    setLoading(false);
  }
};

  return (

  <ImageBackground
    source={require("../assets/login1.jpg")}
    style={styles.background}
    resizeMode="cover"
  >
    <Stack.Screen options={{ headerShown: false }} />

    <View style={styles.overlay}>

      <Image
        source={require("../assets/unipro_logo_pulse.gif")}
        style={{
          width: 300,
          height: 300,
          alignSelf: "center",
          marginTop: -275,
          marginBottom: -10
        }}
        resizeMode="contain"
      />

      <View style={styles.card}>

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* ✅ USERNAME */}
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={20} color="#6366f1" />
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            autoCapitalize="none"
            onChangeText={setUsername}
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color="#6366f1" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

      </View>

    </View>

  </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center"
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 15,
    elevation: 5
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333"
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 25
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c2c2c2",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: "#fbf8f8"
  },
  input: {
    flex: 1,
    padding: 12
  },
  button: {
    backgroundColor: "#6c6c6d",
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  }
});