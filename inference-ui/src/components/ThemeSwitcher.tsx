import * as React from "react";
import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} size="icon" variant="ghost">
      {theme === "light" ? (
        <Moon className="h-12 w-12" />
      ) : (
        <Sun className="h-12 w-12" />
      )}
    </Button>
  );
};
