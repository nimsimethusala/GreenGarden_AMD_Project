import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Pressable, Text, Alert, ActivityIndicator, ImageBackground } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();  
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { colors, currentTheme, toggleTheme } = useTheme();

  const handleLogin = async () => {
    console.log("Login logic here");
  };

  return (
    <ImageBackground
      source={colors.backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={{ padding: 20, justifyContent: "center", backgroundColor: currentTheme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 15, 13, 0.9)", height: '80%', width: '90%', borderRadius: 20, boxShadow: '0.5px 1px 2px 3px rgba(0, 5, 5, 0.4)' }}>
                {/* Dark Mode Toggle */}
                <TouchableOpacity
                onPress={toggleTheme}
                style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: currentTheme === "light" ? "#0a7a2b" : "#025749",
                }}
                >
                    <Icon name={currentTheme === "light" ? "dark-mode" : "wb-sunny"} size={20} color="#ffffff"/>
                </TouchableOpacity>
                <Text style={{ fontSize: 27, fontWeight: "700", marginBottom: 44, color: currentTheme === "light" ? "#02473d" : "#fff", alignSelf: "center" }}>Welcome Back</Text>

                {/* Email Input */}
                <TextInput 
                    placeholder="Email" 
                    placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#c3f7ef"}
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    style={{ 
                        borderBottomWidth: 1, 
                        marginBottom: 16,
                        borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#c3f7ef",
                        color: currentTheme === "light" ? "#000" : "#fff",
                        paddingVertical: 6, 
                    }}
                />

                {/* Password Input */}
                <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#c3f7ef", marginTop: 10 }}>
                    <TextInput 
                        placeholder="Password" 
                        placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#c3f7ef"}
                        secureTextEntry={!show} 
                        style={{ flex: 1, color: currentTheme === "light" ? "#000" : "#fff", paddingVertical: 6 }} 
                    />
                    <TouchableOpacity onPress={() => setShow(s => !s)} style={{ padding: 8 }}>
                        <Icon name={show ? "visibility-off" : "visibility"} size={20} color={currentTheme === "light" ? "#0a7a2b" : "#c3f7ef"} />
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity onPress={handleLogin} style={{ marginTop: 54, backgroundColor: currentTheme === "light" ? "#0a7a2b" : "#025749", padding: 14, borderRadius: 8, alignItems: "center" }}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Sign in</Text>}
                </TouchableOpacity>

                {/* Signup link */}
                <Pressable
                    onPress={() => router.push("/signup")}
                    className="self-center"
                    style={{ marginTop: 35 }}
                >
                    <Text
                        style={{ color: currentTheme === "light" ? "#0a7a2b" : "#c3f7ef", fontWeight: "500", fontSize: 14, textAlign: "center" }}
                    >
                    Don’t have an account? Register
                    </Text>
                </Pressable>
            </View>
        </View>
    </ImageBackground>
  );
}
