import { View, Text, Image, ImageBackground, Pressable } from "react-native";
import React from "react";
import { useTheme } from "@/context/ThemeContext";

const Index = () => {
  const { colors, currentTheme, toggleTheme } = useTheme();

  return (
    <ImageBackground
      source={colors.backgroundImage}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >

      <Text style={{ color: colors.primary_text, fontSize: 20, fontWeight: "bold" }}>
        {currentTheme === "dark" ? "Dark Mode" : "Light Mode"}
      </Text>

      <Pressable
        onPress={toggleTheme}
        style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 8, marginTop: 20 }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Toggle Theme</Text>
      </Pressable>
    </ImageBackground>
  );
};

export default Index;
