import * as React from "react";
import { useState, useMemo } from "react";
import { ThemeContext, ThemeContextType } from "./theme-context-definition";

type Theme = "light" | "dark";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("dark");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value: ThemeContextType = useMemo(
    () => ({ theme, toggleTheme }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
