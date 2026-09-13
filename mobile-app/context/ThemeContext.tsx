import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sun, Moon, Smartphone } from 'lucide-react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  subtext: string;
  authorityPrimary: string;
  authoritySecondary: string;
  citizenPrimary: string;
  citizenSecondary: string;
  accent: string;
  error: string;
  errorBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;
  inputBg: string;
  inputBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  glassBg: string;
}

export const themes: { dark: ThemeColors; light: ThemeColors } = {
  dark: {
    background: '#0B1416',
    card: '#132124',
    surface: '#1A2D31',
    surfaceHover: '#233C42',
    border: '#1F373C',
    borderSubtle: '#172B2F',
    text: '#F4F7F6',
    textSecondary: '#C5D3D1',
    subtext: '#8E9E9C',
    authorityPrimary: '#2F9E8F',
    authoritySecondary: '#257E72',
    citizenPrimary: '#E8A33D',
    citizenSecondary: '#C58428',
    accent: '#38BDF8',
    error: '#F87171',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    success: '#34D399',
    successBg: 'rgba(52, 211, 153, 0.15)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.15)',
    info: '#60A5FA',
    infoBg: 'rgba(96, 165, 250, 0.15)',
    inputBg: '#0E1A1D',
    inputBorder: '#1F373C',
    tabBarBg: 'rgba(15, 27, 30, 0.95)',
    tabBarBorder: '#1D3238',
    glassBg: 'rgba(19, 33, 36, 0.85)',
  },
  light: {
    background: '#F6F9F8',
    card: '#FFFFFF',
    surface: '#EBF2F1',
    surfaceHover: '#DFECEB',
    border: '#D2DFDD',
    borderSubtle: '#E2ECEB',
    text: '#0D1A1C',
    textSecondary: '#31474B',
    subtext: '#5B7276',
    authorityPrimary: '#1E7C6F',
    authoritySecondary: '#166258',
    citizenPrimary: '#CB7D18',
    citizenSecondary: '#AD650B',
    accent: '#0284C7',
    error: '#DC2626',
    errorBg: 'rgba(220, 38, 38, 0.1)',
    success: '#059669',
    successBg: 'rgba(5, 150, 105, 0.1)',
    warning: '#D97706',
    warningBg: 'rgba(217, 119, 6, 0.1)',
    info: '#2563EB',
    infoBg: 'rgba(37, 99, 235, 0.1)',
    inputBg: '#FFFFFF',
    inputBorder: '#CAD8D6',
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: '#D8E4E2',
    glassBg: 'rgba(255, 255, 255, 0.88)',
  }
};

interface ThemeContextType {
  theme: ThemeColors;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.dark,
  isDarkMode: true,
  themeMode: 'system',
  setThemeMode: async () => {},
  toggleTheme: async () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('@app_theme_mode');
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
          setThemeModeState(savedMode);
        } else {
          // Backward compatibility check
          const legacyTheme = await AsyncStorage.getItem('@app_theme');
          if (legacyTheme === 'light') setThemeModeState('light');
          else if (legacyTheme === 'dark') setThemeModeState('dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadThemePreference();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('@app_theme_mode', mode);
      await AsyncStorage.setItem('@app_theme', mode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : mode);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const isDarkMode =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const toggleTheme = async () => {
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(nextMode);
  };

  const currentTheme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDarkMode,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Reusable Theme Selector Component:
 * Renders an ultra-modern 3-way toggle (Light, Dark, System)
 */
export const ThemeSelector = () => {
  const { themeMode, setThemeMode, theme, isDarkMode } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Smartphone },
  ];

  return (
    <View style={[styles.selectorContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {options.map((opt) => {
        const isSelected = themeMode === opt.mode;
        const Icon = opt.icon;
        return (
          <TouchableOpacity
            key={opt.mode}
            activeOpacity={0.7}
            onPress={() => setThemeMode(opt.mode)}
            style={[
              styles.optionBtn,
              isSelected && [
                styles.optionBtnActive,
                { backgroundColor: theme.card, borderColor: isDarkMode ? '#2F9E8F' : '#1E7C6F' }
              ],
            ]}
          >
            <Icon
              size={16}
              color={isSelected ? (isDarkMode ? '#2F9E8F' : '#1E7C6F') : theme.subtext}
              strokeWidth={isSelected ? 2.5 : 2}
            />
            <Text
              style={[
                styles.optionText,
                { color: isSelected ? theme.text : theme.subtext },
                isSelected && styles.optionTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionTextActive: {
    fontWeight: '800',
  },
});