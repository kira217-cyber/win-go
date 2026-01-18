import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Profile from "../pages/Profile/Profile";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);
