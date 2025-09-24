import React from 'react'
import { Tabs } from 'expo-router'
import { MaterialIcons } from "@expo/vector-icons"

const tabs = [
    {label: 'Plants', name: 'adminPlantScreen', icon: "local-florist"},
    {label: 'Categories', name: 'categoryScreen', icon: "category"},
    {label: 'Profile', name: 'adminProfile', icon: "person" }
] as const

const UserDashboardRoutes = () => {
  return (
    
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#03fcb5",
        tabBarInactiveTintColor: "#5f736d",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#001a12"
        }
      }}
    >
      {/* (obj.name) ===  ({name}) */}
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