// components/section/HeaderSection.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface HeaderSectionProps {
  title: string;
  showThemeToggle?: boolean;
}

export default function HeaderSection({ title, showThemeToggle = true }: HeaderSectionProps) {
  const { colors, currentTheme, toggleTheme } = useTheme();

  return (
    <View style={[  styles.header, { backgroundColor: colors.secondary_background }]}>
      <Text style={[styles.headerTitle, { color: colors.primary_text }]}>
        {title}
      </Text>
      {showThemeToggle && (
        <TouchableOpacity 
          onPress={toggleTheme}
          style={[
            styles.themeButton,
            { backgroundColor: colors.secondary_text + "20" }
          ]}
        >
          <Feather 
            name={currentTheme === "light" ? "moon" : "sun"} 
            size={20} 
            color={colors.secondary_text} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});