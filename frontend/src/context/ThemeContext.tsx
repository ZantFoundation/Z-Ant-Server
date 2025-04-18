import { createContext, useContext, useState, ReactNode } from "react";
import { JSX } from "react/jsx-runtime";

interface ThemeClasses {
  navbar: string;
  background: string;
  text: string;
  secondaryText: string;
  card: string;
  button: string;
  link: string;
  cardHover: string;
  footer: string;
}

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
  themeClasses: ThemeClasses;
}

interface ThemeProviderProps {
  children: ReactNode | ((value: ThemeContextType) => ReactNode);
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toggleTheme = (): void => {
    setDarkMode(!darkMode);
  };

  // Determine theme classes
  const themeClasses: ThemeClasses = {
    navbar: darkMode ? "bg-[#481A00]" : "bg-[#FFFCEA]",
    background: darkMode ? "bg-[#18181B]" : "bg-white",
    text: darkMode ? "text-white" : "text-gray-900",
    secondaryText: darkMode ? "text-gray-300" : "text-gray-700",
    card: darkMode ? "bg-[#18181B]" : "bg-white",
    button: darkMode
      ? "bg-amber-600 hover:bg-amber-700 text-white"
      : "bg-amber-500 hover:bg-amber-600 text-white",
    link: darkMode
      ? "text-amber-400 hover:text-amber-300"
      : "text-amber-600 hover:text-amber-700",
    cardHover: darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50",
    footer: darkMode ? "bg-[#18181C]" : "bg-white-100",
  };

  const value: ThemeContextType = {
    darkMode,
    toggleTheme,
    themeClasses,
  };

  return (
    <ThemeContext.Provider value={value}>
      {typeof children === "function" ? children(value) : children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
