import React from 'react'
import { Slot } from 'expo-router'
import '../global.css'
import { ThemeProvider } from '@/context/ThemeContext'

const RootLayout = () => {
  return (
    <ThemeProvider>
        <Slot />
    </ThemeProvider>
  )
}

export default RootLayout