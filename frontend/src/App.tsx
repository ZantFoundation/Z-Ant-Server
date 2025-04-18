import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import ContentColumns from "./components/ContentColumns";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";

const App: React.FC = () => {
  const [showColumns, setShowColumns] = useState<boolean>(false);

  const toggleColumnsView = (): void => {
    setShowColumns(!showColumns);
  };

  return (
    <ThemeProvider>
      {({ darkMode, themeClasses }) => (
        <div
          className={`min-h-screen flex flex-col ${themeClasses.background} transition-colors duration-300`}
        >
          <Navbar />

          <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
            {!showColumns ? (
              <LandingPage toggleColumnsView={toggleColumnsView} />
            ) : (
              <ContentColumns />
            )}
          </main>

          <Footer />
        </div>
      )}
    </ThemeProvider>
  );
};

export default App;
