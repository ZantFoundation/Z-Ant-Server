import React from "react";
import { useTheme } from "../context/ThemeContext";

const Footer: React.FC = () => {
  const { themeClasses } = useTheme();

  return (
    <footer className={`py-6 ${themeClasses.footer} mt-auto`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className={`text-sm ${themeClasses.secondaryText} mb-4 md:mb-0`}>
            © 2025 Z-Ant Project
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className={`${themeClasses.secondaryText} hover:${themeClasses.text}`}
            >
              GitHub
            </a>
            <a
              href="#"
              className={`${themeClasses.secondaryText} hover:${themeClasses.text}`}
            >
              Documentation
            </a>
            <a
              href="#"
              className={`${themeClasses.secondaryText} hover:${themeClasses.text}`}
            >
              Community
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
