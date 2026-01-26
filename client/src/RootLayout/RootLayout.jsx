import React from "react";
import { Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Don't forget to import the CSS

import Navbar from "../Components/Navbar/Navbar";
import BottomNavbar from "../Components/BottomNavbar/BottomNavbar";
import FloatingSocial from "../Components/FloatingSocial/FloatingSocial";
import PromotionModal from "../Components/PromotionModal/PromotionModal";

// Fallbacks (your original images)
const FALLBACK_OUTER =
  "https://i.ibb.co/6JsJ9k6Y/riotgames-esports-sportsbetting.png";
const FALLBACK_INNER = "/bg.png";

const fetchLogos = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/logos`);
  console.log("Raw API logos response:", data);
  return data;
};

const normalizeImagePath = (rawPath) => {
  if (!rawPath) return null;
  let path = rawPath.replace(/\\/g, "/").replace(/^\.?\//, "");
  if (!path.startsWith("uploads/")) {
    path = "uploads/" + path;
  }
  return path;
};

const RootLayout = () => {
  const { data: logos, isLoading } = useQuery({
    queryKey: ["logos"],
    queryFn: fetchLogos,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });

  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

  const outerBg = logos?.outerBackground
    ? `${apiBase}/${normalizeImagePath(logos.outerBackground)}`
    : FALLBACK_OUTER;

  const innerBg = logos?.innerBackground
    ? `${apiBase}/${normalizeImagePath(logos.innerBackground)}`
    : FALLBACK_INNER;

  console.log("Final background URLs:", { outerBg, innerBg });

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-black">
        {/* Navbar skeleton */}
        <div className="h-16 bg-gray-900 flex items-center px-4">
          <Skeleton width={140} height={36} baseColor="#444" highlightColor="#666" />
        </div>

        {/* Main content area skeleton */}
        <div className="flex-1 flex justify-center items-center p-4">
          <div className="w-full md:w-[60%] lg:w-[40%] xl:w-[30%] h-full flex flex-col">
            {/* Content skeleton */}
            <div className="flex-1 bg-gradient-to-b from-gray-900 to-black rounded-lg p-6">
              <Skeleton count={8} height={28} className="mb-4" baseColor="#333" highlightColor="#555" />
              <Skeleton height={180} className="mb-6 rounded-lg" baseColor="#333" highlightColor="#555" />
              <Skeleton count={6} height={24} className="mb-3" baseColor="#333" highlightColor="#555" />
            </div>

            {/* Bottom navbar / floating elements placeholder */}
            <div className="h-20 mt-4">
              <Skeleton height={60} borderRadius={16} baseColor="#222" highlightColor="#444" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal render (when data is loaded)
  return (
    <div
      style={{
        backgroundImage: `url('${outerBg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="h-screen flex justify-center"
    >
      <div className="w-full md:w-[60%] lg:w-[40%] xl:w-[30%] overflow-y-auto [scrollbar-width:none]">
        <Navbar />

        <div
          style={{
            backgroundImage: `url('${innerBg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <Outlet />
          <PromotionModal />
          <BottomNavbar />
          <FloatingSocial />
        </div>
      </div>
    </div>
  );
};

export default RootLayout;