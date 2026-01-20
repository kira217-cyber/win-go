import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { routes } from "./router/router.jsx";
import AuthProvider from "./Context/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import { LanguageProvider } from "./Context/LanguageProvider.jsx";
import FaviconAndTitle from "./Components/FaviconAndTitle/FaviconAndTitle.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {" "}
        <AuthProvider>
          <ToastContainer position="top-right" />
          <FaviconAndTitle />
          <RouterProvider router={routes} />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
);
