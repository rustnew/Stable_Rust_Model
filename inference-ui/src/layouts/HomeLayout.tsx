/**
 * Main layout component for the application.
 * This component wraps the main content of the application and can be used to provide a consistent layout.
 */
import * as React from "react";

interface HomeLayoutProps {
  children: React.ReactNode;
}

import { useTheme } from "../hooks/useTheme";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`relative min-h-screen font-sans ${
        theme === "light" ? "bg-white text-slate-900" : "text-white"
      }`}
    >
      {/* Background image and overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/malaria.jpeg')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.8))" }}
      />
      <Header />
      <main className="pt-16 flex flex-col items-center flex-grow">
        {children}
      </main>
      <div id="portal-container" />
      <Footer />
    </div>
  );
};

export default HomeLayout;
