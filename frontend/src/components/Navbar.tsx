import React from "react";
import { useTheme } from "../context/ThemeContext";
import { BiMoon, BiSun } from "react-icons/bi";

const Navbar: React.FC = () => {
  const { darkMode, toggleTheme, themeClasses } = useTheme();

  return (
    <nav className={`py-3 ${themeClasses.navbar} shadow-lg`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <a
            className={`text-xl md:text-2xl flex items-center font-bold ${themeClasses.text}`}
            href="/"
          >
            <img
              src="src/assets/zant-icon.png"
              alt="Z-Ant Logo"
              className="h-8 mr-3"
            />
            Z-Ant
          </a>
        </div>
        <div className="flex items-center">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-sm hover:bg-opacity-20 hover:bg-gray-300 transition-colors ${themeClasses.text}`}
            aria-label="Toggle theme"
          >
            {darkMode ? <BiMoon size={20} /> : <BiSun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
