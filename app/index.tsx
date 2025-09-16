import { View, Text, ImageBackground, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();
  const { colors, currentTheme, toggleTheme } = useTheme();

  return (
    <ImageBackground
      source={colors.backgroundImage}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <View
        className="w-full rounded-2xl justify-center items-center"
        style={{
          backgroundColor: currentTheme === "light" ? "rgba(255, 255, 255, 0.35)" : "rgba(252, 181, 157,0.13)",
          height: "80%",
          width: "90%",
          boxShadow: '0.5px 1px 2px 3px rgba(0, 5, 5, 0.3)',
          justifyContent: "center",
          alignItems: "center",
          position: "relative", // important for absolutely positioning child
        }}
      >
        
        {/* Dark Mode Toggle at Top-Right */}
        <Pressable
        onPress={toggleTheme}
        style={{
            position: "absolute",
            top: 15,
            right: 15,
            backgroundColor: currentTheme === "light" ? "#ed7951" : "#f7c92f",
            padding: 12,
            borderRadius: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
        }}
        >
        <Icon
            name={currentTheme === "light" ? "dark-mode" : "light-mode"} // icon changes
            size={24}
            color={currentTheme === "light" ? "#fff" : "#000"} // color changes
        />
        </Pressable>


        <Text
          style={{
            color: currentTheme === "light" ? "rgba(140, 38, 4)" : "rgba(21, 214, 163)",
            fontSize: 50,
            fontWeight: "bold",
          }}
        >
          𝐆𝐫𝐞𝐞𝐧
        </Text>

        <Text
          style={{
            color: currentTheme === "light" ? "rgba(140, 38, 4)" : "rgba(21, 214, 163)",
            fontSize: 50,
            fontWeight: "bold",
          }}
        >
          𝐆𝐚𝐫𝐝𝐞𝐧
        </Text>

        <TouchableOpacity
          style={{
              backgroundColor: currentTheme === "light" ? "#4d1e03" : "#001c15",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 15,
              alignSelf: 'center',
              marginTop: 30,
              boxShadow: currentTheme === "light" ? '0.5px 1px 9px 3px rgba(252, 104, 143, 0.6)' : '0.5px 1px 9px 3px rgba(6, 158, 119, 0.9)',
            }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Index;
