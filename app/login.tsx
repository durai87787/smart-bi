import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {

    const user = email.trim();
    const pass = password.trim();

    if (user === "admin@gmail.com" && pass === "1234") {

      router.replace("/home");

    } else {

      Alert.alert("Login Failed", "Invalid Email or Password");

    }

  };

  return (

  <ImageBackground
  source={require("../assets/login1.jpg")}
  style={styles.background}
  resizeMode="cover"
>

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

          {/* Email */}

          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color="#6366f1" />

            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}

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

          {/* Button */}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

        </View>

      </View>

     </ImageBackground>

  );
}

const styles = StyleSheet.create({

  logo: {
  width: 120,
  height: 120,
  alignSelf: "center",
  marginBottom: 10
},

background: {
  flex: 1,
  width: "100%",
  height: "100%",
  justifyContent: "center"
},

  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255, 252, 252, 0)"
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