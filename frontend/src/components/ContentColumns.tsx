import React from "react";
import { useTheme } from "../context/ThemeContext";

const ContentColumns: React.FC = () => {
  const { themeClasses } = useTheme();

  return (
    <div className="w-full max-w-6xl px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        className={`flex flex-col ${themeClasses.card} border-2 rounded-xl p-6`}
      ></div>

      <div
        className={`flex flex-col md:col-span-2 ${themeClasses.card} border-2 rounded-xl p-6`}
      ></div>
    </div>
  );
};

export default ContentColumns;
