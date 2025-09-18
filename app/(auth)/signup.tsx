import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import ProfileImagePicker from "@/components/ProfileImagePicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";

export default function SignupScreen() {
  const { colors, currentTheme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const onImagePicked = (blob: Blob | null) => {
    setAvatarBlob(blob);
  };

  // Validation logic
  const validate = () => {
    if (!email.includes("@")) return "Enter a valid email address";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSignup = () => {
    const error = validate();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }
    Alert.alert("Success", "All inputs are valid 🎉");
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
                backgroundColor:
                currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                padding: 10,
                borderRadius: 50,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
            }}
            >
            <Icon
                name={currentTheme === "light" ? "dark-mode" : "light-mode"}
                size={22}
                color={currentTheme === "light" ? "#fff" : "#000"}
            />
            </TouchableOpacity>

            {/* Profile Image */}
            <ProfileImagePicker onImagePicked={onImagePicked} initialUri={null} />

            {/* Name */}
            <TextInput
            placeholder="Name"
            placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
            value={name}
            onChangeText={setName}
            style={{
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 36,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
            }}
            />

            {/* Email */}
            <TextInput
            placeholder="Email"
            placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 22,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
            }}
            />

            {/* Password */}
            <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 22,
            }}
            >
            <TextInput
                placeholder="Password"
                placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{
                flex: 1,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
                }}
            />
            <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={{ padding: 8 }}
            >
                <Icon
                name={showPassword ? "visibility-off" : "visibility"}
                size={20}
                color={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
                />
            </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "light" ? "#0a7a2b" : "#74f7d5",
                marginTop: 22,
            }}
            >
            <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                style={{
                flex: 1,
                paddingVertical: 6,
                color: currentTheme === "light" ? "#000" : "#fff",
                }}
            />
            <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={{ padding: 8 }}
            >
                <Icon
                name={showPassword ? "visibility-off" : "visibility"}
                size={20}
                color={currentTheme === "light" ? "#0a7a2b" : "#74f7d5"}
                />
            </TouchableOpacity>
            </View>

            {/* Submit button */}
            <TouchableOpacity
            onPress={handleSignup}
            style={{
                marginTop: 44,
                backgroundColor: currentTheme === "light" ? "#0a7a2b" : "#07b889",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
            }}
            >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                Create account
                </Text>
            )}
            </TouchableOpacity>
        </View>
      </View>  
      
    </ImageBackground>
  );
}
