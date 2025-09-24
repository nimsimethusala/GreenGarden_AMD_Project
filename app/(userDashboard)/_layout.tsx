import React from 'react'
import { Tabs } from 'expo-router'
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from '@/context/ThemeContext'

const tabs = [
    {label: 'Home', name: 'home', icon: "home-filled"},
    {label: 'My Plants', name: 'myPlant', icon: "add-circle"},
    {label: 'Plants', name: 'plantScreen', icon: "local-florist"},
    {label: 'Profile', name: 'userProfile', icon: "person" }
] as const

const UserDashboardRoutes = () => {
  const { colors, currentTheme } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary_text,
        tabBarInactiveTintColor: colors.accent,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.secondary_background
        }
      }}
    >
      {tabs.map(({ name, icon, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={icon} color={color} size={size} />
            )
          }}
        />
      ))}
    </Tabs>
  )
}

export default UserDashboardRoutes