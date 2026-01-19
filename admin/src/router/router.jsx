import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Profile from "../pages/Profile/Profile";
import AllUser from "../pages/AllUser/AllUser";
import AddGameProvider from "../pages/AddGameProvider/AddGameProvider";
import AddGame from "../pages/AddGame/AddGame";
import Withdraw from "../pages/Withdraw/Withdraw";
import Deposit from "../pages/Deposit/Deposit";
import NavbarController from "../pages/NavbarController/NavbarController";
import BannerController from "../pages/BannerController/BannerController";
import NoticeController from "../pages/NoticeController/NoticeController";
import ProviderController from "../pages/ProviderController/ProviderController";
import PaymentMethodController from "../pages/PaymentMethodController/PaymentMethodController";
import BottomNavbarController from "../pages/BottomNavbarController/BottomNavbarController";
import FaviconAndTitleController from "../pages/FaviconAndTitleController/FaviconAndTitleController";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Home />
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
        path: "all-user",
        element: (
          <PrivateRoute>
            <AllUser />
          </PrivateRoute>
        ),
      },
      {
        path: "add-game-provider",
        element: (
          <PrivateRoute>
            <AddGameProvider />
          </PrivateRoute>
        ),
      },
      {
        path: "add-game",
        element: (
          <PrivateRoute>
            <AddGame />
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
        path: "deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
      },
      {
        path: "controller/navbar",
        element: (
          <PrivateRoute>
            <NavbarController />
          </PrivateRoute>
        ),
      },
      {
        path: "controller/banner",
        element: (
          <PrivateRoute>
            <BannerController />
          </PrivateRoute>
        ),
      },
      {
        path: "controller/notice",
        element: (
          <PrivateRoute>
            <NoticeController />
          </PrivateRoute>
        ),
      },
      {
        path: "controller/provider",
        element: (
          <PrivateRoute>
            <ProviderController />
          </PrivateRoute>
        ),
      },
      {
        path: "controller/payment-method",
        element: (
          <PrivateRoute>
            <PaymentMethodController />
          </PrivateRoute>
        ),
      },
      {
        path: "controller/bottom-navbar",
        element: (
          <PrivateRoute>
            <BottomNavbarController />
          </PrivateRoute>
        ),
      },
      {
        path: "controller/favivon-icon-title",
        element: (
          <PrivateRoute>
            <FaviconAndTitleController />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
]);
