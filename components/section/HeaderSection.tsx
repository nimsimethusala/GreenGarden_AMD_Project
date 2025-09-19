import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons"; 
import { theme } from "@/constants/theme";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const HeaderSection: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const { user } = useAuth();
  const t = darkMode ? theme.dark : theme.light;

  return (
    <View style={[styles.header, { backgroundColor: t.primary_background }]}>
      {/* Theme toggle button */}
      <TouchableOpacity
        style={[styles.themeToggle, { backgroundColor: t.accent }]}
        onPress={() => setDarkMode(!darkMode)}
      >
        {darkMode ? (
          <Feather name="sun" size={22} color={t.icon_accent} />
        ) : (
          <Feather name="moon" size={22} color={t.icon_accent} />
        )}
      </TouchableOpacity>

      {/* Greeting */}
      <View style={styles.headerContent}>
        <Text style={[styles.appName, { color: t.primary_text }]}>
          Hello, {user?.username || "Guest"}
        </Text>
        <Text style={[styles.tagline, { color: t.secondary_text }]}>
          Increase your natural beauty
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomRightRadius: 50,
    position: "relative",
  },
  headerContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  themeToggle: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 6,
    borderRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default HeaderSection;
