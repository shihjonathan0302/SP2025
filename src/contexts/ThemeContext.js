// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const ThemeContext = createContext();

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    text: '#111111',
    card: '#f9f9f9',
    border: '#e5e7eb',
    primary: '#2563EB',
    label: '#111111', // 🔑 Light 下文字顏色
  },
};

const DarkThemeCustom = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    text: '#ffffff',
    card: '#111111',
    border: '#333333',
    primary: '#3B82F6',
    label: '#ffffff', // 🔑 Dark 下文字顏色
  },
};

const ConstantColors = {
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'

  const setLight = () => setTheme('light');
  const setDark = () => setTheme('dark');
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const currentTheme = theme === 'dark' ? DarkThemeCustom : LightTheme;

  return (
    <ThemeContext.Provider
      value={{ theme, setLight, setDark, toggleTheme, currentTheme, ConstantColors }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}