import React from 'react'
import { Slot } from 'expo-router'
import '../global.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { LoaderProvider } from '@/context/LoaderContext'

const RootLayout = () => {
  return (
    <LoaderProvider>
      <ThemeProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </ThemeProvider>
    </LoaderProvider>
  )
}

export default RootLayout
