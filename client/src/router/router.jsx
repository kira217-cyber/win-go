import { createBrowserRouter } from "react-router";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Deposit from "../pages/Deposit/Deposit";
import Withdraw from "../pages/Withdraw/Withdraw";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import Promotion from "../pages/Promotion/Promotion";

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
        path: "deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
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
        path: "promotion",
        element: (
          <PrivateRoute>  
            <Promotion />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw",
        element: (
          <PrivateRoute>
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);
