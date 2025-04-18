import React from "react";
import { useTheme } from "../context/ThemeContext";

interface LandingPageProps {
  toggleColumnsView: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ toggleColumnsView }) => {
  const { themeClasses } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-4xl mx-auto">
      <h1
        className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight ${themeClasses.text}`}
      >
        Z-Ant Simplifies the Deployment of Neural Networks on Microprocessors
      </h1>

      <p className={`text-xl mb-10 max-w-2xl ${themeClasses.secondaryText}`}>
        An open-source framework that optimizes neural networks for edge
        computing with minimal resource consumption
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button
          onClick={toggleColumnsView}
          className={`px-8 py-4 rounded-lg font-medium text-lg shadow-lg transform transition hover:scale-105 ${themeClasses.button}`}
        >
          Get Started
        </button>
      </div>

      <div className={`mt-16 ${themeClasses.secondaryText}`}>
        <p className="mb-3 text-lg">
          Z-Ant is an open-source project powered by Zig
        </p>
        <p className="flex items-center justify-center gap-2">
          For help visit our
          <a
            href="https://github.com/ZantFoundation/Z-Ant"
            className={`font-medium ${themeClasses.link} hover:underline`}
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
