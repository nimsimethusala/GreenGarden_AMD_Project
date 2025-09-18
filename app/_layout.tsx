import React from 'react'
import { Slot } from 'expo-router'
import '../global.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
// import { useRoleRedirect } from '@/hooks/useRoleRedirect'

const RootLayout = () => {
  // useRoleRedirect();

  return (
    <ThemeProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default RootLayout