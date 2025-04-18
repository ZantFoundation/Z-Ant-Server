import React from "react";
import { useTheme } from "../context/ThemeContext";

const ContentColumns: React.FC = () => {
  const { themeClasses } = useTheme();

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      <div
        className={`md:w-1/3 ${themeClasses.card} border ${themeClasses.background} ${themeClasses.text} p-6 rounded-lg shadow-lg`}
      >
        Help
      </div>
      <div
        className={`md:w-2/3 ${themeClasses.card} border ${themeClasses.background} ${themeClasses.text} p-6 rounded-lg shadow-lg`}
      >
        Content for the second column
      </div>
    </div>
  );
};

export default ContentColumns;
