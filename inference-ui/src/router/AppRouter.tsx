/**
 * Application router component that handles all client-side routing.
 * This component sets up the React Router with the application's route configuration,
 * wraps all routes in the main layout, and provides recursive route rendering.
 */
import { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import routes from "./routes";
const AppRouter = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeLayout>
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Routes>
        </HomeLayout>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
