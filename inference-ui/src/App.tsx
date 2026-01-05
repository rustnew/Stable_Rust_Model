/**
 * Main application component.
 * This component serves as the entry point for the application's routing.
 */
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
};

export default App;
